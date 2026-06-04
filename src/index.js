// Agent Starter - Programmatic API
// For CLI usage, use bin/cli.js

export { init } from './commands/init.js';
export { AGENT_TARGETS, parseAgentTargets } from './agents.js';

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

export { SKILLS, profiles, getProfile } from './profiles.js';
