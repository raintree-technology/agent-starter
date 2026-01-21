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

## License

MIT
