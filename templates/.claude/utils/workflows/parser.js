/**
 * Workflow Parser
 * Parse and validate YAML workflow files
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export class WorkflowParser {
  /**
   * Parse workflow file
   * @param {string} filePath - Path to workflow YAML
   * @returns {Promise<object>} Parsed workflow
   */
  async parse(filePath) {
    return this.parseSync(filePath);
  }

  /**
   * Parse workflow file synchronously
   * @param {string} filePath - Path to workflow YAML
   * @returns {object} Parsed workflow
   */
  parseSync(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Workflow file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');

    try {
      const workflow = yaml.load(content);
      return this.normalizeWorkflow(workflow);
    } catch (error) {
      throw new Error(`Failed to parse workflow YAML: ${error.message}`);
    }
  }

  /**
   * Normalize workflow structure
   * @param {object} workflow - Raw workflow
   * @returns {object} Normalized workflow
   */
  normalizeWorkflow(workflow) {
    return {
      name: workflow.name || 'Unnamed Workflow',
      version: workflow.version || '1.0',
      description: workflow.description || '',
      inputs: workflow.inputs || {},
      env: workflow.env || {},
      steps: workflow.steps || [],
      on_failure: workflow.on_failure || [],
      on_success: workflow.on_success || [],
      metadata: workflow.metadata || {}
    };
  }

  /**
   * Validate workflow
   * @param {object} workflow - Workflow to validate
   * @returns {object} Validation result
   */
  async validate(workflow) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!workflow.name) {
      errors.push('Workflow name is required');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Validate steps
    if (workflow.steps) {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        const stepErrors = this.validateStep(step, i);
        errors.push(...stepErrors);
      }
    }

    // Validate inputs
    if (workflow.inputs) {
      for (const [name, config] of Object.entries(workflow.inputs)) {
        if (config.type && !['string', 'number', 'boolean', 'choice'].includes(config.type)) {
          errors.push(`Invalid input type for "${name}": ${config.type}`);
        }

        if (config.type === 'choice' && !config.choices) {
          errors.push(`Input "${name}" has type "choice" but no choices defined`);
        }

        if (config.required && config.default !== undefined) {
          warnings.push(`Input "${name}" is required but has a default value`);
        }
      }
    }

    // Check for undefined variable references
    const undefinedVars = this.findUndefinedVariables(workflow);
    if (undefinedVars.length > 0) {
      warnings.push(`Potentially undefined variables: ${undefinedVars.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate step
   * @param {object} step - Step to validate
   * @param {number} index - Step index
   * @returns {Array} Errors
   */
  validateStep(step, index) {
    const errors = [];
    const stepId = step.name || `Step ${index + 1}`;

    // Step must have an action
    if (!step.bash && !step.command && !step.manual && !step.type && !step.workflow) {
      errors.push(`${stepId}: Step must have bash, command, manual, type, or workflow`);
    }

    // Validate bash
    if (step.bash && typeof step.bash !== 'string') {
      errors.push(`${stepId}: bash must be a string`);
    }

    // Validate command
    if (step.command && typeof step.command !== 'string') {
      errors.push(`${stepId}: command must be a string`);
    }

    // Validate timeout
    if (step.timeout !== undefined) {
      if (typeof step.timeout !== 'number' || step.timeout < 0) {
        errors.push(`${stepId}: timeout must be a positive number`);
      }
    }

    // Validate parallel/sequential steps
    if (step.type === 'parallel' || step.type === 'sequential') {
      if (!step.steps || !Array.isArray(step.steps)) {
        errors.push(`${stepId}: ${step.type} step must have steps array`);
      } else {
        for (let i = 0; i < step.steps.length; i++) {
          const subErrors = this.validateStep(step.steps[i], i);
          errors.push(...subErrors.map(e => `${stepId} > ${e}`));
        }
      }
    }

    return errors;
  }

  /**
   * Find undefined variable references
   * @param {object} workflow - Workflow
   * @returns {Array} Undefined variable names
   */
  findUndefinedVariables(workflow) {
    const defined = new Set();
    const referenced = new Set();

    // Add defined inputs
    if (workflow.inputs) {
      for (const name of Object.keys(workflow.inputs)) {
        defined.add(`inputs.${name}`);
      }
    }

    // Add defined env vars
    if (workflow.env) {
      for (const name of Object.keys(workflow.env)) {
        defined.add(`env.${name}`);
      }
    }

    // Add step outputs
    if (workflow.steps) {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        if (step.name) {
          defined.add(`steps.${step.name}.output`);
          defined.add(`steps.${step.name}.exit_code`);
        }
      }
    }

    // Find all variable references
    const findRefs = (obj) => {
      if (typeof obj === 'string') {
        const matches = obj.matchAll(/\$\{\{(.+?)\}\}/g);
        for (const match of matches) {
          const expr = match[1].trim();
          // Extract variable name (before . or operator)
          const varName = expr.split(/[.\s<>=!]/)[0];
          referenced.add(varName);
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const value of Object.values(obj)) {
          findRefs(value);
        }
      }
    };

    findRefs(workflow);

    // Find undefined
    const undefined = [];
    for (const ref of referenced) {
      if (!defined.has(ref) && !ref.startsWith('workflow.')) {
        undefined.push(ref);
      }
    }

    return undefined;
  }
}
