import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function read(filePath) {
  return readFileSync(resolve(filePath), 'utf8');
}

test('skill installation docs require immutable commit-pinned artifacts', () => {
  const files = [
    'templates/.claude/commands/install-skill.md',
    'templates/.claude/commands/discover-skills.md'
  ];

  for (const file of files) {
    const content = read(file);

    assert.doesNotMatch(content, /raw\.githubusercontent\.com\/.+\/main\//);
    assert.doesNotMatch(content, /github\.com\/.+\/(?:blob|tree)\/main\//);
    assert.match(content, /commit[- ]pinned|commit SHA/i);
    assert.match(content, /SHA-256/i);
  }
});

test('security checklist references an implemented security test target', () => {
  const securityPolicy = read('SECURITY.md');
  const packageJson = JSON.parse(read('package.json'));

  assert.match(securityPolicy, /npm run test:security/);
  assert.equal(typeof packageJson.scripts?.['test:security'], 'string');
  assert.match(packageJson.scripts['test:security'], /node --test/);
});

test('workflow docs fail closed on slash-command steps and avoid rollback claims', () => {
  const workflowDocs = read('templates/.claude/commands/workflow.md');
  const composerDocs = read('templates/.claude/commands/meta/workflow-compose.md');

  assert.match(workflowDocs, /commandHandler/);
  assert.doesNotMatch(workflowDocs, /manual checkpoints rather than shell commands/);
  assert.doesNotMatch(workflowDocs, /Automatic rollback on failure/);

  assert.doesNotMatch(composerDocs, /command:\s*\//);
  assert.doesNotMatch(composerDocs, /Automatic rollback on failure/);
});
