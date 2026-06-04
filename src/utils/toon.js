import { existsSync, lstatSync } from 'fs';
import { join } from 'path';

const TOON_WRAPPER_RELATIVE_PATH = ['utils', 'toon', 'cli.mjs'];

export function setupToonBinary(claudeDir) {
  const wrapperPath = join(claudeDir, ...TOON_WRAPPER_RELATIVE_PATH);

  if (!existsSync(wrapperPath)) {
    return {
      success: false,
      error: `TOON wrapper missing at ${wrapperPath}`,
    };
  }

  let stats;
  try {
    stats = lstatSync(wrapperPath);
  } catch (error) {
    return {
      success: false,
      error: `Unable to inspect TOON wrapper: ${error.message}`,
    };
  }
  if (stats.isSymbolicLink()) {
    return {
      success: false,
      error: `TOON wrapper must be a regular file: ${wrapperPath}`,
    };
  }

  if (!stats.isFile()) {
    return {
      success: false,
      error: `TOON wrapper is not a file: ${wrapperPath}`,
    };
  }

  return { success: true, path: wrapperPath };
}
