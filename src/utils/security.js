import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { resolve, relative, isAbsolute } from 'path';

const MAX_SKILL_PATH_LENGTH = 256;
const MAX_SKILL_ID_LENGTH = 64;
const MAX_COMMAND_NAME_LENGTH = 64;
const MAX_HOSTNAME_LENGTH = 253;

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
]);

const BLOCKED_HOSTNAME_SUFFIXES = [
  '.local',
  '.localhost',
  '.home.arpa',
  '.internal',
  '.invalid',
  '.test',
];

function normalizeHostname(hostname) {
  return hostname
    .toLowerCase()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/\.$/, '');
}

function isPrivateIpv4Address(address) {
  const parts = address.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [first, second] = parts;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    first >= 224
  );
}

function isPrivateIpv6Address(address) {
  const normalized = normalizeHostname(address);

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('::ffff:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80') ||
    normalized.startsWith('ff') ||
    normalized.startsWith('2001:db8')
  );
}

export function isPrivateIpAddress(address) {
  const version = isIP(normalizeHostname(address));
  if (version === 4) {
    return isPrivateIpv4Address(address);
  }
  if (version === 6) {
    return isPrivateIpv6Address(address);
  }
  return true;
}

export function getUrlValidationError(str) {
  if (!str || typeof str !== 'string') {
    return 'URL must be a non-empty string';
  }

  let url;
  try {
    url = new URL(str);
  } catch (error) {
    return `Malformed URL: ${error.message}`;
  }

  if (url.protocol !== 'https:') {
    return 'URL must use https';
  }

  if (url.username || url.password) {
    return 'URL must not include credentials';
  }

  const hostname = normalizeHostname(url.hostname);
  if (!hostname || hostname.length > MAX_HOSTNAME_LENGTH) {
    return 'URL hostname is missing or too long';
  }

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return `URL hostname is blocked: ${hostname}`;
  }

  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return `URL hostname uses a blocked suffix: ${hostname}`;
  }

  if (isIP(hostname)) {
    return 'URL must use a public DNS hostname, not an IP literal';
  }

  return undefined;
}

/**
 * Validate that a string is a valid URL
 * Prevents command injection via malformed URLs
 */
export function isValidUrl(str) {
  return getUrlValidationError(str) === undefined;
}

export async function assertPublicHttpsUrl(str, resolver = lookup) {
  const validationError = getUrlValidationError(str);
  if (validationError) {
    throw new Error(validationError);
  }

  const url = new URL(str);
  const hostname = normalizeHostname(url.hostname);
  let addresses;
  try {
    addresses = await resolver(hostname, { all: true, verbatim: true });
  } catch (error) {
    throw new Error(`Unable to resolve ${hostname}: ${error.message}`);
  }

  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error(`No DNS records found for ${hostname}`);
  }

  for (const { address } of addresses) {
    if (isPrivateIpAddress(address)) {
      throw new Error(`URL resolves to a non-public address: ${hostname}`);
    }
  }

  return url;
}

/**
 * Validate that a path stays within a base directory
 * Prevents path traversal attacks (e.g., ../../etc/passwd)
 */
export function isPathSafe(targetPath, baseDir) {
  if (!targetPath || !baseDir) {
    return false;
  }

  try {
    // Resolve both paths to absolute
    const resolvedBase = resolve(baseDir);
    const resolvedTarget = resolve(targetPath);

    const relativeTarget = relative(resolvedBase, resolvedTarget);

    // Target must be the base itself or a descendant, not a prefix sibling.
    if (relativeTarget.startsWith('..') || isAbsolute(relativeTarget)) {
      return false;
    }

    // Check for null bytes (bypass attempts)
    if (targetPath.includes('\0') || baseDir.includes('\0')) {
      return false;
    }

    return true;
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    }
    return false;
  }
}

/**
 * Validate a skill path is safe
 * Must be relative, no traversal, valid characters
 * SECURITY: Protected against ReDoS
 */
export function isValidSkillPath(skillPath) {
  if (!skillPath || typeof skillPath !== 'string') {
    return false;
  }

  // CRITICAL: Length check BEFORE regex to prevent ReDoS
  if (skillPath.length > MAX_SKILL_PATH_LENGTH) {
    return false;
  }

  // Must not be absolute
  if (isAbsolute(skillPath)) {
    return false;
  }

  // No null bytes
  if (skillPath.includes('\0')) {
    return false;
  }

  // No parent directory traversal
  if (skillPath.includes('..')) {
    return false;
  }

  // Must match expected pattern: alphanumeric, hyphens, underscores, slashes
  const validPattern = /^[a-zA-Z0-9_/-]+$/;
  if (!validPattern.test(skillPath)) {
    return false;
  }

  // No double slashes
  if (skillPath.includes('//')) {
    return false;
  }

  // Must not start or end with slash
  if (skillPath.startsWith('/') || skillPath.endsWith('/')) {
    return false;
  }

  return true;
}

/**
 * Validate skill ID format
 * SECURITY: Protected against ReDoS
 */
export function isValidSkillId(skillId) {
  if (!skillId || typeof skillId !== 'string') {
    return false;
  }

  // CRITICAL: Length check BEFORE regex to prevent ReDoS
  if (skillId.length > MAX_SKILL_ID_LENGTH) {
    return false;
  }

  // Alphanumeric, hyphens, underscores only (no slashes)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(skillId)) {
    return false;
  }

  return true;
}

/**
 * Validate command name format
 * Must be alphanumeric with hyphens/underscores, no path separators
 * SECURITY: Protected against path traversal and ReDoS
 */
export function isValidCommandName(commandName) {
  if (!commandName || typeof commandName !== 'string') {
    return false;
  }

  // CRITICAL: Length check BEFORE regex to prevent ReDoS
  if (commandName.length > MAX_COMMAND_NAME_LENGTH) {
    return false;
  }

  // No null bytes
  if (commandName.includes('\0')) {
    return false;
  }

  // Alphanumeric, hyphens, underscores only (no slashes, dots, or path separators)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(commandName)) {
    return false;
  }

  return true;
}

/**
 * Sanitize a string for safe display (prevent log injection)
 */
export function sanitizeForLog(str) {
  if (typeof str !== 'string') {
    return String(str);
  }

  // Remove control characters except newline and tab.
  return Array.from(str).filter((char) => {
    const code = char.charCodeAt(0);
    return code === 9 || code === 10 || (code >= 32 && code !== 127);
  }).join('');
}
