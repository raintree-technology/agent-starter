import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  isValidUrl,
  isValidCommandName,
  isValidSkillPath,
  isPathSafe
} from '../src/utils/security.js';
import { readInstalledManifest } from '../src/utils/manifest.js';

// ── FIX 10: Expanded SSRF blocklist ─────────────────────────────────────

test('isValidUrl blocks IPv6 loopback [::1]', () => {
  assert.ok(!isValidUrl('http://[::1]:8080/api'));
  assert.ok(!isValidUrl('http://::1/'));
});

test('isValidUrl blocks hex and octal localhost', () => {
  assert.ok(!isValidUrl('http://0x7f000001/'));
  assert.ok(!isValidUrl('http://0177.0.0.1/'));
});

test('isValidUrl blocks full 127.x loopback range', () => {
  assert.ok(!isValidUrl('http://127.0.0.2/'));
  assert.ok(!isValidUrl('http://127.255.255.255/'));
});

test('isValidUrl blocks link-local 169.254.x', () => {
  assert.ok(!isValidUrl('http://169.254.1.1/'));
  assert.ok(!isValidUrl('http://169.254.169.254/')); // AWS metadata
});

test('isValidUrl blocks full 172.16-31.x RFC 1918 range', () => {
  assert.ok(!isValidUrl('http://172.16.0.1/'));
  assert.ok(!isValidUrl('http://172.20.0.1/'));
  assert.ok(!isValidUrl('http://172.31.255.255/'));
  // Outside range should be allowed
  assert.ok(isValidUrl('http://172.32.0.1/'));
  assert.ok(isValidUrl('http://172.15.0.1/'));
});

test('isValidUrl blocks IPv6 private ranges', () => {
  assert.ok(!isValidUrl('http://fc00::1/'));
  assert.ok(!isValidUrl('http://fd12::1/'));
  assert.ok(!isValidUrl('http://fe80::1/'));
});

test('isValidUrl still allows legitimate URLs', () => {
  assert.ok(isValidUrl('https://docs.stripe.com'));
  assert.ok(isValidUrl('https://supabase.com/docs'));
  assert.ok(isValidUrl('https://example.com/path'));
});

// ── FIX 5: Command name validation ──────────────────────────────────────

test('isValidCommandName accepts valid names', () => {
  assert.ok(isValidCommandName('install-skill'));
  assert.ok(isValidCommandName('audit_code'));
  assert.ok(isValidCommandName('test123'));
  assert.ok(isValidCommandName('toon-decode'));
});

test('isValidCommandName rejects path traversal', () => {
  assert.ok(!isValidCommandName('../../etc/passwd'));
  assert.ok(!isValidCommandName('../secret'));
});

test('isValidCommandName rejects names with slashes', () => {
  assert.ok(!isValidCommandName('foo/bar'));
  assert.ok(!isValidCommandName('commands/hack'));
});

test('isValidCommandName rejects names with dots', () => {
  assert.ok(!isValidCommandName('file.md'));
  assert.ok(!isValidCommandName('...'));
});

test('isValidCommandName rejects names exceeding 64 chars', () => {
  assert.ok(!isValidCommandName('a'.repeat(65)));
  assert.ok(isValidCommandName('a'.repeat(64)));
});

test('isValidCommandName rejects empty/null/undefined', () => {
  assert.ok(!isValidCommandName(''));
  assert.ok(!isValidCommandName(null));
  assert.ok(!isValidCommandName(undefined));
});

test('isValidCommandName rejects null bytes', () => {
  assert.ok(!isValidCommandName('test\0hack'));
});

// ── FIX 1: readInstalledManifest validation ─────────────────────────────

test('readInstalledManifest returns null for missing manifest', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'cs-test-'));
  try {
    const result = readInstalledManifest(tempDir);
    assert.equal(result, null);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('readInstalledManifest returns null for invalid JSON', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'cs-test-'));
  const claudeDir = join(tempDir, '.claude');
  mkdirSync(claudeDir, { recursive: true });
  writeFileSync(join(claudeDir, 'manifest.json'), 'not json!!!');
  try {
    const result = readInstalledManifest(tempDir);
    assert.equal(result, null);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('readInstalledManifest returns null for invalid schema', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'cs-test-'));
  const claudeDir = join(tempDir, '.claude');
  mkdirSync(claudeDir, { recursive: true });
  // Missing required fields
  writeFileSync(join(claudeDir, 'manifest.json'), JSON.stringify({ bad: true }));
  try {
    const result = readInstalledManifest(tempDir);
    assert.equal(result, null);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('readInstalledManifest accepts valid manifest', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'cs-test-'));
  const claudeDir = join(tempDir, '.claude');
  mkdirSync(claudeDir, { recursive: true });
  const validManifest = {
    version: '1.0.0',
    skills: [
      { id: 'test-skill', path: 'skills/test', category: 'test' }
    ],
    categories: {}
  };
  writeFileSync(join(claudeDir, 'manifest.json'), JSON.stringify(validManifest));
  try {
    const result = readInstalledManifest(tempDir);
    assert.ok(result);
    assert.equal(result.version, '1.0.0');
    assert.equal(result.skills.length, 1);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

// ── FIX 4: settings.local.json renamed to .example ─────────────────────

test('settings.local.json template is renamed to .example', () => {
  assert.ok(
    existsSync('templates/.claude/settings.local.json.example'),
    'settings.local.json.example should exist'
  );
  assert.ok(
    !existsSync('templates/.claude/settings.local.json'),
    'settings.local.json should NOT exist (renamed to .example)'
  );
});
