---
url: https://docs.shelby.xyz/sdks/typescript
fetched: 2025-11-16
---

[](/)

Search

`⌘``K`

SDKs

Comprehensive libraries

TypeScript SDK

[Getting Started](/sdks/typescript)[Acquire shelbyUSD and APT Tokens](/sdks/typescript/fund-your-account)[Acquire API Keys](/sdks/typescript/acquire-api-keys)

Core

[Overview](/sdks/typescript/core)[Specifications](/sdks/typescript/core/specifications)

Node.js

[Overview](/sdks/typescript/node)[Specifications](/sdks/typescript/node/specifications)

Guides

Browser

[Overview](/sdks/typescript/browser)

Guides

Media Player

[](https://github.com/shelby)

TypeScript SDK

# Getting Started

Getting Started with the TypeScript SDK reference for Shelby Protocol

# TypeScript SDK

The Shelby Protocol TypeScript SDK provides both Node.js and browser support for interacting with the Shelby Protocol. This comprehensive reference covers all available types, functions, and classes.

## Installation

npm

pnpm

yarn

bun
    
    
    npm install @shelby-protocol/sdk @aptos-labs/ts-sdk

## Quick Start

### Node.js Environment
    
    
    import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
    import { Network } from "@aptos-labs/ts-sdk";
    
    // Create client configuration
    const config = {
      network: Network.SHELBYNET,
      apiKey: "aptoslabs_***",
    };
    
    // Initialize the Shelby client
    const shelbyClient = new ShelbyNodeClient(config);

Explore the complete [Node.js client](/sdks/typescript/node) usage

### Browser Environment
    
    
    import { ShelbyClient } from '@shelby-protocol/sdk/browser'
    import { Network } from '@aptos-labs/ts-sdk'
    
    // Create client configuration
    const config = {
      network: Network.SHELBYNET
      apiKey: "aptoslabs_***",
    }
    
    // Initialize the Shelby client
    const shelbyClient = new ShelbyClient(config)

Explore the complete [Browser client](/sdks/typescript/browser) usage

## Examples

Explore all of the Shelby examples provided in the examples repo, which demonstrate how to build on Shelby

  * [Shelby Examples](https://github.com/shelby/examples/tree/main/apps)



## API Reference

Explore the complete TypeScript API documentation:

  * [Core Types & Functions](/sdks/typescript/core) \- Shared functionality for both environments



[Acquire shelbyUSD and APT TokensFund your account by acquiring shelbyUSD and APT Tokens](/sdks/typescript/fund-your-account)

### On this page

TypeScript SDKInstallationQuick StartNode.js EnvironmentBrowser EnvironmentExamplesAPI Reference