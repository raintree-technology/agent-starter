# Attack Surface Map: claude-starter

**Audit date:** 2026-04-15
**Branch:** `codex/security-hardening`
**Commit:** `6dd2a7f`
**Auditor:** white-box recon (automated)

---

## 1. Stack Summary

| Component | Technology | Version / Notes |
|---|---|---|
| Language | JavaScript (ES Modules) | Node.js >= 18 |
| Package manager | npm | `package-lock.json` present |
| CLI framework | `commander` | ^14.0.2 |
| Interactive prompts | `inquirer` | ^13.1.0 |
| File operations | `fs-extra` | ^11.3.3 (copy, remove, ensureDir) |
| YAML parsing | `js-yaml` | ^4.1.1 (used by workflow parser) |
| JSON schema validation | `ajv` + `ajv-formats` | ^8.18.0 / ^3.0.1 |
| Child process execution | `child_process.execFile`, `child_process.spawn` | Node.js built-in |
| External tool dependency | `docpull` (Python/pipx) | Invoked via `execFile` |
| Compiled binary | TOON encoder/decoder | Zig, Mach-O arm64 (357KB) |
| Templating | None (static markdown skills) | -- |
| HTTP client | None in src/ (delegated to `docpull`) | -- |
| ORM / DB | None | -- |
| Auth | None (local CLI tool) | -- |

### Dependency audit

```
npm audit: 0 vulnerabilities (60 prod, 84 dev, 143 total)
```

---

## 2. CLI Command / Endpoint Table

This is a CLI tool, not a web server. "Endpoints" are CLI commands exposed via `commander`.

| Command | Handler | Auth | Accepted Inputs |
|---|---|---|---|
| `claude-starter [dir]` (default) | `src/commands/init.js:13` | None (local CLI) | `dir` (positional path), `--yes`, `--force`, `--profile <name>`, `--skills <csv>`, `--no-toon` |
| `claude-starter init [dir]` | `src/commands/init.js:13` | None | Same as default |
| `claude-starter add <skills...>` | `src/commands/add.js:8` | None | `skills` (variadic positional), `--force` |
| `claude-starter list` | `src/commands/list.js:7` | None | `--category <name>`, `--installed`, `--json` |
| `claude-starter update [skills...]` | `src/commands/update.js:8` | None | `skills` (variadic positional), `--all` |
| `claude-starter docs <action> [skill]` | `src/commands/docs.js:98` | None | `action` (pull/update/status/sync), `skill` (optional ID), `--stale-days <n>` |
| Workflow engine (template, not CLI-exposed) | `templates/.claude/utils/workflows/engine.js:35` | None | Workflow YAML file path, `--input key=value`, `--dry-run`, `--verbose`, `--allow-shell` |

---

## 3. Sources of Untrusted Input

### 3a. Direct user input (CLI arguments)

| Source | Entry point | Notes |
|---|---|---|
| `dir` argument | `bin/cli.js:24` | Resolved with `path.resolve()` |
| `--profile <name>` | `bin/cli.js:28` | Matched against hardcoded profile list |
| `--skills <csv>` | `bin/cli.js:29` | Split on `,`, each looked up in manifest |
| `--category <name>` | `bin/cli.js:55` | Used as string filter |
| `<skills...>` to `add` | `bin/cli.js:46` | Each resolved via manifest lookup |
| `--stale-days` | `bin/cli.js:71` | Parsed with `parseInt()` |
| `--input key=value` (workflow) | `templates/.claude/utils/workflows/engine.js:411` | Split on `=`, used in variable substitution |

### 3b. File-based input (parsed from disk)

| Source | Parser location | Format | Notes |
|---|---|---|---|
| `templates/.claude/manifest.json` | `src/utils/manifest.js:10` | JSON | Size-limited (10MB), array-length-limited (1000), schema-validated |
| `.claude/manifest.json` (installed) | `src/utils/manifest.js:49` | JSON | **No size limit or validation** on installed copy |
| `skill.json` files | `src/utils/manifest.js:61` | JSON | Path-validated before read |
| `~/.claude-starter/docs-cache.json` | `src/utils/docs-cache.js:20` | JSON | Read from user homedir, no size limit |
| Workflow YAML files | `templates/.claude/utils/workflows/parser.js:26` | YAML | Parsed with `js-yaml.load()` (safe schema in v4) |
| Skill `.md` files | `scripts/generate-manifest.js:76` | Markdown | Regex extraction of headings/frontmatter |

### 3c. External process output

