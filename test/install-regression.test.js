import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { lstat, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { parseAgentTargets } from '../src/agents.js';
import {
  copyAgentEssentials,
  copyAgentSkills,
  copyAll,
  copyCommands,
  copySkills,
  copyToonUtils,
  isAgentSkillInstalled,
  isSkillInstalled,
  normalizeSkillPath,
  writeCodexAgentsFile,
  writeCursorProjectRule,
} from '../src/utils/copy.js';
import { setupToonBinary } from '../src/utils/toon.js';

const execFileAsync = promisify(execFile);

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'claude-starter-test-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test('agent target parser supports aliases and rejects unknown targets', () => {
  assert.deepEqual(parseAgentTargets('codex,cursor'), ['codex', 'cursor']);
  assert.deepEqual(parseAgentTargets('all'), ['claude', 'codex', 'cursor']);
  assert.throws(() => parseAgentTargets('windsurf'), /Unknown agent target/);
});

test('profile skill paths install under .claude/skills/<id>', async (t) => {
  const dir = await withTempDir(t);

  await copySkills(dir, ['toon-formatter']);

  assert.equal(existsSync(join(dir, '.claude', 'skills', 'toon-formatter', 'skill.md')), true);
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'skills')), false);
  assert.equal(await isSkillInstalled(dir, 'toon-formatter'), true);
});

test('codex target installs local skills and root AGENTS guidance', async (t) => {
  const dir = await withTempDir(t);

  await copyAgentEssentials(dir, 'codex');
  await copyAgentSkills(dir, 'codex', ['copywriting-frameworks']);
  await writeCodexAgentsFile(dir, ['copywriting-frameworks']);

  assert.equal(
    existsSync(join(dir, '.codex', 'skills', 'copywriting-frameworks', 'SKILL.md')),
    true,
  );
  assert.equal(
    existsSync(
      join(
        dir,
        '.codex',
        'skills',
        'copywriting-frameworks',
        'references',
        'direct-response-patterns.md',
      ),
    ),
    true,
  );
  assert.equal(existsSync(join(dir, 'AGENTS.md')), true);
  assert.equal(await isAgentSkillInstalled(dir, 'codex', 'copywriting-frameworks'), true);
});

test('cursor target installs project rules and skill references', async (t) => {
  const dir = await withTempDir(t);

  await copyAgentEssentials(dir, 'cursor');
  await copyAgentSkills(dir, 'cursor', ['copywriting-frameworks']);
  await writeCursorProjectRule(dir, ['copywriting-frameworks']);

  assert.equal(existsSync(join(dir, '.cursor', 'rules', 'agent-starter.mdc')), true);
  assert.equal(existsSync(join(dir, '.cursor', 'rules', 'copywriting-frameworks.mdc')), true);
  assert.equal(
    existsSync(
      join(
        dir,
        '.cursor',
        'rules',
        'copywriting-frameworks',
        'references',
        'direct-response-patterns.md',
      ),
    ),
    true,
  );
  assert.equal(await isAgentSkillInstalled(dir, 'cursor', 'copywriting-frameworks'), true);
});

test('real Apple HIG skills install with references for Codex and Cursor', async (t) => {
  const dir = await withTempDir(t);
  const skillPaths = ['hig-foundations', 'hig-components-layout'];

  await copyAgentEssentials(dir, 'codex');
  await copyAgentSkills(dir, 'codex', skillPaths);
  await writeCodexAgentsFile(dir, skillPaths);

  await copyAgentEssentials(dir, 'cursor');
  await copyAgentSkills(dir, 'cursor', skillPaths);
  await writeCursorProjectRule(dir, skillPaths);

  const codexSkillPath = join(dir, '.codex', 'skills', 'hig-foundations', 'SKILL.md');
  const cursorRulePath = join(dir, '.cursor', 'rules', 'hig-components-layout.mdc');

  assert.equal((await lstat(codexSkillPath)).isSymbolicLink(), false);
  assert.equal((await lstat(cursorRulePath)).isSymbolicLink(), false);
  assert.equal(
    existsSync(join(dir, '.codex', 'skills', 'hig-foundations', 'references', 'color.md')),
    true,
  );
  assert.equal(
    existsSync(join(dir, '.cursor', 'rules', 'hig-components-layout', 'references', 'sidebars.md')),
    true,
  );

  const codexAgents = await readFile(join(dir, 'AGENTS.md'), 'utf8');
  assert.match(codexAgents, /Apple Human Interface Guidelines design foundations/);
  assert.doesNotMatch(codexAgents, />-/);
});

test('copywriting skill installs with its reference material', async (t) => {
  const dir = await withTempDir(t);

  await copySkills(dir, ['copywriting-frameworks']);

  assert.equal(
    existsSync(join(dir, '.claude', 'skills', 'copywriting-frameworks', 'skill.md')),
    true,
  );
  assert.equal(
    existsSync(
      join(
        dir,
        '.claude',
        'skills',
        'copywriting-frameworks',
        'references',
        'direct-response-patterns.md',
      ),
    ),
    true,
  );
});

test('legacy skills/<id> inputs normalize to the current destination', async (t) => {
  const dir = await withTempDir(t);

  await copySkills(dir, ['skills/toon-formatter']);

  assert.equal(normalizeSkillPath('skills/toon-formatter'), 'toon-formatter');
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'toon-formatter', 'skill.md')), true);
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'skills', 'toon-formatter')), false);
});

test('copySkills preflights all requested skills before writing', async (t) => {
  const dir = await withTempDir(t);

  await assert.rejects(
    copySkills(dir, ['toon-formatter', 'missing-skill']),
    /Skill not found: missing-skill/,
  );

  assert.equal(existsSync(join(dir, '.claude', 'skills', 'toon-formatter')), false);
});

