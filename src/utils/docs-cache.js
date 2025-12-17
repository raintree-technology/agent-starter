/**
 * Track documentation freshness and enable auto-updates
 */

import { pathExists } from 'fs-extra';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { homedir } from 'os';

/**
 * Get path to global docs cache file
 */
function getCachePath() {
  return resolve(homedir(), '.claude-starter', 'docs-cache.json');
}

/**
 * Read docs cache
 */
export async function readDocsCache() {
  const cachePath = getCachePath();

  if (!(await pathExists(cachePath))) {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      docs: {}
    };
  }

  try {
    const content = await readFile(cachePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      docs: {}
    };
  }
}

/**
 * Write docs cache
 */
export async function writeDocsCache(cache) {
  const cachePath = getCachePath();

  // Ensure directory exists
  await mkdir(dirname(cachePath), { recursive: true });

  cache.lastUpdated = new Date().toISOString();
  await writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
}

/**
 * Record that docs were pulled for a skill
 */
export async function recordDocsPulled(skillId, metadata = {}) {
  const cache = await readDocsCache();

  cache.docs[skillId] = {
    pulledAt: new Date().toISOString(),
    size: metadata.size || null,
    fileCount: metadata.fileCount || null,
    url: metadata.url || null,
    version: metadata.version || null
  };

  await writeDocsCache(cache);
}

/**
 * Get info about when docs were last pulled
 */
export async function getDocsInfo(skillId) {
  const cache = await readDocsCache();
  return cache.docs[skillId] || null;
}

/**
 * Check if docs are stale (older than N days)
 */
export async function areDocsStale(skillId, staleDays = 7) {
  const info = await getDocsInfo(skillId);

  if (!info || !info.pulledAt) {
    return true; // Never pulled = stale
  }

  const pulledDate = new Date(info.pulledAt);
  const now = new Date();
  const daysSincePull = (now - pulledDate) / (1000 * 60 * 60 * 24);

  return daysSincePull > staleDays;
}

/**
 * Get all stale docs
 */
export async function getStaleSkills(staleDays = 7) {
  const cache = await readDocsCache();
  const staleSkills = [];

  for (const [skillId, info] of Object.entries(cache.docs)) {
    if (await areDocsStale(skillId, staleDays)) {
      staleSkills.push({
        id: skillId,
        ...info,
        daysSincePull: info.pulledAt
          ? Math.floor((new Date() - new Date(info.pulledAt)) / (1000 * 60 * 60 * 24))
          : null
      });
    }
  }

  return staleSkills;
}

/**
 * Get all skills that have docs pulled
 */
export async function getSkillsWithDocs() {
  const cache = await readDocsCache();
  return Object.keys(cache.docs);
}

/**
 * Clear docs cache entry for a skill
 */
export async function clearDocsCache(skillId) {
  const cache = await readDocsCache();
  delete cache.docs[skillId];
  await writeDocsCache(cache);
}

/**
 * Clear entire docs cache
 */
export async function clearAllDocsCache() {
  await writeDocsCache({
    version: '1.0.0',
    docs: {}
  });
}
