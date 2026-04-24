import chalk from 'chalk';
import ora from 'ora';
import { resolve } from 'path';
import { pathExists } from 'fs-extra';
import { copySkill, getTemplatesDir } from '../utils/copy.js';
import { readManifest, findSkill, getAllDependencies } from '../utils/manifest.js';

export async function add(skillIds, options = {}) {
  const claudeDir = resolve('.claude');

  // Check if .claude exists
  if (!await pathExists(claudeDir)) {
    console.log(chalk.yellow('\nNo .claude/ directory found.'));
    console.log(chalk.dim('Run `npx claude-starter` first to initialize.\n'));
    return;
  }

  const manifest = readManifest(getTemplatesDir());
  const spinner = ora('Adding skills...').start();

  try {
    // Collect all skills to install (including dependencies)
    const toInstall = new Set();
    const notFound = [];

    for (const skillId of skillIds) {
      const skill = findSkill(manifest, skillId);
      if (!skill) {
        notFound.push(skillId);
        continue;
      }

      toInstall.add(skillId);

      // Add dependencies
      const deps = getAllDependencies(manifest, skillId);
      deps.forEach(d => toInstall.add(d));
    }

    if (notFound.length > 0) {
      spinner.warn(`Skills not found: ${notFound.join(', ')}`);
    }

    if (toInstall.size === 0) {
      spinner.fail('No valid skills to install');
      return;
    }

    // Install skills
    const results = { success: [], skipped: [], failed: [] };

    for (const skillId of toInstall) {
      const skill = findSkill(manifest, skillId);
      if (!skill) continue;

      spinner.text = `Adding ${skillId}...`;

      try {
        const skillPath = skill.path;
        const destPath = resolve('.claude', skillPath);

        // Check if already installed
        if (await pathExists(destPath)) {
          if (!options.force) {
            results.skipped.push(skillId);
            continue;
          }
        }

        await copySkill('.', skillPath, { force: options.force });
        results.success.push(skillId);
      } catch (error) {
        results.failed.push({ id: skillId, error: error.message });
      }
    }

    // Report results
    if (results.success.length > 0) {
      spinner.succeed(`Added ${results.success.length} skill(s)`);
      console.log(chalk.green(`  Added: ${results.success.join(', ')}`));
    }

    if (results.skipped.length > 0) {
      console.log(chalk.yellow(`  Skipped (already installed): ${results.skipped.join(', ')}`));
      console.log(chalk.dim('    Use --force to overwrite'));
    }

    if (results.failed.length > 0) {
      console.log(chalk.red(`  Failed:`));
      for (const f of results.failed) {
        console.log(chalk.red(`    - ${f.id}: ${f.error}`));
      }
    }

    // Check for docs
    const skillsWithDocs = [...toInstall]
      .map(id => findSkill(manifest, id))
      .filter(s => s?.docs?.url);

    if (skillsWithDocs.length > 0) {
      console.log('\n' + chalk.dim('To pull documentation:'));
      for (const skill of skillsWithDocs) {
        console.log(chalk.cyan(`  npx claude-starter docs pull ${skill.id}`));
      }
    }

    console.log('');

  } catch (error) {
    spinner.fail('Failed to add skills');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