| Source | Invocation point | Notes |
|---|---|---|
| `docpull` stdout/stderr | `src/commands/docs.js:68` | Output captured but not parsed or used in further operations |
| Shell command output (workflow) | `templates/.claude/utils/workflows/step-runner.js:74` | Captured into state; can flow into subsequent variable substitution |

### 3d. Pre-shipped binary

| Source | Path | Notes |
|---|---|---|
| TOON binary | `skills/toon-formatter/bin/toon-darwin-arm64` | Unsigned Mach-O arm64 binary, no checksum verification |

---

## 4. Sinks (Dangerous Operations)

### 4a. Child process execution

| Sink type | File:line | Input source | Guard |
|---|---|---|---|
| `execFile("which", ["docpull"])` | `src/commands/docs.js:30` | Hardcoded args | Low risk - fixed command |
| `execFile("docpull", [url, "-o", outputPath])` | `src/commands/docs.js:68` | `url` from manifest `docs.url`, `outputPath` from manifest `docs.output` or `skill.path` | `isValidUrl()` on URL, `isPathSafe()` on output path |
| `spawn('bash', ['-c', command])` | `templates/.claude/utils/workflows/step-runner.js:74` | Workflow YAML `bash:` field after variable substitution | Gated behind `allowShell` flag (default: false), env scrubbed |

### 4b. File system writes

| Sink type | File:line | Input source | Guard |
|---|---|---|---|
| `writeFile(settings.json)` | `src/commands/init.js:182` | Generated from hardcoded template + skill IDs | Path is `resolve(claudeDir, 'settings.json')` |
| `copy(templatesDir, claudeDir)` | `src/utils/copy.js:46` | Template directory (package-internal) | Symlink filter, docs filter |
| `copy(srcPath, destPath)` per skill | `src/utils/copy.js:110` | `skillPath` from manifest lookup | `isValidSkillPath()`, `isPathSafe()` x2, symlink check |
| `writeFileSync(skillJsonPath, ...)` | `src/utils/manifest.js:102` | Merge of existing JSON + update object | `isValidSkillPath()`, `isPathSafe()` |
| `writeFile(cachePath, ...)` | `src/utils/docs-cache.js:53` | Docs metadata (timestamps, URLs) | Path is `~/.claude-starter/docs-cache.json` (hardcoded) |
| `copy(srcPath, destPath)` commands | `src/utils/copy.js:215` | `commandName` from profile definition | No path validation on commandName (uses string concat with `.md`) |
| `copy(srcHooksDir, destHooksDir)` | `src/utils/copy.js:235` | Template hooks directory | Symlink filter |
| `symlinkSync(binaryPath, symlinkPath)` | `src/utils/platform.js:78` | Platform-derived binary name | Path constructed from `os.platform()` + `os.arch()` |
| `remove(claudeDir)` | `src/utils/copy.js:37` | `targetDir` from CLI `dir` arg | Only with `--force` flag |
| Hook scripts write to `/tmp/` | `templates/.claude/hooks/auto-optimize.sh:32-33` | `TOOL_INPUT_FILE_PATH` env var | `set -euo pipefail`, but paths not quoted in all contexts |

### 4c. JSON parse (potential for prototype pollution / DoS)

| Sink | File:line | Guard |
|---|---|---|
| `JSON.parse(manifest)` | `src/utils/manifest.js:24` | 10MB size limit, 1000-skill limit, schema validation |
| `JSON.parse(installed manifest)` | `src/utils/manifest.js:54` | **No size or schema validation** |
| `JSON.parse(skill.json)` | `src/utils/manifest.js:79` | Path validated, errors caught |
| `JSON.parse(docs-cache)` | `src/utils/docs-cache.js:32` | Errors caught, defaults returned |
| `deepMerge()` | `src/utils/manifest.js:124` | Prototype pollution guard (`__proto__`, `constructor`, `prototype` blocked) |

### 4d. YAML parse

| Sink | File:line | Guard |
|---|---|---|
| `yaml.load(content)` | `templates/.claude/utils/workflows/parser.js:33` | js-yaml v4 defaults to safe schema (no `!!js/function`). **No file size limit.** |

### 4e. Variable substitution / expression evaluation

| Sink | File:line | Notes |
|---|---|---|
| `substituteVariables()` | `templates/.claude/utils/workflows/state-manager.js:83` | Regex-based `${{ expr }}` replacement; results flow into `spawn('bash', ...)` |
| `evaluateInContext()` | `templates/.claude/utils/workflows/state-manager.js:181` | Custom expression evaluator (no `eval()`), but uses `resolveValue()` with dot-path traversal into context object |

### 4f. Symlink creation

