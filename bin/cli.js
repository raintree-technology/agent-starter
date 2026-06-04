#!/usr/bin/env node

import { program } from 'commander';
import { init } from '../src/commands/init.js';
import { docs } from '../src/commands/docs.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

program
  .name('agent-starter')
  .version(pkg.version)
  .description('Agent starter kit: 28 depth-focused skills for Claude Code, Codex, and Cursor');

program
  .command('init [dir]', { isDefault: true })
  .description('Initialize agent-starter in directory')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-f, --force', 'Overwrite existing files')
  .option('--agent <list>', 'Agent target(s): claude, codex, cursor, or all', 'claude')
  .option('--profile <name>', 'Use preset profile (all, apple-hig, design-hci, minimal)')
  .option('--skills <list>', 'Comma-separated skills to install')
  .option('--no-toon', 'Skip TOON utilities')
  .action(init);

program
  .command('docs <action> [skill]')
  .description('Manage documentation (pull, update, status, sync)')
  .option('--stale-days <days>', 'Days before docs are considered stale', '7')
  .action(docs);

program.parse();
