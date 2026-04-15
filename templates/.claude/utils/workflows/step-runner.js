/**
 * Step Runner
 * Execute individual workflow steps
 */

import { spawn } from 'child_process';
import readline from 'readline';

const SAFE_PARENT_ENV_KEYS = [
  'PATH',
  'HOME',
  'LANG',
  'LC_ALL',
  'TERM',
  'TMPDIR',
  'TMP',
  'TEMP',
  'USER',
  'LOGNAME',
  'SHELL',
  'PWD',
  'SystemRoot',
  'ComSpec',
  'WINDIR'
];

export class StepRunner {
  constructor(options = {}) {
    this.options = {
      allowShell: false,
      ...options
    };
  }

  buildExecutionEnv(stepEnv = {}) {
    const env = {};

    for (const key of SAFE_PARENT_ENV_KEYS) {
      if (process.env[key]) {
        env[key] = process.env[key];
      }
    }

    for (const [key, value] of Object.entries(stepEnv)) {
      if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
        continue;
      }

      env[key] = String(value);
    }

    return env;
  }

  /**
   * Run bash command
   * @param {object} step - Step definition
   * @param {object} state - Workflow state
   * @returns {Promise<object>} Execution result
   */
  async runBash(step, state) {
    if (!this.options.allowShell) {
      throw new Error(
        'Shell execution is disabled by default. Review the workflow and rerun with --allow-shell to execute bash steps.',
      );
    }

    // SECURITY: Shell-escape substituted variable values to prevent injection
    const command = state.substituteVariables(step.bash, { shellEscape: true });
    const timeout = step.timeout || 120000; // 2 minutes default

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const child = spawn('bash', ['-c', command], {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: this.buildExecutionEnv(state.getEnv())
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        if (this.options.verbose) {
          process.stdout.write(text);
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        if (this.options.verbose) {
          process.stderr.write(text);
        }
      });

      // Timeout
      const timeoutId = setTimeout(() => {
        child.kill();
        reject(new Error(`Command timeout after ${timeout}ms`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        resolve({
          exitCode: code || 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          duration
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  /**
   * Run command
   * @param {object} step - Step definition
   * @param {object} state - Workflow state
   * @returns {Promise<object>} Execution result
   */
  async runCommand(step, state) {
    const command = state.substituteVariables(step.command).trim();

    if (command.startsWith('/')) {
      if (typeof this.options.commandHandler !== 'function') {
        throw new Error(
          'Claude slash-command workflow steps require an explicit commandHandler; refusing to continue without verified execution.',
        );
      }

      const startTime = Date.now();
      const result = await this.options.commandHandler({ ...step, command }, state);

      if (!result || typeof result !== 'object') {
        throw new Error(
          `Command handler for "${command}" must return a result object with a numeric exitCode.`,
        );
      }

      if (typeof result.exitCode !== 'number' || Number.isNaN(result.exitCode)) {
        throw new Error(
          `Command handler for "${command}" must return a numeric exitCode.`,
        );
      }

      return {
        stdout: '',
        stderr: '',
        duration: Date.now() - startTime,
        ...result
      };
    }

    return this.runBash({ ...step, bash: command }, state);
  }

  /**
   * Run manual checkpoint
   * @param {object} step - Step definition
   * @param {object} state - Workflow state
   * @returns {Promise<object>} Execution result
   */
  async runManual(step, state) {
    const message = state.substituteVariables(step.manual);
    const startTime = Date.now();

    if (typeof this.options.manualHandler === 'function') {
      return this.options.manualHandler({ ...step, manual: message }, state);
    }

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw new Error('Manual workflow steps require an interactive terminal');
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏸️  MANUAL CHECKPOINT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(message);
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Press Enter to continue...', () => {
        rl.close();
        console.log('');
        resolve({
          exitCode: 0,
          manual: true,
          duration: Date.now() - startTime
        });
      });
    });
  }
}
