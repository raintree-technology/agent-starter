import { resolve } from 'node:path';
import chalk from 'chalk';
import { loadManifest, MANIFEST_FILENAME, MANIFEST_VERSION, saveManifest } from '../manifest.js';
import { getCatalogMcp, MCP_CATALOG, validateMcpEntry } from '../mcps.js';
import { SKILLS } from '../profiles.js';
import { runSync } from './sync.js';

async function loadManifestOrFail(targetDir) {
  const manifest = await loadManifest(targetDir);
  if (!manifest) {
    throw new Error(
      `No ${MANIFEST_FILENAME} found in ${targetDir}. Run \`agent-starter init\` first.`,
    );
  }
  return manifest;
}

function parseKeyValuePairs(pairs = [], flagName) {
  const result = {};
  for (const pair of pairs) {
    const separator = pair.indexOf('=');
    if (separator === -1) {
      throw new Error(`Invalid ${flagName} value (expected KEY=VALUE): ${pair}`);
    }
    result[pair.slice(0, separator)] = pair.slice(separator + 1);
  }
  return result;
}

export async function addMcp(name, options = {}) {
  try {
    const targetDir = resolve(options.dir || '.');
    const manifest = await loadManifestOrFail(targetDir);

    let entry;
    if (options.command || options.url) {
      entry = { name };
      if (options.command) entry.command = options.command;
      if (options.args) entry.args = options.args.split(' ').filter(Boolean);
      if (options.url) entry.url = options.url;
      if (options.env) entry.env = parseKeyValuePairs(options.env, '--env');
      if (options.header) entry.headers = parseKeyValuePairs(options.header, '--header');
      validateMcpEntry(entry);
    } else {
      entry = getCatalogMcp(name);
      if (!entry) {
        throw new Error(
          `Unknown MCP: ${name}. Known: ${Object.keys(MCP_CATALOG).join(', ')}. ` +
            'For anything else pass --command/--args or --url (and --env/--header KEY=VALUE).',
        );
      }
    }

    manifest.version ??= MANIFEST_VERSION;
    manifest.mcps = [...(manifest.mcps || []).filter((mcp) => mcp.name !== name), entry];
    await saveManifest(targetDir, manifest);
    await runSync(targetDir, options);
    console.log(chalk.green(`Added MCP "${name}" to ${MANIFEST_FILENAME} and synced.`));
  } catch (error) {
    console.error(chalk.red(`Add MCP failed: ${error.message}`));
    process.exit(1);
  }
}

export async function addSkill(name, options = {}) {
  try {
    const targetDir = resolve(options.dir || '.');
    const manifest = await loadManifestOrFail(targetDir);

    if (!SKILLS.some((skill) => skill.id === name)) {
      throw new Error(
        `Unknown skill: ${name}. Run \`agent-starter init\` to see available skills.`,
      );
    }

    manifest.version ??= MANIFEST_VERSION;
    manifest.skills = [...new Set([...(manifest.skills || []), name])];
    await saveManifest(targetDir, manifest);
    await runSync(targetDir, options);
    console.log(chalk.green(`Added skill "${name}" to ${MANIFEST_FILENAME} and synced.`));
  } catch (error) {
    console.error(chalk.red(`Add skill failed: ${error.message}`));
    process.exit(1);
  }
}