| Sink | File:line | Notes |
|---|---|---|
| `symlinkSync()` | `src/utils/platform.js:78` | Creates `toon` symlink; path derived from `os.platform()` + `os.arch()` (not user-controlled) |

---

## 5. Existing Defenses Observed

### Input validation (`src/utils/security.js`)

| Defense | Function | Notes |
|---|---|---|
| URL validation + SSRF block | `isValidUrl()` | Blocks localhost, private IPs, non-http(s), credentials in URL |
| Path traversal prevention | `isPathSafe()` | Resolves to absolute, checks prefix containment, null-byte check |
| Skill path format validation | `isValidSkillPath()` | Length < 256, no `..`, no absolute, alphanumeric + hyphens + slashes only, no `//` |
| Skill ID validation | `isValidSkillId()` | Length < 64, alphanumeric + hyphens + underscores only |
| Log sanitization | `sanitizeForLog()` | Strips control characters |
| Manifest schema validation | `validateManifest()` | Checks structure, validates each skill's id/path/docs.url |
| ReDoS prevention | Length checks before regex | Applied in `isValidSkillPath()`, `isValidSkillId()` |

### Prototype pollution protection (`src/utils/manifest.js:124`)

- `deepMerge()` explicitly skips `__proto__`, `constructor`, `prototype` keys

### Symlink attack prevention (`src/utils/copy.js`)

- `lstat()` used to detect symlinks before every copy operation
- Symlinks are rejected with warning messages

### JSON bomb mitigation (`src/utils/manifest.js`)

- 10MB file size limit on template manifest
- 1000-skill array length limit

### Shell execution lockdown (`templates/.claude/utils/workflows/step-runner.js`)

- `allowShell` defaults to `false`; bash steps blocked unless explicitly opted in
- Environment scrubbing: only whitelisted env vars (`PATH`, `HOME`, `LANG`, etc.) forwarded to child processes
- Env key validation: only `^[A-Z_][A-Z0-9_]*$` accepted

### Slash-command safety (`templates/.claude/utils/workflows/step-runner.js:133`)

- Slash-command steps require an explicit `commandHandler` function
- Without it, execution is refused (fail-closed)

### Workflow confirmation gates (`templates/.claude/utils/workflows/engine.js:147`)

- Steps with `confirm: true` block execution until user approves
- Tests verify this behavior

### Supply chain hardening (template commands)

- `install-skill.md` requires commit-pinned GitHub URLs
- SHA-256 digest displayed and verified pre/post-install
- Artifact is downloaded once, reviewed, then copied (not re-fetched)
- Tests enforce no `raw.githubusercontent.com/.../main/` references

### Template settings (fail-closed)

- `templates/.claude/settings.json` ships with **no permissions or hooks** (verified by test)
- `settings.local.json` is a separate template with scoped permissions
- Hooks are disabled by default in all profiles

---

## 6. Auto-Fixes Applied

**None.** The codebase already passes all standard hygiene checks:

| Check | Status | Notes |
|---|---|---|
| `.gitignore` covers `.env` + secrets | PASS | Comprehensive entries for `.env`, `.env.local`, `.env.*.local` |
| No committed `.env` files | PASS | None found in tree or git history |
| No committed credentials | PASS | No API keys, tokens, or passwords found |
| Security headers middleware | N/A | CLI tool, no HTTP server |
| Session cookie hardening | N/A | No sessions |
| Dependency pinning | NOTE | Uses `^` (caret) ranges, standard for Node.js. `js-yaml ^4.1.1` is security-relevant but v4 safe-by-default. `npm audit` reports 0 vulnerabilities. |

---

## 7. Open Questions / Areas Needing Deeper Review

### HIGH PRIORITY

1. **Installed manifest has no validation** (`src/utils/manifest.js:49-55`)
   - `readInstalledManifest()` calls `JSON.parse()` with no size limit, no schema validation, and no error handling beyond what `JSON.parse()` provides
   - If a malicious `manifest.json` is placed in `.claude/`, it could cause DoS or unexpected behavior
   - Compare with `readManifest()` which has 10MB limit + schema validation

2. **Workflow variable substitution flows into `spawn('bash', ...)`** (`state-manager.js:83` -> `step-runner.js:74`)
   - When `allowShell` is true, `${{ expr }}` values are substituted into bash commands
   - If workflow inputs come from untrusted sources (e.g., CI environment), this is a command injection vector
   - The env scrubbing helps but the command string itself is the issue

3. **TOON binary is unsigned and unverified** (`skills/toon-formatter/bin/toon-darwin-arm64`)
   - 357KB Mach-O binary committed directly to git
   - No signature, no checksum file, no reproducible build verification
   - `SECURITY.md` acknowledges this as a known limitation (planned for v1.1)

