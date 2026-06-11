import { copy, pathExists, remove, ensureDir, move } from "fs-extra";
import { lstat, mkdtemp, readFile, writeFile } from "fs/promises";
import { join, dirname, resolve, basename } from "path";
import { fileURLToPath } from "url";
import { isValidSkillPath, isPathSafe, isValidCommandName, sanitizeForLog } from "./security.js";
import { AGENT_TARGETS } from "../agents.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LEGACY_SKILLS_PREFIX = "skills/";
const INSTALL_STAGING_PREFIX = ".claude-install-";
const INSTALL_BACKUP_PREFIX = ".claude.backup.";
const SKILL_MARKDOWN_FILENAMES = ["skill.md", "SKILL.md"];

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

function shouldCopyTemplatePath(src) {
  if (basename(src) === "settings.local.json" || basename(src) === "settings.local.json.example") {
    return false;
  }

  return true;
}

function templateCopyFilter() {
  return async (src) => {
    await rejectSymlink(src);
    return shouldCopyTemplatePath(src);
  };
}

function supportFileCopyFilter() {
  return async (src) => {
    await rejectSymlink(src);
    const fileName = basename(src);

    if (SKILL_MARKDOWN_FILENAMES.includes(fileName)) {
      return false;
    }

    return true;
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
    throw new Error(`Failed to replace ${finalDir}: ${error.message}`, { cause: error });
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

export function getAgentTemplateDir(agent) {
  if (agent === "claude") {
    return getTemplatesDir();
  }
  if (!AGENT_TARGETS[agent]) {
    throw new Error(`Unknown agent target: ${sanitizeForLog(String(agent))}`);
  }
  return join(__dirname, "../../templates", agent);
}

/**
 * Get the skills directory path
 * Returns: /path/to/package/templates/.claude/skills
 */
export function getSkillsDir() {
  return join(getTemplatesDir(), "skills");
}

function getAgentOutputDir(targetDir, agent) {
  const target = AGENT_TARGETS[agent];
  if (!target) {
    throw new Error(`Unknown agent target: ${sanitizeForLog(String(agent))}`);
  }
  return resolve(targetDir, target.outputDir);
}

function cursorRuleName(skillPath) {
  return normalizeSkillPath(skillPath).replaceAll("/", "--");
}

function splitFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return { metadata: {}, body: markdown };
  }

  const endIndex = markdown.indexOf("\n---", 4);
  if (endIndex === -1) {
    return { metadata: {}, body: markdown };
  }

  const frontmatter = markdown.slice(4, endIndex).trim();
  const bodyStart = markdown.indexOf("\n", endIndex + 4);
  const body = bodyStart === -1 ? "" : markdown.slice(bodyStart + 1);
  const metadata = {};
  const frontmatterLines = frontmatter.split("\n");

  for (let index = 0; index < frontmatterLines.length; index += 1) {
    const line = frontmatterLines[index];
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!key) continue;

    if ([">", ">-", "|", "|-"].includes(value)) {
      const blockLines = [];
      while (
        index + 1 < frontmatterLines.length &&
        (frontmatterLines[index + 1].startsWith(" ") || frontmatterLines[index + 1].trim() === "")
      ) {
        index += 1;
        blockLines.push(frontmatterLines[index].replace(/^ {2}/, ""));
      }
      metadata[key] = value.startsWith("|")
        ? blockLines.join("\n").trim()
        : blockLines.map((blockLine) => blockLine.trim()).join(" ").replace(/\s+/g, " ").trim();
      continue;
    }

    metadata[key] = value.replace(/^"(.*)"$/, "$1").replaceAll('\\"', '"');
  }

  return { metadata, body };
}

function normalizeDescriptionForAgent(description) {
  return String(description || "")
    .replaceAll("Use when Claude needs", "Use when the agent needs")
    .replaceAll("When Claude needs", "When the agent needs")
    .replaceAll("Claude needs", "the agent needs");
}

function normalizeCursorBody(skillPath, body) {
  const ruleName = cursorRuleName(skillPath);
  return body.replaceAll("`references/", `\`${ruleName}/references/`);
}

