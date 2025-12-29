#!/usr/bin/env node

/**
 * Workflow Execution Engine
 * Executes YAML-defined workflows with step orchestration
 */

import { WorkflowParser } from './parser.js';
import { StepRunner } from './step-runner.js';
import { WorkflowState } from './state-manager.js';
import { WorkflowLogger } from './logger.js';
import fs from 'fs';
import path from 'path';

export class WorkflowEngine {
  constructor(options = {}) {
    this.parser = new WorkflowParser();
    this.stepRunner = new StepRunner(options);
    this.logger = new WorkflowLogger();
    this.options = options;
  }

  /**
   * Execute workflow from file
   * @param {string} workflowPath - Path to workflow YAML file
   * @param {object} inputs - Input parameters
   * @param {object} options - Execution options
   * @returns {Promise<object>} Execution result
   */
  async execute(workflowPath, inputs = {}, options = {}) {
    const dryRun = options.dryRun || false;
    const verbose = options.verbose || false;

    try {
      // 1. Parse workflow
      this.logger.info(`Loading workflow: ${workflowPath}`);
      const workflow = await this.parser.parse(workflowPath);

      if (verbose) {
        this.logger.debug('Workflow loaded:', workflow);
      }

      // 2. Validate workflow
      this.logger.info('Validating workflow...');
      const validation = await this.parser.validate(workflow);

      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
      }

      this.logger.success('Workflow validated');

      // 3. Initialize state
      const state = new WorkflowState({ workflow, inputs });

      if (dryRun) {
        this.logger.info('[DRY RUN] Workflow would execute with:');
        this.logger.info(`  Name: ${workflow.name}`);
        this.logger.info(`  Steps: ${workflow.steps?.length || 0}`);
        this.logger.info(`  Inputs:`, inputs);
        return {
          status: 'dry_run',
          workflow,
          state: state.export()
        };
      }

      // 4. Execute steps
      this.logger.info(`Executing workflow: ${workflow.name}`);
      const startTime = Date.now();

      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];

        this.logger.step(`[${i + 1}/${workflow.steps.length}] ${step.name || `Step ${i + 1}`}`);

