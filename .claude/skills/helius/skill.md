# Helius Skill

Helius is the leading Solana infrastructure provider, offering high-performance RPC nodes, real-time data streaming, and developer APIs for building on Solana.

## Trigger Keywords

- Helius
- Solana RPC
- LaserStream
- DAS API
- Digital Asset Standard
- Solana webhooks
- Priority Fee API
- Enhanced Transactions
- ZK Compression
- Solana infrastructure
- getAsset
- getTransactionsForAddress

## Core Services

### RPC Infrastructure
- **Shared RPC Nodes**: High-performance Solana RPC with 99.99% uptime
- **Dedicated Nodes**: Custom infrastructure starting at $2,900/month
- **Staked Connections**: Priority transaction sending through staked validators
- **ShredStream**: Direct connection to Solana leaders for ultra-low latency

### Real-Time Data Streaming

#### LaserStream gRPC
Ultra-low latency blockchain data streaming. Drop-in replacement for Yellowstone gRPC.
- Stream blocks, accounts, and transactions in real-time
- 9 global regions (FRA, AMS, TYO, SG, EWR, PITT, SLC, LAX, LON)
- Automatic reconnects and historical replay
- Available on Professional plans ($999/month)

#### Webhooks
Configure instant notifications for blockchain events:
- Account changes
- Transaction confirmations
- Program events
- NFT activity

#### Enhanced WebSockets
Real-time subscriptions for accounts, blocks, logs, programs, and votes.

### Transaction Services

#### Helius Sender
Optimized transaction sending for traders:
- Sends to Helius and Jito in parallel
- 7 regional endpoints
- Minimum tip: 0.0002 SOL

#### Priority Fee API
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getPriorityFeeEstimate",
  "params": [{"accountKeys": ["..."]}]
}
```

## API Reference

### Digital Asset Standard (DAS)
Standardized API for tokens and NFTs. Handles both regular and compressed NFTs.

**Key Methods:**
- `getAsset` - Get metadata for a single asset
- `getAssetBatch` - Batch asset retrieval
- `getAssetsByOwner` - Get all assets owned by an address
- `getAssetsByCreator` - Get assets by creator
- `getAssetsByAuthority` - Get assets by authority
- `getAssetsByGroup` - Get assets in a collection

### Enhanced Transactions API
Pre-parsed transaction data in human-readable format.

**Methods:**
- `getTransactions` - Get parsed transaction data
- `getTransactionsForAddress` - Historical transactions with filtering

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTransactionsForAddress",
  "params": [
    "WALLET_ADDRESS",
    {
      "transactionDetails": "full",
      "sortOrder": "asc",
      "limit": 10
    }
  ]
}
```

### ZK Compression
Reduce on-chain storage costs by up to 98%.

**Methods:**
- `getCompressedAccount`
- `getCompressedAccountProof`
- `getCompressedTokenBalancesByOwner`

### Standard Solana RPC Methods
Full support for all Solana RPC HTTP and WebSocket methods:
- Account queries (`getAccountInfo`, `getBalance`, `getMultipleAccounts`)
- Block operations (`getBlock`, `getBlockHeight`, `getBlocks`)
- Transaction methods (`getTransaction`, `sendTransaction`, `simulateTransaction`)
- Token operations (`getTokenAccountBalance`, `getTokenSupply`)

## Authentication

All API requests require an API key. Get one at https://dashboard.helius.dev

**RPC URL Format:**
```
https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

## Pricing Tiers

| Plan | Price | Credits | Rate Limit | sendTransaction |
|------|-------|---------|------------|-----------------|
| Free | $0/mo | 1M | 10 RPS | 1/sec |
| Developer | $49/mo | 10M | 50 RPS | 5/sec |
| Business | $499/mo | 100M | 200 RPS | 50/sec |
| Professional | $999/mo | 200M | 500 RPS | 100/sec |
| Enterprise | Custom | Custom | Custom | Custom |

## Use Cases

- **Trading & MEV**: LaserStream + Sender for low-latency execution
- **Wallets**: Real-time balance updates, transaction history
- **DeFi**: Priority fees, transaction optimization
- **NFT Platforms**: DAS API for metadata, compressed NFTs
- **Analytics**: Historical data, indexing with getTransactionsForAddress
- **Fintech**: Reliable RPC, compliance-ready infrastructure

## SDKs & Tools

- **JavaScript SDK**: High-performance LaserStream client (up to 1.3GB/s)
- **Helius AirShip**: Compression management tool
- **ORB Explorer**: Block explorer

## Documentation

Full documentation: https://www.helius.dev/docs

### Pull Local Docs (Optional)

For offline access to 200+ Helius docs, install docpull and run:

```bash
# Install docpull
pipx install docpull

# Pull Helius documentation
docpull https://www.helius.dev/docs -o .claude/skills/helius/docs
```

This pulls the full documentation locally for faster context loading.

## Support

- Discord, Slack, Telegram support
- 10 min median response time
- 24/7 engineering assistance on paid plans
