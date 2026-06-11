import { readFile, writeFile } from 'fs/promises';
import { pathExists } from 'fs-extra';
import { join, resolve } from 'path';
import { getProfile, profiles, SKILLS } from './profiles.js';
import { parseAgentTargets } from './agents.js';
import { validateMcpEntry } from './mcps.js';

export const MANIFEST_FILENAME = 'agent.json';
export const MANIFEST_VERSION = 1;

export function getManifestPath(targetDir) {
  return join(resolve(targetDir), MANIFEST_FILENAME);
}

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('agent.json must be a JSON object');
  }
  if (manifest.version !== MANIFEST_VERSION) {
    throw new Error(`Unsupported agent.json version: ${manifest.version} (expected ${MANIFEST_VERSION})`);
  }
  if (manifest.profile !== undefined && !getProfile(manifest.profile)) {
    throw new Error(`Unknown profile in agent.json: ${manifest.profile}. Available: ${Object.keys(profiles).join(', ')}`);
  }
  if (manifest.targets !== undefined) {
    parseAgentTargets(Array.isArray(manifest.targets) ? manifest.targets.join(',') : manifest.targets);
  }
  if (manifest.skills !== undefined) {
    if (!Array.isArray(manifest.skills) || manifest.skills.some((skill) => typeof skill !== 'string')) {
      throw new Error('agent.json: skills must be an array of skill ids');
    }
    const knownSkillIds = new Set(SKILLS.map((skill) => skill.id));
    const unknown = manifest.skills.filter((skill) => !knownSkillIds.has(skill));
    if (unknown.length > 0) {
      throw new Error(`agent.json: unknown skill(s): ${unknown.join(', ')}`);
    }
  }
  if (manifest.mcps !== undefined) {
    if (!Array.isArray(manifest.mcps)) {
      throw new Error('agent.json: mcps must be an array');
    }
    manifest.mcps.forEach(validateMcpEntry);
    const names = manifest.mcps.map((entry) => entry.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      throw new Error(`agent.json: duplicate MCP name(s): ${[...new Set(duplicates)].join(', ')}`);
    }
  }
  if (manifest.model !== undefined) {
    if (typeof manifest.model !== 'object' || manifest.model === null || Array.isArray(manifest.model)
      || Object.values(manifest.model).some((value) => typeof value !== 'string')) {
      throw new Error('agent.json: model must be an object mapping agent target to model id');
    }
  }
  return manifest;
}

export async function loadManifest(targetDir) {
  const manifestPath = getManifestPath(targetDir);
  if (!(await pathExists(manifestPath))) {
    return null;
  }
  let parsed;
  try {
    parsed = JSON.parse(await readFile(manifestPath, 'utf-8'));
  } catch (error) {
    throw new Error(`Failed to parse ${manifestPath}: ${error.message}`, { cause: error });
  }
  return validateManifest(parsed);
}

export async function saveManifest(targetDir, manifest) {
  validateManifest(manifest);
  const manifestPath = getManifestPath(targetDir);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  return manifestPath;
}

/**
 * Merge the manifest with its profile into a concrete install plan.
 * Profile entries come first; explicit manifest entries extend the profile,
 * and an explicit MCP entry with the same name overrides the profile's.
 */
export function resolveManifest(manifest) {
  validateManifest(manifest);
  const profile = manifest.profile ? getProfile(manifest.profile) : null;

  const skills = [...new Set([...(profile?.skills || []), ...(manifest.skills || [])])];

  const mcpsByName = new Map();
  for (const entry of [...(profile?.mcps || []), ...(manifest.mcps || [])]) {
    mcpsByName.set(entry.name, entry);
  }

  return {
    profile: manifest.profile || null,
    targets: parseAgentTargets((manifest.targets || ['claude']).join(',')),
    skills,
    mcps: [...mcpsByName.values()],
    model: manifest.model || {},
    commands: profile?.commands || [],
    toon: Boolean(profile?.toon) && skills.includes('toon-formatter'),
    hooks: Boolean(profile?.hooks),
  };
}
