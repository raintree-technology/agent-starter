import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { resolve } from 'path';
import { pathExists } from 'fs-extra';
import { writeFile } from 'fs/promises';
import { copyAll, copySkills, copyEssentials, copyCommands, copyHooks, getTemplatesDir } from '../utils/copy.js';
import { readManifest, findSkill, getAllDependencies } from '../utils/manifest.js';
import { setupToonBinary } from '../utils/platform.js';
import { getProfiles, getProfile, getProfileChoices, getSkillChoices } from '../profiles.js';
import { generateSettings } from '../utils/settings.js';

export async function init(dir = '.', options = {}) {
  const targetDir = resolve(dir);
  const claudeDir = resolve(targetDir, '.claude');

  console.log(chalk.bold('\nClaude Starter\n'));

  // Check if .claude already exists
  if (await pathExists(claudeDir)) {
    if (!options.force && !options.yes) {
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: '.claude/ directory already exists. What would you like to do?',
        choices: [
          { name: 'Merge (keep existing, add missing)', value: 'merge' },
          { name: 'Overwrite (replace everything)', value: 'overwrite' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }]);

      if (action === 'cancel') {
        console.log(chalk.yellow('Cancelled.'));
        return;
      }

      options.force = action === 'overwrite';
      options.merge = action === 'merge';
    }
  }

  // Interactive profile selection if not specified
  if (!options.profile && !options.skills && !options.yes) {
    const { selectedProfile } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedProfile',
      message: 'Which skills do you want to install?',
      choices: getProfileChoices(),
      default: 'web-saas'
    }]);

    options.profile = selectedProfile;

    // If custom profile, let user pick skills
    if (selectedProfile === 'custom') {
      const { selectedSkills } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'selectedSkills',
        message: 'Select skills to install (spacebar to select, enter to continue):',
        choices: getSkillChoices(),
        pageSize: 20
      }]);

      if (selectedSkills.length === 0) {
        console.log(chalk.yellow('No skills selected. Cancelled.'));
        return;
      }

      options.skills = selectedSkills.join(',');
      options.profile = null; // Don't use profile, use skills
    }
  }

  const spinner = ora('Installing claude-starter...').start();

  try {
    const manifest = readManifest(getTemplatesDir());
    let installedSkills = [];

    // Handle profile selection
    if (options.profile) {
      const profile = getProfile(options.profile);
      if (!profile) {
        spinner.fail(`Unknown profile: ${options.profile}`);
        console.log(chalk.dim(`Available profiles: ${Object.keys(getProfiles()).join(', ')}`));
        return;
      }

      spinner.text = `Installing profile: ${profile.name}`;

      // Copy essentials first
      await copyEssentials(targetDir, options);

      // Copy commands if specified in profile
      if (profile.commands && profile.commands.length > 0) {
        await copyCommands(targetDir, profile.commands, options);
      }

      // Copy hooks if enabled in profile
      if (profile.hooks) {
        await copyHooks(targetDir, options);
      }

      // Handle wildcard (all skills)
      let skillsToInstall;
      if (profile.skills.includes('*')) {
        // Install all skills
        spinner.text = 'Installing all skills...';
        await copyAll(targetDir, options);
        installedSkills = manifest.skills?.map(s => s.id) || [];
      } else {
        // Get all skills with dependencies
        skillsToInstall = new Set(profile.skills);
        for (const skillId of profile.skills) {
          const deps = getAllDependencies(manifest, skillId);
          deps.forEach(d => skillsToInstall.add(d));
        }

        // Get skill paths
        const skillPaths = [...skillsToInstall].map(id => {
          const skill = findSkill(manifest, id);
          return skill?.path;
        }).filter(Boolean);

        await copySkills(targetDir, skillPaths, options);
        installedSkills = [...skillsToInstall];
      }

      spinner.succeed(`Installed profile: ${profile.name} (${installedSkills.length} skills)`);
    }
    // Handle selective skills
    else if (options.skills) {
      const skillIds = options.skills.split(',').map(s => s.trim());

      spinner.text = `Installing ${skillIds.length} skills...`;

      // Copy essentials first
      await copyEssentials(targetDir, options);

      // Copy hooks if enabled
      if (options.hooks) {
        await copyHooks(targetDir, options);
      }

      // Get all skills with dependencies
      const skillsToInstall = new Set(skillIds);
      for (const skillId of skillIds) {
        const deps = getAllDependencies(manifest, skillId);
        deps.forEach(d => skillsToInstall.add(d));
      }

      // Get skill paths
      const skillPaths = [...skillsToInstall].map(id => {
        const skill = findSkill(manifest, id);
        if (!skill) {
          console.log(chalk.yellow(`\nWarning: Skill not found: ${id}`));
          return null;
        }
        return skill.path;
      }).filter(Boolean);

      await copySkills(targetDir, skillPaths, options);
      installedSkills = [...skillsToInstall];

      spinner.succeed(`Installed ${skillPaths.length} skills`);
    }
    // Full install
    else {
      spinner.text = 'Copying all skills and configurations...';
      await copyAll(targetDir, options);
      installedSkills = manifest.skills?.map(s => s.id) || [];
      spinner.succeed('Installed all skills and configurations');
    }

    // Generate settings.json
    spinner.start('Generating settings.json...');
    const settings = generateSettings(installedSkills, {
      hooks: options.hooks !== false,
      toon: options.toon !== false
    });
    await writeFile(resolve(claudeDir, 'settings.json'), settings, 'utf-8');
    spinner.succeed('Generated settings.json');

    // Setup TOON binary
    if (options.toon !== false) {
      const toonResult = setupToonBinary(resolve(targetDir, '.claude'));
      if (!toonResult.success) {
        console.log(chalk.yellow(`\nNote: ${toonResult.error}`));
        if (toonResult.suggestion) {
          console.log(chalk.dim(toonResult.suggestion));
        }
      }
    }

    // Success message
    console.log('\n' + chalk.green('Claude starter installed successfully.') + '\n');
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.dim('  1. Pull documentation for skills you need:'));
    console.log(`     ${chalk.cyan('npx claude-starter docs pull stripe')}`);
    console.log(chalk.dim('  2. Or pull all documentation:'));
    console.log(`     ${chalk.cyan('npx claude-starter docs pull')}`);
    console.log(chalk.dim('  3. List available skills:'));
    console.log(`     ${chalk.cyan('npx claude-starter list')}\n`);

  } catch (error) {
    spinner.fail('Installation failed');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
