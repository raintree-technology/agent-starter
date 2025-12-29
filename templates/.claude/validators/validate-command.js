#!/usr/bin/env node

/**
 * Command Validator
 * Validates Claude Code command markdown files against schema
 * Usage: node validate-command.js <command-file>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load schema
const schemaPath = path.join(__dirname, 'command-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Reserved command names
const RESERVED_NAMES = [
  'help', 'version', 'init', 'config', 'settings',
  'claude', 'agent', 'system', 'internal'
];

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validate = ajv.compile(schema);

/**
 * Parse frontmatter from markdown file
 * @param {string} content - Markdown file content
 * @returns {object} Parsed frontmatter
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      // Try to parse as JSON
      try {
        frontmatter[key.trim()] = JSON.parse(value);
      } catch {
        frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  return frontmatter;
}

/**
 * Extract metadata from markdown content
 * @param {string} content - Markdown file content
 * @returns {object} Extracted metadata
 */
function extractMetadata(content) {
  const metadata = {};

  // Extract title (first # heading)
  const titleMatch = content.match(/^#\s+(.+)/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract usage
  const usageMatch = content.match(/\*\*Usage:\*\*\s+`\/([a-z-]+)/);
  if (usageMatch) {
    metadata.commandName = usageMatch[1];
  }

  // Extract arguments
  const argsSection = content.match(/\*\*Arguments?:\*\*\s*([\s\S]*?)(?=\n\*\*|\n##|\n---|\n```|$)/);
  if (argsSection) {
    const args = [];
    const argRegex = /[-*]\s+`([^`]+)`\s+\(([^)]+)\)\s+-\s+(.+)/g;
    let argMatch;
    while ((argMatch = argRegex.exec(argsSection[1])) !== null) {
      args.push({
        name: argMatch[1],
        type: argMatch[2],
        description: argMatch[3].trim()
      });
    }
    if (args.length > 0) {
      metadata.arguments = args;
    }
  }

  // Extract options
  const optionsSection = content.match(/\*\*Options?:\*\*\s*([\s\S]*?)(?=\n\*\*|\n##|\n---|\n```|$)/);
  if (optionsSection) {
    const options = [];
    const optionRegex = /[-*]\s+`(--[a-z-]+)`\s+-\s+(.+)/g;
    let optionMatch;
    while ((optionMatch = optionRegex.exec(optionsSection[1])) !== null) {
      options.push({
        flag: optionMatch[1],
        description: optionMatch[2].trim()
      });
    }
    if (options.length > 0) {
      metadata.options = options;
    }
  }

  // Extract examples
  const examplesSection = content.match(/##\s+Examples?\s*([\s\S]*?)(?=\n##|$)/);
  if (examplesSection) {
    const examples = [];
    const exampleRegex = /[-*]\s+`([^`]+)`\s+-?\s*(.+)?/g;
    let exampleMatch;
    while ((exampleMatch = exampleRegex.exec(examplesSection[1])) !== null) {
      examples.push({
        command: exampleMatch[1],
        description: exampleMatch[2] ? exampleMatch[2].trim() : ''
      });
    }
    if (examples.length > 0) {
      metadata.examples = examples;
    }
  }

  return metadata;
}

/**
 * Validate command name
 * @param {string} name - Command name
 * @returns {object} Validation result
 */
function validateCommandName(name) {
  const errors = [];

  // Check reserved names
  if (RESERVED_NAMES.includes(name)) {
    errors.push({
      type: 'reserved_name',
      message: `Command name "${name}" is reserved and cannot be used`,
      severity: 'error'
    });
  }

  // Check naming convention (kebab-case)
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    errors.push({
      type: 'naming_convention',
      message: `Command name "${name}" must be kebab-case (lowercase, alphanumeric with hyphens)`,
      severity: 'error'
    });
  }

  // Check length
  if (name.length < 2) {
    errors.push({
      type: 'name_too_short',
      message: `Command name "${name}" is too short (minimum 2 characters)`,
      severity: 'error'
    });
  }

  if (name.length > 50) {
    errors.push({
      type: 'name_too_long',
      message: `Command name "${name}" is too long (maximum 50 characters)`,
      severity: 'error'
    });
  }

  // Check for consecutive hyphens
  if (/--/.test(name)) {
    errors.push({
      type: 'consecutive_hyphens',
      message: `Command name "${name}" contains consecutive hyphens`,
      severity: 'warning'
    });
  }

  // Check for leading/trailing hyphens
  if (/^-|-$/.test(name)) {
    errors.push({
      type: 'hyphen_position',
      message: `Command name "${name}" cannot start or end with a hyphen`,
      severity: 'error'
    });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors
  };
}

/**
 * Check for conflicts with existing commands
 * @param {string} name - Command name
 * @param {string} commandsDir - Commands directory
 * @returns {object} Conflict check result
 */
function checkConflicts(name, commandsDir) {
  const conflicts = [];

  // Check all command directories
  const commandDirs = [
    path.join(commandsDir, 'meta'),
    path.join(commandsDir, 'generated'),
    commandsDir
  ];

  for (const dir of commandDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const metadata = extractMetadata(content);

      if (metadata.commandName === name) {
        conflicts.push({
          file: path.relative(commandsDir, filePath),
          path: filePath
        });
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

/**
 * Validate command file
 * @param {string} filePath - Path to command file
 * @returns {object} Validation result
 */
export function validateCommandFile(filePath) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    file: filePath
  };

  // Check file exists
  if (!fs.existsSync(filePath)) {
    result.valid = false;
    result.errors.push({
      type: 'file_not_found',
      message: `File not found: ${filePath}`,
      severity: 'error'
    });
    return result;
  }

  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    result.valid = false;
    result.errors.push({
      type: 'read_error',
      message: `Failed to read file: ${error.message}`,
      severity: 'error'
    });
    return result;
  }

  // Parse frontmatter (optional)
  const frontmatter = parseFrontmatter(content);

  // Extract metadata from markdown
  const metadata = extractMetadata(content);

  // Combine frontmatter and metadata
  const commandData = { ...metadata, ...frontmatter };

  // Validate command name
  if (commandData.commandName || commandData.name) {
    const name = commandData.commandName || commandData.name;
    const nameValidation = validateCommandName(name);

    if (!nameValidation.valid) {
      result.valid = false;
      result.errors.push(...nameValidation.errors.filter(e => e.severity === 'error'));
      result.warnings.push(...nameValidation.errors.filter(e => e.severity === 'warning'));
    }

    // Add validated name to command data
    commandData.name = name;
  } else {
    result.errors.push({
      type: 'missing_name',
      message: 'Command name not found in file',
      severity: 'error'
    });
    result.valid = false;
  }

  // Validate against JSON schema
  if (frontmatter) {
    const valid = validate(commandData);

    if (!valid) {
      result.valid = false;
      result.errors.push(...validate.errors.map(err => ({
        type: 'schema_validation',
        message: `${err.instancePath} ${err.message}`,
        severity: 'error',
        data: err
      })));
    }
  }

  // Check required sections
  const requiredSections = ['Usage', 'Purpose', 'Workflow', 'Examples'];
  for (const section of requiredSections) {
    if (!new RegExp(`##\\s+${section}`, 'i').test(content)) {
      result.warnings.push({
        type: 'missing_section',
        message: `Missing recommended section: ${section}`,
        severity: 'warning'
      });
    }
  }

  // Check for code blocks
  if (!/```/.test(content)) {
    result.warnings.push({
      type: 'no_code_blocks',
      message: 'Command has no code blocks (examples recommended)',
      severity: 'info'
    });
  }

  return result;
}

/**
 * Format validation results
 * @param {object} result - Validation result
 * @returns {string} Formatted output
 */
function formatResults(result) {
  const lines = [];

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('Command Validation Results');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`File: ${result.file}`);
  lines.push(`Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
  lines.push('');

  if (result.errors.length > 0) {
    lines.push('Errors:');
    for (const error of result.errors) {
      lines.push(`  ❌ ${error.message}`);
    }
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('Warnings:');
    for (const warning of result.warnings) {
      lines.push(`  ⚠️  ${warning.message}`);
    }
    lines.push('');
  }

  if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
    lines.push('✅ No issues found!');
    lines.push('');
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return lines.join('\n');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node validate-command.js <command-file>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  const result = validateCommandFile(filePath);

  console.log(formatResults(result));

  process.exit(result.valid ? 0 : 1);
}
