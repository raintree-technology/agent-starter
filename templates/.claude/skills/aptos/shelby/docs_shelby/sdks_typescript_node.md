---
url: https://docs.shelby.xyz/sdks/typescript/node
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

Server-side specific functionality for Node.js environments

# Introduction

The Node.js version of the SDK is used to interact with the Shelby network from a Node.js environment. The SDK provides a high level interface for interacting with the different components of the Shelby network: the coordination layer, the RPC layer, and the storage layer.

## Installation

npm

pnpm

yarn

bun
    
    
    npm install @shelby-protocol/sdk @aptos-labs/ts-sdk

## Usage

Make sure you [aquired an API Key](/sdks/typescript/acquire-api-keys)

Access the Node.js version of the SDK by importing using the `@shelby-protocol/sdk/node` entry point.
    
    
    import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
    import { Network } from "@aptos-labs/ts-sdk";
    
    // Create client configuration
    const config = {
      network: Network.SHELBYNET,
      apiKey: "aptoslabs_***",
    };
    
    // Initialize the Shelby client
    const shelbyClient = new ShelbyNodeClient(config);

## Next Steps

### [SpecificationsReference documentation for the API and specifications](/sdks/typescript/node/specifications)### [Uploading a FileLearn how to upload a file to the Shelby network](/sdks/typescript/node/guides/uploading-file)

  


[SpecificationsCore types and functions shared between Node.js and browser environments](/sdks/typescript/core/specifications)[SpecificationsServer-side specific functionality for Node.js environments](/sdks/typescript/node/specifications)

### On this page

IntroductionInstallationUsageNext Steps