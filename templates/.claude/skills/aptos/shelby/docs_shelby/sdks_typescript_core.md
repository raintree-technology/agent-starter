---
url: https://docs.shelby.xyz/sdks/typescript/core
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

The core package contains environment agnostic types and functions to interact with the Shelby network.

# Introduction

The core package contains environment agnostic types and functions that can be used to interact with the Shelby network. This shared package will typically contain the types and functions that are shared between the Node.js and browser environments.

## Installation

npm

pnpm

yarn

bun
    
    
    npm install @shelby-protocol/sdk @aptos-labs/ts-sdk

This package comes pre-packaged with the Node.js and browser packages. You can access it by using the `@shelby-protocol/sdk` entry point.

**Node.js Entry Point**
    
    
    import { ShelbyBlob } from '@shelby-protocol/sdk/node'

**Browser Entry Point**
    
    
    import { ShelbyBlob } from '@shelby-protocol/sdk/browser'

[Acquire API KeysAcquire API Keys for the Shelby RPC, Aptos Node API, and Aptos Indexer APIs](/sdks/typescript/acquire-api-keys)[SpecificationsCore types and functions shared between Node.js and browser environments](/sdks/typescript/core/specifications)

### On this page

IntroductionInstallation