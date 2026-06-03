// Agent Starter - Programmatic API
// For CLI usage, use bin/cli.js

export { init } from './commands/init.js';
export { docs } from './commands/docs.js';
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

export {
  getToonBinaryName,
  isPlatformSupported,
  setupToonBinary,
} from './utils/platform.js';

export { SKILLS, profiles, getProfile } from './profiles.js';
