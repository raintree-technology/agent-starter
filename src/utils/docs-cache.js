/**
 * Track documentation freshness and enable auto-updates
 */

import { pathExists } from 'fs-extra';
import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import { resolve, dirname } from 'path';
import { homedir } from 'os';
import { isValidSkillId, sanitizeForLog } from './security.js';

const CACHE_VERSION = '1.0.0';
const MAX_CACHE_BYTES = 5 * 1024 * 1024;
const CACHE_DIRECTORY_MODE = 0o700;
const CACHE_FILE_MODE = 0o600;
const DEFAULT_STALE_DAYS = 7;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;

function emptyCache() {
  return {
    version: CACHE_VERSION,
    lastUpdated: new Date().toISOString(),
    docs: {}
  };
}

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidCache(cache) {
  if (!isPlainRecord(cache) || !isPlainRecord(cache.docs)) {
    return false;
  }

  return Object.keys(cache.docs).every(isValidSkillId);
}

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
    return emptyCache();
  }

  try {
    const fileStats = await stat(cachePath);
    if (fileStats.size > MAX_CACHE_BYTES) {
      console.warn(`Warning: Docs cache file too large (${fileStats.size} bytes), resetting`);
      return emptyCache();
    }

    const content = await readFile(cachePath, 'utf-8');
    const parsed = JSON.parse(content);
    if (!isValidCache(parsed)) {
      console.warn('Warning: Docs cache schema is invalid, resetting');
      return emptyCache();
    }
    return parsed;
  } catch (error) {
    console.warn(`Warning: Unable to read docs cache, resetting: ${sanitizeForLog(error.message)}`);
    return emptyCache();
  }
}

/**
 * Write docs cache
 */
export async function writeDocsCache(cache) {
  const cachePath = getCachePath();

  if (!isValidCache(cache)) {
    throw new Error('Refusing to write invalid docs cache data');
  }

  await mkdir(dirname(cachePath), { recursive: true, mode: CACHE_DIRECTORY_MODE });

  cache.lastUpdated = new Date().toISOString();
  await writeFile(cachePath, JSON.stringify(cache, null, 2), {
    encoding: 'utf-8',
    mode: CACHE_FILE_MODE,
  });
}

/**
 * Record that docs were pulled for a skill
 */
export async function recordDocsPulled(skillId, metadata = {}) {
  if (!isValidSkillId(skillId)) {
    throw new Error(`Invalid skill id for docs cache: ${sanitizeForLog(String(skillId))}`);
  }

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
  if (!isValidSkillId(skillId)) {
    throw new Error(`Invalid skill id for docs cache: ${sanitizeForLog(String(skillId))}`);
  }

  const cache = await readDocsCache();
  return cache.docs[skillId] || null;
}

/**
 * Check if docs are stale (older than N days)
 */
export async function areDocsStale(skillId, staleDays = DEFAULT_STALE_DAYS) {
  const info = await getDocsInfo(skillId);

  if (!info || !info.pulledAt) {
    return true;
  }

  const pulledDate = new Date(info.pulledAt);
  if (Number.isNaN(pulledDate.getTime())) {
    return true;
  }

  const now = new Date();
  const daysSincePull = (now - pulledDate) / MILLISECONDS_PER_DAY;

  return daysSincePull > staleDays;
}

/**
 * Get all stale docs
 */
export async function getStaleSkills(staleDays = DEFAULT_STALE_DAYS) {
  const cache = await readDocsCache();
  const staleSkills = [];

  for (const [skillId, info] of Object.entries(cache.docs)) {
    const pulledAtMs = info.pulledAt ? new Date(info.pulledAt).getTime() : Number.NaN;
    const daysSincePull = info.pulledAt
      ? Math.floor((Date.now() - pulledAtMs) / MILLISECONDS_PER_DAY)
      : null;

    if (!info.pulledAt || Number.isNaN(daysSincePull) || daysSincePull > staleDays) {
      staleSkills.push({
        id: skillId,
        ...info,
        daysSincePull
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
  if (!isValidSkillId(skillId)) {
    throw new Error(`Invalid skill id for docs cache: ${sanitizeForLog(String(skillId))}`);
  }

  const cache = await readDocsCache();
  delete cache.docs[skillId];
  await writeDocsCache(cache);
}

/**
 * Clear entire docs cache
 */
export async function clearAllDocsCache() {
  await writeDocsCache(emptyCache());
}
