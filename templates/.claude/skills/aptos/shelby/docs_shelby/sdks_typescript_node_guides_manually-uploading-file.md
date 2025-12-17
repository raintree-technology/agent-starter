---
url: https://docs.shelby.xyz/sdks/typescript/node/guides/manually-uploading-file
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

# Manually Uploading a File

Learn how to manually upload a file to the Shelby network from a Node.js environment

# Overview

In this guide, we will walk you through the process of manually uploading a file to the Shelby network from a Node.js environment. As opposed to the [Uploading a File](/sdks/typescript/node/guides/uploading-file) guide, this guide will go through the end-to-end process of generating commitments, writing them to the coordination layer, and then confirming them through the RPC layer.

This guide assumes you already have a Node.js environment setup and will be using the Shelbynet network.

## Getting Started

### Installation and Setup

This guide assumes you already have a basic understanding of the [Uploading a File](/sdks/typescript/node/guides/uploading-file) guide. If you do not, please refer to that guide first before proceeding.

### Generating Commitments

The first step before uploading a file is to generate the commitments for the file. This can be done by using the `generateCommitments` function from the SDK.

The SDK now supports automatic provider management. If you're using a single client, you don't need to create a provider manually. For advanced use cases where you need to share a provider across multiple clients, see the example below.

uploadScript.ts
    
    
    import { Ed25519Account, Ed25519PrivateKey, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
    import { ShelbyNodeClient, ClayErasureCodingProvider, generateCommitments } from "@shelby-protocol/sdk/node";
    import fs from "fs/promises";
    
    // 1. Setup your signer
    const signer = new Ed25519Account({
      privateKey: new Ed25519PrivateKey("ed25519-priv-<value_of_private_key_from_config.yaml>"),
    });
    
    // 2. Setup your client (provider will be created automatically)
    const aptosClient = new Aptos(new AptosConfig({ network: Network.SHELBYNET }));
    const shelbyClient = new ShelbyNodeClient({
      network: Network.SHELBYNET,
    });
    
    // 3. Generate the commitments
    const blobData = await fs.readFile("file.txt");
    // Option A: Create provider explicitly (for direct use with generateCommitments)
    const provider = await ClayErasureCodingProvider.create();
    const blobCommitments = await generateCommitments(provider, blobData);
    
    // Option B: Pass provider to client (for sharing across multiple clients)
    // const provider = await ClayErasureCodingProvider.create();
    // const shelbyClient = new ShelbyNodeClient(config, provider);

### Writing Commitments to the Coordination Layer

The next step is to write the commitments to the coordination layer. This can be done by using the `registerBlob` function on the `ShelbyBlobClient` class (accessible via `client.coordination`).

uploadScript.ts
    
    
    import { Ed25519Account, Ed25519PrivateKey, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
    import { ShelbyNodeClient, ClayErasureCodingProvider, generateCommitments } from "@shelby-protocol/sdk/node";
    import fs from "fs/promises";
    
    // 1. Setup your signer
    const signer = new Ed25519Account({
      privateKey: new Ed25519PrivateKey("ed25519-priv-<value_of_private_key_from_config.yaml>"),
    });
    
    // 2. Setup your client
    const aptosClient = new Aptos(new AptosConfig({ network: Network.SHELBYNET }));
    const shelbyClient = new ShelbyNodeClient({
      network: Network.SHELBYNET,
    });
    
    // 3. Generate the commitments
    const blobData = await fs.readFile("file.txt");
    // Create provider explicitly for use with generateCommitments
    const provider = await ClayErasureCodingProvider.create();
    const blobCommitments = await generateCommitments(provider, blobData);
    
    // 4. Write the commitments to the coordination layer
    const { transaction: pendingWriteBlobCommitmentsTransaction } =
      await shelbyClient.coordination.registerBlob({
        account: signer,
        blobName: "path/to/file.txt",
        blobMerkleRoot: blobCommitments.blob_merkle_root,
        size: blobData.length,
        expirationMicros: (1000 * 60 * 60 * 24 * 30 + Date.now()) * 1000, // 30 days
      });
    
    await aptosClient.waitForTransaction({
      transactionHash: pendingWriteBlobCommitmentsTransaction.hash,
    });

### Confirming Commitments through the RPC Layer

Once the commitments have been written to the coordination layer, we can now confirm them through the RPC layer. This can be done by using the `putBlob` function on the `ShelbyRPCClient` class.

uploadScript.ts
    
    
    import { Ed25519Account, Ed25519PrivateKey, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
    import { ShelbyNodeClient, ClayErasureCodingProvider, generateCommitments } from "@shelby-protocol/sdk/node";
    import fs from "fs/promises";
    
    // 1. Setup your signer
    const signer = new Ed25519Account({
      privateKey: new Ed25519PrivateKey("ed25519-priv-<value_of_private_key_from_config.yaml>"),
    });
    
    // 2. Setup your client
    const aptosClient = new Aptos(new AptosConfig({ network: Network.SHELBYNET }));
    const shelbyClient = new ShelbyNodeClient({
      network: Network.SHELBYNET,
    });
    
    // 3. Generate the commitments
    const blobData = await fs.readFile("file.txt");
    // Create provider explicitly for use with generateCommitments
    const provider = await ClayErasureCodingProvider.create();
    const blobCommitments = await generateCommitments(provider, blobData);
    
    // 4. Write the commitments to the coordination layer
    const { transaction: pendingWriteBlobCommitmentsTransaction } =
      await shelbyClient.coordination.registerBlob({
        account: signer,
        blobName: "path/to/file.txt",
        blobMerkleRoot: blobCommitments.blob_merkle_root,
        size: blobData.length,
        expirationMicros: (1000 * 60 * 60 * 24 * 30 + Date.now()) * 1000, // 30 days
      });
    
    await aptosClient.waitForTransaction({
      transactionHash: pendingWriteBlobCommitmentsTransaction.hash,
    });
    
    // 5. Confirm the commitments through the RPC layer
    await shelbyClient.rpc.putBlob({
        account: signer.accountAddress,
        blobName: "path/to/file.txt",
        blobData,
    });

## Conclusion

And that is it! You have now manually uploaded a file to the Shelby network. For more information about the SDK, feel free to refer to the [Specifications](/sdks/typescript/node/specifications) page.

### [SpecificationsReference documentation for the API and specifications](/sdks/typescript/node/specifications)

  


[Uploading a FileLearn how to upload a file to the Shelby network from a Node.js environment](/sdks/typescript/node/guides/uploading-file)[OverviewClient-side specific functionality for browser environments](/sdks/typescript/browser)

### On this page

OverviewGetting StartedInstallation and SetupGenerating CommitmentsWriting Commitments to the Coordination LayerConfirming Commitments through the RPC LayerConclusion