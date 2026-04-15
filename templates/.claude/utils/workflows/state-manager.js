/**
 * Workflow State Manager
 * Manages workflow state and variable substitution
 */

export class WorkflowState {
  constructor({ workflow, inputs = {}, env = {} }) {
    this.workflow = workflow;
    this.inputs = this.validateInputs(inputs, workflow.inputs || {});
    this.env = { ...workflow.env, ...env };
    this.stepResults = new Map();
  }

  /**
   * Validate inputs against workflow input schema
   * @param {object} provided - Provided inputs
   * @param {object} schema - Input schema
   * @returns {object} Validated inputs
   */
  validateInputs(provided, schema) {
    const validated = {};

    for (const [name, config] of Object.entries(schema)) {
      let value = provided[name];

      // Use default if not provided
      if (value === undefined) {
        if (config.default !== undefined) {
          value = config.default;
        } else if (config.required) {
          throw new Error(`Required input "${name}" not provided`);
        }
      }

      // Validate type
      if (value !== undefined && config.type) {
        const actualType = typeof value;
        const expectedType = config.type;

        if (expectedType === 'number' && actualType !== 'number') {
          value = parseFloat(value);
          if (isNaN(value)) {
            throw new Error(`Input "${name}" must be a number`);
          }
        } else if (expectedType === 'boolean' && actualType !== 'boolean') {
          value = value === 'true' || value === true;
        }

        // Validate choices
        if (config.allowed && !config.allowed.includes(value)) {
          throw new Error(
            `Input "${name}" must be one of: ${config.allowed.join(', ')}`
          );
        }

        // Validate range
        if (expectedType === 'number') {
          if (config.min !== undefined && value < config.min) {
            throw new Error(`Input "${name}" must be >= ${config.min}`);
          }
          if (config.max !== undefined && value > config.max) {
            throw new Error(`Input "${name}" must be <= ${config.max}`);
          }
        }
      }

      validated[name] = value;
    }

    return validated;
  }

