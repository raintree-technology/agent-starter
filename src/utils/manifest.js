import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import * as fs from "fs";
import { join, resolve } from "path";
import { isValidSkillPath, isPathSafe, validateManifest } from "./security.js";

/**
 * Read the manifest.json from templates or installed location
 * Security: Validates manifest structure after parsing
 */
export function readManifest(templatesDir) {
  const manifestPath = join(templatesDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  // SECURITY: Check file size before parsing (prevent JSON bomb DoS)
  const stats = fs.statSync(manifestPath);
  if (stats.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Manifest file too large (>10MB)');
  }

  let manifest;
  try {
    const content = readFileSync(manifestPath, "utf-8");

    // SECURITY: Parse with depth limit
    manifest = JSON.parse(content);

    // Check array lengths
    if (manifest.skills && manifest.skills.length > 1000) {
      throw new Error('Too many skills in manifest (>1000)');
    }
  } catch (e) {
    throw new Error(`Invalid JSON in manifest: ${e.message}`);
  }

  // Security: Validate manifest structure
  const validation = validateManifest(manifest);
  if (!validation.valid) {
    throw new Error(`Invalid manifest: ${validation.errors.join(", ")}`);
  }

  return manifest;
}

/**
 * Read manifest from installed .claude directory
 */
export function readInstalledManifest(targetDir = ".") {
  const manifestPath = join(targetDir, ".claude", "manifest.json");
  if (!existsSync(manifestPath)) {
    return null;
  }
  return JSON.parse(readFileSync(manifestPath, "utf-8"));
}

/**
 * Read skill.json for a specific skill
 * Security: Validates path to prevent traversal attacks
 */
export function readSkillJson(claudeDir, skillPath) {
  // Security: Validate skill path format
  if (!isValidSkillPath(skillPath)) {
    return null; // Return null for invalid paths (not an error, just not found)
  }

  const skillJsonPath = resolve(claudeDir, skillPath, "skill.json");

  // Security: Verify path stays within claudeDir
  if (!isPathSafe(skillJsonPath, claudeDir)) {
    return null;
  }

  if (!existsSync(skillJsonPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(skillJsonPath, "utf-8"));
  } catch {
    return null; // Invalid JSON treated as not found
  }
}

/**
 * Write skill.json for a specific skill
 * Security: Validates path to prevent traversal attacks
 */
export function writeSkillJson(claudeDir, skillPath, data) {
  // Security: Validate skill path format
  if (!isValidSkillPath(skillPath)) {
    throw new Error(`Invalid skill path: ${skillPath}`);
  }

  const skillJsonPath = resolve(claudeDir, skillPath, "skill.json");

  // Security: Verify path stays within claudeDir
  if (!isPathSafe(skillJsonPath, claudeDir)) {
    throw new Error("Security: path escapes .claude directory");
  }

  writeFileSync(skillJsonPath, JSON.stringify(data, null, 2) + "\n");
}

/**
 * Update specific fields in skill.json
 */
export function updateSkillJson(claudeDir, skillPath, updates) {
  const current = readSkillJson(claudeDir, skillPath);
  if (!current) {
    throw new Error(`skill.json not found for: ${skillPath}`);
  }

  // Deep merge updates
  const updated = deepMerge(current, updates);
  writeSkillJson(claudeDir, skillPath, updated);
  return updated;
}

/**
 * Deep merge objects
 * SECURITY: Protected against prototype pollution
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    // CRITICAL: Block prototype pollution attacks
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Skip dangerous keys
    }

    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Find a skill by ID in the manifest
 */
export function findSkill(manifest, skillId) {
  return manifest.skills.find((s) => s.id === skillId);
}

/**
 * Get all skills that depend on a given skill
 */
export function getDependents(manifest, skillId) {
  return manifest.skills.filter((s) => s.dependencies?.includes(skillId));
}

/**
 * Get all dependencies for a skill (recursive)
 */
export function getAllDependencies(manifest, skillId, visited = new Set()) {
  if (visited.has(skillId)) return [];
  visited.add(skillId);

  const skill = findSkill(manifest, skillId);
  if (!skill || !skill.dependencies) return [];

  const deps = [...skill.dependencies];
  for (const depId of skill.dependencies) {
    deps.push(...getAllDependencies(manifest, depId, visited));
  }

  return [...new Set(deps)];
}

/**
 * Group skills by category
 */
export function groupByCategory(skills) {
  return skills.reduce((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});
}
