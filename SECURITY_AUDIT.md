# Security & Robustness Audit

Comprehensive audit of security vulnerabilities and robustness issues.

---

## Executive Summary

**Current Security Posture: 6/10** ⚠️

**Good:**
- ✅ Using `execFile` (not `exec`) - prevents shell injection
- ✅ Path traversal prevention (`isPathSafe`)
- ✅ URL validation with SSRF prevention
- ✅ Skill path validation
- ✅ Manifest structure validation

**Critical Issues Found:**
- ❌ No checksum verification (MITM attacks)
- ❌ Prototype pollution in `deepMerge`
- ❌ No disk space checks
- ❌ No transaction/rollback system
- ❌ Race conditions in file operations
- ❌ No binary signature verification
- ❌ ReDoS vulnerabilities in regex
- ❌ No rate limiting
- ❌ Symlink attacks possible
- ❌ JSON bomb DoS possible

---

## 1. CRITICAL Security Vulnerabilities

### 1.1 Prototype Pollution in deepMerge ⚠️ HIGH

**Location:** `src/utils/manifest.js:108-122`

**Problem:**
```javascript
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
```

**Attack:**
```javascript
// Attacker crafts malicious skill.json
{
  "docs": {
    "__proto__": {
      "isAdmin": true
    }
  }
}
// Pollutes Object.prototype!
```

**Fix:**
```javascript
function deepMerge(target, source) {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    // CRITICAL: Block prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Skip dangerous keys
    }

    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}
```

---

### 1.2 No Checksum Verification ⚠️ HIGH

**Problem:** Downloaded documentation has no integrity checks

**Attack Scenario:**
```
1. User runs: npx claude-starter docs pull stripe
2. MITM attacker intercepts connection
3. Injects malicious files into docs
4. User's Claude skills now reference malicious content
```

**Fix:**
```javascript
// Add to registry.json
{
  "id": "stripe",
  "docs": {
    "url": "https://docs.stripe.com",
    "checksum": "sha256:abc123...",  // Expected hash
    "size": "33MB"
  }
}

// Verify after download
async function verifyChecksum(filePath, expectedHash) {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => {
      const computed = hash.digest('hex');
      resolve(computed === expectedHash);
    });
    stream.on('error', reject);
  });
}
```

---

### 1.3 ReDoS (Regular Expression Denial of Service) ⚠️ MEDIUM

**Location:** `src/utils/security.js:110`

**Problem:**
```javascript
const validPattern = /^[a-zA-Z0-9_\-\/]+$/;
```

**Attack:**
```javascript
// Attacker provides malicious skill path
const evil = 'a'.repeat(100000) + '!';
// Regex engine backtracks exponentially -> DoS
```

**Fix:**
```javascript
function isValidSkillPath(skillPath) {
  if (!skillPath || typeof skillPath !== 'string') {
    return false;
  }

  // CRITICAL: Length check BEFORE regex
  if (skillPath.length > 256) {
    return false; // Prevent ReDoS
  }

  // Rest of validation...
}
```

---

### 1.4 Symlink Attacks ⚠️ MEDIUM

**Problem:** No symlink detection during copy operations

**Attack:**
```bash
# Attacker creates malicious skill
cd templates/.claude/skills/
ln -s /etc/passwd evil-skill

# User installs
npx claude-starter add evil-skill
# Now /etc/passwd copied to user's project!
```

**Fix:**
```javascript
import { lstat } from 'fs-extra';

async function copySkill(targetDir, skillPath, options = {}) {
  const srcPath = resolve(templatesDir, skillPath);

  // CRITICAL: Check for symlinks
  const stats = await lstat(srcPath);
  if (stats.isSymbolicLink()) {
    throw new Error(`Security: skill path is a symlink: ${skillPath}`);
  }

  // Add filter to fs-extra copy
  await copy(srcPath, destPath, {
    overwrite: options.force,
    filter: async (src) => {
      const srcStat = await lstat(src);
      if (srcStat.isSymbolicLink()) {
        console.warn(`Skipping symlink: ${src}`);
        return false; // Don't copy symlinks
      }
      return true;
    }
  });
}
```

---

