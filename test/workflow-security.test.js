import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { StepRunner } from '../templates/.claude/utils/workflows/step-runner.js';
import { WorkflowEngine } from '../templates/.claude/utils/workflows/engine.js';

function createState(env = {}) {
  return {
    substituteVariables(value) {
      return value;
    },
    getEnv() {
      return env;
    }
  };
}

test('bash workflow steps are blocked unless shell execution is explicitly enabled', async () => {
  const runner = new StepRunner();

  await assert.rejects(
    () => runner.runBash({ bash: 'echo "unsafe"' }, createState()),
    /disabled by default/,
  );
});

test('workflow bash steps run with a scrubbed environment', async () => {
  const previousSecret = process.env.LEAK_ME;
  process.env.LEAK_ME = 'super-secret-token';

  try {
    const runner = new StepRunner({ allowShell: true });
    const result = await runner.runBash(
      {
        bash: 'printf "%s" "${LEAK_ME:-missing}|${NODE_ENV:-missing}|${CI:-missing}"'
      },
      createState({ NODE_ENV: 'production', CI: 'true' }),
    );

    assert.equal(result.stdout, 'missing|production|true');
  } finally {
    if (previousSecret === undefined) {
      delete process.env.LEAK_ME;
    } else {
      process.env.LEAK_ME = previousSecret;
    }
  }
});

test('slash-command workflow steps are rejected without a verified command handler', async () => {
  const runner = new StepRunner();

  await assert.rejects(
    () => runner.runCommand({ command: '/audit-code --strict' }, createState()),
    /explicit commandHandler/,
  );
});

test('slash-command workflow steps use the provided verified command handler result', async () => {
  let handledCommand = '';
  const runner = new StepRunner({
    commandHandler: async (step) => {
      handledCommand = step.command;
      return {
        exitCode: 0,
        stdout: 'verified',
        verified: true
      };
    }
  });

  const result = await runner.runCommand(
    { command: '/audit-code --strict' },
    createState(),
  );

  assert.equal(handledCommand, '/audit-code --strict');
  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, 'verified');
  assert.equal(result.verified, true);
});

test('confirm:true blocks execution until approved', async () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'claude-starter-workflow-'));
  const workflowPath = join(tempDir, 'confirm.yml');

  try {
    writeFileSync(
      workflowPath,
      [
        'name: "Confirmation Test"',
        'steps:',
        '  - name: "Protected Step"',
        '    confirm: true',
        '    bash: |',
        '      echo "should not run"'
      ].join('\n'),
      'utf8',
    );

    const engine = new WorkflowEngine({
      allowShell: true,
      confirmationHandler: async () => false
    });

    const result = await engine.execute(workflowPath);

    assert.equal(result.status, 'error');
    assert.match(result.error, /Confirmation rejected/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('workflow execution fails closed when slash-command steps have no verified handler', async () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'claude-starter-workflow-'));
  const workflowPath = join(tempDir, 'slash-command.yml');

  try {
    writeFileSync(
      workflowPath,
      [
        'name: "Slash Command Test"',
        'steps:',
        '  - name: "Audit"',
        '    command: /audit-code --strict'
      ].join('\n'),
      'utf8',
    );

    const engine = new WorkflowEngine();
    const result = await engine.execute(workflowPath);

    assert.equal(result.status, 'error');
    assert.match(result.error, /explicit commandHandler/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('shipped workflows use supported template syntax and avoid destructive rollback commands', () => {
  const workflowFiles = [
    resolve('templates/.claude/workflows/production-release.yml'),
    resolve('templates/.claude/workflows/hotfix.yml')
  ];

  for (const workflowFile of workflowFiles) {
    const content = readFileSync(workflowFile, 'utf8');

    assert.doesNotMatch(content, /\$\{inputs\./);
    assert.doesNotMatch(content, /git reset --hard/);
    assert.doesNotMatch(content, /git branch -D/);
    assert.doesNotMatch(content, /^\s*command:\s*\//m);
  }
});
