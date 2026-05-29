import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, mkdir, writeFile, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

import {
  copyAll,
  copyCommands,
  copySkills,
  copyToonUtils,
  isSkillInstalled,
  normalizeSkillPath,
} from '../src/utils/copy.js';
import { setupToonBinary } from '../src/utils/platform.js';
import { skillIdToPath } from '../src/profiles.js';

const execFileAsync = promisify(execFile);

async function withTempDir(t) {
  const dir = await mkdtemp(join(tmpdir(), 'claude-starter-test-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test('profile skill paths install under .claude/skills/<id>', async (t) => {
  const dir = await withTempDir(t);

  await copySkills(dir, [skillIdToPath('stripe')]);

  assert.equal(existsSync(join(dir, '.claude', 'skills', 'stripe', 'skill.md')), true);
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'skills')), false);
  assert.equal(await isSkillInstalled(dir, 'stripe'), true);
});

test('legacy skills/<id> inputs normalize to the current destination', async (t) => {
  const dir = await withTempDir(t);

  await copySkills(dir, ['skills/plaid']);

  assert.equal(normalizeSkillPath('skills/plaid'), 'plaid');
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'plaid', 'skill.md')), true);
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'skills', 'plaid')), false);
});

test('copySkills preflights all requested skills before writing', async (t) => {
  const dir = await withTempDir(t);

  await assert.rejects(
    copySkills(dir, ['stripe', 'missing-skill']),
    /Skill not found: missing-skill/,
  );

  assert.equal(existsSync(join(dir, '.claude', 'skills', 'stripe')), false);
});

test('copyCommands rejects traversal before creating command output', async (t) => {
  const dir = await withTempDir(t);

  await assert.rejects(
    copyCommands(dir, ['../escape']),
    /Invalid command name/,
  );

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

  await execFileAsync(process.execPath, [
    cliPath,
    'init',
    dir,
    '--yes',
    '--profile',
    'minimal',
  ]);

  assert.equal(existsSync(join(dir, '.claude', 'skills', 'toon-formatter', 'skill.md')), true);
  assert.equal(existsSync(join(dir, '.claude', 'utils', 'toon', 'cli.mjs')), true);
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'skills')), false);
});