  /**
   * Escape a value for safe use in shell commands
   * Wraps in single quotes and escapes embedded single quotes
   * @param {string} str - Value to escape
   * @returns {string} Shell-safe value
   */
  static shellEscape(str) {
    if (typeof str !== 'string') return String(str);
    return "'" + str.replace(/'/g, "'\\''") + "'";
  }

  /**
   * Substitute variables in text
   * @param {string} text - Text with ${{}expressions
   * @param {object} options - Options
   * @param {boolean} options.shellEscape - Shell-escape substituted values (use for bash contexts)
   * @returns {string} Substituted text
   */
  substituteVariables(text, options = {}) {
    if (typeof text !== 'string') {
      return text;
    }

    return text.replace(/\$\{\{\s*(.+?)\s*\}\}/g, (match, expr) => {
      try {
        const value = this.evaluate(expr);
        if (value === undefined) return match;
        const strValue = String(value);
        // SECURITY: Shell-escape substituted values when destined for bash
        if (options.shellEscape) {
          return WorkflowState.shellEscape(strValue);
        }
        return strValue;
      } catch (error) {
        console.warn(`Failed to evaluate expression: ${expr}`);
        return match;
      }
    });
  }

  /**
   * Evaluate expression
   * @param {string} expr - Expression to evaluate
   * @returns {any} Result
   */
  evaluate(expr) {
    // Handle simple property access
    if (expr.startsWith('inputs.')) {
      const key = expr.substring(7);
      return this.inputs[key];
    }

    if (expr.startsWith('env.')) {
      const key = expr.substring(4);
      return this.env[key];
    }

    if (expr.startsWith('steps.')) {
      return this.evaluateStepExpression(expr);
    }

    if (expr.startsWith('workflow.')) {
      return this.evaluateWorkflowExpression(expr);
    }

    // Try to evaluate as JavaScript expression
    try {
      const context = {
        inputs: this.inputs,
        env: this.env,
        steps: this.getStepsProxy(),
        workflow: {
          name: this.workflow.name,
          status: this.getWorkflowStatus()
        }
      };

      return this.evaluateInContext(expr, context);
    } catch (error) {
      throw new Error(`Failed to evaluate: ${expr}`);
    }
  }

  /**
   * Evaluate step expression
   * @param {string} expr - Expression
   * @returns {any} Result
   */
  evaluateStepExpression(expr) {
    const match = expr.match(/steps\.([^.]+)\.(.+)/);
    if (!match) {
      throw new Error(`Invalid step expression: ${expr}`);
    }

    const [, stepName, property] = match;
    const result = this.getStepResultByName(stepName);

    if (!result) {
      return undefined;
    }

    return result[property];
  }

  /**
   * Evaluate workflow expression
   * @param {string} expr - Expression
   * @returns {any} Result
   */
  evaluateWorkflowExpression(expr) {
    if (expr === 'workflow.name') {
      return this.workflow.name;
    }

    if (expr === 'workflow.status') {
      return this.getWorkflowStatus();
    }

    return undefined;
  }

  /**
   * Evaluate expression in context
   * @param {string} expr - Expression
   * @param {object} context - Context object
   * @returns {any} Result
   */
  evaluateInContext(expr, context) {
    // Simple safe evaluation without using eval()
    // Supports: property access, comparisons, basic operators

    // Handle comparisons
    const operators = ['==', '!=', '===', '!==', '>', '<', '>=', '<='];
    for (const op of operators) {
      if (expr.includes(op)) {
        const [left, right] = expr.split(op).map(s => s.trim());
        const leftVal = this.resolveValue(left, context);
        const rightVal = this.resolveValue(right, context);

        switch (op) {
          case '==': return leftVal == rightVal;
          case '!=': return leftVal != rightVal;
          case '===': return leftVal === rightVal;
          case '!==': return leftVal !== rightVal;
          case '>': return leftVal > rightVal;
          case '<': return leftVal < rightVal;
          case '>=': return leftVal >= rightVal;
          case '<=': return leftVal <= rightVal;
        }
      }
    }

    // Simple property access
    return this.resolveValue(expr, context);
  }

  /**
   * Resolve value from context
   * @param {string} path - Property path
   * @param {object} context - Context
   * @returns {any} Value
   */
  resolveValue(path, context) {
    // Remove quotes if string literal
    if ((path.startsWith('"') && path.endsWith('"')) ||
        (path.startsWith("'") && path.endsWith("'"))) {
      return path.slice(1, -1);
    }

    // Parse numbers
    if (/^-?\d+(\.\d+)?$/.test(path)) {
      return parseFloat(path);
    }

    // Parse booleans
    if (path === 'true') return true;
    if (path === 'false') return false;

    // Resolve from context
    const parts = path.split('.');
    let value = context;

    // SECURITY: Block prototype traversal keys
    const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

    for (const part of parts) {
      if (value === undefined || value === null) {
        return undefined;
      }
      // SECURITY: Prevent prototype pollution / traversal
      if (BLOCKED_KEYS.has(part)) {
        return undefined;
      }
      if (typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, part)) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Set step result
   * @param {number|string} stepId - Step index or name
   * @param {object} result - Result
   */
  setStepResult(stepId, result) {
    this.stepResults.set(stepId, result);
  }

  /**
   * Get step result by name
   * @param {string} name - Step name
   * @returns {object|undefined} Result
   */
  getStepResultByName(name) {
    // Find step by name
    for (let i = 0; i < this.workflow.steps.length; i++) {
      const step = this.workflow.steps[i];
      if (step.name === name) {
        return this.stepResults.get(i);
      }
    }

    return undefined;
  }

  /**
   * Get steps proxy for expression evaluation
   * @returns {object} Steps proxy
   */
  getStepsProxy() {
    const steps = {};

    for (let i = 0; i < this.workflow.steps.length; i++) {
      const step = this.workflow.steps[i];
      if (step.name) {
        steps[step.name] = this.stepResults.get(i) || {};
      }
    }

    return steps;
  }

  /**
   * Get workflow status
   * @returns {string} Status
   */
  getWorkflowStatus() {
    const results = Array.from(this.stepResults.values());

    if (results.some(r => r.exitCode !== 0)) {
      return 'failed';
    }

    if (results.length === this.workflow.steps.length) {
      return 'completed';
    }

    return 'running';
  }

  /**
   * Get environment variables
   * @returns {object} Environment variables
   */
  getEnv() {
    return { ...this.env };
  }

  /**
   * Evaluate expression and return boolean
   * @param {string} expr - Expression
   * @returns {boolean} Result
   */
  evaluateExpression(expr) {
    const result = this.evaluate(expr);
    return Boolean(result);
  }

  /**
   * Export state
   * @returns {object} State
   */
  export() {
    return {
      inputs: this.inputs,
      env: this.env,
      stepResults: Object.fromEntries(this.stepResults.entries())
    };
  }
}
