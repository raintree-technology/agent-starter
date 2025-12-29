#!/usr/bin/env node

/**
 * Command Conflict Checker
 * Detects naming conflicts between commands
 * Usage: node check-conflicts.js <command-name> [commands-dir]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract command name from markdown file
 * @param {string} content - File content
 * @returns {string|null} Command name
 */
function extractCommandName(content) {
  // Try to find usage pattern: *Usage:* `/command-name`
  const usageMatch = content.match(/\*\*Usage:\*\*\s+`\/([a-z-]+)/);
  if (usageMatch) {
    return usageMatch[1];
  }

  // Try to find in title
  const titleMatch = content.match(/^#\s+([a-z-]+)/i);
  if (titleMatch) {
    const title = titleMatch[1].toLowerCase().replace(/\s+/g, '-');
    if (/^[a-z][a-z0-9-]*$/.test(title)) {
      return title;
    }
  }

  return null;
}

/**
 * Find all command files in directory
 * @param {string} dir - Directory to search
 * @returns {Array} List of command files with metadata
 */
function findCommands(dir) {
  const commands = [];

  if (!fs.existsSync(dir)) {
    return commands;
  }

  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', 'docs'].includes(entry.name)) {
          scan(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const commandName = extractCommandName(content);

          if (commandName) {
            commands.push({
              name: commandName,
              file: entry.name,
              path: fullPath,
              relativePath: path.relative(dir, fullPath),
              directory: path.dirname(path.relative(dir, fullPath))
            });
          }
        } catch (error) {
          console.error(`Error reading ${fullPath}: ${error.message}`);
        }
      }
    }
  }

  scan(dir);
  return commands;
}

/**
 * Check for conflicts
 * @param {string} commandName - Command name to check
 * @param {string} commandsDir - Commands directory
 * @returns {object} Conflict results
 */
export function checkConflicts(commandName, commandsDir) {
  const allCommands = findCommands(commandsDir);

  const conflicts = allCommands.filter(cmd => cmd.name === commandName);

  const similarNames = allCommands.filter(cmd => {
    if (cmd.name === commandName) return false;

    // Check for similar names
    const distance = levenshteinDistance(cmd.name, commandName);
    return distance <= 2; // Similar if edit distance <= 2
  });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    hasSimilar: similarNames.length > 0,
    similar: similarNames,
    totalCommands: allCommands.length,
    allCommands
  };
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Format conflict results
 * @param {string} commandName - Command name
 * @param {object} result - Conflict check result
 * @returns {string} Formatted output
 */
function formatResults(commandName, result) {
  const lines = [];

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('Command Conflict Check');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`Command: ${commandName}`);
  lines.push(`Total commands: ${result.totalCommands}`);
  lines.push('');

  if (result.hasConflicts) {
    lines.push('❌ CONFLICTS FOUND:');
    lines.push('');
    for (const conflict of result.conflicts) {
      lines.push(`  File: ${conflict.relativePath}`);
      lines.push(`  Directory: ${conflict.directory || 'root'}`);
      lines.push('');
    }
    lines.push('⚠️  This command name is already in use.');
    lines.push('   Choose a different name or remove the existing command.');
    lines.push('');
  } else {
    lines.push('✅ No conflicts found!');
    lines.push('');
  }

  if (result.hasSimilar) {
    lines.push('⚠️  SIMILAR NAMES:');
    lines.push('');
    for (const similar of result.similar) {
      lines.push(`  - ${similar.name} (${similar.relativePath})`);
    }
    lines.push('');
    lines.push('   Consider using a more distinct name to avoid confusion.');
    lines.push('');
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return lines.join('\n');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node check-conflicts.js <command-name> [commands-dir]');
    console.error('');
    console.error('Example:');
    console.error('  node check-conflicts.js my-command');
    console.error('  node check-conflicts.js my-command /path/to/.claude/commands');
    process.exit(1);
  }

  const commandName = args[0];
  const commandsDir = args[1] || path.resolve(__dirname, '../commands');

  const result = checkConflicts(commandName, commandsDir);

  console.log(formatResults(commandName, result));

  process.exit(result.hasConflicts ? 1 : 0);
}
