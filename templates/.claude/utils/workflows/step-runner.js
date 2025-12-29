/**
 * Step Runner
 * Execute individual workflow steps
 */

import { spawn } from 'child_process';
import readline from 'readline';

export class StepRunner {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Run bash command
   * @param {object} step - Step definition
   * @param {object} state - Workflow state
   * @returns {Promise<object>} Execution result
   */
  async runBash(step, state) {
    const command = state.substituteVariables(step.bash);
    const timeout = step.timeout || 120000; // 2 minutes default

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const child = spawn('bash', ['-c', command], {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env, ...state.getEnv() }
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
    const command = state.substituteVariables(step.command);

    // For now, treat commands like bash
    // In practice, this would invoke Claude Code commands
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
          manual: true
        });
      });
    });
  }
}
