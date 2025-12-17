import os from 'os';
import { existsSync, symlinkSync, unlinkSync } from 'fs';
import { join } from 'path';

/**
 * Get the TOON binary name for the current platform
 */
export function getToonBinaryName() {
  const platform = os.platform();  // darwin, linux, win32
  const arch = os.arch();          // arm64, x64

  if (platform === 'win32') {
    return `toon-windows-${arch}.exe`;
  }

  return `toon-${platform}-${arch}`;
}

/**
 * Get supported platforms
 */
export function getSupportedPlatforms() {
  return [
    'darwin-arm64',
    'darwin-x64',
    'linux-x64',
    'linux-arm64'
  ];
}

/**
 * Check if current platform is supported
 */
export function isPlatformSupported() {
  const platform = os.platform();
  const arch = os.arch();
  const key = `${platform}-${arch}`;
  return getSupportedPlatforms().includes(key);
}

/**
 * Setup TOON binary symlink for the current platform
 */
export function setupToonBinary(claudeDir) {
  // TOON binary is in skills/toon-formatter/bin/
  const binDir = join(claudeDir, 'skills', 'toon-formatter', 'bin');
  const binaryName = getToonBinaryName();
  const binaryPath = join(binDir, binaryName);
  const symlinkPath = join(binDir, 'toon');

  // Check if platform-specific binary exists
  if (!existsSync(binaryPath)) {
    // Try old location for backwards compatibility
    const oldBinDir = join(claudeDir, 'utils', 'toon', 'bin');
    const oldBinaryPath = join(oldBinDir, binaryName);
    if (existsSync(oldBinaryPath)) {
      return { success: true, path: oldBinaryPath, note: 'Using binary from utils/toon' };
    }

    return {
      success: false,
      error: `No TOON binary for platform: ${os.platform()}-${os.arch()}`,
      suggestion: 'TOON binary not found. The package may need platform-specific binaries.'
    };
  }

  // Remove existing symlink if present
  if (existsSync(symlinkPath)) {
    try {
      unlinkSync(symlinkPath);
    } catch (e) {
      // Ignore errors
    }
  }

  // Create symlink
  try {
    symlinkSync(binaryPath, symlinkPath);
    return { success: true, path: symlinkPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get platform info for display
 */
export function getPlatformInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    supported: isPlatformSupported()
  };
}
