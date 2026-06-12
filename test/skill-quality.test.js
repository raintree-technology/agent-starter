import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import test from 'node:test';
import { SKILLS } from '../src/profiles.js';
import {
  copyAgentEssentials,
  copyAgentSkills,
  writeCodexAgentsFile,
  writeCursorProjectRule,
} from '../src/utils/copy.js';

const SKILLS_ROOT = 'templates/.claude/skills';
const MAX_ENTRYPOINT_LINES = 500;

async function walk(dir) {
  const results = [];
  for (const entry of await readdir(dir)) {
    const fullPath = join(dir, entry);
    const entryStat = await stat(fullPath);
    if (entryStat.isDirectory()) {
      results.push(...(await walk(fullPath)));
    } else {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function splitFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return { metadata: {}, body: markdown };
  const endIndex = markdown.indexOf('\n---', 4);
  assert.notEqual(endIndex, -1, 'frontmatter must be closed');

  const rawFrontmatter = markdown.slice(4, endIndex).trim();
  const metadata = {};
  const frontmatterLines = rawFrontmatter.split('\n');
  for (let index = 0; index < frontmatterLines.length; index += 1) {
    const line = frontmatterLines[index];
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!key) continue;

    if (['>', '>-', '|', '|-'].includes(value)) {
      const blockLines = [];
      while (
        index + 1 < frontmatterLines.length &&
        (frontmatterLines[index + 1].startsWith(' ') || frontmatterLines[index + 1].trim() === '')
      ) {
        index += 1;
        blockLines.push(frontmatterLines[index].replace(/^ {2}/, ''));
      }
      metadata[key] = value.startsWith('|')
        ? blockLines.join('\n').trim()
        : blockLines
            .map((blockLine) => blockLine.trim())
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
      continue;
    }

    metadata[key] = value.replace(/^"(.*)"$/, '$1');
  }

  return {
    metadata,
    body: markdown.slice(markdown.indexOf('\n', endIndex + 4) + 1),
  };
}

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'agent-starter-skill-quality-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test('only templates/.claude/skills is tracked as skill source', async () => {
  const gitignore = await readFile('.gitignore', 'utf8');
  assert.match(gitignore, /^\.claude\/skills\/$/m);
  assert.equal(existsSync('.claude/skills'), false);
});

test('template skill entrypoints stay compact and use folder-matching names', async () => {
  const markdownFiles = (await walk(SKILLS_ROOT)).filter((file) =>
    /(^|\/)(skill\.md|SKILL\.md)$/.test(file),
  );

  assert.ok(markdownFiles.length > 0);

  for (const file of markdownFiles) {
    const markdown = await readFile(file, 'utf8');
    const rel = relative(SKILLS_ROOT, file);
    const lines = markdown.split('\n').length;
    const { metadata } = splitFrontmatter(markdown);

    assert.ok(lines <= MAX_ENTRYPOINT_LINES, `${rel} has ${lines} lines`);
    assert.equal(metadata.name, basename(dirname(file)), `${rel} name must match folder`);
    assert.match(metadata.name, /^[a-z0-9-]{1,63}$/);
    assert.ok(metadata.description, `${rel} needs a description`);
  }
});

test('registry covers every top-level template skill', async () => {
  const registered = new Set(SKILLS.map((skill) => skill.id));
  const entries = await readdir(SKILLS_ROOT, { withFileTypes: true });
  const topLevelSkills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDir = join(SKILLS_ROOT, entry.name);
    if (existsSync(join(skillDir, 'skill.md')) || existsSync(join(skillDir, 'SKILL.md'))) {
      topLevelSkills.push(entry.name);
    }
  }

  for (const skillId of topLevelSkills.sort()) {
    assert.ok(
      registered.has(skillId),
      `${skillId} is a top-level template skill but is not registered`,
    );
  }
});

