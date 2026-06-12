// Agent Starter - Programmatic API
// For CLI usage, use bin/cli.js

export { AGENT_TARGETS, parseAgentTargets } from './agents.js';
export { init } from './commands/init.js';
export { getProfile, profiles, SKILLS } from './profiles.js';
export {
  copyAgentEssentials,
  copyAgentSkill,
  copyAgentSkills,
  copyAll,
  copySkill,
  copySkills,
  getTemplatesDir,
} from './utils/copy.js';
export { setupToonBinary } from './utils/toon.js';
