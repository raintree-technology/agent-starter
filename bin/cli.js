#!/usr/bin/env node

import { program } from 'commander';
import { init } from '../src/commands/init.js';
import { add } from '../src/commands/add.js';
import { list } from '../src/commands/list.js';
import { update } from '../src/commands/update.js';
import { docs } from '../src/commands/docs.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

program
  .name('claude-starter')
  .version(pkg.version)
  .description('Claude Code starter kit with 40+ skills and docpull integration');

// Default command - init
program
  .argument('[dir]', 'Target directory', '.')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-f, --force', 'Overwrite existing files')
  .option('--profile <name>', 'Use preset profile (web-saas, blockchain, minimal)')
  .option('--skills <list>', 'Comma-separated skills to install')
  .option('--no-toon', 'Skip TOON utilities')
  .action(init);

// Init command (explicit)
program
  .command('init [dir]')
  .description('Initialize claude-starter in directory')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-f, --force', 'Overwrite existing files')
  .option('--profile <name>', 'Use preset profile (web-saas, blockchain, minimal)')
  .option('--skills <list>', 'Comma-separated skills to install')
  .option('--no-toon', 'Skip TOON utilities')
  .action(init);

// Add command
program
  .command('add <skills...>')
  .description('Add specific skills to existing setup')
  .option('-f, --force', 'Overwrite existing skills')
  .action(add);

// List command
program
  .command('list')
  .description('List all available skills')
  .option('-c, --category <name>', 'Filter by category')
  .option('-i, --installed', 'Show only installed skills')
  .option('-j, --json', 'Output as JSON')
  .action(list);

// Update command
program
  .command('update [skills...]')
  .description('Update installed skills to latest version')
  .option('-a, --all', 'Update all skills')
  .action(update);

// Docs command
program
  .command('docs <action> [skill]')
  .description('Manage documentation (pull, update, status, sync)')
  .option('--stale-days <days>', 'Days before docs are considered stale', '7')
  .action(docs);

program.parse();
