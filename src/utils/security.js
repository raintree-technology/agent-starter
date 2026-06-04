import { resolve, relative, isAbsolute } from 'path';

const MAX_SKILL_PATH_LENGTH = 256;
const MAX_COMMAND_NAME_LENGTH = 64;

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
