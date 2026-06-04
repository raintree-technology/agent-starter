import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { join, resolve } from 'path';
import { pathExists } from 'fs-extra';
import {
  copyAgentEssentials,
  copyAgentSkills,
  copyAll,
  copySkills,
  copyEssentials,
  copyCommands,
  copyHooks,
  copyToonUtils,
  writeCodexAgentsFile,
  writeCursorProjectRule,
} from '../utils/copy.js';
import { setupToonBinary } from '../utils/toon.js';
import { profiles, getProfile, getProfileChoices, getSkillChoices, SKILLS } from '../profiles.js';
import { AGENT_TARGETS, formatAgentTargets, parseAgentTargets } from '../agents.js';

function parseSkillList(skillsList) {
  return [...new Set(skillsList.split(',').map((skill) => skill.trim()).filter(Boolean))];
}

function validateRequestedSkills(skillIds) {
  const knownSkillIds = new Set(SKILLS.map((skill) => skill.id));
  const unknownSkillIds = skillIds.filter((skillId) => !knownSkillIds.has(skillId));
  if (unknownSkillIds.length > 0) {
    throw new Error(`Unknown skill(s): ${unknownSkillIds.join(', ')}`);
  }
}

async function findExistingAgentTargets(targetDir, agentTargets) {
  const targetPaths = {
    claude: ['.claude'],
    codex: ['.codex', 'AGENTS.md'],
    cursor: ['.cursor'],
  };
  const existing = [];

  for (const agent of agentTargets) {
    for (const relPath of targetPaths[agent] || []) {
      if (await pathExists(resolve(targetDir, relPath))) {
        existing.push(relPath);
      }
    }
  }

  return existing;
}

async function installClaude(targetDir, installPlan, options) {
  const claudeDir = resolve(targetDir, '.claude');
  const installedToon = options.toon !== false && installPlan.skills.includes('toon-formatter');

  if (installPlan.copyWholeClaudeTemplate) {
    await copyAll(targetDir, options);
  } else {
    await copyEssentials(targetDir, options);

    if (installPlan.commands.length > 0) {
      await copyCommands(targetDir, installPlan.commands, options);
    }

    if (installPlan.hooks && options.hooks !== false) {
      await copyHooks(targetDir, options);
    }

    await copySkills(targetDir, installPlan.skills, options);
  }

  if (installedToon) {
    await copyToonUtils(targetDir, options);
    const toonResult = setupToonBinary(claudeDir);
    if (!toonResult.success) {
      throw new Error(toonResult.error);
    }
  }
}

async function installCodex(targetDir, installPlan, options) {
  await copyAgentEssentials(targetDir, 'codex', options);
  await copyAgentSkills(targetDir, 'codex', installPlan.skills, options);
  await writeCodexAgentsFile(targetDir, installPlan.skills, options);
}

async function installCursor(targetDir, installPlan, options) {
  await copyAgentEssentials(targetDir, 'cursor', options);
  await copyAgentSkills(targetDir, 'cursor', installPlan.skills, options);
  await writeCursorProjectRule(targetDir, installPlan.skills, options);
}

export async function init(dir = '.', options = {}) {
  const targetDir = resolve(dir);
  const agentTargets = parseAgentTargets(options.agent || 'claude');

  console.log(chalk.bold('\nAgent Starter\n'));

  const existingTargets = await findExistingAgentTargets(targetDir, agentTargets);
  if (existingTargets.length > 0) {
    if (!options.force && !options.yes) {
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: `${existingTargets.join(', ')} already exist. What would you like to do?`,
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
      default: 'all',
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

  const spinner = ora('Installing agent-starter...').start();

  try {
    const installPlan = {
      skills: [],
      commands: [],
      hooks: false,
      copyWholeClaudeTemplate: false,
      label: 'all skills',
    };

    if (options.profile) {
      const profile = getProfile(options.profile);
      if (!profile) {
        spinner.fail(`Unknown profile: ${options.profile}`);
        console.log(chalk.dim(`Available profiles: ${Object.keys(profiles).join(', ')}`));
        return;
      }

      spinner.text = `Installing profile: ${profile.name}`;
      installPlan.skills = profile.skills;
      installPlan.commands = profile.commands || [];
      installPlan.hooks = Boolean(profile.hooks);
      installPlan.copyWholeClaudeTemplate = profile.skills.length === SKILLS.length;
      installPlan.label = `profile: ${profile.name}`;
    } else if (options.skills) {
      const skillIds = parseSkillList(options.skills);
      validateRequestedSkills(skillIds);

      spinner.text = `Installing ${skillIds.length} skills...`;
      installPlan.skills = skillIds;
      installPlan.hooks = Boolean(options.hooks);
      installPlan.label = `${skillIds.length} skills`;
    } else {
      spinner.text = 'Copying all skills and configurations...';
      installPlan.skills = SKILLS.map((s) => s.id);
      installPlan.commands = ['analyze-tokens', 'convert-to-toon', 'toon-decode', 'toon-encode', 'toon-validate'];
      installPlan.hooks = options.hooks !== false;
      installPlan.copyWholeClaudeTemplate = true;
    }

    for (const agent of agentTargets) {
      spinner.text = `Installing ${installPlan.label} for ${AGENT_TARGETS[agent].name}...`;
      if (agent === 'claude') {
        await installClaude(targetDir, installPlan, options);
      } else if (agent === 'codex') {
        await installCodex(targetDir, installPlan, options);
      } else if (agent === 'cursor') {
        await installCursor(targetDir, installPlan, options);
      }
    }

    spinner.succeed(`Installed ${installPlan.skills.length} skills for ${formatAgentTargets(agentTargets)}`);

    console.log('\n' + chalk.green('Agent starter installed successfully.') + '\n');
    console.log(chalk.bold('Next steps:'));
    if (agentTargets.includes('codex')) {
      console.log(chalk.dim('  Codex project guidance:'));
      console.log(`     ${chalk.cyan(join(targetDir, 'AGENTS.md'))}`);
    }
    if (agentTargets.includes('cursor')) {
      console.log(chalk.dim('  Cursor project rules:'));
      console.log(`     ${chalk.cyan(join(targetDir, '.cursor/rules'))}`);
    }
    console.log('');
  } catch (error) {
    spinner.fail('Installation failed');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