test('long reference files include a table of contents', async () => {
  const referenceFiles = (await walk(SKILLS_ROOT)).filter((file) => file.includes('/references/'));

  for (const file of referenceFiles) {
    const markdown = await readFile(file, 'utf8');
    const rel = relative(SKILLS_ROOT, file);
    if (rel.startsWith('hig-')) {
      assert.match(
        markdown.slice(0, 1200),
        /source: https:\/\/developer\.apple\.com\/design\/human-interface-guidelines\//,
        `${rel} needs canonical Apple source metadata`,
      );
      assert.match(
        markdown.slice(0, 1200),
        /<!-- hig-doctor:attribution -->/,
        `${rel} needs HIG Doctor attribution`,
      );
      continue;
    }

    const lines = markdown.split('\n').length;
    if (lines <= 100) continue;

    assert.match(
      markdown.slice(0, 1200),
      /^## Table of Contents$/m,
      `${rel} needs a top-level table of contents`,
    );
  }
});

test('template skills do not carry stale captured-doc or legacy-runtime content', async () => {
  const files = (await walk(SKILLS_ROOT)).filter((file) => /\.(md|json)$/.test(file));
  const stalePatterns = [
    [/3,253|2,616|199 markdown/, 'stale documentation count'],
    [/claude-sonnet-4-5-20250929|claude-sonnet-4-6/, 'hardcoded Claude model snapshot'],
    [/Auto-invoke|Auto-invokes/, 'Claude-only auto-invoke wording'],
    [/Example 1: \[Scenario\]/, 'placeholder scenario heading'],
    [
      /Source Code:\s*`src\/toon\.zig`|zig-out\/bin\/toon|toon-darwin-arm64/,
      'obsolete TOON native binary path',
    ],
    [
      /\.claude\/skills\/toon-formatter|docs\/INSTALL|docs\/toon-guide/,
      'obsolete TOON skill docs path',
    ],
    [
      /\.claude\/docs\/creating-components|Examples from TOON Formatter/,
      'obsolete scaffold reference',
    ],
    [/2024-01-01|2024-12-31|2024-11-16|2026-04-16|2024-08-15/, 'stale dated example'],
    [/Skill tool/, 'Claude-only skill runtime wording'],
  ];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const rel = relative(SKILLS_ROOT, file);
    for (const [pattern, label] of stalePatterns) {
      assert.doesNotMatch(content, pattern, `${rel} contains ${label}`);
    }
  }
});

test('template skills use references instead of docs directories for bundled guidance', async () => {
  const allFiles = await walk(SKILLS_ROOT);
  for (const file of allFiles) {
    assert.equal(
      relative(SKILLS_ROOT, file).split('/').includes('docs'),
      false,
      `${relative(SKILLS_ROOT, file)} is under a docs directory`,
    );
  }
});

test('generated Codex and Cursor targets keep valid target-specific skill output', async (t) => {
  const dir = await withTempDir(t);
  const skillPaths = SKILLS.map((skill) => skill.id);

  await copyAgentEssentials(dir, 'codex');
  await copyAgentSkills(dir, 'codex', skillPaths);
  await writeCodexAgentsFile(dir, skillPaths);

  await copyAgentEssentials(dir, 'cursor');
  await copyAgentSkills(dir, 'cursor', skillPaths);
  await writeCursorProjectRule(dir, skillPaths);

  const generatedFiles = (await walk(dir)).filter((file) => /\.(md|mdc)$/.test(file));
  for (const file of generatedFiles) {
    const content = await readFile(file, 'utf8');
    const rel = relative(dir, file);
    assert.doesNotMatch(content, /Skill tool/, rel);
  }

  const codexAgents = await readFile(join(dir, 'AGENTS.md'), 'utf8');
  const cursorProjectRule = await readFile(join(dir, '.cursor/rules/agent-starter.mdc'), 'utf8');
  assert.doesNotMatch(codexAgents, /\\"/);
  assert.doesNotMatch(cursorProjectRule, /\\"/);

  const codexCopywriting = await readFile(
    join(dir, '.codex/skills/copywriting-frameworks/SKILL.md'),
    'utf8',
  );
  const codexMetadata = splitFrontmatter(codexCopywriting).metadata;
  assert.deepEqual(Object.keys(codexMetadata), ['name', 'description']);
  assert.equal(
    existsSync(
      join(dir, '.codex/skills/copywriting-frameworks/references/direct-response-patterns.md'),
    ),
    true,
  );
  assert.equal(
    existsSync(
      join(dir, '.cursor/rules/copywriting-frameworks/references/direct-response-patterns.md'),
    ),
    true,
  );
});
