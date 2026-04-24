// Claude Starter - Programmatic API
// For CLI usage, use bin/cli.js

export { init } from './commands/init.js';
export { docs } from './commands/docs.js';

export {
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
