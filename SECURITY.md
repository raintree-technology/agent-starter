# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in claude-starter, please report it by emailing **security@raintree.ai** (or create a private security advisory on GitHub).

**Please do not open a public issue.**

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and provide a timeline for fixing the issue.

---

## Security Measures

This package implements multiple layers of security:

### 1. Command Injection Prevention
- ✅ Documentation pulling uses `execFile` with argument arrays
- ✅ The `docpull` executable is resolved once, checked with `--help`, then invoked by absolute path
- ✅ No shipped workflow engine executes arbitrary shell commands

### 2. Path Traversal Prevention
- ✅ All file paths validated before operations
- ✅ `isPathSafe()` checks ensure paths stay within expected directories
- ✅ Relative paths only (no absolute paths)
- ✅ No `..` directory traversal allowed
- ✅ Prefix-sibling paths are rejected with `path.relative()` containment checks

### 3. Prototype Pollution Protection
- ✅ The runtime does not recursively merge untrusted objects
- ✅ Settings merges copy known top-level keys instead of traversing arbitrary user-controlled paths

### 4. Regular Expression DoS (ReDoS) Prevention
- ✅ Length checks before regex validation
- ✅ Simple, non-backtracking regex patterns
- ✅ Maximum input lengths enforced

### 5. Symlink Attack Prevention
- ✅ Symlinks detected and rejected during copy operations
- ✅ `lstat()` used instead of `stat()` to detect links
- ✅ Required template files must be regular files

### 6. JSON Bomb DoS Prevention
- ✅ Docs cache is capped at 5MB and schema-validated before use
- ✅ Installed `skill.json` files are checked as regular files and schema-validated before docs operations

### 7. SSRF Prevention
- ✅ Documentation URLs must use HTTPS
- ✅ URL validation blocks credentials, localhost names, private suffixes, and IP literals
- ✅ Hostnames are resolved before `docpull`; private, loopback, link-local, multicast, and reserved DNS results are rejected
- ✅ Documentation sources come from installed skill metadata and should stay on reviewed domains

### 8. Least Privilege Defaults
- ✅ Shared template settings ship without wildcard tool permissions
- ✅ Executable hooks and elevated trust settings belong in `.claude/settings.local.json`

### 9. Supply Chain Hardening
- ✅ Skill installation guidance requires commit-pinned GitHub sources
- ✅ Skill installs review a single downloaded artifact and surface its SHA-256 digest before install
- ✅ Installed bytes are copied from the reviewed artifact instead of being re-fetched from a mutable branch
- ✅ GitHub Actions are pinned to full commit SHAs in CI
- ✅ CI runs gitleaks secret scanning and CodeQL on every PR and push to `main`
- ✅ Dependabot version updates are configured for npm (root + `site/`) and GitHub Actions in `.github/dependabot.yml`
- ℹ️ Repository-level controls (secret-scanning push protection, Dependabot security alerts, branch protection) are configured in GitHub repo settings, outside this source tree

### 10. Input Validation
- ✅ All user inputs sanitized
- ✅ Skill IDs, paths, URLs validated before use
- ✅ Log injection prevention (control character filtering)

---

## Known Limitations

### Not Yet Implemented (Roadmap)

1. **Checksum verification** - Downloaded docs are not verified with checksums
2. **Documentation content trust** - Pulled docs are fetched over HTTPS but their content is not semantically reviewed by the CLI
3. **External docpull trust** - Users must install `docpull` from a trusted source
4. **DNS-rebinding window** - The pre-flight DNS public-address check and `docpull`'s own connection resolve independently, so a rebinding attacker could still steer the actual fetch (low risk: `docpull` is trusted and URLs come from reviewed skill metadata)
5. **Rate limiting** - No limits on docpull frequency

### Out of Scope

- **Content validation** - We don't validate the actual content of pulled documentation
- **Network security** - SSL/TLS is handled by Node.js and `docpull`
- **User authentication** - This is a local tool, no auth required

---

## Dependency Security

We regularly audit dependencies:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

**Automated:** GitHub Dependabot alerts enabled

---

## Secure Usage Guidelines

### For Users

1. **Only install from npm:**
   ```bash
   npx create-claude-starter  # ✅ Safe
   ```

2. **Verify package integrity:**
   ```bash
   npm view create-claude-starter dist.integrity
   ```

3. **Don't run with elevated privileges:**
   ```bash
   sudo npx create-claude-starter  # ❌ Not needed
   ```

4. **Review installed skills before use:**
   ```bash
   find .claude/skills -maxdepth 3 -name skill.md -print
   ```

### For Contributors

1. **Never commit secrets** - Use `.gitignore`
2. **Validate all inputs** - Use security.js utilities
3. **Default to typed execution** - Use `execFile` or other typed actions by default
4. **Test security** - Run `npm test`
5. **Update dependencies** - Keep packages current

---

## Security Checklist (Pre-Release)

Before each release, verify:

- [ ] `npm audit` shows no vulnerabilities
- [ ] All dependencies up to date
- [ ] Security tests passing
- [ ] No hardcoded secrets or credentials
- [ ] All file operations use path validation
- [ ] Input validation on all user-provided data
- [ ] Error messages don't leak sensitive info
- [ ] CHANGELOG.md documents security fixes

---

## Security Testing

Run security tests:

```bash
# Unit tests (including security)
npm test

# Dependency audit
npm audit

# Static analysis
npm run lint
```

---

## Version History

### v3.0.0
- Depth-pack reframe; manifest system removed in favor of the `init`/`docs` CLI
- SSRF defense rebuilt: HTTPS-only parsing, IP-literal and private-suffix blocks, DNS public-address resolution check
- Atomic `--force` installs (staged replace with rollback) and batch preflight before any writes
- Docs cache hardened: 5 MB size cap, schema validation, `0700`/`0600` modes
- Symlink rejection across all copy paths
- CI with SHA-pinned actions: lint, tests, `npm`/`bun audit`, gitleaks, CodeQL

### v1.0.0
- Initial release with core security measures: command injection prevention, path traversal protection, ReDoS prevention, symlink mitigation, JSON-bomb limits

---

## Credits

Security audit and improvements by the Raintree team.

If you have security concerns or suggestions, please contact us at security@raintree.ai.