4. **`settings.local.json` template ships with WebFetch permissions** (`templates/.claude/settings.local.json`)
   - Pre-authorizes `github.com`, `raw.githubusercontent.com`, `awesomeclaude.ai`, `api.github.com`
   - Users who install this template get these permissions without explicit review
   - While `.gitignore` covers the installed copy, the template itself is tracked in git

### MEDIUM PRIORITY

5. **`copyCommands()` does not validate command names** (`src/utils/copy.js:200-220`)
   - `commandName` is concatenated with `.md` extension and used as a file path
   - While command names come from hardcoded profiles, the programmatic API (`src/index.js`) exports this function
   - No `isValidSkillPath()` or equivalent applied to command names

6. **Hook scripts use unquoted `$FILE_PATH`** (`templates/.claude/hooks/auto-optimize.sh:32-39`)
   - `grep -q "^${FILE_PATH}$"` — if `FILE_PATH` contains regex metacharacters, this could match unintended lines
   - `echo "$FILE_PATH" >> "$SESSION_FILE"` — write to world-readable `/tmp/` with predictable names

7. **Workflow YAML parsing has no file size limit** (`templates/.claude/utils/workflows/parser.js:26`)
   - `yaml.load()` is called on arbitrary file content with no size check
   - A very large YAML file could cause memory exhaustion

8. **`docs-cache.json` has no size limit** (`src/utils/docs-cache.js:32`)
   - Reads from `~/.claude-starter/docs-cache.json` with no bounds checking
   - Repeated `recordDocsPulled()` calls could grow the file unboundedly

9. **`evaluateInContext()` property traversal** (`state-manager.js:216-243`)
   - `resolveValue()` splits on `.` and traverses object properties
   - While the context object is constructed internally, crafted workflow expressions could access prototype chain properties
   - No `hasOwnProperty` check on property access

### LOW PRIORITY

10. **SSRF blocklist is incomplete** (`src/utils/security.js:32-39`)
    - Blocks `localhost`, `127.0.0.1`, `192.168.x`, `10.x`, `172.16.x`, `.local`
    - Missing: `[::1]` (IPv6 loopback), `0x7f000001` (hex IP), `169.254.x` (link-local), `172.17-31.x` (full RFC 1918 range), DNS rebinding
    - Risk is mitigated because URLs come from the shipped manifest, not direct user input

11. **`parseInt(options.staleDays)` without radix** (`src/commands/docs.js:204`)
    - `parseInt(options.staleDays || "7", 10)` — actually does specify radix 10, so this is fine
    - But `options.staleDays` comes from CLI `--stale-days` which accepts any string

12. **Regex in `generate-manifest.js` processes untrusted markdown** (`scripts/generate-manifest.js:82-94`)
    - Extracts headings and frontmatter from `.md` files with regex
    - Only runs on template files (developer-controlled), not user input
    - Low risk but worth noting for supply chain context

13. **`/tmp/` files in hooks use predictable names** (`templates/.claude/hooks/auto-optimize.sh:32-33`)
    - `/tmp/claude-optimize-suggestions.txt` and `/tmp/claude-session-changes.txt`
    - Predictable paths could enable symlink-based attacks by other local users
    - Hooks are disabled by default

---

## 8. Threat Model Summary

### Attack surface category: LOCAL CLI TOOL

This is **not** a web server or networked service. The primary threat model is:

1. **Supply chain** — Malicious content in the npm package, templates, or the TOON binary
2. **Skill installation** — User installs a malicious skill from an untrusted GitHub repo
3. **Workflow execution** — A crafted workflow YAML achieves command injection when `--allow-shell` is enabled
4. **Path traversal** — Crafted skill paths or manifest entries escape the `.claude/` directory
5. **Local privilege escalation** — Predictable `/tmp/` files, symlink attacks, or binary execution

### Trust boundaries

```
[User CLI input] ---> [commander argument parsing] ---> [manifest lookup / validation] ---> [file copy / exec]
                                                                                               |
[Template files] ----> [shipped in npm package] ---> [copied to user project]                  |
                                                                                               |
[External: docpull] <---- [execFile with validated URL + path] <-------------------------------+
                                                                                               |
[External: TOON binary] <---- [symlinked from package] <--------------------------------------+
                                                                                               |
[Workflow YAML] ----> [js-yaml parse] ---> [variable substitution] ---> [spawn bash -c] <------+
```

---

*End of attack surface map. Next phase: vulnerability analysis.*
