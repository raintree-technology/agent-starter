import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { pathExists } from 'fs-extra';
import { join, resolve } from 'path';
import { isAgentSkillInstalled } from '../utils/copy.js';
import { readManagedBlock } from '../utils/managed-block.js';
import { loadManifest, resolveManifest, MANIFEST_FILENAME } from '../manifest.js';
import { buildMcpServersMap } from '../mcps.js';
import { AGENT_TARGETS } from '../agents.js';

const MCP_JSON_PATHS = {
  claude: ['.mcp.json'],
  cursor: ['.cursor', 'mcp.json'],
};

async function readJsonIfExists(filePath) {
  if (!(await pathExists(filePath))) {
    return null;
  }
  try {
    return JSON.parse(await readFile(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function diffMcpJsonTarget(targetDir, target, plan) {
  const filePath = join(targetDir, ...MCP_JSON_PATHS[target]);
  const expected = buildMcpServersMap(plan.mcps);
  const actual = (await readJsonIfExists(filePath))?.mcpServers || {};

  const missing = [];
  const drifted = [];
  for (const [name, server] of Object.entries(expected)) {
    if (!(name in actual)) {
      missing.push(name);
    } else if (JSON.stringify(actual[name]) !== JSON.stringify(server)) {
      drifted.push(name);
    }
  }
  const unmanaged = Object.keys(actual).filter((name) => !(name in expected));
  return { missing, drifted, unmanaged };
}

async function diffCodexMcps(targetDir, plan) {
  const block = await readManagedBlock(join(targetDir, '.codex', 'config.toml'), 'hash');
  const missing = plan.mcps
    .filter((entry) => !block || !block.includes(`[mcp_servers.${entry.name}]`))
    .map((entry) => entry.name);
  return { missing, drifted: [], unmanaged: [] };
}

export async function getStatus(dir = '.') {
  const targetDir = resolve(dir);
  const manifest = await loadManifest(targetDir);
  if (!manifest) {
    throw new Error(`No ${MANIFEST_FILENAME} found in ${targetDir}. Run \`npx create-agent-starter@latest init\` first.`);
  }
  const plan = resolveManifest(manifest);
  const report = { plan, targets: {} };

  for (const target of plan.targets) {
    const missingSkills = [];
    for (const skill of plan.skills) {
      if (!(await isAgentSkillInstalled(targetDir, target, skill))) {
        missingSkills.push(skill);
      }
    }

    let mcps;
    if (target === 'codex') {
      mcps = await diffCodexMcps(targetDir, plan);
    } else {
      mcps = await diffMcpJsonTarget(targetDir, target, plan);
    }

    report.targets[target] = { missingSkills, mcps };
  }

  report.inSync = Object.values(report.targets).every((targetReport) => (
    targetReport.missingSkills.length === 0
    && targetReport.mcps.missing.length === 0
    && targetReport.mcps.drifted.length === 0
  ));
  return report;
}

export async function status(dir = '.') {
  try {
    const report = await getStatus(dir);
    console.log(chalk.bold(`\nagent.json status${report.plan.profile ? ` (profile: ${report.plan.profile})` : ''}\n`));

    for (const [target, targetReport] of Object.entries(report.targets)) {
      const label = AGENT_TARGETS[target].name;
      const problems = [];
      if (targetReport.missingSkills.length > 0) {
        problems.push(`missing skills: ${targetReport.missingSkills.join(', ')}`);
      }
      if (targetReport.mcps.missing.length > 0) {
        problems.push(`missing MCPs: ${targetReport.mcps.missing.join(', ')}`);
      }
      if (targetReport.mcps.drifted.length > 0) {
        problems.push(`drifted MCPs: ${targetReport.mcps.drifted.join(', ')}`);
      }

      if (problems.length === 0) {
        console.log(`  ${chalk.green('✓')} ${label} — in sync`);
      } else {
        console.log(`  ${chalk.red('✗')} ${label} — ${problems.join('; ')}`);
      }
      if (targetReport.mcps.unmanaged.length > 0) {
        console.log(chalk.dim(`      unmanaged MCPs (left alone): ${targetReport.mcps.unmanaged.join(', ')}`));
      }
    }

    console.log('');
    if (!report.inSync) {
      console.log(chalk.yellow(
        'Run `npx create-agent-starter@latest sync` to reconcile, or `agent-starter sync` with the global CLI.\n',
      ));
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(chalk.red(`Status failed: ${error.message}`));
    process.exit(1);
  }
}
