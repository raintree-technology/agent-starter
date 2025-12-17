---
url: https://docs.shelby.xyz/sdks/typescript/acquire-api-keys
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

# Acquire API Keys

Acquire API Keys for the Shelby RPC, Aptos Node API, and Aptos Indexer APIs

# API Keys

API keys authenticate your app and manage rate limits when using Shelby services. Without one, your client runs in "anonymous" mode with much lower limits, which can affect performance.

## Overview

API keys provide several important benefits:

  * **Authentication** : Securely identify your application to Shelby services.
  * **Rate Limiting** : Access higher request limits for better application performance.
  * **Usage Tracking** : Monitor your API consumption and optimize usage patterns.
  * **Service Access** : Enable access to premium features and enhanced service tiers.



## Acquiring API Keys

To obtain your API keys, you'll need to create an API resource through the Geomi platform:

### Step-by-Step Guide

### Navigate to Geomi

Visit [geomi.dev](https://geomi.dev) in your web browser.

### Account Setup

Log in to your existing account or create a new account if you haven't already.

### Create API Resource

On the overview page, click the "API Resource" card to begin creating a new resource.

### Configure Resource

Complete the configuration form with the following settings:

  * **Network** : Select `Shelbynet` from the available network options.
  * **Resource Name** : Provide a descriptive name for your API resource.
  * **Usage Description** : Briefly describe your intended use case.



### Generate Keys

Once submitted, your API keys will be generated and displayed.

**Note** : By default the site generates a key for use in a private server context. If you intend to use the key in a frontend context, create a client key.

Learn more about API keys at the Geomi [API keys](https://geomi.dev/docs/api-keys) and [billing](https://geomi.dev/docs/admin/billing) pages.

## Implementing API Keys

### Basic Configuration

Integrate your API key into the Shelby client configuration as shown below:
    
    
    import { Network } from "@aptos-labs/ts-sdk";
    import { ShelbyNodeClient } from "@shelby/sdk";
    
    const client = new ShelbyNodeClient({
      network: Network.SHELBYNET,
      apiKey: "aptoslabs_***", // Replace with your actual API key
    });

Or into an Aptos client:
    
    
    import { Network, AptosConfig, Aptos } from "@aptos-labs/ts-sdk";
    
    const aptosConfig = new AptosConfig({
     network: Network.SHELBYNET,
     clientConfig : {
      API_KEY: "aptoslabs_***", // Replace with your actual API key
     }
    })
    const aptosClient = new Aptos(aptosConfig)

[Acquire shelbyUSD and APT TokensFund your account by acquiring shelbyUSD and APT Tokens](/sdks/typescript/fund-your-account)[OverviewThe core package contains environment agnostic types and functions to interact with the Shelby network.](/sdks/typescript/core)

### On this page

API KeysOverviewAcquiring API KeysStep-by-Step GuideNavigate to GeomiAccount SetupCreate API ResourceConfigure ResourceGenerate KeysImplementing API KeysBasic Configuration