# Agent Skills

These skills are compatible with `npx skills add` and follow the [Agent Skills specification](https://agentskills.io).

## Available Skills

| Skill | Description | Category |
|-------|-------------|----------|
| **toon-formatter** | 30-60% token savings on structured data | Token Optimization |
| **aptos** | Aptos blockchain & Move language | Blockchain |
| **aptos/move-language** | Move programming fundamentals | Blockchain |
| **aptos/framework** | Aptos Framework (0x1) modules | Blockchain |
| **aptos/object-model** | Object Model for composable assets | Blockchain |
| **aptos/token-standards** | Coin, FA, Digital Asset standards | Blockchain |
| **aptos/move-testing** | Unit tests, integration tests, prover | Blockchain |
| **aptos/move-prover** | Formal verification for Move | Blockchain |
| **aptos/gas-optimization** | Gas & performance optimization | Blockchain |
| **aptos/dapp-integration** | Wallet & frontend integration | Blockchain |
| **aptos/shelby** | Decentralized blob storage | Blockchain |
| **aptos/decibel** | On-chain perpetual futures trading | Blockchain |
| **helius** | Solana RPC, DAS API, LaserStream | Blockchain |
| **plaid** | Banking API for fintech apps | Fintech |
| **whop** | Memberships, courses, digital products | Monetization |
| **code-quality/cleanup-unused** | Detect & delete dead code, unused exports/files/deps | Code Quality |
| **code-quality/cleanup-cycles** | Detect & break circular dependencies | Code Quality |
| **code-quality/cleanup-dedupe** | Find duplicate code, extract to shared utils | Code Quality |
| **code-quality/cleanup-types** | Consolidate duplicate type/interface definitions | Code Quality |
| **code-quality/cleanup-weak-types** | Replace `any`/`unknown`/`interface{}` with strong types | Code Quality |
| **code-quality/cleanup-defensive** | Remove pointless try/catch & error-hiding fallbacks | Code Quality |
| **code-quality/cleanup-legacy** | Remove deprecated code & dead fallback branches | Code Quality |
| **code-quality/cleanup-slop** | Strip AI slop, narration & restated-code comments | Code Quality |
| **code-quality/cleanup-all** | Orchestrator: run all 8 cleanup skills in sequence | Code Quality |

## Installation

```bash
# Install all skills
npx skills add raintree-technology/claude-starter

# Install specific skill
npx skills add raintree-technology/claude-starter --skill toon-formatter

# Install nested skill
npx skills add raintree-technology/claude-starter --skill aptos/shelby

# List available skills
npx skills add raintree-technology/claude-starter --list
```

## Skills by Category

### Token Optimization

#### toon-formatter
**TOON (Token-Oriented Object Notation)** reduces token consumption by 30-60% for tabular data like API responses, logs, and database results.

```bash
npx skills add raintree-technology/claude-starter --skill toon-formatter
```

**Triggers:** large JSON, data optimization, token reduction, arrays, tables, logs, TOON

---

### Blockchain - Aptos Ecosystem

#### aptos
Aptos blockchain and Move language expert. Covers Move programming (abilities, generics, resources), Aptos framework modules, smart contract development, token standards, and dApp integration.

```bash
npx skills add raintree-technology/claude-starter --skill aptos
```

**Triggers:** Aptos, Move language, Move smart contract, abilities, generics, resources, fungible asset

#### aptos/move-language
Move programming language fundamentals. Abilities (copy/drop/store/key), generics, phantom types, references, global storage operations, signer pattern, visibility modifiers.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/move-language
```

**Triggers:** move language, abilities, generics, phantom type, borrow_global, signer, acquires

#### aptos/framework
Aptos Framework (0x1) standard library modules. Account, coin, fungible_asset, object, timestamp, table, smart_table, event, randomness, aggregator, resource_account.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/framework
```

**Triggers:** aptos framework, 0x1::, table, smarttable, event, timestamp, randomness, aggregator

#### aptos/object-model
Aptos Object Model for composable, transferable assets. ObjectCore, Object<T>, ConstructorRef, ExtendRef, DeleteRef, TransferRef, ownership, named vs generated objects.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/object-model
```

**Triggers:** object model, objectcore, constructorref, extendref, transferref, soul-bound, composable

#### aptos/token-standards
Token standards including Coin, Fungible Asset, Digital Asset (NFT). Collections, metadata, minting, burning, royalties, Token V1 vs V2.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/token-standards
```

**Triggers:** token, nft, fungible asset, coin, digital asset, collection, mint, burn, royalty

#### aptos/move-testing
Testing Move smart contracts. Unit tests, integration tests, Move Prover, debugging, coverage, test attributes, CI/CD integration.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/move-testing
```

**Triggers:** move test, unit test, integration test, debug, coverage, expected_failure

#### aptos/move-prover
Formal verification for Move smart contracts. Specifications, invariants, preconditions, postconditions, aborts_if, schemas, quantifiers.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/move-prover
```

**Triggers:** Move Prover, formal verification, spec, invariant, ensures, requires, aborts_if

#### aptos/gas-optimization
Gas optimization and performance tuning. Storage costs, inline functions, aggregators, Table vs SmartTable, event optimization, struct packing, profiling.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/gas-optimization
```

**Triggers:** gas optimization, gas cost, performance, inline, aggregator, parallel execution

#### aptos/dapp-integration
Frontend integration with Aptos. Wallet connectivity (Petra, Martian, Pontem), wallet adapter, TypeScript SDK, transaction building, React/Next.js.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/dapp-integration
```

**Triggers:** wallet connect, petra, martian, typescript sdk, dapp, frontend integration

#### aptos/shelby
Shelby Protocol decentralized blob storage on Aptos. Erasure coding (Clay Codes), TypeScript SDK, storage providers, video streaming, AI training data.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/shelby
```

**Triggers:** Shelby, Shelby Protocol, decentralized storage, Aptos storage, blob storage, erasure coding

#### aptos/decibel
Decibel on-chain perpetual futures trading platform. REST APIs, WebSocket streams, TypeScript SDK, orderbook, TWAP orders, position management.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/decibel
```

**Triggers:** Decibel, perpetual futures, Aptos trading, perps, orderbook, TWAP, trading API

---

### Blockchain - Solana

#### helius
Helius Solana infrastructure including RPC, DAS API for NFTs, LaserStream real-time streaming, and ZK Compression.

```bash
npx skills add raintree-technology/claude-starter --skill helius
```

**Triggers:** Helius, Solana RPC, DAS API, NFT metadata, priority fees, LaserStream

---

### Fintech

#### plaid
Plaid banking API for financial data integration. Bank connections, transactions, ACH transfers, identity verification.

```bash
npx skills add raintree-technology/claude-starter --skill plaid
```

**Triggers:** Plaid, banking API, Plaid Link, bank connection, ACH, financial data

---

### Monetization

#### whop
Whop platform for digital products, memberships, courses, and community monetization. Checkout, webhooks, OAuth apps.

```bash
npx skills add raintree-technology/claude-starter --skill whop
```

**Triggers:** Whop, memberships, digital products, course platform, community monetization

---

### Code Quality

A bundle of 8 cleanup skills + 1 orchestrator. Each follows the same contract: **detect → critical assessment → auto-apply HIGH-confidence fixes → verify**. Skills write a markdown report to `.claude/cleanup-reports/` and only auto-apply changes that pass strict confidence rules. Verify step (typecheck + tests + lint) reverts on failure. Multi-language: TS/JS, Python, Go, Rust.

#### code-quality/cleanup-unused
Detect and delete unused code, exports, files, and dependencies. Runs `knip` (TS), `vulture` (Py), `staticcheck` (Go), `cargo-machete` (Rust). Auto-deletes only items with zero references and no dynamic-import risk.

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-unused
```

**Triggers:** unused code, dead code, knip, unused exports, unused dependencies, dead-code analysis

#### code-quality/cleanup-cycles
Detect and untangle circular import dependencies. Runs `madge`/`skott` (TS), `pycycle` (Py), or compiler-only checks (Go/Rust). Auto-extracts leaf-level cycles; reports core-module cycles for human review.

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-cycles
```

**Triggers:** circular imports, dependency cycles, madge, untangle modules

#### code-quality/cleanup-dedupe
Find duplicated code blocks via `jscpd` and extract to shared utils where it reduces complexity. Auto-extracts only token-identical blocks ≥30 LOC; smaller or divergent duplicates flagged for review.

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-dedupe
```

**Triggers:** deduplicate, DRY, copy-paste, jscpd, consolidate logic

#### code-quality/cleanup-types
Consolidate duplicate type/interface/dataclass/struct definitions into a shared module. Auto-consolidates structurally identical types with the same name; defers similar-but-divergent shapes.

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-types
```

**Triggers:** consolidate types, duplicate interfaces, shared types module

#### code-quality/cleanup-weak-types
Replace weak types (`any`, `unknown`, `interface{}`, untyped Python) with strong inferred types. Per-occurrence verification — each replacement is typechecked individually and reverted if it breaks.

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-weak-types
```

**Triggers:** any, unknown, weak types, strict typing, noImplicitAny, type safety

#### code-quality/cleanup-defensive
Remove pointless try/catch and defensive guards that hide errors. Preserves catches at true system boundaries (HTTP handlers, CLI entry, message consumers).

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-defensive
```

**Triggers:** try/catch, error hiding, defensive code, swallowed errors, useless catch

#### code-quality/cleanup-legacy
Find and remove deprecated/legacy code with zero callers, plus unreachable fallback branches (e.g., feature-flag defaults that have flipped, version checks for unsupported runtimes).

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-legacy
```

**Triggers:** deprecated code, legacy paths, dead branches, fallback removal, @deprecated

#### code-quality/cleanup-slop
Strip AI slop, narration comments (`// removed X`, `// updated to Y`), restated-code comments, stub markers, and AI platitudes. Preserves comments that explain WHY (workarounds, invariants, citations).

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-slop
```

**Triggers:** AI slop, useless comments, narration comments, comment cleanup

#### code-quality/cleanup-all
Orchestrator that runs the 8 cleanup skills in a deliberate order: unused → cycles → dedupe → types → weak-types → defensive → legacy → slop. Each step verifies before the next runs; halts on first failure with a consolidated report.

```bash
npx skills add raintree-technology/claude-starter --skill code-quality/cleanup-all
```

**Triggers:** clean up codebase, full code-quality pass, sweep the repo, run all cleanups

---

## Directory Structure

```
skills/
├── toon-formatter/
│   └── SKILL.md
├── aptos/
│   ├── SKILL.md              # Main Aptos/Move skill
│   ├── move-language/
│   │   └── SKILL.md
│   ├── framework/
│   │   └── SKILL.md
│   ├── object-model/
│   │   └── SKILL.md
│   ├── token-standards/
│   │   └── SKILL.md
│   ├── move-testing/
│   │   └── SKILL.md
│   ├── move-prover/
│   │   └── SKILL.md
│   ├── gas-optimization/
│   │   └── SKILL.md
│   ├── dapp-integration/
│   │   └── SKILL.md
│   ├── shelby/
│   │   └── SKILL.md
│   └── decibel/
│       └── SKILL.md
├── helius/
│   └── SKILL.md
├── plaid/
│   └── SKILL.md
├── whop/
│   └── SKILL.md
├── code-quality/
│   ├── cleanup-unused/SKILL.md
│   ├── cleanup-cycles/SKILL.md
│   ├── cleanup-dedupe/SKILL.md
│   ├── cleanup-types/SKILL.md
│   ├── cleanup-weak-types/SKILL.md
│   ├── cleanup-defensive/SKILL.md
│   ├── cleanup-legacy/SKILL.md
│   ├── cleanup-slop/SKILL.md
│   └── cleanup-all/SKILL.md
└── README.md
```

## Why These Skills?

| Skill | Gap Filled |
|-------|------------|
| **toon-formatter** | No token optimization tools exist |
| **aptos** | Comprehensive Move/Aptos expertise |
| **aptos/move-language** | Deep Move language fundamentals |
| **aptos/framework** | Standard library expertise |
| **aptos/object-model** | Composable asset patterns |
| **aptos/token-standards** | Token implementation guide |
| **aptos/move-testing** | Testing best practices |
| **aptos/move-prover** | Formal verification underserved |
| **aptos/gas-optimization** | Performance optimization |
| **aptos/dapp-integration** | Frontend integration patterns |
| **aptos/shelby** | Novel decentralized storage |
| **aptos/decibel** | On-chain trading platform |
| **helius** | Platform-specific Solana infrastructure |
| **plaid** | Comprehensive fintech banking API |
| **whop** | Digital product monetization platform |
| **code-quality/*** | Reusable code-quality cleanup pipeline applicable to any language/repo |

## License

MIT