        try {
          const result = await this.executeStep(step, state, verbose);
          state.setStepResult(i, result);

          if (result.exitCode !== 0 && step.fail_on_error !== false) {
            throw new Error(`Step failed with exit code ${result.exitCode}`);
          }

          this.logger.success(`Step completed (${result.duration}ms)`);
        } catch (error) {
          this.logger.error(`Step failed: ${error.message}`);

          // Execute failure handlers
          if (workflow.on_failure) {
            await this.executeFailureHandlers(workflow.on_failure, state);
          }

          throw new Error(`Workflow failed at step ${i + 1}: ${error.message}`);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.success(`Workflow completed successfully in ${duration}ms`);

      // Execute success handlers
      if (workflow.on_success) {
        await this.executeSuccessHandlers(workflow.on_success, state);
      }

      return {
        status: 'success',
        workflow,
        state: state.export(),
        duration
      };
    } catch (error) {
      this.logger.error(`Workflow execution failed: ${error.message}`);

      return {
        status: 'error',
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Execute a single step
   * @param {object} step - Step definition
   * @param {WorkflowState} state - Workflow state
   * @param {boolean} verbose - Verbose logging
   * @returns {Promise<object>} Step result
   */
  async executeStep(step, state, verbose) {
    // Check condition
    if (step.when) {
      const condition = state.evaluateExpression(step.when);
      if (!condition) {
        if (verbose) {
          this.logger.debug(`Step skipped (condition: ${step.when})`);
        }
        return { exitCode: 0, skipped: true };
      }
    }

    // Execute step based on type
    if (step.type === 'parallel') {
      return await this.executeParallelStep(step, state, verbose);
    } else if (step.type === 'sequential') {
      return await this.executeSequentialStep(step, state, verbose);
    } else if (step.bash) {
      return await this.stepRunner.runBash(step, state);
    } else if (step.command) {
      return await this.stepRunner.runCommand(step, state);
    } else if (step.manual) {
      return await this.stepRunner.runManual(step, state);
    } else {
      throw new Error(`Unknown step type: ${JSON.stringify(step)}`);
    }
  }

  /**
   * Execute parallel step
   * @param {object} step - Parallel step
   * @param {WorkflowState} state - State
   * @param {boolean} verbose - Verbose
   * @returns {Promise<object>} Result
   */
  async executeParallelStep(step, state, verbose) {
    const results = await Promise.all(
      step.steps.map(subStep => this.executeStep(subStep, state, verbose))
    );

    const allSucceeded = results.every(r => r.exitCode === 0);

    return {
      exitCode: allSucceeded ? 0 : 1,
      results
    };
  }

  /**
   * Execute sequential step
   * @param {object} step - Sequential step
   * @param {WorkflowState} state - State
   * @param {boolean} verbose - Verbose
   * @returns {Promise<object>} Result
   */
  async executeSequentialStep(step, state, verbose) {
    const results = [];

    for (const subStep of step.steps) {
      const result = await this.executeStep(subStep, state, verbose);
      results.push(result);

      if (result.exitCode !== 0) {
        return {
          exitCode: result.exitCode,
          results
        };
      }
    }

    return {
      exitCode: 0,
      results
    };
  }

  /**
   * Execute failure handlers
   * @param {Array} handlers - Failure handlers
   * @param {WorkflowState} state - State
   */
  async executeFailureHandlers(handlers, state) {
    this.logger.warn('Executing failure handlers...');

    for (const handler of handlers) {
      try {
        if (handler.command) {
          await this.stepRunner.runCommand(handler, state);
        } else if (handler.bash) {
          await this.stepRunner.runBash(handler, state);
        } else if (handler.message) {
          this.logger.error(state.substituteVariables(handler.message));
        }
      } catch (error) {
        this.logger.error(`Failure handler error: ${error.message}`);
      }
    }
  }

  /**
   * Execute success handlers
   * @param {Array} handlers - Success handlers
   * @param {WorkflowState} state - State
   */
  async executeSuccessHandlers(handlers, state) {
    for (const handler of handlers) {
      try {
        if (handler.command) {
          await this.stepRunner.runCommand(handler, state);
        } else if (handler.bash) {
          await this.stepRunner.runBash(handler, state);
        } else if (handler.message) {
          this.logger.success(state.substituteVariables(handler.message));
        }
      } catch (error) {
        this.logger.warn(`Success handler error: ${error.message}`);
      }
    }
  }

  /**
   * List available workflows
   * @param {string} workflowsDir - Workflows directory
   * @returns {Array} Available workflows
   */
  static listWorkflows(workflowsDir) {
    if (!fs.existsSync(workflowsDir)) {
      return [];
    }

    const files = fs.readdirSync(workflowsDir);
    const workflows = [];

    for (const file of files) {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        const filePath = path.join(workflowsDir, file);
        try {
          const parser = new WorkflowParser();
          const workflow = parser.parseSync(filePath);

          workflows.push({
            name: workflow.name || file,
            file,
            path: filePath,
            description: workflow.description || '',
            steps: workflow.steps?.length || 0
          });
        } catch (error) {
          // Skip invalid workflows
        }
      }
    }

    return workflows;
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node engine.js <workflow-file> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --input key=value    Pass input parameter');
    console.error('  --dry-run            Preview without execution');
    console.error('  --verbose            Verbose output');
    console.error('  --list               List available workflows');
    process.exit(1);
  }

  // Handle --list
  if (args[0] === '--list') {
    const workflowsDir = path.resolve('.claude/workflows');
    const workflows = WorkflowEngine.listWorkflows(workflowsDir);

    console.log('Available workflows:');
    console.log('');

    for (const wf of workflows) {
      console.log(`  ${wf.name}`);
      if (wf.description) {
        console.log(`    ${wf.description}`);
      }
      console.log(`    Steps: ${wf.steps}`);
      console.log(`    File: ${wf.file}`);
      console.log('');
    }

    process.exit(0);
  }

  const workflowPath = path.resolve(args[0]);

  // Parse options
  const inputs = {};
  let dryRun = false;
  let verbose = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--verbose') {
      verbose = true;
    } else if (args[i] === '--input' && args[i + 1]) {
      const [key, ...valueParts] = args[i + 1].split('=');
      inputs[key] = valueParts.join('=');
      i++;
    }
  }

  // Execute
  const engine = new WorkflowEngine();
  const result = await engine.execute(workflowPath, inputs, { dryRun, verbose });

  process.exit(result.status === 'success' || result.status === 'dry_run' ? 0 : 1);
}
