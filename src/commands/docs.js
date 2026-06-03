import chalk from 'chalk';
import ora from 'ora';
import { access } from 'fs/promises';
import { constants, readdirSync, readFileSync, lstatSync, statSync, writeFileSync } from 'fs';
import { delimiter, resolve, join } from 'path';
import { pathExists } from 'fs-extra';
import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  assertPublicHttpsUrl,
  getUrlValidationError,
  isPathSafe,
  isValidSkillId,
  isValidSkillPath,
  sanitizeForLog,
} from '../utils/security.js';
import { recordDocsPulled, getStaleSkills } from '../utils/docs-cache.js';

const execFileAsync = promisify(execFile);
const DEFAULT_STALE_DAYS = 7;
const DOCPULL_TIMEOUT_MS = 300_000;
const DOCPULL_MAX_BUFFER_BYTES = 10 * 1024 * 1024;
const DOCPULL_ATTEMPTS = 3;
const DOCPULL_RETRY_BASE_DELAY_MS = 500;
const DOCPULL_CHECK_TIMEOUT_MS = 10_000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const EXECUTABLE_EXTENSIONS = process.platform === 'win32'
  ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';')
  : [''];
const DOCPULL_NOT_INSTALLED_MESSAGE = 'docpull is not installed.';

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

async function findDocpullExecutable() {
  const pathDirs = (process.env.PATH || '').split(delimiter).filter(Boolean);
  for (const pathDir of pathDirs) {
    const extensions = new Set(EXECUTABLE_EXTENSIONS.flatMap((extension) => [
      extension,
      extension.toLowerCase(),
    ]));

    for (const extension of extensions) {
      const candidate = resolve(pathDir, `docpull${extension}`);
      try {
        await access(candidate, constants.X_OK);
        await execFileAsync(candidate, ['--help'], {
          timeout: DOCPULL_CHECK_TIMEOUT_MS,
          maxBuffer: DOCPULL_MAX_BUFFER_BYTES,
        });
        return candidate;
      } catch {
        // Not on PATH, not executable, or --help failed — try the next candidate.
      }
    }
  }
  return undefined;
}

function pathExistsSync(p) {
  try {
    statSync(p);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return false;
    }
    throw error;
  }
}

function readSkillJson(claudeDir, relPath) {
  if (!isValidSkillPath(relPath)) {
    throw new Error(`Invalid installed skill path: ${sanitizeForLog(String(relPath))}`);
  }

  const path = resolve(claudeDir, relPath, 'skill.json');
  if (!isPathSafe(path, claudeDir)) {
    throw new Error(`Installed skill path escapes .claude: ${sanitizeForLog(relPath)}`);
  }
  assertRegularFile(path, `skill.json at ${sanitizeForLog(relPath)}`);

  const parsed = JSON.parse(readFileSync(path, 'utf-8'));
  if (!parsed || typeof parsed !== 'object' || !isValidSkillId(parsed.id)) {
    throw new Error(`Invalid skill.json schema at ${sanitizeForLog(relPath)}`);
  }
  return parsed;
}

function writeSkillJson(claudeDir, relPath, data) {
  if (!isValidSkillPath(relPath)) throw new Error(`Invalid skill path: ${relPath}`);
  const path = resolve(claudeDir, relPath, 'skill.json');
  if (!isPathSafe(path, claudeDir)) throw new Error('path escapes .claude directory');
  if (pathExistsSync(path)) assertRegularFile(path, `skill.json at ${sanitizeForLog(relPath)}`);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function assertRegularFile(path, description) {
  const stats = lstatSync(path);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`Refusing to use non-regular ${description}`);
  }
}

function listInstalledSkills(claudeDir) {
  const skillsDir = join(claudeDir, 'skills');
  if (!pathExistsSync(skillsDir)) return [];

  const results = [];
  function walk(dir, relBase) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      const stat = lstatSync(full);
      if (!stat.isDirectory()) continue;
      const rel = relBase ? `${relBase}/${entry}` : entry;
      const jsonPath = join(full, 'skill.json');
      if (pathExistsSync(jsonPath)) {
        const skill = readSkillJson(claudeDir, `skills/${rel}`);
        results.push({ ...skill, path: `skills/${rel}` });
      }
      walk(full, rel);
    }
  }
  walk(skillsDir, '');
  return results;
}

async function pullDocsForSkill(skill, claudeDir, docpullPath) {
  if (!skill.docs?.url) return { success: false, error: 'No docs URL configured' };

  const url = skill.docs.url;
  const outputPath = resolve(claudeDir, skill.docs.output || `${skill.path}/docs`);

  const urlValidationError = getUrlValidationError(url);
  if (urlValidationError) return { success: false, error: urlValidationError };
  if (!isPathSafe(outputPath, claudeDir)) return { success: false, error: 'Invalid output path' };

  try {
    await assertPublicHttpsUrl(url);
    await runDocpull(docpullPath, url, outputPath);

    const current = readSkillJson(claudeDir, skill.path);
    current.docs = { ...current.docs, lastPulled: new Date().toISOString() };
    writeSkillJson(claudeDir, skill.path, current);

    await recordDocsPulled(skill.id, {
      url,
      size: skill.docs.size,
      fileCount: skill.docs.files,
    });

    return { success: true, outputPath };
  } catch (error) {
    return { success: false, error: sanitizeForLog(error.message) };
  }
}