### 1.5 JSON Bomb DoS ⚠️ MEDIUM

**Problem:** No size limits on JSON parsing

**Attack:**
```json
{
  "skills": [
    {"id": "a".repeat(1000000), ...},
    // 10,000 skills with huge IDs
  ]
}
// Causes OOM crash
```

**Fix:**
```javascript
export function readManifest(templatesDir) {
  const manifestPath = join(templatesDir, 'manifest.json');

  // CRITICAL: Check file size before parsing
  const stats = fs.statSync(manifestPath);
  if (stats.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Manifest file too large (>10MB)');
  }

  const content = readFileSync(manifestPath, 'utf-8');

  // CRITICAL: Limit JSON depth
  let manifest;
  try {
    manifest = JSON.parse(content, (key, value) => {
      // Reject deeply nested objects
      if (typeof value === 'object' && value !== null) {
        const depth = getObjectDepth(value);
        if (depth > 10) {
          throw new Error('JSON too deeply nested');
        }
      }
      return value;
    });
  } catch (e) {
    throw new Error(`Invalid JSON in manifest: ${e.message}`);
  }

  // Additional validation
  if (manifest.skills && manifest.skills.length > 1000) {
    throw new Error('Too many skills in manifest (>1000)');
  }

  return manifest;
}
```

---

### 1.6 TOON Binary Verification ⚠️ HIGH

**Problem:** No signature verification on TOON binaries

**Attack:**
```bash
# Attacker replaces TOON binary with malware
templates/.claude/utils/toon/bin/toon-darwin-arm64 (malicious)

# User runs
npx create-claude-starter
# Malware executed with user permissions!
```

**Fix:**
```javascript
// 1. Sign binaries during build
// build-toon.sh
zig build
shasum -a 256 toon > toon.sha256
openssl dgst -sha256 -sign private.pem toon > toon.sig

// 2. Verify before execution
import crypto from 'crypto';
import { readFileSync } from 'fs';

function verifyToonBinary(binaryPath) {
  const binary = readFileSync(binaryPath);
  const signature = readFileSync(binaryPath + '.sig');
  const publicKey = readFileSync('public.pem');

  const verify = crypto.createVerify('SHA256');
  verify.update(binary);

  if (!verify.verify(publicKey, signature)) {
    throw new Error('TOON binary signature verification failed');
  }
}

// 3. Check in package.json
{
  "toon_checksums": {
    "darwin-arm64": "sha256:abc123...",
    "linux-x64": "sha256:def456..."
  }
}
```

---

## 2. Robustness Issues

### 2.1 No Transaction System / Rollback ⚠️ HIGH

**Problem:** Partial installs leave system in broken state

**Scenario:**
```bash
npx claude-starter init --profile web-saas
# Installs stripe ✓
# Installs supabase ✓
# Network fails during expo ✗
# Result: Broken installation, no rollback
```

**Fix:**
```javascript
class Transaction {
  constructor() {
    this.operations = [];
    this.completed = [];
  }

  async execute(operation) {
    try {
      const result = await operation.run();
      this.operations.push(operation);
      this.completed.push(result);
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async rollback() {
    console.log('Rolling back transaction...');

    // Reverse order
    for (let i = this.completed.length - 1; i >= 0; i--) {
      const operation = this.operations[i];
      try {
        await operation.undo(this.completed[i]);
      } catch (error) {
        console.error(`Rollback failed for ${operation.name}:`, error);
      }
    }

    this.operations = [];
    this.completed = [];
  }

  async commit() {
    // Mark transaction as successful
    this.operations = [];
    this.completed = [];
  }
}

// Usage
export async function init(dir = '.', options = {}) {
  const tx = new Transaction();

  try {
    await tx.execute({
      name: 'create-directory',
      run: async () => {
        await ensureDir(claudeDir);
        return claudeDir;
      },
      undo: async (result) => {
        await remove(result);
      }
    });

    await tx.execute({
      name: 'copy-skills',
      run: async () => {
        const results = await copySkills(targetDir, skillPaths, options);
        return results;
      },
      undo: async (results) => {
        for (const r of results) {
          if (r.success) {
            await remove(r.destPath);
          }
        }
      }
    });

    await tx.commit();
    console.log('Installation successful!');
  } catch (error) {
    console.error('Installation failed, rolling back...');
    throw error;
  }
}
```

