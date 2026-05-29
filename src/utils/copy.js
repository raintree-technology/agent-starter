import { copy, pathExists, remove, ensureDir, move } from "fs-extra";
import { lstat, mkdtemp } from "fs/promises";
import { join, dirname, resolve, relative, sep, basename } from "path";
import { fileURLToPath } from "url";
import { isValidSkillPath, isPathSafe, isValidCommandName, sanitizeForLog } from "./security.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LEGACY_SKILLS_PREFIX = "skills/";
const INSTALL_STAGING_PREFIX = ".claude-install-";
const INSTALL_BACKUP_PREFIX = ".claude.backup.";

function pathHasSegment(path, segment) {
  return relative("", path).split(sep).includes(segment);
}

export function normalizeSkillPath(skillPath) {
  if (typeof skillPath !== "string") {
    throw new Error(`Invalid skill path: ${String(skillPath)}`);
  }

  const normalized = skillPath.startsWith(LEGACY_SKILLS_PREFIX)
    ? skillPath.slice(LEGACY_SKILLS_PREFIX.length)
    : skillPath;

  if (!isValidSkillPath(normalized)) {
    throw new Error(`Invalid skill path: ${sanitizeForLog(skillPath)}`);
  }

  return normalized;
}

async function rejectSymlink(src) {
  const stats = await lstat(src);
  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing to copy symlink: ${sanitizeForLog(src)}`);
  }
}

async function assertRegularTemplateFile(src, description) {
  await rejectSymlink(src);
  const stats = await lstat(src);
  if (!stats.isFile()) {
    throw new Error(`Refusing to copy non-file ${description}: ${sanitizeForLog(src)}`);
  }
}

function shouldCopyTemplatePath(src, root, options = {}) {
  const rel = relative(root, src);
  if (basename(src) === "settings.local.json" || basename(src) === "settings.local.json.example") {
    return false;
  }

  if (!options.includeDocs && pathHasSegment(rel, "docs")) {
    return false;
  }

  return true;
}

function templateCopyFilter(root, options = {}) {
  return async (src) => {
    await rejectSymlink(src);
    return shouldCopyTemplatePath(src, root, options);
  };
}

async function replaceDirectory(stagedDir, finalDir) {
  const parentDir = dirname(finalDir);
  const backupDir = join(parentDir, `${INSTALL_BACKUP_PREFIX}${process.pid}.${Date.now()}`);
  let movedExisting = false;

  try {
    if (await pathExists(finalDir)) {
      await move(finalDir, backupDir, { overwrite: false });
      movedExisting = true;
    }
    await move(stagedDir, finalDir, { overwrite: false });
    if (movedExisting) {
      await remove(backupDir);
    }
  } catch (error) {
    if (movedExisting && !(await pathExists(finalDir)) && await pathExists(backupDir)) {
      await move(backupDir, finalDir, { overwrite: false });
    }
    throw new Error(`Failed to replace ${finalDir}: ${error.message}`);
  } finally {
    if (await pathExists(stagedDir)) {
      await remove(stagedDir);
    }
  }
}

/**
 * Get the templates directory path
 * Returns: /path/to/package/templates/.claude
 */
export function getTemplatesDir() {
  return join(__dirname, "../../templates/.claude");
}

/**
 * Get the skills directory path
 * Returns: /path/to/package/templates/.claude/skills
 */
export function getSkillsDir() {
  return join(getTemplatesDir(), "skills");
}

/**
 * Copy entire .claude directory to target
 */
export async function copyAll(targetDir, options = {}) {
  const templatesDir = getTemplatesDir();
  const claudeDir = join(targetDir, ".claude");

  if (await pathExists(claudeDir)) {
    if (options.force) {
      await ensureDir(targetDir);
      const stagedDir = await mkdtemp(join(targetDir, INSTALL_STAGING_PREFIX));
      try {
        await copy(templatesDir, stagedDir, {
          overwrite: true,
          filter: templateCopyFilter(templatesDir, options),
        });
        await replaceDirectory(stagedDir, claudeDir);
      } catch (error) {
        if (await pathExists(stagedDir)) {
          await remove(stagedDir);
        }
        throw error;
      }
      return claudeDir;
    } else if (!options.merge) {
      throw new Error(
        ".claude directory already exists. Use --force to overwrite or --merge to merge.",
      );
    }
  }

  await ensureDir(claudeDir);
  await copy(templatesDir, claudeDir, {
    overwrite: options.force || options.merge,
    filter: templateCopyFilter(templatesDir, options),
  });

  return claudeDir;
}

/**
 * Copy a specific skill to target
 * Security: Validates skillPath to prevent path traversal attacks
 */
export async function copySkill(targetDir, skillPath, options = {}) {
  const normalizedSkillPath = normalizeSkillPath(skillPath);

  const skillsDir = getSkillsDir();
  const srcPath = resolve(skillsDir, normalizedSkillPath);
  const destPath = resolve(targetDir, ".claude/skills", normalizedSkillPath);

  // Security: Verify resolved paths stay within expected directories
  if (!isPathSafe(srcPath, getSkillsDir())) {
    throw new Error(`Security: skill path escapes templates directory`);
  }
  if (!isPathSafe(destPath, resolve(targetDir, ".claude/skills"))) {
    throw new Error(`Security: destination path escapes .claude directory`);
  }

  if (!(await pathExists(srcPath))) {
    throw new Error(`Skill not found: ${skillPath}`);
  }

  // SECURITY: Check for symlinks before copying
  await rejectSymlink(srcPath);

  if ((await pathExists(destPath)) && !options.force) {
    throw new Error(
      `Skill already installed: ${skillPath}. Use --force to overwrite.`,
    );
  }

  await ensureDir(dirname(destPath));
  await copy(srcPath, destPath, {
    overwrite: options.force,
    filter: templateCopyFilter(srcPath, options),
  });

  return destPath;
}

/**
 * Copy multiple skills
 */
export async function copySkills(targetDir, skillPaths, options = {}) {
  const results = [];

  if (!skillPaths || skillPaths.length === 0) {
    return results;
  }

  const normalizedSkillPaths = skillPaths.map(normalizeSkillPath);
  for (const normalizedSkillPath of normalizedSkillPaths) {
    const srcPath = resolve(getSkillsDir(), normalizedSkillPath);
    if (!(await pathExists(srcPath))) {
      throw new Error(`Skill not found: ${normalizedSkillPath}`);
    }
  }

  for (const normalizedSkillPath of normalizedSkillPaths) {
    const destPath = await copySkill(targetDir, normalizedSkillPath, options);
    results.push({ skillPath: normalizedSkillPath, destPath, success: true });
  }

  return results;
}

/**
 * Check if a skill is installed
 */
export async function isSkillInstalled(targetDir, skillPath) {
  const destPath = join(targetDir, ".claude", "skills", normalizeSkillPath(skillPath));
  return pathExists(destPath);
}

export async function copyEssentials(targetDir, options = {}) {
  const templatesDir = getTemplatesDir();
  const claudeDir = join(targetDir, ".claude");

  await ensureDir(claudeDir);

  const settingsPath = join(templatesDir, "settings.json");
  const readmePath = join(templatesDir, "README.md");

  await assertRegularTemplateFile(settingsPath, "settings template");
  await assertRegularTemplateFile(readmePath, "README template");

  await copy(settingsPath, join(claudeDir, "settings.json"), {
    overwrite: options.force,
  });

  await copy(readmePath, join(claudeDir, "README.md"), {
    overwrite: options.force,
  });

  return claudeDir;
}

export async function copyToonUtils(targetDir, options = {}) {
  const templatesDir = getTemplatesDir();
  const srcToonDir = join(templatesDir, "utils", "toon");
  const destToonDir = join(targetDir, ".claude", "utils", "toon");

  if (!(await pathExists(srcToonDir))) {
    throw new Error("TOON utility wrapper is missing from templates");
  }

  await ensureDir(dirname(destToonDir));
  await copy(srcToonDir, destToonDir, {
    overwrite: options.force,
    filter: templateCopyFilter(srcToonDir, options),
  });

  return destToonDir;
}

/**
 * Copy specific commands to target
 */
export async function copyCommands(targetDir, commandNames, options = {}) {
  if (!commandNames || commandNames.length === 0) {
    return;
  }

  const templatesDir = getTemplatesDir();
  const commandsDir = join(targetDir, ".claude/commands");
  const commandsTemplateDir = join(templatesDir, "commands");

  for (const commandName of commandNames) {
    if (!isValidCommandName(commandName)) {
      throw new Error(`Invalid command name: ${sanitizeForLog(commandName)}`);
    }

    const srcPath = join(commandsTemplateDir, `${commandName}.md`);

    if (!isPathSafe(srcPath, commandsTemplateDir)) {
      throw new Error(`Command path escapes templates directory: ${sanitizeForLog(commandName)}`);
    }

    if (!(await pathExists(srcPath))) {
      throw new Error(`Command not found: ${sanitizeForLog(commandName)}`);
    }

    await assertRegularTemplateFile(srcPath, `${commandName} command template`);
  }

  await ensureDir(commandsDir);

  for (const commandName of commandNames) {
    const srcPath = join(commandsTemplateDir, `${commandName}.md`);
    const destPath = join(commandsDir, `${commandName}.md`);
    await copy(srcPath, destPath, { overwrite: options.force });
  }
}

/**
 * Copy hooks directory to target
 */
export async function copyHooks(targetDir, options = {}) {
  const templatesDir = getTemplatesDir();
  const srcHooksDir = join(templatesDir, "hooks");
  const destHooksDir = join(targetDir, ".claude/hooks");

  if (!(await pathExists(srcHooksDir))) {
    return;
  }

  await ensureDir(destHooksDir);
  await copy(srcHooksDir, destHooksDir, {
    overwrite: options.force,
    filter: templateCopyFilter(srcHooksDir, options),
  });
}