async function runDocpull(docpullPath, url, outputPath) {
  let lastError;
  for (let attempt = 1; attempt <= DOCPULL_ATTEMPTS; attempt += 1) {
    try {
      await execFileAsync(docpullPath, [url, '-o', outputPath], {
        timeout: DOCPULL_TIMEOUT_MS,
        maxBuffer: DOCPULL_MAX_BUFFER_BYTES,
      });
      return;
    } catch (error) {
      lastError = error;
      if (attempt < DOCPULL_ATTEMPTS) {
        await sleep(DOCPULL_RETRY_BASE_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`docpull failed after ${DOCPULL_ATTEMPTS} attempts: ${lastError.message}`);
}

export async function docs(action, skillId, options = {}) {
  const claudeDir = resolve('.claude');

  if (!(await pathExists(claudeDir))) {
    console.log(chalk.yellow('\nNo .claude/ directory found.'));
    console.log(chalk.dim('Run `npx agent-starter --agent claude` first to initialize.\n'));
    return;
  }

  try {
    switch (action) {
      case 'pull': await pullDocs(skillId, claudeDir); break;
      case 'update': await updateDocs(claudeDir, options); break;
      case 'status': await showStatus(skillId, claudeDir); break;
      case 'sync': await syncDocs(claudeDir, options); break;
      default:
        console.log(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.dim('Available actions: pull, update, status, sync'));
    }
  } catch (error) {
    console.log(chalk.red(`Documentation command failed: ${sanitizeForLog(error.message)}`));
    process.exitCode = 1;
  }
}

async function pullDocs(skillId, claudeDir) {
  console.log(chalk.bold('\nPulling Documentation\n'));

  const docpullPath = await findDocpullExecutable();
  if (!docpullPath) {
    console.log(chalk.yellow(DOCPULL_NOT_INSTALLED_MESSAGE));
    console.log(chalk.cyan('\n  pipx install docpull\n'));
    process.exitCode = 1;
    return;
  }

  if (skillId && !isValidSkillId(skillId)) {
    console.log(chalk.red(`Invalid skill id: ${sanitizeForLog(skillId)}`));
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
    const result = await pullDocsForSkill(skill, claudeDir, docpullPath);
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

  const docpullPath = await findDocpullExecutable();
  if (!docpullPath) {
    console.log(chalk.yellow(DOCPULL_NOT_INSTALLED_MESSAGE));
    console.log(chalk.cyan('  pipx install docpull\n'));
    process.exitCode = 1;
    return;
  }

  const staleDays = parseStaleDays(options.staleDays);
  const staleThreshold = staleDays * MILLISECONDS_PER_DAY;
  const allSkills = listInstalledSkills(claudeDir).filter((s) => s.docs?.url);

  const stale = [];
  for (const skill of allSkills) {
    const lastPulled = skill.docs?.lastPulled;
    if (!lastPulled) {
      stale.push({ skill, reason: 'never pulled' });
    } else {
      const age = Date.now() - new Date(lastPulled).getTime();
      if (age > staleThreshold) {
        stale.push({ skill, reason: `${Math.floor(age / MILLISECONDS_PER_DAY)} days old` });
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
    const result = await pullDocsForSkill(skill, claudeDir, docpullPath);
    if (result.success) spinner.succeed(`${skill.id} updated`);
    else spinner.fail(`${skill.id} - ${result.error}`);
  }
  console.log('');
}

async function showStatus(skillId, claudeDir) {
  console.log(chalk.bold('\nDocumentation Status\n'));

  if (skillId && !isValidSkillId(skillId)) {
    console.log(chalk.red(`Invalid skill id: ${sanitizeForLog(skillId)}`));
    return;
  }

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
      const daysAgo = Math.floor(age / MILLISECONDS_PER_DAY);
      status = daysAgo > DEFAULT_STALE_DAYS ? chalk.yellow('Stale') : chalk.green('Up to date');
      lastPulledStr = daysAgo === 0 ? 'today' : `${daysAgo} days ago`;
    }
    console.log(skill.id.padEnd(20) + status.padEnd(20) + lastPulledStr);
  }

  console.log('\n' + chalk.dim('Commands:'));
  console.log(chalk.dim('  npx agent-starter docs pull         Pull all docs'));
  console.log(chalk.dim('  npx agent-starter docs pull stripe  Pull specific skill'));
  console.log(chalk.dim('  npx agent-starter docs update       Update stale docs'));
  console.log(chalk.dim('  npx agent-starter docs sync         Auto-update everything stale\n'));
}

async function syncDocs(claudeDir, options) {
  console.log(chalk.bold('\nAuto-Syncing Documentation\n'));

  const docpullPath = await findDocpullExecutable();
  if (!docpullPath) {
    console.log(chalk.yellow(DOCPULL_NOT_INSTALLED_MESSAGE));
    console.log(chalk.cyan('  pipx install docpull\n'));
    process.exitCode = 1;
    return;
  }

  const staleDays = parseStaleDays(options.staleDays);
  const staleSkills = await getStaleSkills(staleDays);

  if (staleSkills.length === 0) {
    console.log(chalk.green('All documentation is up to date.\n'));
    return;
  }

  const byId = new Map(listInstalledSkills(claudeDir).map((s) => [s.id, s]));

  const results = { success: [], failed: [] };
  for (const staleInfo of staleSkills) {
    const skill = byId.get(staleInfo.id);
    if (!skill?.docs?.url) {
      results.failed.push({ id: staleInfo.id, error: 'Installed skill missing docs URL' });
      continue;
    }

    const ageStr = staleInfo.daysSincePull !== null
      ? `${staleInfo.daysSincePull} days old`
      : 'never pulled';
    const spinner = ora(`${skill.id} (${ageStr})...`).start();
    const result = await pullDocsForSkill(skill, claudeDir, docpullPath);
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

function parseStaleDays(value) {
  const normalized = value ?? String(DEFAULT_STALE_DAYS);
  if (!/^[1-9][0-9]{0,3}$/.test(String(normalized))) {
    throw new Error(`Invalid --stale-days value: ${sanitizeForLog(String(value))}`);
  }
  return Number(normalized);
}