---

### 2.2 Race Conditions in File Operations ⚠️ MEDIUM

**Problem:** Concurrent operations can corrupt files

**Scenario:**
```bash
# Terminal 1
npx claude-starter docs pull stripe

# Terminal 2 (same time)
npx claude-starter docs pull stripe

# Both try to write to same files -> corruption
```

**Fix:**
```javascript
import { open, close } from 'fs/promises';
import { constants } from 'fs';

class FileLock {
  constructor(lockDir = '.claude/.locks') {
    this.lockDir = lockDir;
    this.locks = new Map();
  }

  async acquire(lockName, timeout = 30000) {
    const lockFile = join(this.lockDir, `${lockName}.lock`);
    await ensureDir(this.lockDir);

    const start = Date.now();

    while (true) {
      try {
        // Try to create lock file (exclusive)
        const fd = await open(lockFile, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
        await fd.writeFile(JSON.stringify({
          pid: process.pid,
          timestamp: new Date().toISOString()
        }));
        await fd.close();

        this.locks.set(lockName, lockFile);
        return true;
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }

        // Lock exists, check if stale
        try {
          const lockData = JSON.parse(await readFile(lockFile, 'utf-8'));
          const age = Date.now() - new Date(lockData.timestamp).getTime();

          // Stale lock (>5 min old)
          if (age > 5 * 60 * 1000) {
            await unlink(lockFile);
            continue;
          }
        } catch {
          // Corrupted lock file, remove it
          await unlink(lockFile);
          continue;
        }

        // Check timeout
        if (Date.now() - start > timeout) {
          throw new Error(`Failed to acquire lock: ${lockName} (timeout)`);
        }

        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  async release(lockName) {
    const lockFile = this.locks.get(lockName);
    if (lockFile) {
      await unlink(lockFile).catch(() => {}); // Ignore errors
      this.locks.delete(lockName);
    }
  }
}

// Usage
const locks = new FileLock();

export async function docs(action, skillId, options = {}) {
  const lockName = `docs-${skillId || 'all'}`;

  try {
    await locks.acquire(lockName);

    // Perform operation safely
    await pullDocs(skillId, claudeDir, options);

  } finally {
    await locks.release(lockName);
  }
}
```

---

### 2.3 No Disk Space Checks ⚠️ MEDIUM

**Problem:** Can fill disk without warning

**Fix:**
```javascript
import { statfs } from 'fs/promises';
import { platform } from 'os';

async function getAvailableSpace(path) {
  if (platform() === 'win32') {
    // Windows: use different method
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec(`fsutil volume diskfree ${path.substring(0, 2)}`, (error, stdout) => {
        if (error) return reject(error);
        const match = stdout.match(/Total bytes available to caller:\s+(\d+)/);
        resolve(match ? parseInt(match[1]) : 0);
      });
    });
  }

  // Unix-like systems
  const stats = await statfs(path);
  return stats.bavail * stats.bsize; // Available space in bytes
}

async function checkDiskSpace(targetDir, requiredBytes) {
  const available = await getAvailableSpace(targetDir);
  const requiredGB = (requiredBytes / 1024 / 1024 / 1024).toFixed(2);
  const availableGB = (available / 1024 / 1024 / 1024).toFixed(2);

  if (available < requiredBytes) {
    throw new Error(
      `Insufficient disk space. Required: ${requiredGB}GB, Available: ${availableGB}GB`
    );
  }

  // Warn if less than 1GB free after operation
  if (available - requiredBytes < 1024 * 1024 * 1024) {
    console.warn(chalk.yellow(
      `⚠️  Warning: Less than 1GB disk space will remain after installation`
    ));
  }
}

// Use before operations
export async function pullDocs(skillId, claudeDir, options) {
  const skills = skillId ? [findSkill(manifest, skillId)] : manifest.skills;

  // Calculate total size
  const totalSize = skills.reduce((sum, s) => {
    const sizeStr = s.docs?.size || '0MB';
    const sizeMB = parseInt(sizeStr);
    return sum + (sizeMB * 1024 * 1024);
  }, 0);

  // Check space before downloading
  await checkDiskSpace(claudeDir, totalSize * 1.2); // 20% buffer

  // Proceed with downloads...
}
```

