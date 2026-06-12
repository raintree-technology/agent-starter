import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import chalk from 'chalk';
import { pathExists } from 'fs-extra';
import { formatAgentTargets } from '../agents.js';
import { loadManifest, MANIFEST_FILENAME, resolveManifest } from '../manifest.js';
import { buildCodexMcpToml, buildMcpServersMap, collectEnvReferences } from '../mcps.js';
import {
  copyAgentEssentials,
  copyAgentSkills,
  copyCommands,
  copyToonUtils,
  getSkillSummaries,
  writeCursorProjectRule,
} from '../utils/copy.js';
import { upsertManagedBlock } from '../utils/managed-block.js';
import { setupToonBinary } from '../utils/toon.js';

async function readJsonIfExists(filePath) {
  if (!(await pathExists(filePath))) {
    return null;
  }
  try {
    return JSON.parse(await readFile(filePath, 'utf-8'));
  } catch (error) {
    throw new Error(`Failed to parse ${filePath}: ${error.message}`, { cause: error });
  }
}

/**
 * Merge managed MCP entries into an existing mcpServers JSON file by key.
 * Keys agent-starter did not write are preserved untouched; managed keys
 * are overwritten to match agent.json.
 */
async function writeMcpServersJson(filePath, mcps) {
  if (mcps.length === 0) {
    return null;
  }
  const existing = (await readJsonIfExists(filePath)) || {};
  existing.mcpServers = { ...(existing.mcpServers || {}), ...buildMcpServersMap(mcps) };
  await writeFile(filePath, `${JSON.stringify(existing, null, 2)}\n`, 'utf-8');
  return filePath;
}

async function buildClaudeSkillsBlock(skills) {
  const summaries = await getSkillSummaries(skills);
  return [
    '## Agent Starter skills',
    '',
    'Managed by `agent.json` — run `npx agent-starter sync` after editing it.',
    '',
    ...summaries.map((skill) => `- \`${skill.id}\`: ${skill.description}`),
  ].join('\n');
}

async function buildCodexBlock(skills) {
  const summaries = await getSkillSummaries(skills);
  const skillList = summaries
    .map(
      (skill) =>
        `- \`${skill.id}\`: ${skill.description}\n  Read \`.codex/skills/${skill.id}/SKILL.md\` before using this skill.`,
    )
    .join('\n');
  return [
    '## Agent Starter skills',
    '',
    'When a user request matches one of the skills below, read the matching local skill file before answering, planning, or editing.',
    '',
    skillList || '- No skills installed.',
  ].join('\n');
}

async function syncClaude(targetDir, plan, options) {
  // force stays false: an existing settings.json is user-owned after install
  await copyAgentEssentials(targetDir, 'claude', { ...options, force: false });
  await copyAgentSkills(targetDir, 'claude', plan.skills, { ...options, force: true });

  if (plan.commands.length > 0) {
    await copyCommands(targetDir, plan.commands, { ...options, force: true });
  }
  if (plan.toon) {
    await copyToonUtils(targetDir, { ...options, force: true });
    const toonResult = setupToonBinary(resolve(targetDir, '.claude'));
    if (!toonResult.success) {
      throw new Error(toonResult.error);
    }
  }

  await upsertManagedBlock(
    join(targetDir, 'CLAUDE.md'),
    await buildClaudeSkillsBlock(plan.skills),
    'markdown',
  );
  return writeMcpServersJson(join(targetDir, '.mcp.json'), plan.mcps);
}

async function syncCodex(targetDir, plan, options) {
  await copyAgentEssentials(targetDir, 'codex', { ...options, force: true });
  await copyAgentSkills(targetDir, 'codex', plan.skills, { ...options, force: true });
  await upsertManagedBlock(
    join(targetDir, 'AGENTS.md'),
    await buildCodexBlock(plan.skills),
    'markdown',
  );
  if (plan.mcps.length > 0) {
    await upsertManagedBlock(
      join(targetDir, '.codex', 'config.toml'),
      buildCodexMcpToml(plan.mcps),
      'hash',
    );
  }
}

async function syncCursor(targetDir, plan, options) {
  await copyAgentEssentials(targetDir, 'cursor', { ...options, force: true });
  await copyAgentSkills(targetDir, 'cursor', plan.skills, { ...options, force: true });

  // agent-starter.mdc is wholly generated, and .mdc frontmatter must start
  // at byte 0, so it is overwritten rather than marker-managed.
  await writeCursorProjectRule(targetDir, plan.skills, { ...options, force: true });
  return writeMcpServersJson(join(targetDir, '.cursor', 'mcp.json'), plan.mcps);
}

const TARGET_SYNCERS = {
  claude: syncClaude,
  codex: syncCodex,
  cursor: syncCursor,
};

async function updateEnvExample(targetDir, envVars) {
  if (envVars.length === 0) {
    return { added: [] };
  }
  const envExamplePath = join(targetDir, '.env.example');
  const existing = (await pathExists(envExamplePath))
    ? await readFile(envExamplePath, 'utf-8')
    : '';
  const missing = envVars.filter((name) => !new RegExp(`^${name}=`, 'm').test(existing));
  if (missing.length === 0) {
    return { added: [] };
  }
  const block = [
    '',
    '# MCP servers (agent.json — used by agent-starter sync targets)',
    ...missing.map((name) => `${name}=`),
    '',
  ].join('\n');
  await writeFile(envExamplePath, existing + block, 'utf-8');
  return { added: missing };
}

export async function runSync(dir = '.', options = {}) {
  const targetDir = resolve(dir);
  const manifest = await loadManifest(targetDir);
  if (!manifest) {
    throw new Error(
      `No ${MANIFEST_FILENAME} found in ${targetDir}. Run \`agent-starter init\` first.`,
    );
  }
  const plan = resolveManifest(manifest);

  for (const target of plan.targets) {
    await TARGET_SYNCERS[target](targetDir, plan, options);
  }

  const envVars = collectEnvReferences(plan.mcps);
  const { added } = await updateEnvExample(targetDir, envVars);
  const unsetVars = envVars.filter((name) => !process.env[name]);

  return { plan, envVars, addedEnvExampleVars: added, unsetVars };
}

export async function sync(dir = '.', options = {}) {
  try {
    const { plan, addedEnvExampleVars, unsetVars } = await runSync(dir, options);
    console.log(
      chalk.green(
        `Synced ${plan.skills.length} skills and ${plan.mcps.length} MCP servers for ${formatAgentTargets(plan.targets)}`,
      ),
    );
    if (plan.profile) {
      console.log(chalk.dim(`Profile: ${plan.profile}`));
    }
    if (addedEnvExampleVars.length > 0) {
      console.log(chalk.dim(`Added to .env.example: ${addedEnvExampleVars.join(', ')}`));
    }
    if (unsetVars.length > 0) {
      console.log(chalk.yellow(`Unset env vars referenced by MCPs: ${unsetVars.join(', ')}`));
    }
  } catch (error) {
    console.error(chalk.red(`Sync failed: ${error.message}`));
    process.exit(1);
  }
}
