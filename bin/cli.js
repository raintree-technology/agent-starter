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
  .name('claude-starter')
  .version(pkg.version)
  .description('Claude Code starter kit: 6 depth-focused skills + TOON utilities');

program
  .command('init [dir]', { isDefault: true })
  .description('Initialize claude-starter in directory')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-f, --force', 'Overwrite existing files')
  .option('--profile <name>', 'Use preset profile (all, web-saas, fintech, minimal)')
  .option('--skills <list>', 'Comma-separated skills to install')
  .option('--no-toon', 'Skip TOON utilities')
  .action(init);

program
  .command('docs <action> [skill]')
  .description('Manage documentation (pull, update, status, sync)')
  .option('--stale-days <days>', 'Days before docs are considered stale', '7')
  .action(docs);

program.parse();
