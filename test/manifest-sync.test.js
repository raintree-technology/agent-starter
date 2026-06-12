import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { getStatus } from '../src/commands/status.js';
import { runSync } from '../src/commands/sync.js';
import { loadManifest, resolveManifest, saveManifest, validateManifest } from '../src/manifest.js';
import {
  buildCodexMcpToml,
  collectEnvReferences,
  getCatalogMcp,
  validateMcpEntry,
} from '../src/mcps.js';
import { detectStackProfile, getProfile } from '../src/profiles.js';
import { readManagedBlock, upsertManagedBlock } from '../src/utils/managed-block.js';

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'agent-manifest-test-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

const GITHUB_MCP = getCatalogMcp('github');

test('manifest validation rejects bad shapes', () => {
  assert.throws(() => validateManifest({ version: 2 }), /Unsupported agent.json version/);
  assert.throws(() => validateManifest({ version: 1, profile: 'nope' }), /Unknown profile/);
  assert.throws(() => validateManifest({ version: 1, skills: ['not-a-skill'] }), /unknown skill/);
  assert.throws(
    () => validateManifest({ version: 1, targets: ['windsurf'] }),
    /Unknown agent target/,
  );
  assert.throws(
    () =>
      validateManifest({ version: 1, mcps: [{ name: 'x', command: 'npx', url: 'https://x.dev' }] }),
    /exactly one of/,
  );
  assert.throws(
    () => validateManifest({ version: 1, mcps: [GITHUB_MCP, GITHUB_MCP] }),
    /duplicate MCP/,
  );
  validateManifest({ version: 1, profile: 'next-saas', targets: ['claude', 'codex'] });
});

test('mcp entry validation accepts stdio and remote shapes', () => {
  validateMcpEntry({ name: 'github', command: 'npx', args: ['-y', 'pkg'], env: { A: 'b' } });
  validateMcpEntry({
    name: 'posthog',
    url: 'https://mcp.posthog.com/mcp',
    headers: { Authorization: 'Bearer x' },
  });
  assert.throws(() => validateMcpEntry({ name: 'bad name!', command: 'npx' }), /Invalid MCP name/);
  assert.throws(
    () => validateMcpEntry({ name: 'x', url: 'http://insecure.dev' }),
    /exactly one of/,
  );
});

test('resolveManifest merges profile skills/mcps with explicit entries', () => {
  const plan = resolveManifest({
    version: 1,
    profile: 'next-saas',
    targets: ['claude', 'codex', 'cursor'],
    skills: ['toon-formatter'],
    mcps: [{ name: 'github', command: 'custom-binary' }],
  });

  const profile = getProfile('next-saas');
  for (const skill of profile.skills) {
    assert.ok(plan.skills.includes(skill), `profile skill ${skill} present`);
  }
  assert.ok(plan.skills.includes('toon-formatter'));

  const github = plan.mcps.find((mcp) => mcp.name === 'github');
  assert.equal(github.command, 'custom-binary', 'explicit MCP overrides profile entry by name');
  assert.ok(plan.mcps.some((mcp) => mcp.name === 'neon'));
});

test('stack profile detection reads dependencies', () => {
  assert.equal(
    detectStackProfile({ dependencies: { next: '16.0.0', 'better-auth': '1.0.0' } }),
    'next-saas',
  );
  assert.equal(detectStackProfile({ dependencies: { next: '16.0.0' } }), 'next');
  assert.equal(detectStackProfile({ dependencies: { express: '5.0.0' } }), 'node');
  assert.equal(detectStackProfile(null), null);
});

test('env reference collection finds ${VAR} across env, headers, args, url', () => {
  const vars = collectEnvReferences([
    { name: 'a', command: 'npx', args: ['--key=${KEY_ONE}'], env: { TOKEN: '${KEY_TWO}' } },
    {
      name: 'b',
      url: 'https://x.dev/${KEY_THREE}',
      headers: { Authorization: 'Bearer ${KEY_TWO}' },
    },
  ]);
  assert.deepEqual(vars, ['KEY_ONE', 'KEY_THREE', 'KEY_TWO']);
});

test('codex toml rendering covers stdio and remote servers', () => {
  const toml = buildCodexMcpToml([
    { name: 'github', command: 'npx', args: ['-y', 'pkg'], env: { TOKEN: '${T}' } },
    {
      name: 'posthog',
      url: 'https://mcp.posthog.com/mcp',
      headers: { Authorization: 'Bearer ${P}' },
    },
  ]);
  assert.match(toml, /\[mcp_servers\.github\]/);
  assert.match(toml, /args = \["-y", "pkg"\]/);
  assert.match(toml, /\[mcp_servers\.github\.env\]/);
  assert.match(toml, /\[mcp_servers\.posthog\]/);
  assert.match(toml, /url = "https:\/\/mcp\.posthog\.com\/mcp"/);
});

