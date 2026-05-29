import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { resolve } from 'path';
import { pathExists } from 'fs-extra';
import { writeFile } from 'fs/promises';
import { copyAll, copySkills, copyEssentials, copyCommands, copyHooks, copyToonUtils } from '../utils/copy.js';
import { setupToonBinary } from '../utils/platform.js';
import { getProfiles, getProfile, getProfileChoices, getSkillChoices, skillIdToPath, SKILLS } from '../profiles.js';
import { generateSettings } from '../utils/settings.js';

function parseSkillList(skillsList) {
  return skillsList.split(',').map((skill) => skill.trim()).filter(Boolean);
}

function validateRequestedSkills(skillIds) {
  const knownSkillIds = new Set(SKILLS.map((skill) => skill.id));
  const unknownSkillIds = skillIds.filter((skillId) => !knownSkillIds.has(skillId));
  if (unknownSkillIds.length > 0) {
    throw new Error(`Unknown skill(s): ${unknownSkillIds.join(', ')}`);
  }
}

export async function init(dir = '.', options = {}) {
  const targetDir = resolve(dir);
  const claudeDir = resolve(targetDir, '.claude');
  let installedHooks = false;
  let installedToon = false;

  console.log(chalk.bold('\nClaude Starter\n'));

  if (await pathExists(claudeDir)) {
    if (!options.force && !options.yes) {
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: '.claude/ directory already exists. What would you like to do?',
        choices: [
          { name: 'Merge (keep existing, add missing)', value: 'merge' },
          { name: 'Overwrite (replace everything)', value: 'overwrite' },
          { name: 'Cancel', value: 'cancel' },
        ],
      }]);

      if (action === 'cancel') {
        console.log(chalk.yellow('Cancelled.'));
        return;
      }

      options.force = action === 'overwrite';
      options.merge = action === 'merge';
    }
  }

  if (!options.profile && !options.skills && !options.yes) {
    const { selectedProfile } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedProfile',
      message: 'Which skills do you want to install?',
      choices: getProfileChoices(),
      default: 'web-saas',
    }]);

    options.profile = selectedProfile;

    if (selectedProfile === 'custom') {
      const { selectedSkills } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'selectedSkills',
        message: 'Select skills to install (spacebar to select, enter to continue):',
        choices: getSkillChoices(),
        pageSize: 20,
      }]);

      if (selectedSkills.length === 0) {
        console.log(chalk.yellow('No skills selected. Cancelled.'));
        return;
      }

      options.skills = selectedSkills.join(',');
      options.profile = null;
    }
  }

  const spinner = ora('Installing claude-starter...').start();

  try {
    let installedSkills = [];

    if (options.profile) {
      const profile = getProfile(options.profile);
      if (!profile) {
        spinner.fail(`Unknown profile: ${options.profile}`);
        console.log(chalk.dim(`Available profiles: ${Object.keys(getProfiles()).join(', ')}`));
        return;
      }

      spinner.text = `Installing profile: ${profile.name}`;

      await copyEssentials(targetDir, options);

      if (profile.commands?.length > 0) {
        await copyCommands(targetDir, profile.commands, options);
      }

      if (profile.hooks && options.hooks !== false) {
        await copyHooks(targetDir, options);
        installedHooks = true;
      }

      if (profile.skills.length === SKILLS.length) {
        spinner.text = 'Installing all skills...';
        await copyAll(targetDir, options);
      } else {
        await copySkills(targetDir, profile.skills.map(skillIdToPath), options);
      }
      installedSkills = profile.skills;
      installedToon = options.toon !== false && installedSkills.includes('toon-formatter');
      if (installedToon) {
        await copyToonUtils(targetDir, options);
      }

      spinner.succeed(`Installed profile: ${profile.name} (${installedSkills.length} skills)`);
    } else if (options.skills) {
      const skillIds = parseSkillList(options.skills);
      validateRequestedSkills(skillIds);

      spinner.text = `Installing ${skillIds.length} skills...`;

      await copyEssentials(targetDir, options);

      if (options.hooks) {
        await copyHooks(targetDir, options);
        installedHooks = true;
      }

      await copySkills(targetDir, skillIds.map(skillIdToPath), options);
      installedSkills = skillIds;
      installedToon = options.toon !== false && installedSkills.includes('toon-formatter');
      if (installedToon) {
        await copyToonUtils(targetDir, options);
      }

      spinner.succeed(`Installed ${skillIds.length} skills`);
    } else {
      spinner.text = 'Copying all skills and configurations...';
      await copyAll(targetDir, options);
      installedSkills = SKILLS.map((s) => s.id);
      installedHooks = options.hooks !== false;
      installedToon = options.toon !== false;
      spinner.succeed('Installed all skills and configurations');
    }

    spinner.start('Generating settings.json...');
    const settings = generateSettings(installedSkills, {
      hooks: installedHooks,
      toon: installedToon,
    });
    await writeFile(resolve(claudeDir, 'settings.json'), settings, 'utf-8');
    spinner.succeed('Generated settings.json');

    if (installedToon) {
      const toonResult = setupToonBinary(resolve(targetDir, '.claude'));
      if (!toonResult.success) {
        throw new Error(toonResult.error);
      }
    }

    console.log('\n' + chalk.green('Claude starter installed successfully.') + '\n');
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.dim('  Pull external docs for a skill (requires docpull):'));
    console.log(`     ${chalk.cyan('npx claude-starter docs pull stripe')}`);
    console.log(chalk.dim('  Or all docs at once:'));
    console.log(`     ${chalk.cyan('npx claude-starter docs pull')}\n`);
  } catch (error) {
    spinner.fail('Installation failed');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
