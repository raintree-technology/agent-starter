import { copy, pathExists, remove, ensureDir } from "fs-extra";
import { lstat } from "fs/promises";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { isValidSkillPath, isPathSafe } from "./security.js";
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the templates directory path
 * Returns: /path/to/package/templates/.claude
 */
export function getTemplatesDir() {
  // From src/utils/copy.js, go up 2 levels to package root, then into templates/.claude
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
      await remove(claudeDir);
    } else if (!options.merge) {
      throw new Error(
        ".claude directory already exists. Use --force to overwrite or --merge to merge.",
      );
    }
  }

  await ensureDir(claudeDir);
  await copy(templatesDir, claudeDir, {
    overwrite: options.force || options.merge,
    filter: async (src) => {
      // SECURITY: Skip symlinks to prevent symlink attacks
      try {
        const stats = await lstat(src);
        if (stats.isSymbolicLink()) {
          console.warn(chalk.yellow(`Warning: Skipping symlink: ${src}`));
          return false;
        }
      } catch {
        return false;
      }

      // Skip docs directories (they should be pulled separately)
      if (src.includes("/docs/") && !options.includeDocs) {
        return false;
      }
      return true;
    },
  });

  return claudeDir;
}

/**
 * Copy a specific skill to target
 * Security: Validates skillPath to prevent path traversal attacks
 */
export async function copySkill(targetDir, skillPath, options = {}) {
  // Security: Validate skill path format (no .., no absolute paths)
  if (!isValidSkillPath(skillPath)) {
    throw new Error(`Invalid skill path: ${skillPath}`);
  }

  const skillsDir = getSkillsDir();
  const srcPath = resolve(skillsDir, skillPath);
  const destPath = resolve(targetDir, ".claude/skills", skillPath);

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
  const srcStats = await lstat(srcPath);
  if (srcStats.isSymbolicLink()) {
    throw new Error(`Security: skill path is a symlink: ${skillPath}`);
  }

  if ((await pathExists(destPath)) && !options.force) {
    throw new Error(
      `Skill already installed: ${skillPath}. Use --force to overwrite.`,
    );
  }

  await ensureDir(dirname(destPath));
  await copy(srcPath, destPath, {
    overwrite: options.force,
    filter: async (src) => {
      // SECURITY: Skip symlinks during copy
      try {
        const stats = await lstat(src);
        if (stats.isSymbolicLink()) {
          console.warn(chalk.yellow(`Warning: Skipping symlink: ${src}`));
          return false;
        }
      } catch {
        return false;
      }

      // Skip docs directories
      if (src.includes("/docs/") && !options.includeDocs) {
        return false;
      }
      return true;
    },
  });

  return destPath;
}

/**
 * Copy multiple skills
 */
export async function copySkills(targetDir, skillPaths, options = {}) {
  const results = [];

  if (!skillPaths || skillPaths.length === 0) {
    console.log(chalk.yellow('Warning: No skills to copy'));
    return results;
  }

  for (const skillPath of skillPaths) {
    try {
      const destPath = await copySkill(targetDir, skillPath, options);
      results.push({ skillPath, destPath, success: true });
    } catch (error) {
      console.error(chalk.red(`Failed to copy ${skillPath}: ${error.message}`));
      results.push({ skillPath, error: error.message, success: false });
    }
  }
  return results;
}

/**
 * Check if a skill is installed
 */
export async function isSkillInstalled(targetDir, skillPath) {
  const destPath = join(targetDir, ".claude", skillPath);
  return pathExists(destPath);
}

/**
 * Copy manifest.json and essential config files
 */
export async function copyEssentials(targetDir, options = {}) {
  const templatesDir = getTemplatesDir();
  const claudeDir = join(targetDir, ".claude");

  await ensureDir(claudeDir);

  // Copy manifest
  await copy(
    join(templatesDir, "manifest.json"),
    join(claudeDir, "manifest.json"),
    { overwrite: options.force },
  );

  // Copy settings
  await copy(
    join(templatesDir, "settings.json"),
    join(claudeDir, "settings.json"),
    { overwrite: options.force },
  );

  // Copy README
  await copy(join(templatesDir, "README.md"), join(claudeDir, "README.md"), {
    overwrite: options.force,
  });

  return claudeDir;
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

  await ensureDir(commandsDir);

  for (const commandName of commandNames) {
    const srcPath = join(templatesDir, "commands", `${commandName}.md`);
    const destPath = join(commandsDir, `${commandName}.md`);

    if (await pathExists(srcPath)) {
      await copy(srcPath, destPath, { overwrite: options.force });
    } else {
      console.warn(chalk.yellow(`Warning: Command not found: ${commandName}`));
    }
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
    filter: async (src) => {
      // Skip symlinks
      try {
        const stats = await lstat(src);
        if (stats.isSymbolicLink()) {
          console.warn(chalk.yellow(`Warning: Skipping symlink: ${src}`));
          return false;
        }
      } catch {
        return false;
      }
      return true;
    }
  });
}