---

### 2.4 No Retry Logic for Network Failures ⚠️ MEDIUM

**Fix:**
```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw error; // Permanent failure
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(chalk.yellow(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usage
async function pullDocsForSkill(skill, claudeDir) {
  return retryWithBackoff(async () => {
    await execFileAsync("docpull", [url, "-o", outputPath], {
      timeout: 300000,
      maxBuffer: 10 * 1024 * 1024,
    });
  }, 3, 2000);
}
```

---

### 2.5 Circular Dependency Detection ⚠️ LOW

**Fix:**
```javascript
export function getAllDependencies(manifest, skillId, visited = new Set(), path = []) {
  if (visited.has(skillId)) {
    // Check for circular dependency
    if (path.includes(skillId)) {
      const cycle = [...path, skillId].join(' -> ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }
    return [];
  }

  visited.add(skillId);
  path.push(skillId);

  const skill = findSkill(manifest, skillId);
  if (!skill || !skill.dependencies) {
    path.pop();
    return [];
  }

  const deps = [...skill.dependencies];
  for (const depId of skill.dependencies) {
    deps.push(...getAllDependencies(manifest, depId, visited, path));
  }

  path.pop();
  return [...new Set(deps)];
}
```

---

## 3. Additional Security Hardening

### 3.1 Content Security Policy for External Fetches

```javascript
// Only allow fetching from whitelisted domains
const ALLOWED_DOC_HOSTS = [
  'docs.stripe.com',
  'supabase.com',
  'docs.expo.dev',
  'plaid.com',
  'docs.whop.com',
  'shopify.dev',
  'docs.anthropic.com',
  'code.claude.com'
];

function isValidUrl(str) {
  // ... existing checks ...

  const url = new URL(str);
  const hostname = url.hostname.toLowerCase();

  // Check whitelist
  const isAllowed = ALLOWED_DOC_HOSTS.some(allowed =>
    hostname === allowed || hostname.endsWith('.' + allowed)
  );

  if (!isAllowed) {
    return false;
  }

  return true;
}
```

### 3.2 Rate Limiting

```javascript
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get requests in current window
    const reqs = this.requests.get(key) || [];
    const validReqs = reqs.filter(t => t > windowStart);

    if (validReqs.length >= this.maxRequests) {
      const oldestReq = Math.min(...validReqs);
      const waitTime = this.windowMs - (now - oldestReq);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)}s`);
    }

    validReqs.push(now);
    this.requests.set(key, validReqs);
  }
}

const limiter = new RateLimiter(5, 60000); // 5 requests per minute

async function pullDocsForSkill(skill, claudeDir) {
  await limiter.checkLimit(skill.docs.url);
  // ... proceed with download
}
```

### 3.3 Atomic Writes

```javascript
import { rename } from 'fs/promises';
import { randomBytes } from 'crypto';

async function atomicWrite(filePath, data) {
  const tempPath = `${filePath}.tmp.${randomBytes(8).toString('hex')}`;

  try {
    // Write to temp file
    await writeFile(tempPath, data);

    // Atomic rename
    await rename(tempPath, filePath);
  } catch (error) {
    // Cleanup on error
    await unlink(tempPath).catch(() => {});
    throw error;
  }
}

// Use for settings.json
await atomicWrite(
  resolve(claudeDir, 'settings.json'),
  JSON.stringify(settings, null, 2)
);
```

---

## 4. Implementation Priority

### Phase 1: CRITICAL (Ship Blockers) 🔥
Must fix before npm publish:

1. **Prototype pollution** - 30 min
2. **Symlink attacks** - 1 hour
3. **TOON binary verification** - 2 hours
4. **JSON bomb limits** - 30 min
5. **ReDoS fixes** - 30 min

**Total: 4.5 hours**

### Phase 2: HIGH (Next Week) ⚠️
Important for production use:

6. **Transaction/rollback system** - 4 hours
7. **Checksum verification** - 3 hours
8. **File locking** - 2 hours
9. **Disk space checks** - 1 hour
10. **Retry logic** - 1 hour

**Total: 11 hours**

### Phase 3: MEDIUM (Following Release) 📋
Improve robustness:

11. **Atomic writes** - 1 hour
12. **Rate limiting** - 1 hour
13. **Circular dep detection** - 30 min
14. **CSP whitelist** - 30 min
15. **Better error messages** - 2 hours

**Total: 5 hours**

---

## 5. Testing Strategy

### Security Tests
```javascript
// test/security.test.js
import { test } from 'node:test';
import { deepMerge } from '../src/utils/manifest.js';

