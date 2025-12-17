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
- ✅ Uses `execFile` (not `exec` or `spawn` with shell)
- ✅ Arguments passed as arrays, never concatenated strings
- ✅ No shell interpretation of user input

### 2. Path Traversal Prevention
- ✅ All file paths validated before operations
- ✅ `isPathSafe()` checks ensure paths stay within expected directories
- ✅ Relative paths only (no absolute paths)
- ✅ No `..` directory traversal allowed

### 3. Prototype Pollution Protection
- ✅ Deep merge functions block `__proto__`, `constructor`, `prototype`
- ✅ No dynamic property access from user input

### 4. Regular Expression DoS (ReDoS) Prevention
- ✅ Length checks before regex validation
- ✅ Simple, non-backtracking regex patterns
- ✅ Maximum input lengths enforced

### 5. Symlink Attack Prevention
- ✅ Symlinks detected and rejected during copy operations
- ✅ `lstat()` used instead of `stat()` to detect links
- ✅ Warning messages for skipped symlinks

### 6. JSON Bomb DoS Prevention
- ✅ File size limits (10MB for manifest.json)
- ✅ Array length limits (1000 skills max)
- ✅ Depth limits on nested objects

### 7. SSRF Prevention
- ✅ URL validation blocks localhost, private IPs, file:// protocol
- ✅ Only `http://` and `https://` allowed
- ✅ Domain whitelist for documentation sources

### 8. Input Validation
- ✅ All user inputs sanitized
- ✅ Skill IDs, paths, URLs validated before use
- ✅ Log injection prevention (control character filtering)

---

## Known Limitations

### Not Yet Implemented (Roadmap)

1. **Checksum verification** - Downloaded docs not yet verified with checksums (planned for v1.1)
2. **Binary signature verification** - TOON binaries not yet signed (planned for v1.1)
3. **Rate limiting** - No limits on docpull frequency (planned for v1.2)
4. **Transaction rollback** - Partial installs don't auto-rollback (planned for v1.2)

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

4. **Review skills before installation:**
   ```bash
   npx claude-starter list  # See what's available
   ```

### For Contributors

1. **Never commit secrets** - Use `.gitignore`
2. **Validate all inputs** - Use security.js utilities
3. **Use `execFile`** - Never use `exec` or `spawn` with shell
4. **Test security** - Run `npm run test:security`
5. **Update dependencies** - Keep packages current

---

## Security Checklist (Pre-Release)

Before each release, verify:

- [ ] `npm audit` shows no vulnerabilities
- [ ] All dependencies up to date
- [ ] Security tests passing
- [ ] No hardcoded secrets or credentials
- [ ] All file operations use path validation
- [ ] All external commands use `execFile` with arg arrays
- [ ] Input validation on all user-provided data
- [ ] Error messages don't leak sensitive info
- [ ] CHANGELOG.md documents security fixes

---

## Security Testing

Run security tests:

```bash
# Unit tests (including security)
npm test

# Specific security tests
npm run test:security

# Dependency audit
npm audit

# Static analysis
npm run lint
```

---

## Version History

### v1.0.0 (2025-01-15)
- Initial release with core security measures
- Command injection prevention
- Path traversal protection
- Prototype pollution fixes
- ReDoS prevention
- Symlink attack mitigation
- JSON bomb limits

---

## Credits

Security audit and improvements by the Raintree team.

If you have security concerns or suggestions, please contact us at security@raintree.ai.
