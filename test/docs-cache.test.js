import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  readDocsCache,
  writeDocsCache,
  recordDocsPulled,
  getDocsInfo,
} from '../src/utils/docs-cache.js';

// docs-cache resolves its path from os.homedir(), which honors $HOME on POSIX.
// Each test file runs in its own process under `node --test`, so sandboxing
// the home directory here cannot leak into other suites.
async function withSandboxedHome(t) {
  const home = await mkdtemp(join(tmpdir(), 'claude-starter-home-'));
  const prevHome = process.env.HOME;
  const prevUserProfile = process.env.USERPROFILE;
  process.env.HOME = home;
  process.env.USERPROFILE = home;
  t.after(async () => {
    if (prevHome === undefined) delete process.env.HOME;
    else process.env.HOME = prevHome;
    if (prevUserProfile === undefined) delete process.env.USERPROFILE;
    else process.env.USERPROFILE = prevUserProfile;
    await rm(home, { recursive: true, force: true });
  });
  return join(home, '.claude-starter', 'docs-cache.json');
}

test('recordDocsPulled persists metadata that getDocsInfo can read back', async (t) => {
  await withSandboxedHome(t);

  await recordDocsPulled('stripe', { url: 'https://docs.stripe.com', size: 10, fileCount: 3 });
  const info = await getDocsInfo('stripe');

  assert.equal(info.url, 'https://docs.stripe.com');
  assert.equal(info.fileCount, 3);
  assert.ok(info.pulledAt);
});

test('cache is written with owner-only file and directory modes', { skip: process.platform === 'win32' }, async (t) => {
  const cachePath = await withSandboxedHome(t);

  await recordDocsPulled('plaid', { url: 'https://plaid.com/docs' });

  assert.equal(statSync(cachePath).mode & 0o777, 0o600);
  assert.equal(statSync(join(cachePath, '..')).mode & 0o777, 0o700);
});

test('readDocsCache resets when the cache file exceeds the size cap', async (t) => {
  const cachePath = await withSandboxedHome(t);
  await mkdir(join(cachePath, '..'), { recursive: true });
  await writeFile(cachePath, 'a'.repeat(5 * 1024 * 1024 + 1), 'utf8');

  const cache = await readDocsCache();

  assert.deepEqual(cache.docs, {});
});

test('readDocsCache resets when the schema is invalid', async (t) => {
  const cachePath = await withSandboxedHome(t);
  await mkdir(join(cachePath, '..'), { recursive: true });
  await writeFile(cachePath, JSON.stringify({ docs: { 'not a valid id!': {} } }), 'utf8');

  const cache = await readDocsCache();

  assert.deepEqual(cache.docs, {});
});

test('recordDocsPulled rejects invalid skill ids', async (t) => {
  await withSandboxedHome(t);

  await assert.rejects(recordDocsPulled('../escape', {}), /Invalid skill id/);
});

test('writeDocsCache refuses to persist a malformed cache object', async (t) => {
  await withSandboxedHome(t);

  await assert.rejects(writeDocsCache({ docs: [] }), /invalid docs cache/i);
  assert.equal(existsSync(join(process.env.HOME, '.claude-starter', 'docs-cache.json')), false);
});
