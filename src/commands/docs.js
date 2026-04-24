import chalk from 'chalk';
import ora from 'ora';
import { resolve, join } from 'path';
import { pathExists } from 'fs-extra';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { isValidUrl, isPathSafe, isValidSkillPath } from '../utils/security.js';
import { recordDocsPulled, getStaleSkills } from '../utils/docs-cache.js';

const execFileAsync = promisify(execFile);

async function isDocpullInstalled() {
  try {
    await execFileAsync('which', ['docpull']);
    return true;
  } catch {
    return false;
  }
}

function pathExistsSync(p) {
  try { statSync(p); return true; } catch { return false; }
}

function readSkillJson(claudeDir, relPath) {
  if (!isValidSkillPath(relPath)) return null;
  const path = resolve(claudeDir, relPath, 'skill.json');
  if (!isPathSafe(path, claudeDir)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function writeSkillJson(claudeDir, relPath, data) {
  if (!isValidSkillPath(relPath)) throw new Error(`Invalid skill path: ${relPath}`);
  const path = resolve(claudeDir, relPath, 'skill.json');
  if (!isPathSafe(path, claudeDir)) throw new Error('path escapes .claude directory');
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function listInstalledSkills(claudeDir) {
  const skillsDir = join(claudeDir, 'skills');
  if (!pathExistsSync(skillsDir)) return [];

  const results = [];
  function walk(dir, relBase) {
    let entries;
    try { entries = readdirSync(dir); } catch { return; }
    for (const entry of entries) {
      const full = join(dir, entry);
      let stat;
      try { stat = statSync(full); } catch { continue; }
      if (!stat.isDirectory()) continue;
      const rel = relBase ? `${relBase}/${entry}` : entry;
      const jsonPath = join(full, 'skill.json');
      if (pathExistsSync(jsonPath)) {
        try {
          const skill = JSON.parse(readFileSync(jsonPath, 'utf-8'));
          results.push({ ...skill, path: `skills/${rel}` });
        } catch { /* skip unreadable */ }
      }
      walk(full, rel);
    }
  }
  walk(skillsDir, '');
  return results;
}

async function pullDocsForSkill(skill, claudeDir) {
  if (!skill.docs?.url) return { success: false, error: 'No docs URL configured' };

  const url = skill.docs.url;
  const outputPath = resolve(claudeDir, skill.docs.output || `${skill.path}/docs`);

  if (!isValidUrl(url)) return { success: false, error: 'Invalid URL format' };
  if (!isPathSafe(outputPath, claudeDir)) return { success: false, error: 'Invalid output path' };

  try {
    await execFileAsync('docpull', [url, '-o', outputPath], {
      timeout: 300000,
      maxBuffer: 10 * 1024 * 1024,
    });

    try {
      const current = readSkillJson(claudeDir, skill.path);
      if (current) {
        current.docs = { ...current.docs, lastPulled: new Date().toISOString() };
        writeSkillJson(claudeDir, skill.path, current);
      }
    } catch { /* ignore */ }

    await recordDocsPulled(skill.id, {
      url,
      size: skill.docs.size,
      fileCount: skill.docs.files,
    });

    return { success: true, outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function docs(action, skillId, options = {}) {
  const claudeDir = resolve('.claude');

  if (!(await pathExists(claudeDir))) {
    console.log(chalk.yellow('\nNo .claude/ directory found.'));
    console.log(chalk.dim('Run `npx claude-starter` first to initialize.\n'));
    return;
  }

  switch (action) {
    case 'pull': await pullDocs(skillId, claudeDir); break;
    case 'update': await updateDocs(claudeDir, options); break;
    case 'status': await showStatus(skillId, claudeDir); break;
    case 'sync': await syncDocs(claudeDir, options); break;
    default:
      console.log(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.dim('Available actions: pull, update, status, sync'));
  }
}

async function pullDocs(skillId, claudeDir) {
  console.log(chalk.bold('\nPulling Documentation\n'));

  if (!(await isDocpullInstalled())) {
    console.log(chalk.yellow('docpull is not installed.'));
    console.log(chalk.cyan('\n  pipx install docpull\n'));
    return;
  }

  const allSkills = listInstalledSkills(claudeDir);
  const skills = skillId
    ? allSkills.filter((s) => s.id === skillId)
    : allSkills.filter((s) => s.docs?.url);

  if (skillId && skills.length === 0) {
    console.log(chalk.red(`Skill not found: ${skillId}`));
    return;
  }
  if (skillId && !skills[0].docs?.url) {
    console.log(chalk.yellow(`Skill ${skillId} has no external documentation.`));
    return;
  }

  console.log(chalk.dim(`Pulling docs for ${skills.length} skill(s)...\n`));

  const results = { success: [], failed: [] };
  for (const skill of skills) {
    const spinner = ora(`Pulling ${skill.id}...`).start();
    const result = await pullDocsForSkill(skill, claudeDir);
    if (result.success) {
      spinner.succeed(`${skill.id} - ${skill.docs.files || '?'} files`);
      results.success.push(skill.id);
    } else {
      spinner.fail(`${skill.id} - ${result.error}`);
      results.failed.push({ id: skill.id, error: result.error });
    }
  }

  console.log('\n' + chalk.dim('─'.repeat(40)));
  if (results.success.length > 0) console.log(chalk.green(`Successfully pulled: ${results.success.length}`));
  if (results.failed.length > 0) console.log(chalk.red(`Failed: ${results.failed.length}`));
  console.log('');
}

async function updateDocs(claudeDir, options) {
  console.log(chalk.bold('\nUpdating Stale Documentation\n'));

  if (!(await isDocpullInstalled())) {
    console.log(chalk.yellow('docpull is not installed.'));
    console.log(chalk.cyan('  pipx install docpull\n'));
    return;
  }

  const staleDays = parseInt(options.staleDays || '7', 10);
  const staleThreshold = staleDays * 24 * 60 * 60 * 1000;
  const allSkills = listInstalledSkills(claudeDir).filter((s) => s.docs?.url);

  const stale = [];
  for (const skill of allSkills) {
    const lastPulled = skill.docs?.lastPulled;
    if (!lastPulled) {
      stale.push({ skill, reason: 'never pulled' });
    } else {
      const age = Date.now() - new Date(lastPulled).getTime();
      if (age > staleThreshold) {
        stale.push({ skill, reason: `${Math.floor(age / 86400000)} days old` });
      }
    }
  }

  if (stale.length === 0) {
    console.log(chalk.green('All documentation is up to date.\n'));
    return;
  }

  console.log(chalk.dim(`Found ${stale.length} stale skill(s) (>${staleDays} days):\n`));
  for (const { skill, reason } of stale) {
    console.log(chalk.yellow(`  - ${skill.id} (${reason})`));
  }
  console.log('');

  for (const { skill } of stale) {
    const spinner = ora(`Updating ${skill.id}...`).start();
    const result = await pullDocsForSkill(skill, claudeDir);
    if (result.success) spinner.succeed(`${skill.id} updated`);
    else spinner.fail(`${skill.id} - ${result.error}`);
  }
  console.log('');
}

async function showStatus(skillId, claudeDir) {
  console.log(chalk.bold('\nDocumentation Status\n'));

  const all = listInstalledSkills(claudeDir).filter((s) => s.docs?.url);
  const skills = skillId ? all.filter((s) => s.id === skillId) : all;
  if (skillId && skills.length === 0) {
    console.log(chalk.red(`Skill not found: ${skillId}`));
    return;
  }

  console.log(chalk.dim('Skill'.padEnd(20) + 'Status'.padEnd(20) + 'Last Pulled'));
  console.log(chalk.dim('─'.repeat(60)));

  for (const skill of skills) {
    const lastPulled = skill.docs?.lastPulled;
    let status;
    let lastPulledStr;
    if (!lastPulled) {
      status = chalk.yellow('Not pulled');
      lastPulledStr = chalk.dim('-');
    } else {
      const age = Date.now() - new Date(lastPulled).getTime();
      const daysAgo = Math.floor(age / 86400000);
      status = daysAgo > 7 ? chalk.yellow('Stale') : chalk.green('Up to date');
      lastPulledStr = daysAgo === 0 ? 'today' : `${daysAgo} days ago`;
    }
    console.log(skill.id.padEnd(20) + status.padEnd(20) + lastPulledStr);
  }

  console.log('\n' + chalk.dim('Commands:'));
  console.log(chalk.dim('  npx claude-starter docs pull         Pull all docs'));
  console.log(chalk.dim('  npx claude-starter docs pull stripe  Pull specific skill'));
  console.log(chalk.dim('  npx claude-starter docs update       Update stale docs'));
  console.log(chalk.dim('  npx claude-starter docs sync         Auto-update everything stale\n'));
}

async function syncDocs(claudeDir, options) {
  console.log(chalk.bold('\nAuto-Syncing Documentation\n'));

  if (!(await isDocpullInstalled())) {
    console.log(chalk.yellow('docpull is not installed.'));
    console.log(chalk.cyan('  pipx install docpull\n'));
    return;
  }

  const staleDays = parseInt(options.staleDays || '7', 10);
  const staleSkills = await getStaleSkills(staleDays);

  if (staleSkills.length === 0) {
    console.log(chalk.green('All documentation is up to date.\n'));
    return;
  }

  const byId = new Map(listInstalledSkills(claudeDir).map((s) => [s.id, s]));

  const results = { success: [], failed: [] };
  for (const staleInfo of staleSkills) {
    const skill = byId.get(staleInfo.id);
    if (!skill?.docs?.url) continue;

    const ageStr = staleInfo.daysSincePull !== null
      ? `${staleInfo.daysSincePull} days old`
      : 'never pulled';
    const spinner = ora(`${skill.id} (${ageStr})...`).start();
    const result = await pullDocsForSkill(skill, claudeDir);
    if (result.success) {
      spinner.succeed(`${skill.id} - updated`);
      results.success.push(skill.id);
    } else {
      spinner.fail(`${skill.id} - ${result.error}`);
      results.failed.push({ id: skill.id, error: result.error });
    }
  }

  console.log('\n' + chalk.dim('─'.repeat(40)));
  console.log(chalk.green(`Updated: ${results.success.length} skills`));
  if (results.failed.length > 0) console.log(chalk.red(`Failed: ${results.failed.length} skills`));
  console.log('');
}
