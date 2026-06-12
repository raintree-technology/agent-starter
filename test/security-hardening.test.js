import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { isPathSafe, isValidCommandName, sanitizeForLog } from '../src/utils/security.js';

// ── FIX 5: Command name validation ──────────────────────────────────────

test('isValidCommandName accepts valid names', () => {
  assert.ok(isValidCommandName('toon-encode'));
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

// ── Path boundary validation ────────────────────────────────────────────

test('isPathSafe rejects prefix-sibling paths', () => {
  assert.equal(isPathSafe('/tmp/base-evil/file', '/tmp/base'), false);
  assert.equal(isPathSafe('/tmp/base/../base-evil/file', '/tmp/base'), false);
});

test('isPathSafe accepts base directory descendants', () => {
  assert.equal(isPathSafe('/tmp/base/file', '/tmp/base'), true);
  assert.equal(isPathSafe('/tmp/base/nested/file', '/tmp/base'), true);
});

// ── Log injection prevention ────────────────────────────────────────────

test('sanitizeForLog strips control and DEL characters', () => {
  assert.equal(sanitizeForLog('safe\x00\x07\x1b\x7fvalue'), 'safevalue');
  assert.equal(sanitizeForLog('line\rwith\bcontrol'), 'linewithcontrol');
});

test('sanitizeForLog preserves tab, newline, and printable text', () => {
  assert.equal(sanitizeForLog('a\tb\nc d'), 'a\tb\nc d');
  assert.equal(sanitizeForLog('https://docs.example.com'), 'https://docs.example.com');
});

test('sanitizeForLog coerces non-string input to a string', () => {
  assert.equal(sanitizeForLog(123), '123');
  assert.equal(sanitizeForLog(null), 'null');
  assert.equal(sanitizeForLog(undefined), 'undefined');
});

// ── FIX 4: settings.local.json renamed to .example ─────────────────────

test('settings.local.json template is renamed to .example', () => {
  assert.ok(
    existsSync('templates/.claude/settings.local.json.example'),
    'settings.local.json.example should exist',
  );
  assert.ok(
    !existsSync('templates/.claude/settings.local.json'),
    'settings.local.json should NOT exist (renamed to .example)',
  );
});
