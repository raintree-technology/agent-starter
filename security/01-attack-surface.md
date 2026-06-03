# Attack Surface Map: claude-starter

**Audit date:** 2026-05-23  
**Scope:** npm CLI package, copied `.claude/` templates, benchmark scripts, and the bundled Next.js marketing site.

## Stack Summary

| Component | Technology | Notes |
|---|---|---|
| CLI runtime | Node.js ES modules | `bin/cli.js`, `src/commands/*`, `src/utils/*` |
| Package manager | npm | `package-lock.json` present and dependency ranges pinned in `package.json` |
| CLI framework | `commander` | Explicit `init` subcommand is also the default command |
| Prompting | `inquirer` | Used only when `--yes`, `--profile`, and `--skills` are absent |
| File operations | `fs-extra` + Node `fs` | Template copy, staged replacement, docs cache writes |
| External tool | `docpull` | Invoked with validated HTTPS docs URL, DNS public-address check, timeout, bounded output, and retries |
| TOON utilities | Node wrapper | `.claude/utils/toon/cli.mjs` delegates to pinned npm packages instead of a committed native binary |
| Site | Next.js App Router | `site/proxy.ts` sets nonce-based CSP and security headers |

## CLI Commands

| Command | Handler | Inputs | Security boundary |
|---|---|---|---|
| `claude-starter [dir]` | `src/commands/init.js` | target dir, profile, skill CSV, `--force`, `--yes`, `--no-toon` | Copies package templates into a local project |
| `claude-starter init [dir]` | `src/commands/init.js` | same as default command | Same as default command; covered by regression test |
| `claude-starter docs <action> [skill]` | `src/commands/docs.js` | action, optional skill id, `--stale-days` | Executes `docpull` against installed skill metadata |

## Trust Boundaries

| Boundary | Risk | Current defense |
|---|---|---|
| User-provided target directory | Path traversal, destructive overwrite | Uses `resolve`; `--force` replacement is staged and restores the previous directory on failure |
| Requested skill/profile | Wrong destination tree, partial writes | Skill paths normalize once; requested batch is preflighted before writes |
| Template files | Symlink copy attack, local trust settings leakage | `lstat` rejects symlinks; `settings.local.json.example` is not auto-copied |
| Installed `skill.json` docs metadata | SSRF through docs URL or output path | HTTPS-only URL parser, no credentials, no IP literals, blocked local suffixes, DNS public-address check, `.claude` output containment |
| `docpull` process | Hanging process, unbounded output, transient network failure | Fixed timeout, fixed max buffer, retry with backoff, explicit nonzero exit on missing tool |
| Docs cache in user home | JSON bomb, malformed cache, broad permissions | Size limit, schema validation, `0700` directory mode, `0600` file mode |
| Next.js site | CSP bypass, fake production stats | Nonce-based CSP in `proxy.ts`; GitHub stats use timeout/retry/schema validation and render unavailable state instead of mock counts |

## Fixed Findings

| Finding | Root cause | Fix | Regression prevention |
|---|---|---|---|
| Selective profile installs copied `skills/<id>` under `.claude/skills/skills/<id>` or failed | Skill IDs were converted to paths with an extra `skills/` prefix | `skillIdToPath()` now returns the skill id; `normalizeSkillPath()` preserves compatibility with legacy `skills/<id>` input | `test/install-regression.test.js` verifies profile, legacy, and invalid skill paths |
| `claude-starter init ...` prompted in non-interactive shells | Default positional command swallowed the explicit `init` subcommand | `init` is registered as Commander’s default command instead of a separate root positional action | CLI regression test executes `node bin/cli.js init ... --yes --profile minimal` |
| Partial install could succeed after validation/copy failures | Copy routines validated and wrote one item at a time | Skill and command batches preflight before writes; full `--force` installs stage then replace atomically | Install regression tests assert invalid batches leave no partial skill output |
| Docs URL validation was blocklist-based | Direct host checks missed DNS rebinding and IP-literal variants | HTTPS-only parser, blocked local suffixes, no IP literals, DNS resolution check rejecting non-public addresses | Security tests cover private DNS results, IP literals, IPv6, credentials, and non-HTTPS |
| `docpull` failures could hang or retry poorly | External process execution had timeout but no retry and weak executable discovery | Fixed executable lookup, timeout, max buffer, retry backoff, explicit failure handling | CI runs root tests and production dependency audit |
| TOON setup expected a removed native binary | Platform utility still symlinked old binary paths | Setup now verifies `.claude/utils/toon/cli.mjs`; selective installs copy the wrapper | Install test verifies wrapper copy and setup result |
| Site CSP allowed inline scripts in production | Static header in `next.config.ts` allowed inline scripts without a nonce | `site/proxy.ts` generates per-request nonce CSP and page uses dynamic rendering | Build plus running-server CSP check verifies no inline/eval allowances and matching nonces |
| GitHub stats showed fake fallback counts | Network failure fell through to hardcoded mock values | External fetch has timeout, retry, schema validation, and unavailable rendering | Site lint/typecheck/build and server HTML check verify page renders without mock fallback |
| Template hooks had stale or unsafe examples | Hardcoded local paths, stale hook reference, broad local permissions | Removed hardcoded path, removed missing hook reference, emptied local permission allowlist, tightened backup retention | Template scan covers hardcoded path and stale hook markers |
| Skill examples logged financial/identity data | Documentation snippets used `console.log` for ACH, identity, balances, webhooks, and payment details | Replaced with storage, state update, event recording, or redacted projection examples | Repository scan verifies no `console.log` remains in copied skill templates |

## Verification Commands

Run these before release:

```bash
npm run lint
npm test
npm audit --audit-level=moderate
cd site && bun run lint && bun run typecheck && bun run build && bun audit
```

The GitHub Actions workflow at `.github/workflows/ci.yml` runs the same blocking checks for the package and site jobs with SHA-pinned actions.

## Residual Risks

| Risk | Why it remains | Mitigating factors |
|---|---|---|
| DNS rebinding on docs pull | `assertPublicHttpsUrl` resolves and validates the hostname, but `docpull` re-resolves and connects independently — the validated address is not pinned to the actual fetch | `docpull` is a user-installed trusted tool and docs URLs come from reviewed skill metadata, not arbitrary input |
| docpull supply chain | The CLI shells out to whatever `docpull` is first on `PATH` | Executable is resolved once by absolute path and probed with `--help`; users are directed to install from a trusted source |
| Pulled documentation content | Fetched docs are not checksum-verified or semantically reviewed | HTTPS transport, public-address-only resolution, bounded output, and timeouts limit exposure |