test('copyCommands rejects traversal before creating command output', async (t) => {
  const dir = await withTempDir(t);

  await assert.rejects(copyCommands(dir, ['../escape']), /Invalid command name/);

  assert.equal(existsSync(join(dir, '.claude', 'commands')), false);
});

test('TOON wrapper is copied and verified for selective installs', async (t) => {
  const dir = await withTempDir(t);

  await copyToonUtils(dir);
  const result = setupToonBinary(join(dir, '.claude'));

  assert.equal(result.success, true);
  assert.equal(result.path, join(dir, '.claude', 'utils', 'toon', 'cli.mjs'));
});

test('copyAll --force replaces an existing .claude and leaves no staging or backup residue', async (t) => {
  const dir = await withTempDir(t);
  const claudeDir = join(dir, '.claude');
  await mkdir(claudeDir, { recursive: true });
  await writeFile(join(claudeDir, 'stale-sentinel.txt'), 'old', 'utf8');

  await copyAll(dir, { force: true });

  assert.equal(existsSync(join(claudeDir, 'stale-sentinel.txt')), false);
  assert.equal(existsSync(join(claudeDir, 'settings.json')), true);

  const residue = (await readdir(dir)).filter(
    (entry) => entry.startsWith('.claude-install-') || entry.startsWith('.claude.backup.'),
  );
  assert.deepEqual(residue, []);
});

test('copyAll refuses to clobber an existing .claude without force or merge', async (t) => {
  const dir = await withTempDir(t);
  await mkdir(join(dir, '.claude'), { recursive: true });

  await assert.rejects(copyAll(dir, {}), /already exists/);
});

test('copyAll never copies local settings overrides', async (t) => {
  const dir = await withTempDir(t);

  await copyAll(dir, {});

  assert.equal(existsSync(join(dir, '.claude', 'settings.local.json')), false);
  assert.equal(existsSync(join(dir, '.claude', 'settings.local.json.example')), false);
});

test('CLI explicit init subcommand respects non-interactive options', async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve('bin/cli.js');

  await execFileAsync(process.execPath, [cliPath, 'init', dir, '--yes', '--profile', 'minimal']);

  assert.equal(existsSync(join(dir, '.claude', 'skills', 'toon-formatter', 'skill.md')), true);
  assert.equal(existsSync(join(dir, '.claude', 'utils', 'toon', 'cli.mjs')), true);
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'skills')), false);
});

test('CLI can install all supported agent targets', async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve('bin/cli.js');

  await execFileAsync(process.execPath, [
    cliPath,
    'init',
    dir,
    '--yes',
    '--agent',
    'all',
    '--skills',
    'copywriting-frameworks',
  ]);

  assert.equal(
    existsSync(join(dir, '.claude', 'skills', 'copywriting-frameworks', 'skill.md')),
    true,
  );
  assert.equal(
    existsSync(join(dir, '.codex', 'skills', 'copywriting-frameworks', 'SKILL.md')),
    true,
  );
  assert.equal(existsSync(join(dir, 'AGENTS.md')), true);
  assert.equal(existsSync(join(dir, '.cursor', 'rules', 'copywriting-frameworks.mdc')), true);
});

test('CLI apple-hig profile installs only HIG skills for Codex and Cursor', async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve('bin/cli.js');

  const { stdout, stderr } = await execFileAsync(process.execPath, [
    cliPath,
    'init',
    dir,
    '--yes',
    '--agent',
    'codex,cursor',
    '--profile',
    'apple-hig',
  ]);

  assert.match(`${stdout}\n${stderr}`, /Installed 15 skills for Codex, Cursor/);
  assert.equal(existsSync(join(dir, '.codex', 'skills', 'hig-doctor-audit', 'SKILL.md')), true);
  assert.equal(existsSync(join(dir, '.codex', 'skills', 'hig-foundations', 'SKILL.md')), true);
  assert.equal(
    existsSync(join(dir, '.codex', 'skills', 'hig-technologies', 'references', 'siri.md')),
    true,
  );
  assert.equal(existsSync(join(dir, '.cursor', 'rules', 'hig-components-controls.mdc')), true);
  assert.equal(
    existsSync(join(dir, '.cursor', 'rules', 'hig-components-layout', 'references', 'sidebars.md')),
    true,
  );
  assert.equal(existsSync(join(dir, '.codex', 'skills', 'human-processor-model')), false);
});

test('CLI codex-only install does not emit Claude or Cursor targets', async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve('bin/cli.js');

  await execFileAsync(process.execPath, [
    cliPath,
    'init',
    dir,
    '--yes',
    '--agent',
    'codex',
    '--skills',
    'cleanup-unused',
  ]);

  assert.equal(existsSync(join(dir, '.codex', 'skills', 'cleanup-unused', 'SKILL.md')), true);
  assert.equal(existsSync(join(dir, 'AGENTS.md')), true);
  assert.equal(existsSync(join(dir, '.claude')), false);
  assert.equal(existsSync(join(dir, '.cursor')), false);
});

test('CLI deduplicates repeated explicit skill ids before installing', async (t) => {
  const dir = await withTempDir(t);
  const cliPath = resolve('bin/cli.js');

  const { stdout, stderr } = await execFileAsync(process.execPath, [
    cliPath,
    'init',
    dir,
    '--yes',
    '--agent',
    'codex',
    '--skills',
    'hig-foundations,hig-foundations',
  ]);

  assert.match(`${stdout}\n${stderr}`, /Installed 1 skills for Codex/);
  assert.equal(existsSync(join(dir, '.codex', 'skills', 'hig-foundations', 'SKILL.md')), true);
});
