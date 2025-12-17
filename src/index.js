// Claude Starter - Programmatic API
// For CLI usage, use bin/cli.js

export { init } from './commands/init.js';
export { add } from './commands/add.js';
export { list } from './commands/list.js';
export { update } from './commands/update.js';
export { docs } from './commands/docs.js';

export {
  readManifest,
  readInstalledManifest,
  findSkill,
  getAllDependencies,
  groupByCategory
} from './utils/manifest.js';

export {
  copyAll,
  copySkill,
  copySkills,
  getTemplatesDir
} from './utils/copy.js';

export {
  getToonBinaryName,
  isPlatformSupported,
  setupToonBinary
} from './utils/platform.js';
