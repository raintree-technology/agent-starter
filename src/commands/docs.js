import chalk from "chalk";
import ora from "ora";
import { resolve } from "path";
import { pathExists } from "fs-extra";
import { execFile } from "child_process";
import { promisify } from "util";
import { getTemplatesDir } from "../utils/copy.js";
import {
  readManifest,
  findSkill,
  readSkillJson,
  updateSkillJson,
} from "../utils/manifest.js";
import { isValidUrl, isPathSafe } from "../utils/security.js";
import {
  recordDocsPulled,
  getDocsInfo,
  areDocsStale,
  getStaleSkills
} from "../utils/docs-cache.js";

const execFileAsync = promisify(execFile);

/**
 * Check if docpull is installed
 */
async function isDocpullInstalled() {
  try {
    // Security: Use execFile with argument array to avoid shell injection
    await execFileAsync("which", ["docpull"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pull docs for a skill using docpull
 * Security: Uses execFile with argument array to prevent command injection
 */
async function pullDocsForSkill(skill, claudeDir) {
  if (!skill.docs?.url) {
    return { success: false, error: "No docs URL configured" };
  }

  const url = skill.docs.url;
  const outputPath = resolve(
    claudeDir,
    skill.docs.output || skill.path + "/docs",
  );

  // Security: Validate URL format to prevent injection
  if (!isValidUrl(url)) {
    return { success: false, error: "Invalid URL format" };
  }

  // Security: Validate output path stays within .claude directory
  if (!isPathSafe(outputPath, claudeDir)) {
    return {
      success: false,
      error: "Invalid output path (path traversal detected)",
    };
  }

  try {
    // Security: Use execFile with argument array - prevents shell injection
    // Arguments are passed directly to the process, not interpreted by shell
    await execFileAsync("docpull", [url, "-o", outputPath], {
      timeout: 300000, // 5 min timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB output limit
    });

    // Update skill.json with lastPulled timestamp
    try {
      updateSkillJson(claudeDir, skill.path, {
        docs: {
          ...skill.docs,
          lastPulled: new Date().toISOString(),
        },
      });
    } catch {
      // skill.json might not exist in installed location
    }

    // Record in global cache
    await recordDocsPulled(skill.id, {
      url: url,
      size: skill.docs.size,
      fileCount: skill.docs.files
    });

    return { success: true, outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function docs(action, skillId, options = {}) {
  const claudeDir = resolve(".claude");

  // Check if .claude exists
  if (!(await pathExists(claudeDir))) {
    console.log(chalk.yellow("\nNo .claude/ directory found."));
    console.log(chalk.dim("Run `npx claude-starter` first to initialize.\n"));
    return;
  }

  switch (action) {
    case "pull":
      await pullDocs(skillId, claudeDir, options);
      break;
    case "update":
      await updateDocs(claudeDir, options);
      break;
    case "status":
      await showStatus(skillId, claudeDir);
      break;
    case "sync":
      await syncDocs(claudeDir, options);
      break;
    default:
      console.log(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.dim("Available actions: pull, update, status, sync"));
  }
}

async function pullDocs(skillId, claudeDir, options) {
  console.log(chalk.bold("\n📥 Pulling Documentation\n"));

  // Check for docpull
  if (!(await isDocpullInstalled())) {
    console.log(chalk.yellow("docpull is not installed."));
    console.log(chalk.dim("\nInstall it with:"));
    console.log(chalk.cyan("  pipx install docpull"));
    console.log(chalk.dim("  or"));
    console.log(chalk.cyan("  pip install docpull\n"));
    return;
  }

  const manifest = readManifest(getTemplatesDir());

  // Get skills to pull docs for
  let skills;
  if (skillId) {
    const skill = findSkill(manifest, skillId);
    if (!skill) {
      console.log(chalk.red(`Skill not found: ${skillId}`));
      return;
    }
    if (!skill.docs?.url) {
      console.log(
        chalk.yellow(`Skill ${skillId} has no external documentation.`),
      );
      return;
    }
    skills = [skill];
  } else {
    // All skills with docs
    skills = manifest.skills.filter((s) => s.docs?.url);
  }

  console.log(chalk.dim(`Pulling docs for ${skills.length} skill(s)...\n`));

  const results = { success: [], failed: [] };

  for (const skill of skills) {
    const spinner = ora(`Pulling ${skill.id}...`).start();

    const result = await pullDocsForSkill(skill, claudeDir);

    if (result.success) {
      spinner.succeed(`${skill.id} - ${skill.docs.files || "?"} files`);
      results.success.push(skill.id);
    } else {
      spinner.fail(`${skill.id} - ${result.error}`);
      results.failed.push({ id: skill.id, error: result.error });
    }
  }

  // Summary
  console.log("\n" + chalk.dim("─".repeat(40)));
  if (results.success.length > 0) {
    console.log(
      chalk.green(`Successfully pulled: ${results.success.length}`),
    );
  }
  if (results.failed.length > 0) {
    console.log(chalk.red(`Failed: ${results.failed.length}`));
  }
  console.log("");
}

async function updateDocs(claudeDir, options) {
  console.log(chalk.bold("\n🔄 Updating Stale Documentation\n"));

  // Check for docpull
  if (!(await isDocpullInstalled())) {
    console.log(chalk.yellow("docpull is not installed."));
    console.log(chalk.cyan("  pipx install docpull\n"));
    return;
  }

  const manifest = readManifest(getTemplatesDir());
  const staleDays = parseInt(options.staleDays || "7", 10);
  const staleThreshold = staleDays * 24 * 60 * 60 * 1000;

  // Find stale skills
  const staleSkills = [];

  for (const skill of manifest.skills.filter((s) => s.docs?.url)) {
    const skillJson = readSkillJson(claudeDir, skill.path);
    const lastPulled = skillJson?.docs?.lastPulled;

    if (!lastPulled) {
      staleSkills.push({ skill, reason: "never pulled" });
    } else {
      const age = Date.now() - new Date(lastPulled).getTime();
      if (age > staleThreshold) {
        const daysAgo = Math.floor(age / (1000 * 60 * 60 * 24));
        staleSkills.push({ skill, reason: `${daysAgo} days old` });
      }
    }
  }

  if (staleSkills.length === 0) {
    console.log(chalk.green("All documentation is up to date!\n"));
    return;
  }

  console.log(
    chalk.dim(
      `Found ${staleSkills.length} stale skill(s) (>${staleDays} days):\n`,
    ),
  );

  for (const { skill, reason } of staleSkills) {
    console.log(chalk.yellow(`  - ${skill.id} (${reason})`));
  }

  console.log("");

  // Pull stale docs
  for (const { skill } of staleSkills) {
    const spinner = ora(`Updating ${skill.id}...`).start();

    const result = await pullDocsForSkill(skill, claudeDir);

    if (result.success) {
      spinner.succeed(`${skill.id} updated`);
    } else {
      spinner.fail(`${skill.id} - ${result.error}`);
    }
  }

  console.log("");
}

async function showStatus(skillId, claudeDir) {
  console.log(chalk.bold("\nDocumentation Status\n"));

  const manifest = readManifest(getTemplatesDir());

  // Get skills to show
  let skills;
  if (skillId) {
    const skill = findSkill(manifest, skillId);
    if (!skill) {
      console.log(chalk.red(`Skill not found: ${skillId}`));
      return;
    }
    skills = [skill];
  } else {
    skills = manifest.skills.filter((s) => s.docs?.url);
  }

  console.log(
    chalk.dim("Skill".padEnd(20) + "Status".padEnd(20) + "Last Pulled"),
  );
  console.log(chalk.dim("─".repeat(60)));

  for (const skill of skills) {
    const skillJson = readSkillJson(claudeDir, skill.path);
    const lastPulled = skillJson?.docs?.lastPulled;

    let status, lastPulledStr;

    if (!lastPulled) {
      status = chalk.yellow("Not pulled");
      lastPulledStr = chalk.dim("-");
    } else {
      const age = Date.now() - new Date(lastPulled).getTime();
      const daysAgo = Math.floor(age / (1000 * 60 * 60 * 24));

      if (daysAgo > 7) {
        status = chalk.yellow("Stale");
      } else {
        status = chalk.green("Up to date");
      }

      lastPulledStr = daysAgo === 0 ? "today" : `${daysAgo} days ago`;
    }

    console.log(skill.id.padEnd(20) + status.padEnd(20) + lastPulledStr);
  }

  console.log("\n" + chalk.dim("Commands:"));
  console.log(
    chalk.dim("  npx claude-starter docs pull         Pull all docs"),
  );
  console.log(
    chalk.dim("  npx claude-starter docs pull stripe  Pull specific skill"),
  );
  console.log(
    chalk.dim("  npx claude-starter docs update       Update stale docs"),
  );
  console.log(
    chalk.dim("  npx claude-starter docs sync         Auto-update everything stale\n"),
  );
}

/**
 * Auto-sync: Check for stale docs and update them automatically
 * This is the "auto-updating" feature
 */
async function syncDocs(claudeDir, options) {
  console.log(chalk.bold("\n🔄 Auto-Syncing Documentation\n"));

  // Check for docpull
  if (!(await isDocpullInstalled())) {
    console.log(chalk.yellow("docpull is not installed."));
    console.log(chalk.cyan("  pipx install docpull\n"));
    return;
  }

  const staleDays = parseInt(options.staleDays || "7", 10);

  // Use global cache to check staleness
  const staleSkills = await getStaleSkills(staleDays);

  if (staleSkills.length === 0) {
    console.log(chalk.green("All documentation is up to date.\n"));
    return;
  }

  console.log(chalk.dim(`Found ${staleSkills.length} skill(s) needing updates:\n`));

  const manifest = readManifest(getTemplatesDir());

  // Auto-update all stale skills
  const results = { success: [], failed: [] };

  for (const staleInfo of staleSkills) {
    const skill = findSkill(manifest, staleInfo.id);
    if (!skill || !skill.docs?.url) continue;

    const ageStr = staleInfo.daysSincePull !== null
      ? `${staleInfo.daysSincePull} days old`
      : 'never pulled';

    const spinner = ora(`${skill.id} (${ageStr})...`).start();

    const result = await pullDocsForSkill(skill, claudeDir);

    if (result.success) {
      spinner.succeed(`${skill.id} - updated`);
      results.success.push(skill.id);
    } else {
      spinner.fail(`${skill.id} - ${result.error}`);
      results.failed.push({ id: skill.id, error: result.error });
    }
  }

  // Summary
  console.log("\n" + chalk.dim("─".repeat(40)));
  console.log(chalk.green(`Updated: ${results.success.length} skills`));
  if (results.failed.length > 0) {
    console.log(chalk.red(`Failed: ${results.failed.length} skills`));
  }
  console.log(chalk.dim(`\nTip: Run this periodically to keep docs fresh`));
  console.log(chalk.dim(`   Or add to cron: 0 0 * * 0 (weekly on Sunday)\n`));
}
