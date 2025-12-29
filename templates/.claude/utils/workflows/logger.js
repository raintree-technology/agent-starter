/**
 * Workflow Logger
 * Formatted console output for workflows
 */

export class WorkflowLogger {
  constructor() {
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m'
    };
  }

  info(message, ...args) {
    console.log(`${this.colors.blue}ℹ${this.colors.reset} ${message}`, ...args);
  }

  success(message, ...args) {
    console.log(`${this.colors.green}✓${this.colors.reset} ${message}`, ...args);
  }

  warn(message, ...args) {
    console.log(`${this.colors.yellow}⚠${this.colors.reset} ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`${this.colors.red}✗${this.colors.reset} ${message}`, ...args);
  }

  step(message, ...args) {
    console.log(`${this.colors.cyan}▶${this.colors.reset} ${message}`, ...args);
  }

  debug(message, ...args) {
    console.log(`${this.colors.dim}${message}${this.colors.reset}`, ...args);
  }
}