test('managed block upsert preserves surrounding content and is idempotent', async (t) => {
  const dir = await withTempDir(t);
  const filePath = join(dir, 'AGENTS.md');
  await writeFile(filePath, '# My project\n\nHand-written notes.\n');

  await upsertManagedBlock(filePath, 'generated v1', 'markdown');
  await upsertManagedBlock(filePath, 'generated v2', 'markdown');

  const content = await readFile(filePath, 'utf-8');
  assert.match(content, /Hand-written notes\./);
  assert.match(content, /generated v2/);
  assert.doesNotMatch(content, /generated v1/);
  assert.equal(await readManagedBlock(filePath, 'markdown'), 'generated v2');
});

test('sync writes skills and MCP config for all targets and is idempotent', async (t) => {
  const dir = await withTempDir(t);
  await saveManifest(dir, {
    version: 1,
    profile: 'base',
    targets: ['claude', 'codex', 'cursor'],
    mcps: [GITHUB_MCP],
  });

  const first = await runSync(dir);
  assert.deepEqual(first.envVars, ['GITHUB_PERSONAL_ACCESS_TOKEN']);

  // skills land in every target's native layout
  assert.ok(existsSync(join(dir, '.claude', 'skills', 'cleanup-unused')));
  assert.ok(existsSync(join(dir, '.codex', 'skills', 'cleanup-unused', 'SKILL.md')));
  assert.ok(existsSync(join(dir, '.cursor', 'rules', 'cleanup-unused.mdc')));

  // MCP config lands in every target's native format
  const claudeMcp = JSON.parse(await readFile(join(dir, '.mcp.json'), 'utf-8'));
  assert.equal(claudeMcp.mcpServers.github.command, 'npx');
  const cursorMcp = JSON.parse(await readFile(join(dir, '.cursor', 'mcp.json'), 'utf-8'));
  assert.equal(cursorMcp.mcpServers.github.command, 'npx');
  const codexToml = await readFile(join(dir, '.codex', 'config.toml'), 'utf-8');
  assert.match(codexToml, /\[mcp_servers\.github\]/);

  // env vars documented once
  const envExample = await readFile(join(dir, '.env.example'), 'utf-8');
  assert.match(envExample, /^GITHUB_PERSONAL_ACCESS_TOKEN=$/m);

  await runSync(dir);
  const envExampleAfter = await readFile(join(dir, '.env.example'), 'utf-8');
  assert.equal(
    envExampleAfter.match(/GITHUB_PERSONAL_ACCESS_TOKEN=/g).length,
    1,
    'second sync must not duplicate .env.example entries',
  );
});

test('sync preserves foreign MCP keys and content outside managed markers', async (t) => {
  const dir = await withTempDir(t);
  await writeFile(
    join(dir, '.mcp.json'),
    JSON.stringify({
      mcpServers: { 'user-added': { command: 'my-server' } },
    }),
  );
  await writeFile(join(dir, 'AGENTS.md'), '# Existing guidance\n');
  await saveManifest(dir, {
    version: 1,
    targets: ['claude', 'codex'],
    skills: ['cleanup-unused'],
    mcps: [GITHUB_MCP],
  });

  await runSync(dir);

  const claudeMcp = JSON.parse(await readFile(join(dir, '.mcp.json'), 'utf-8'));
  assert.equal(claudeMcp.mcpServers['user-added'].command, 'my-server');
  assert.ok(claudeMcp.mcpServers.github);

  const agentsMd = await readFile(join(dir, 'AGENTS.md'), 'utf-8');
  assert.match(agentsMd, /# Existing guidance/);
  assert.match(agentsMd, /agent-starter:begin/);
});

test('status reports drift and unmanaged entries', async (t) => {
  const dir = await withTempDir(t);
  await saveManifest(dir, {
    version: 1,
    targets: ['claude'],
    skills: ['cleanup-unused'],
    mcps: [GITHUB_MCP],
  });

  await runSync(dir);
  let report = await getStatus(dir);
  assert.equal(report.inSync, true);

  // drift: foreign key added, managed key mutated, skill removed
  const mcpPath = join(dir, '.mcp.json');
  const mcpJson = JSON.parse(await readFile(mcpPath, 'utf-8'));
  mcpJson.mcpServers.github.command = 'something-else';
  mcpJson.mcpServers.extra = { command: 'user-owned' };
  await writeFile(mcpPath, JSON.stringify(mcpJson));
  await rm(join(dir, '.claude', 'skills', 'cleanup-unused'), { recursive: true });

  report = await getStatus(dir);
  assert.equal(report.inSync, false);
  assert.deepEqual(report.targets.claude.mcps.drifted, ['github']);
  assert.deepEqual(report.targets.claude.mcps.unmanaged, ['extra']);
  assert.deepEqual(report.targets.claude.missingSkills, ['cleanup-unused']);

  await runSync(dir);
  report = await getStatus(dir);
  assert.equal(report.inSync, true, 'sync reconciles drift');
  const reconciled = JSON.parse(await readFile(mcpPath, 'utf-8'));
  assert.equal(reconciled.mcpServers.extra.command, 'user-owned', 'reconcile keeps foreign keys');
});

test('loadManifest returns null without agent.json and round-trips with save', async (t) => {
  const dir = await withTempDir(t);
  assert.equal(await loadManifest(dir), null);
  await saveManifest(dir, { version: 1, profile: 'next-saas', targets: ['claude'] });
  const manifest = await loadManifest(dir);
  assert.equal(manifest.profile, 'next-saas');
});