async function getSkillMarkdownSource(skillPath) {
  const normalizedSkillPath = normalizeSkillPath(skillPath);
  const skillDir = resolve(getSkillsDir(), normalizedSkillPath);

  if (!isPathSafe(skillDir, getSkillsDir())) {
    throw new Error("Security: skill path escapes templates directory");
  }
  if (!(await pathExists(skillDir))) {
    throw new Error(`Skill not found: ${normalizedSkillPath}`);
  }
  await rejectSymlink(skillDir);

  for (const fileName of SKILL_MARKDOWN_FILENAMES) {
    const markdownPath = join(skillDir, fileName);
    if (await pathExists(markdownPath)) {
      await assertRegularTemplateFile(markdownPath, `${normalizedSkillPath} skill markdown`);
      const markdown = await readFile(markdownPath, "utf-8");
      const parsed = splitFrontmatter(markdown);
      return {
        skillDir,
        normalizedSkillPath,
        markdown,
        metadata: parsed.metadata,
        body: parsed.body,
      };
    }
  }

  throw new Error(`Skill markdown not found: ${normalizedSkillPath}`);
}

async function copySkillSupportFiles(srcSkillDir, destSkillDir, options = {}) {
  await ensureDir(destSkillDir);
  await copy(srcSkillDir, destSkillDir, {
    overwrite: options.force,
    filter: supportFileCopyFilter(),
  });
}

async function writeGeneratedFile(destPath, content, options = {}) {
  if ((await pathExists(destPath)) && !options.force) {
    throw new Error(`File already exists: ${sanitizeForLog(destPath)}. Use --force to overwrite.`);
  }
  await ensureDir(dirname(destPath));
  await writeFile(destPath, content, "utf-8");
}

async function copyCodexSkill(targetDir, skillPath, options = {}) {
  const source = await getSkillMarkdownSource(skillPath);
  const codexSkillsRoot = resolve(targetDir, ".codex", "skills");
  const destDir = resolve(codexSkillsRoot, source.normalizedSkillPath);
  const destPath = resolve(destDir, "SKILL.md");

  if (!isPathSafe(destPath, codexSkillsRoot)) {
    throw new Error("Security: destination path escapes .codex skills directory");
  }

  const description = normalizeDescriptionForAgent(source.metadata.description);
  const name = source.metadata.name || source.normalizedSkillPath;
  const content = [
    "---",
    `name: ${name}`,
    `description: ${description}`,
    "---",
    "",
    source.body.trimStart(),
  ].join("\n");

  await writeGeneratedFile(destPath, content, options);
  await copySkillSupportFiles(source.skillDir, destDir, options);

  return destPath;
}

async function copyCursorSkill(targetDir, skillPath, options = {}) {
  const source = await getSkillMarkdownSource(skillPath);
  const rulesRoot = resolve(targetDir, ".cursor", "rules");
  const ruleName = cursorRuleName(source.normalizedSkillPath);
  const destPath = resolve(rulesRoot, `${ruleName}.mdc`);
  const supportDir = resolve(rulesRoot, ruleName);

  if (!isPathSafe(destPath, rulesRoot) || !isPathSafe(supportDir, rulesRoot)) {
    throw new Error("Security: destination path escapes .cursor rules directory");
  }

  const description = normalizeDescriptionForAgent(source.metadata.description);
  const content = [
    "---",
    `description: ${JSON.stringify(description)}`,
    "globs:",
    "alwaysApply: false",
    "---",
    "",
    normalizeCursorBody(source.normalizedSkillPath, source.body.trimStart()),
  ].join("\n");

  await writeGeneratedFile(destPath, content, options);
  await copySkillSupportFiles(source.skillDir, supportDir, options);

  return destPath;
}

