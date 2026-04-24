import chalk from 'chalk';
import ora from 'ora';
import { resolve } from 'path';
import { pathExists } from 'fs-extra';
import { copySkill, getTemplatesDir } from '../utils/copy.js';
import { readManifest, readInstalledManifest, findSkill } from '../utils/manifest.js';

export async function update(skillIds = [], options = {}) {
  const claudeDir = resolve('.claude');

  // Check if .claude exists
  if (!await pathExists(claudeDir)) {
    console.log(chalk.yellow('\nNo .claude/ directory found.'));
    console.log(chalk.dim('Run `npx claude-starter` first to initialize.\n'));
    return;
  }

  console.log(chalk.bold('\n🔄 Updating Skills\n'));

  const manifest = readManifest(getTemplatesDir());
  const installed = readInstalledManifest('.');

  if (!installed) {
    console.log(chalk.yellow('No manifest found in .claude/'));
    return;
  }

  // Determine which skills to update
  let skillsToUpdate;

  if (options.all || skillIds.length === 0) {
    // Update all installed skills
    skillsToUpdate = installed.skills.map(s => s.id);
    console.log(chalk.dim(`Updating all ${skillsToUpdate.length} installed skills...\n`));
  } else {
    // Update specific skills
    skillsToUpdate = skillIds;
    console.log(chalk.dim(`Updating ${skillsToUpdate.length} skill(s)...\n`));
  }

  const results = { updated: [], skipped: [], failed: [] };

  for (const skillId of skillsToUpdate) {
    const skill = findSkill(manifest, skillId);

    if (!skill) {
      results.skipped.push({ id: skillId, reason: 'not found in template' });
      continue;
    }

    const spinner = ora(`Updating ${skillId}...`).start();

    try {
      // Check if installed
      const skillPath = resolve(claudeDir, skill.path);
      if (!await pathExists(skillPath)) {
        spinner.warn(`${skillId} - not installed`);
        results.skipped.push({ id: skillId, reason: 'not installed' });
        continue;
      }

      // Compare versions if available
      const installedSkill = installed.skills.find(s => s.id === skillId);
      const templateVersion = skill.version || '1.0.0';
      const installedVersion = installedSkill?.version || '1.0.0';

      if (templateVersion === installedVersion && !options.force) {
        spinner.info(`${skillId} - already at latest (${templateVersion})`);
        results.skipped.push({ id: skillId, reason: 'up to date' });
        continue;
      }

      // Update skill
      await copySkill('.', skill.path, { force: true });

      spinner.succeed(`${skillId} - updated to ${templateVersion}`);
      results.updated.push(skillId);

    } catch (error) {
      spinner.fail(`${skillId} - ${error.message}`);
      results.failed.push({ id: skillId, error: error.message });
    }
  }

  // Summary
  console.log('\n' + chalk.dim('─'.repeat(40)));

  if (results.updated.length > 0) {
    console.log(chalk.green(`Updated: ${results.updated.length}`));
  }
  if (results.skipped.length > 0) {
    console.log(chalk.dim(`Skipped: ${results.skipped.length}`));
  }
  if (results.failed.length > 0) {
    console.log(chalk.red(`Failed: ${results.failed.length}`));
  }

  console.log('');
}
