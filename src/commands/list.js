import chalk from 'chalk';
import { resolve } from 'path';
import { pathExists } from 'fs-extra';
import { getTemplatesDir } from '../utils/copy.js';
import { readManifest, readInstalledManifest, groupByCategory, readSkillJson } from '../utils/manifest.js';

export async function list(options = {}) {
  const manifest = readManifest(getTemplatesDir());
  const installed = readInstalledManifest('.');

  // JSON output
  if (options.json) {
    const output = options.installed && installed
      ? installed.skills
      : manifest.skills;
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(chalk.bold('\nAvailable Skills\n'));

  let skills = manifest.skills;

  // Filter by category
  if (options.category) {
    skills = skills.filter(s => s.category === options.category);
    if (skills.length === 0) {
      console.log(chalk.yellow(`No skills found in category: ${options.category}`));
      console.log(chalk.dim(`Available categories: ${manifest.categories.map(c => c.id).join(', ')}`));
      return;
    }
  }

  // Filter to installed only
  if (options.installed) {
    if (!installed) {
      console.log(chalk.yellow('No .claude/ directory found. Run `npx claude-starter` to install.'));
      return;
    }
    const installedIds = new Set(installed.skills.map(s => s.id));
    skills = skills.filter(s => installedIds.has(s.id));
  }

  // Group by category
  const grouped = groupByCategory(skills);
  // manifest.categories is already an object with category IDs as keys
  const categoryMeta = manifest.categories || {};

  for (const [categoryId, categorySkills] of Object.entries(grouped)) {
    const category = categoryMeta[categoryId] || { name: categoryId, icon: '📁' };
    console.log(chalk.bold.blue(`\n${category.name}`));
    console.log(chalk.dim('─'.repeat(40)));

    for (const skill of categorySkills) {
      const isInstalled = installed?.skills.some(s => s.id === skill.id);
      const hasDocsUrl = skill.docs?.url;

      // Check if docs are pulled
      let docsStatus = '';
      if (hasDocsUrl && isInstalled) {
        const skillJson = readSkillJson(resolve('.claude'), skill.path);
        if (skillJson?.docs?.lastPulled) {
          const lastPulled = new Date(skillJson.docs.lastPulled);
          const daysAgo = Math.floor((Date.now() - lastPulled) / (1000 * 60 * 60 * 24));
          docsStatus = chalk.dim(` [docs: ${daysAgo}d ago]`);
        } else {
          docsStatus = chalk.yellow(' [docs: not pulled]');
        }
      } else if (hasDocsUrl) {
        docsStatus = chalk.dim(` [docs: ${skill.docs.files} files]`);
      }

      const installedMark = isInstalled ? chalk.green('[installed]') : chalk.dim('[not installed]');
      const name = skill.id.padEnd(25);
      const deps = skill.dependencies?.length
        ? chalk.dim(` → ${skill.dependencies.join(', ')}`)
        : '';

      console.log(`  ${installedMark} ${name}${docsStatus}${deps}`);
    }
  }

  // Summary
  const totalSkills = manifest.skills.length;
  const installedCount = installed?.skills.length || 0;

  console.log('\n' + chalk.dim('─'.repeat(40)));
  console.log(chalk.dim(`Total: ${totalSkills} skills available`));
  if (installed) {
    console.log(chalk.dim(`Installed: ${installedCount} skills`));
  }

  // Hints
  console.log('\n' + chalk.dim('Commands:'));
  console.log(chalk.dim('  npx claude-starter add <skill>     Add a skill'));
  console.log(chalk.dim('  npx claude-starter docs pull       Pull documentation'));
  console.log(chalk.dim('  npx claude-starter list --category payments'));
  console.log('');
}
