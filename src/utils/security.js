import { resolve, relative, isAbsolute } from 'path';

/**
 * Validate that a string is a valid URL
 * Prevents command injection via malformed URLs
 */
export function isValidUrl(str) {
  if (!str || typeof str !== 'string') {
    return false;
  }

  // Must start with http:// or https://
  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    return false;
  }

  try {
    const url = new URL(str);

    // Only allow http and https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    // Hostname must exist and be valid
    if (!url.hostname || url.hostname.length === 0) {
      return false;
    }

    // Block localhost and private IPs (SSRF prevention)
    const hostname = url.hostname.toLowerCase();

    // Direct localhost variants (IPv4, IPv6, hex, octal)
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '[::1]' ||
      hostname === '::1' ||
      hostname === '0x7f000001' ||
      hostname === '0177.0.0.1'
    ) {
      return false;
    }

    // Private IPv4 ranges (RFC 1918 + loopback + link-local)
    if (
      hostname.startsWith('192.168.') ||       // 192.168.0.0/16
      hostname.startsWith('10.') ||             // 10.0.0.0/8
      hostname.startsWith('169.254.') ||        // 169.254.0.0/16 link-local
      hostname.startsWith('127.')               // 127.0.0.0/8 full loopback
    ) {
      return false;
    }

    // 172.16.0.0/12 = 172.16.x.x through 172.31.x.x
    const match172 = hostname.match(/^172\.(\d+)\./);
    if (match172) {
      const second = parseInt(match172[1], 10);
      if (second >= 16 && second <= 31) {
        return false;
      }
    }

    // IPv6 private (fc00::/7) and link-local (fe80::/10), mDNS (.local)
    if (
      hostname.startsWith('fc') ||
      hostname.startsWith('fd') ||
      hostname.startsWith('fe80') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    // No credentials in URL
    if (url.username || url.password) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
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

    // Target must start with base (be inside it)
    if (!resolvedTarget.startsWith(resolvedBase)) {
      return false;
    }

    // Check for null bytes (bypass attempts)
    if (targetPath.includes('\0') || baseDir.includes('\0')) {
      return false;
    }

    return true;
  } catch {
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
  if (skillPath.length > 256) {
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
  const validPattern = /^[a-zA-Z0-9_\-\/]+$/;
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
  if (skillId.length > 64) {
    return false;
  }

  // Alphanumeric, hyphens, underscores only (no slashes)
  const validPattern = /^[a-zA-Z0-9_\-]+$/;
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
  if (commandName.length > 64) {
    return false;
  }

  // No null bytes
  if (commandName.includes('\0')) {
    return false;
  }

  // Alphanumeric, hyphens, underscores only (no slashes, dots, or path separators)
  const validPattern = /^[a-zA-Z0-9_\-]+$/;
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

  // Remove control characters except newline and tab
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Validate JSON schema for manifest.json
 * Returns { valid: boolean, errors: string[] }
 */
export function validateManifest(manifest) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be an object'] };
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    errors.push('Missing or invalid version');
  }

  if (!Array.isArray(manifest.skills)) {
    errors.push('skills must be an array');
  } else {
    for (let i = 0; i < manifest.skills.length; i++) {
      const skill = manifest.skills[i];

      if (!skill.id || !isValidSkillId(skill.id)) {
        errors.push(`Skill ${i}: invalid or missing id`);
      }

      if (!skill.path || !isValidSkillPath(skill.path)) {
        errors.push(`Skill ${skill.id || i}: invalid or missing path`);
      }

      if (skill.docs?.url && !isValidUrl(skill.docs.url)) {
        errors.push(`Skill ${skill.id || i}: invalid docs.url`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