export async function getSkillSummaries(skillPaths) {
  const summaries = [];
  for (const skillPath of skillPaths) {
    const source = await getSkillMarkdownSource(skillPath);
    summaries.push({
      id: source.normalizedSkillPath,
      name: source.metadata.name || source.normalizedSkillPath,
      description: normalizeDescriptionForAgent(source.metadata.description),
    });
  }
  return summaries;
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
          filter: templateCopyFilter(),
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
    filter: templateCopyFilter(),
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
    filter: templateCopyFilter(),
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

export async function isAgentSkillInstalled(targetDir, agent, skillPath) {
  const normalizedSkillPath = normalizeSkillPath(skillPath);
  if (agent === "claude") {
    return isSkillInstalled(targetDir, normalizedSkillPath);
  }
  if (agent === "codex") {
    return pathExists(join(targetDir, ".codex", "skills", normalizedSkillPath, "SKILL.md"));
  }
  if (agent === "cursor") {
    return pathExists(join(targetDir, ".cursor", "rules", `${cursorRuleName(normalizedSkillPath)}.mdc`));
  }
  throw new Error(`Unknown agent target: ${sanitizeForLog(String(agent))}`);
}

export async function copyAgentEssentials(targetDir, agent, options = {}) {
  if (agent === "claude") {
    return copyEssentials(targetDir, options);
  }

  const templatesDir = getAgentTemplateDir(agent);
  const outputDir = getAgentOutputDir(targetDir, agent);
  const readmePath = join(templatesDir, "README.md");

  if (await pathExists(readmePath)) {
    await assertRegularTemplateFile(readmePath, `${agent} README template`);
  }

  await ensureDir(outputDir);

  if (await pathExists(readmePath)) {
    await copy(readmePath, join(outputDir, "README.md"), {
      overwrite: options.force,
    });
  }

  if (agent === "cursor") {
    await ensureDir(join(outputDir, "rules"));
  }

  return outputDir;
}

export async function copyAgentSkill(targetDir, agent, skillPath, options = {}) {
  if (agent === "claude") {
    return copySkill(targetDir, skillPath, options);
  }
  if (agent === "codex") {
    return copyCodexSkill(targetDir, skillPath, options);
  }
  if (agent === "cursor") {
    return copyCursorSkill(targetDir, skillPath, options);
  }
  throw new Error(`Unknown agent target: ${sanitizeForLog(String(agent))}`);
}

export async function copyAgentSkills(targetDir, agent, skillPaths, options = {}) {
  if (!skillPaths || skillPaths.length === 0) {
    return [];
  }

  const normalizedSkillPaths = skillPaths.map(normalizeSkillPath);
  for (const normalizedSkillPath of normalizedSkillPaths) {
    await getSkillMarkdownSource(normalizedSkillPath);
  }

  const results = [];
  for (const normalizedSkillPath of normalizedSkillPaths) {
    const destPath = await copyAgentSkill(targetDir, agent, normalizedSkillPath, options);
    results.push({ agent, skillPath: normalizedSkillPath, destPath, success: true });
  }

  return results;
}

export async function writeCodexAgentsFile(targetDir, skillPaths, options = {}) {
  const summaries = await getSkillSummaries(skillPaths);
  const destPath = resolve(targetDir, "AGENTS.md");

  const skillList = summaries.map((skill) => (
    `- \`${skill.id}\`: ${skill.description}\n  Read \`.codex/skills/${skill.id}/SKILL.md\` before using this skill.`
  )).join("\n");

  const content = [
    "# AGENTS.md",
    "",
    "This project includes Agent Starter guidance for Codex.",
    "",
    "When a user request matches one of the skills below, read the matching local skill file before answering, planning, or editing. Keep the selected skill active only for the current task unless the user asks to continue that workflow.",
    "",
    "## Skills",
    "",
    skillList || "- No skills were installed.",
    "",
    "## Local Skill Files",
    "",
    "Codex skill files are stored under `.codex/skills/<skill-id>/SKILL.md` so project-specific expertise can live with the repository.",
    "",
  ].join("\n");

  await writeGeneratedFile(destPath, content, options);
  return destPath;
}

export async function writeCursorProjectRule(targetDir, skillPaths, options = {}) {
  const summaries = await getSkillSummaries(skillPaths);
  const rulesRoot = resolve(targetDir, ".cursor", "rules");
  const destPath = resolve(rulesRoot, "agent-starter.mdc");

  const skillList = summaries.map((skill) => (
    `- \`${skill.id}\`: ${skill.description}`
  )).join("\n");

  const content = [
    "---",
    'description: "Agent Starter skill-selection guidance for Cursor"',
    "globs:",
    "alwaysApply: true",
    "---",
    "",
    "# Agent Starter",
    "",
    "Use the project rules in this directory when a request matches their descriptions. Each skill rule is Agent Requested by default so Cursor can select it when the task context calls for it.",
    "",
    "## Installed Skills",
    "",
    skillList || "- No skills were installed.",
    "",
  ].join("\n");

  await writeGeneratedFile(destPath, content, options);
  return destPath;
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
    filter: templateCopyFilter(),
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
    filter: templateCopyFilter(),
  });
}
