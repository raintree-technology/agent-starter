#!/usr/bin/env node

/**
 * Command Registry Manager
 * Updates the command registry with new/modified commands
 * Usage: node update-registry.js <operation> <command-file>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateCommandFile } from './validate-command.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.resolve(__dirname, '../command-registry.json');

/**
 * Load registry
 * @returns {object} Registry data
 */
function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    return {
      version: '1.0.0',
      commands: {},
      conflicts: [],
      reserved_names: ['help', 'version', 'init', 'config', 'settings']
    };
  }

  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (error) {
    console.error(`Failed to load registry: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Save registry
 * @param {object} registry - Registry data
 */
function saveRegistry(registry) {
  try {
    fs.writeFileSync(
      REGISTRY_PATH,
      JSON.stringify(registry, null, 2) + '\n',
      'utf8'
    );
  } catch (error) {
    console.error(`Failed to save registry: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Extract command metadata
 * @param {string} content - File content
 * @returns {object} Command metadata
 */
function extractMetadata(content) {
  const metadata = {};

  // Extract command name from usage
  const usageMatch = content.match(/\*\*Usage:\*\*\s+`\/([a-z-]+)/);
  if (usageMatch) {
    metadata.name = usageMatch[1];
  }

  // Extract description (first paragraph after title)
  const descMatch = content.match(/^#\s+.+\n\n(.+)/m);
  if (descMatch) {
    metadata.description = descMatch[1].trim();
  }

  // Extract arguments
  const argsSection = content.match(/\*\*Arguments?:\*\*\s*([\s\S]*?)(?=\n\*\*|\n##|\n---|\n```|$)/);
  if (argsSection) {
    const args = [];
    const argRegex = /[-*]\s+`([^`]+)`/g;
    let match;
    while ((match = argRegex.exec(argsSection[1])) !== null) {
      args.push(match[1]);
    }
    metadata.arguments = args;
  }

  // Extract tools (from frontmatter or content)
  const toolsMatch = content.match(/allowedTools:\s*\[(.*?)\]/s);
  if (toolsMatch) {
    metadata.tools = toolsMatch[1]
      .split(',')
      .map(t => t.trim().replace(/['"]/g, ''))
      .filter(Boolean);
  }

  return metadata;
}

/**
 * Add command to registry
 * @param {string} commandPath - Path to command file
 * @param {object} options - Options
 * @returns {object} Operation result
 */
export function addCommand(commandPath, options = {}) {
  const registry = loadRegistry();

  // Validate command file
  const validation = validateCommandFile(commandPath);
  if (!validation.valid && !options.force) {
    return {
      success: false,
      error: 'Command validation failed',
      validation
    };
  }

  // Read file
  const content = fs.readFileSync(commandPath, 'utf8');
  const metadata = extractMetadata(content);

  if (!metadata.name) {
    return {
      success: false,
      error: 'Could not extract command name from file'
    };
  }

  // Check if already exists
  if (registry.commands[metadata.name] && !options.force) {
    return {
      success: false,
      error: `Command "${metadata.name}" already exists in registry`,
      existing: registry.commands[metadata.name]
    };
  }

  // Determine command type
  const relativePath = path.relative(
    path.resolve(__dirname, '../commands'),
    commandPath
  );

  let type = 'standard';
  if (relativePath.startsWith('meta/')) {
    type = 'meta';
  } else if (relativePath.startsWith('generated/')) {
    type = 'generated';
  }

  // Add to registry
  registry.commands[metadata.name] = {
    path: relativePath,
    type,
    created: new Date().toISOString(),
    metadata: {
      description: metadata.description || '',
      arguments: metadata.arguments || [],
      tools: metadata.tools || []
    }
  };

  // Save registry
  saveRegistry(registry);

  return {
    success: true,
    command: metadata.name,
    registry: registry.commands[metadata.name]
  };
}

/**
 * Remove command from registry
 * @param {string} commandName - Command name
 * @returns {object} Operation result
 */
export function removeCommand(commandName) {
  const registry = loadRegistry();

  if (!registry.commands[commandName]) {
    return {
      success: false,
      error: `Command "${commandName}" not found in registry`
    };
  }

  const removed = registry.commands[commandName];
  delete registry.commands[commandName];

  saveRegistry(registry);

  return {
    success: true,
    command: commandName,
    removed
  };
}

/**
 * List all commands
 * @returns {object} Commands list
 */
export function listCommands() {
  const registry = loadRegistry();

  return {
    success: true,
    totalCommands: Object.keys(registry.commands).length,
    commands: registry.commands,
    byType: {
      standard: Object.values(registry.commands).filter(c => c.type === 'standard').length,
      meta: Object.values(registry.commands).filter(c => c.type === 'meta').length,
      generated: Object.values(registry.commands).filter(c => c.type === 'generated').length
    }
  };
}

/**
 * Update command metadata
 * @param {string} commandName - Command name
 * @param {object} updates - Metadata updates
 * @returns {object} Operation result
 */
export function updateCommand(commandName, updates) {
  const registry = loadRegistry();

  if (!registry.commands[commandName]) {
    return {
      success: false,
      error: `Command "${commandName}" not found in registry`
    };
  }

  registry.commands[commandName] = {
    ...registry.commands[commandName],
    ...updates,
    updated: new Date().toISOString()
  };

  saveRegistry(registry);

  return {
    success: true,
    command: commandName,
    updated: registry.commands[commandName]
  };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node update-registry.js <operation> [args...]');
    console.error('');
    console.error('Operations:');
    console.error('  add <command-file>     - Add command to registry');
    console.error('  remove <command-name>  - Remove command from registry');
    console.error('  list                   - List all commands');
    console.error('  update <command-name> <key=value> - Update command metadata');
    console.error('');
    console.error('Examples:');
    console.error('  node update-registry.js add ../commands/my-command.md');
    console.error('  node update-registry.js remove my-command');
    console.error('  node update-registry.js list');
    process.exit(1);
  }

  const operation = args[0];
  let result;

  switch (operation) {
    case 'add':
      if (args.length < 2) {
        console.error('Error: Missing command file path');
        process.exit(1);
      }
      result = addCommand(path.resolve(args[1]));
      break;

    case 'remove':
      if (args.length < 2) {
        console.error('Error: Missing command name');
        process.exit(1);
      }
      result = removeCommand(args[1]);
      break;

    case 'list':
      result = listCommands();
      break;

    case 'update':
      if (args.length < 3) {
        console.error('Error: Missing command name or updates');
        process.exit(1);
      }
      // Parse key=value pairs
      const updates = {};
      for (let i = 2; i < args.length; i++) {
        const [key, value] = args[i].split('=');
        updates[key] = value;
      }
      result = updateCommand(args[1], updates);
      break;

    default:
      console.error(`Error: Unknown operation "${operation}"`);
      process.exit(1);
  }

  console.log(JSON.stringify(result, null, 2));

  process.exit(result.success ? 0 : 1);
}
