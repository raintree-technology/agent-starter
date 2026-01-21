# Agent Skills

These skills are compatible with `npx skills add` and follow the [Agent Skills specification](https://agentskills.io).

## Available Skills

| Skill | Description | Category |
|-------|-------------|----------|
| **toon-formatter** | 30-60% token savings on structured data | Token Optimization |
| **aptos** | Aptos blockchain & Move language | Blockchain |
| **aptos/move-prover** | Formal verification for Move contracts | Blockchain |
| **aptos/shelby** | Decentralized blob storage on Aptos | Blockchain |
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

#### aptos/move-prover
Formal verification expert for Move smart contracts. Write specifications, invariants, preconditions, postconditions, and prove correctness mathematically.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/move-prover
```

**Triggers:** Move Prover, formal verification, spec, invariant, ensures, requires, aborts_if

#### aptos/shelby
Shelby Protocol decentralized blob storage on Aptos. Erasure coding (Clay Codes), TypeScript SDK, storage providers, and high-performance data storage for video streaming and AI training.

```bash
npx skills add raintree-technology/claude-starter --skill aptos/shelby
```

**Triggers:** Shelby, Shelby Protocol, decentralized storage, Aptos storage, blob storage, erasure coding

#### aptos/decibel
Decibel on-chain perpetual futures trading platform. REST APIs, WebSocket streams, TypeScript SDK, orderbook, TWAP orders, and position management.

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
│   ├── SKILL.md          # Main Aptos/Move skill
│   ├── move-prover/
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
| **aptos/move-prover** | Formal verification underserved |
| **aptos/shelby** | Novel decentralized storage protocol |
| **aptos/decibel** | On-chain trading platform |
| **helius** | Platform-specific Solana infrastructure |
| **plaid** | Comprehensive fintech banking API |
| **whop** | Digital product monetization platform |

## License

MIT
