import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

import {
  assertPublicHttpsUrl,
  getUrlValidationError,
  isPrivateIpAddress,
  isValidUrl,
  isValidCommandName,
  isPathSafe,
  sanitizeForLog,
} from '../src/utils/security.js';

// ── FIX 10: Expanded SSRF blocklist ─────────────────────────────────────

test('isValidUrl blocks IPv6 loopback [::1]', () => {
  assert.ok(!isValidUrl('https://[::1]:8080/api'));
  assert.ok(!isValidUrl('https://::1/'));
});

test('isValidUrl blocks hex and octal localhost', () => {
  assert.ok(!isValidUrl('https://0x7f000001/'));
  assert.ok(!isValidUrl('https://0177.0.0.1/'));
});

test('isValidUrl blocks full 127.x loopback range', () => {
  assert.ok(!isValidUrl('https://127.0.0.2/'));
  assert.ok(!isValidUrl('https://127.255.255.255/'));
});

test('isValidUrl blocks link-local 169.254.x', () => {
  assert.ok(!isValidUrl('https://169.254.1.1/'));
  assert.ok(!isValidUrl('https://169.254.169.254/'));
});

test('isValidUrl rejects all IP literals, including public-looking ones', () => {
  assert.ok(!isValidUrl('https://172.16.0.1/'));
  assert.ok(!isValidUrl('https://172.31.255.255/'));
  assert.ok(!isValidUrl('https://172.32.0.1/'));
  assert.ok(!isValidUrl('https://8.8.8.8/'));
});

test('isValidUrl blocks IPv6 private ranges', () => {
  assert.ok(!isValidUrl('https://[fc00::1]/'));
  assert.ok(!isValidUrl('https://[fd12::1]/'));
  assert.ok(!isValidUrl('https://[fe80::1]/'));
  assert.ok(!isValidUrl('https://[::ffff:127.0.0.1]/'));
});

test('isValidUrl still allows legitimate URLs', () => {
  assert.ok(isValidUrl('https://docs.example.com'));
  assert.ok(isValidUrl('https://example.com/docs'));
  assert.ok(isValidUrl('https://example.com/path'));
});

test('isValidUrl rejects non-HTTPS and credentialed URLs', () => {
  assert.equal(getUrlValidationError('http://docs.example.com'), 'URL must use https');
  assert.equal(getUrlValidationError('https://user:pass@example.com'), 'URL must not include credentials');
});

test('isPrivateIpAddress recognizes non-public ranges', () => {
  assert.equal(isPrivateIpAddress('10.0.0.1'), true);
  assert.equal(isPrivateIpAddress('100.64.0.1'), true);
  assert.equal(isPrivateIpAddress('198.18.0.1'), true);
  assert.equal(isPrivateIpAddress('224.0.0.1'), true);
  assert.equal(isPrivateIpAddress('2001:db8::1'), true);
  assert.equal(isPrivateIpAddress('2606:4700:4700::1111'), false);
});

test('assertPublicHttpsUrl rejects DNS results that resolve private', async () => {
  await assert.rejects(
    () => assertPublicHttpsUrl('https://docs.example.com', async () => [{ address: '127.0.0.1', family: 4 }]),
    /non-public address/,
  );
});

test('assertPublicHttpsUrl accepts HTTPS hostnames resolving to public addresses', async () => {
  const url = await assertPublicHttpsUrl(
    'https://docs.example.com/path',
    async () => [{ address: '93.184.216.34', family: 4 }],
  );
  assert.equal(url.hostname, 'docs.example.com');
});

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
    'settings.local.json.example should exist'
  );
  assert.ok(
    !existsSync('templates/.claude/settings.local.json'),
    'settings.local.json should NOT exist (renamed to .example)'
  );
});