test('deepMerge prevents prototype pollution', () => {
  const target = {};
  const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');

  const result = deepMerge(target, malicious);

  assert.strictEqual({}.isAdmin, undefined); // Not polluted
  assert.strictEqual(result.isAdmin, undefined);
});

test('isValidSkillPath blocks path traversal', () => {
  assert.strictEqual(isValidSkillPath('../../../etc/passwd'), false);
  assert.strictEqual(isValidSkillPath('foo/../../bar'), false);
  assert.strictEqual(isValidSkillPath('/absolute/path'), false);
});

test('JSON parser rejects huge files', async () => {
  const hugePath = '/tmp/huge-manifest.json';
  await writeFile(hugePath, JSON.stringify({
    skills: new Array(10000).fill({id: 'a'.repeat(1000)})
  }));

  await assert.rejects(
    () => readManifest('/tmp'),
    /too large|too many/i
  );
});
```

### Robustness Tests
```javascript
test('transaction rolls back on failure', async () => {
  const tx = new Transaction();
  const testDir = '/tmp/test-rollback';

  await assert.rejects(async () => {
    await tx.execute({
      name: 'create',
      run: async () => await ensureDir(testDir),
      undo: async () => await remove(testDir)
    });

    await tx.execute({
      name: 'fail',
      run: async () => { throw new Error('Intentional fail'); },
      undo: async () => {}
    });
  });

  // Directory should be rolled back
  assert.strictEqual(await pathExists(testDir), false);
});

test('concurrent operations use locks', async () => {
  let counter = 0;
  const locks = new FileLock();

  // Run 10 concurrent operations
  await Promise.all(
    Array(10).fill().map(async () => {
      await locks.acquire('test-lock');
      const temp = counter;
      await new Promise(r => setTimeout(r, 10)); // Simulate work
      counter = temp + 1;
      await locks.release('test-lock');
    })
  );

  assert.strictEqual(counter, 10); // No race condition
});
```

---

## 6. Security Checklist Before Publish

- [ ] Prototype pollution fixed
- [ ] Symlink detection added
- [ ] TOON binary signatures verified
- [ ] JSON size limits enforced
- [ ] ReDoS vulnerabilities patched
- [ ] All `execFile` calls use argument arrays (not shell)
- [ ] Path traversal checks on all file operations
- [ ] URL validation on all external fetches
- [ ] Input sanitization on user-provided strings
- [ ] Dependency audit: `npm audit fix`
- [ ] Update all dependencies to latest
- [ ] Add `.npmignore` to exclude test files
- [ ] Review all error messages (no info leakage)
- [ ] Add security policy: `SECURITY.md`
- [ ] Run fuzzing tests
- [ ] Penetration testing (manual)

---

## 7. Operational Security

### Distribution Security
```json
// package.json
{
  "files": [
    "bin/",
    "src/",
    "templates/",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "provenance": true  // Enable npm provenance
  }
}
```

### Supply Chain Security
```bash
# Use lock file
npm install --package-lock

# Audit dependencies
npm audit

# Check for known vulnerabilities
npx snyk test

# Sign releases
git tag -s v1.0.0 -m "Release 1.0.0"
```

---

## Summary

**Before fixing:** 6/10 security score, multiple critical vulnerabilities

**After Phase 1:** 8/10 - Safe to publish
**After Phase 2:** 9/10 - Production-hardened
**After Phase 3:** 9.5/10 - Industry best practices

**Estimated total effort:** 20 hours across 3 phases

**Recommendation:** Complete Phase 1 (4.5 hours) before npm publish.
