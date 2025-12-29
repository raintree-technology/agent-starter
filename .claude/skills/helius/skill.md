---
name: helius
description: Helius Solana RPC and API expert. Use when user mentions Helius, Solana RPC, LaserStream, DAS API, Digital Asset Standard, Solana webhooks, Priority Fee API, Enhanced Transactions, ZK Compression, Solana infrastructure, getAsset, getTransactionsForAddress, or Solana NFT metadata.
allowed-tools: Read, Grep, Glob
model: sonnet
---

# Helius Skill

Helius is the leading Solana infrastructure provider, offering high-performance RPC nodes, real-time data streaming, and developer APIs for building on Solana.

## When to Use

- User asks about Solana RPC providers or infrastructure
- User needs help with NFT/token metadata (DAS API)
- User wants real-time blockchain data (LaserStream, WebSockets, webhooks)
- User is debugging transaction failures, rate limits, or RPC errors
- User asks about priority fees or transaction optimization on Solana
- User mentions ZK Compression or compressed NFTs
- User needs to query historical transactions on Solana

## Process

### 1. Identify the Use Case
Determine what the user needs:
- **RPC access**: Basic Solana queries, account data, transactions
- **Asset data**: NFT/token metadata via DAS API
- **Real-time streaming**: LaserStream, WebSockets, or webhooks
- **Transaction sending**: Helius Sender, priority fees

### 2. Recommend the Right Service
Match their needs to Helius services:
- Simple queries → Shared RPC
- NFT/token metadata → DAS API
- Real-time updates → LaserStream (low latency) or WebSockets
- Event notifications → Webhooks
- Fast trading → Helius Sender + priority fees

### 3. Provide Implementation
Give actionable code with:
- Correct RPC endpoint format
- Required parameters
- Error handling patterns
- Rate limit considerations

### 4. Verify Plan Compatibility
Check if their plan supports the feature:
- Free: Basic RPC only
- Developer: + LaserStream (Devnet)
- Business: + Enhanced WebSockets
- Professional: + LaserStream (Mainnet)

## Quick Start

1. Get an API key at https://dashboard.helius.dev
2. Use the RPC URL: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`
3. Make your first request:
```bash
curl https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY \
  -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["YOUR_WALLET"]}'
```

## Core Services

### RPC Infrastructure
- **Shared RPC Nodes**: High-performance Solana RPC with 99.99% uptime
- **Dedicated Nodes**: Custom infrastructure (contact sales for pricing)
- **Staked Connections**: Priority transaction sending through staked validators
- **ShredStream**: Direct connection to Solana leaders for ultra-low latency

### Real-Time Data Streaming

#### LaserStream gRPC
Ultra-low latency blockchain data streaming. Drop-in replacement for Yellowstone gRPC.
- Stream blocks, accounts, and transactions in real-time
- 9 global regions (FRA, AMS, TYO, SG, EWR, PITT, SLC, LAX, LON)
- Automatic reconnects and historical replay
- **Availability**: Devnet on Developer/Business plans; Devnet + Mainnet on Professional plans

#### Webhooks
Configure instant notifications for blockchain events:
- Account changes
- Transaction confirmations
- Program events
- NFT activity

#### Enhanced WebSockets
Real-time subscriptions for accounts, blocks, logs, programs, and votes.
- **Availability**: Business and Professional plans only

### Transaction Services

#### Helius Sender
Optimized transaction sending for traders:
- Sends to Helius and Jito in parallel
- 7 regional endpoints
- Minimum tip: 0.001 SOL

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

**DAS Rate Limits** (separate from RPC):
| Plan | DAS Rate Limit |
|------|----------------|
| Free | 2 req/s |
| Developer | 10 req/s |
| Business | 50 req/s |
| Professional | 100 req/s |

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

| Plan | Price | Credits | Rate Limit |
|------|-------|---------|------------|
| Free | $0/mo | 1M | 10 RPS |
| Developer | $49/mo | 10M | 50 RPS |
| Business | $499/mo | 100M | 200 RPS |
| Professional | $999/mo | 200M | 500 RPS |
| Enterprise | Custom | Custom | Custom |

### Data Add-ons (Professional+)
| Package | Price |
|---------|-------|
| 5TB | $500/mo |
| 25TB | $2,000/mo |
| 50TB | $3,500/mo |
| 100TB | $4,500/mo |

### Feature Availability by Plan
| Feature | Free | Developer | Business | Professional |
|---------|------|-----------|----------|--------------|
| Shared RPC | ✓ | ✓ | ✓ | ✓ |
| LaserStream (Devnet) | - | ✓ | ✓ | ✓ |
| LaserStream (Mainnet) | - | - | - | ✓ |
| Enhanced WebSockets | - | - | ✓ | ✓ |
| Priority Support | - | - | ✓ | ✓ |

## Common Pitfalls

- ❌ **Using wrong commitment level**: Defaults to `finalized` which is slow
  ✅ **Instead**: Use `confirmed` for faster responses when finality isn't critical

- ❌ **Not handling rate limits**: Hitting 429 errors and failing silently
  ✅ **Instead**: Check `X-RateLimit-Remaining` header, implement exponential backoff

- ❌ **Polling for real-time data**: Making repeated RPC calls for live updates
  ✅ **Instead**: Use WebSockets or LaserStream for streaming data

- ❌ **Ignoring DAS for NFT queries**: Using raw `getAccountInfo` for NFT metadata
  ✅ **Instead**: Use DAS API (`getAsset`, `getAssetsByOwner`) - it's faster and handles compressed NFTs

- ❌ **Sending transactions without simulation**: Wasting SOL on failed transactions
  ✅ **Instead**: Always call `simulateTransaction` first to catch errors

- ❌ **Hardcoding priority fees**: Using static fee values that become stale
  ✅ **Instead**: Use `getPriorityFeeEstimate` for dynamic fee calculation

## Troubleshooting

### Rate Limited (429 errors)
- Check `X-RateLimit-Remaining` header to monitor usage
- `X-RateLimit-Reset` shows when limits reset
- Consider upgrading plan or implementing request queuing

### Transaction Failures
- Use `simulateTransaction` before sending to catch errors
- Check priority fee is sufficient with `getPriorityFeeEstimate`
- Verify account has enough SOL for fees

### WebSocket Disconnections
- Implement automatic reconnection logic
- Use LaserStream for more reliable streaming (has built-in reconnects)

### Stale Data
- Use `commitment: "confirmed"` or `"finalized"` for consistency
- For real-time needs, use WebSockets or LaserStream instead of polling

## Error Handling

```javascript
try {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    // Wait and retry with exponential backoff
  }
  
  const data = await response.json();
  if (data.error) {
    // Handle RPC error
    console.error(`RPC Error ${data.error.code}: ${data.error.message}`);
  }
} catch (err) {
  // Handle network error
}
```

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

For offline access to 200+ Helius docs:

```bash
# Install docpull (requires Python 3.8+)
pip install pipx  # if you don't have pipx
pipx install docpull

# Pull Helius documentation
docpull https://www.helius.dev/docs -o .claude/skills/helius/docs
```

## Support

- Discord, Slack, Telegram support
- 10 min median response time
- 24/7 engineering assistance on paid plans
