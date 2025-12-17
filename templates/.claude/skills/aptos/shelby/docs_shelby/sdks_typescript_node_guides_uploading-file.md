---
url: https://docs.shelby.xyz/sdks/typescript/node/guides/uploading-file
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

[Uploading a File](/sdks/typescript/node/guides/uploading-file)[Manually Uploading a File](/sdks/typescript/node/guides/manually-uploading-file)

Browser

[Overview](/sdks/typescript/browser)

Guides

Media Player

[](https://github.com/shelby)

TypeScript SDKGuides

# Uploading a File

Learn how to upload a file to the Shelby network from a Node.js environment

# Overview

In this guide, we will walk you through the process of obtaining ShelbyUSD tokens and uploading a file to the Shelby network.

This guide assumes you already have a Node.js environment setup and will be using the Shelbynet network.

## Getting Started

### Installation

To get started, you will need to install the following dependencies in your Node.js environment.

npm

pnpm

yarn

bun
    
    
    npm install @shelby-protocol/sdk @aptos-labs/ts-sdk fs-extra glob node-fetch yaml

### Setting up an account

Use the `@aptos-labs/ts-sdk` package to generate a new or existing account

uploadScript.ts
    
    
    import { Account, Ed25519Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
    
    // Generate a new Ed25519 Account
    const account = Account.generate();
    
    // Use an existing Ed25519 Account private key
    const account = new Ed25519Account({
      privateKey: new Ed25519PrivateKey("ed25519-priv-..."),
    });

### Acquire an API Key

To avoid getting rate limited when making calls to the Shelby network, make sure you [acquired an API Key](/sdks/typescript/acquire-api-keys)

### Funding your account

To upload a file, you will need to have an account with two assets:

  * **APT tokens** : Used to pay for gas fees when sending transactions
  * **ShelbyUSD tokens** : Used to pay for the upload the file to the Shelby network



To fund your account with APT tokens, you can use the `fundAccount()` function the Aptos SDK provides.
    
    
    import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
    
    const aptosClient = new Aptos(
      new AptosConfig({
        network: Network.SHELBYNET,
        clientConfig: {
          API_KEY: "aptoslabs_***",
        },
      })
    );
    
    await aptosClient.fundAccount({
      accountAddress: account.accountAddress,
      amount: 100000000,
    });

To fund your account with ShelbyUSD tokens, you can provide your account address to the **Shelby Faucet** found below.

### Faucet

### Setting up Shelby client

Now that you have set up an account with funds, you can start setting up your shelby client to interact with the Shelby network.

uploadScript.ts
    
    
    import { Network } from "@aptos-labs/ts-sdk";
    import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
    
    const shelbyClient = new ShelbyNodeClient({
      network: Network.SHELBYNET,
      apiKey: "aptoslabs_***",
    });

### Uploading a file

Lastly, to upload a file you can use the `upload` function from the `ShelbyNodeClient` class to upload a file to the Shelby network.

uploadScript.ts
    
    
    import fs from "fs/promises";
    
    // 1. Get the file data
    const blobData = await fs.readFile("file.txt");
    
    // 2. Upload the file
    await shelbyClient.upload({
      account,
      blobData,
      blobName: "path/to/file.txt",
      expirationMicros: (1000 * 60 * 60 * 24 * 30 + Date.now()) * 1000, // 30 days
    });

### Retrieving a file (Optional)

To retrieve a file, you can use the `getBlob` function of the `ShelbyRPCClient` class to retrieve a file from the Shelby network.

getBlobScript.ts
    
    
    import { ShelbyBlob } from "@shelby-protocol/sdk/node";
    import fs from "fs";
    
    // 1. Get the file
    const blob: ShelbyBlob = await shelbyClient.download({
      account: account.accountAddress,
      blobName: "path/to/file.txt",
    });
    
    // 2. Save the file
    blob.stream.pipe(fs.createWriteStream("file.txt"));

Alternatively, you can directly download the file using a `GET` request to the Shelby RPC endpoint.
    
    
    curl -X GET "https://api.shelbynet.shelby.xyz/shelby/v1/blobs/{account_address}/{blob_name}" > file.txt

The API documentation is still under development and will be provided at a later date.

**Basic Example**

Blob Name| Account Address  
---|---  
`file.txt`| `0x1234567890123456789012345678901234567890`  
      
    
    curl -X GET "https://api.shelbynet.shelby.xyz/shelby/v1/blobs/0x1234567890123456789012345678901234567890/file.txt" > file.txt

**Relative Paths Example**

Blob Name| Account Address  
---|---  
`path/to/file.txt`| `0x1234567890123456789012345678901234567890`  
      
    
    curl -X GET "https://api.shelbynet.shelby.xyz/shelby/v1/blobs/0x1234567890123456789012345678901234567890/path/to/file.txt" > file.txt

## Conclusion

And that is it! You have now uploaded a file to the Shelby network. For more information about the SDK, feel free to refer to the [Specifications](/sdks/typescript/node/specifications) page.

### [SpecificationsReference documentation for the API and specifications](/sdks/typescript/node/specifications)

[SpecificationsServer-side specific functionality for Node.js environments](/sdks/typescript/node/specifications)[Manually Uploading a FileLearn how to manually upload a file to the Shelby network from a Node.js environment](/sdks/typescript/node/guides/manually-uploading-file)

### On this page

OverviewGetting StartedInstallationSetting up an accountAcquire an API KeyFunding your accountSetting up Shelby clientUploading a fileRetrieving a file (Optional)Conclusion