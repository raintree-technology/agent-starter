import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('shared template settings stay fail-closed', () => {
  const settingsPath = resolve('templates/.claude/settings.json');
  const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));

  assert.equal(settings.permissions, undefined);
  assert.equal(settings.hooks, undefined);
  assert.match(
    settings.description,
    /\.claude\/settings\.local\.json/,
  );
});
