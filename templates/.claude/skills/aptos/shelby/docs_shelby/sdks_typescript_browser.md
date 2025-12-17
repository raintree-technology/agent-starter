---
url: https://docs.shelby.xyz/sdks/typescript/browser
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

# Overview

Client-side specific functionality for browser environments

# Browser API

Client-side functionality optimized for browser environments with Web APIs.

## Browser Implementation

The browser package provides the same core functionality as the Node.js client but optimized for browser environments. It uses the same `ShelbyClient` base class with browser-compatible implementations.
    
    
    import { ShelbyClient } from "@shelby-protocol/sdk/browser";

## Usage
    
    
    import { ShelbyClient } from '@shelby-protocol/sdk/browser'
    import { Network } from '@aptos-labs/ts-sdk'
    
    // Create client configuration
    const config = {
      network: Network.SHELBYNET
      apiKey: process.env.SHELBY_API_KEY,
    }
    
    // Initialize the Shelby client
    const shelbyClient = new ShelbyClient(config)

[Manually Uploading a FileLearn how to manually upload a file to the Shelby network from a Node.js environment](/sdks/typescript/node/guides/manually-uploading-file)[Uploading a FileLearn how to upload a file to the Shelby network from a Browser environment](/sdks/typescript/browser/guides/upload)

### On this page

Browser APIBrowser ImplementationUsage