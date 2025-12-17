---
url: https://docs.shelby.xyz/sdks/typescript/browser/guides/upload
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

[Uploading a File](/sdks/typescript/browser/guides/upload)[Downloading Files](/sdks/typescript/browser/guides/download)

Media Player

[](https://github.com/shelby)

TypeScript SDKGuides

# Uploading a File

Learn how to upload a file to the Shelby network from a Browser environment

## Prerequisites

This guide demonstrates how to upload files to the Shelby network from a browser environment. Before proceeding, ensure you have:

  * A basic understanding of React and TypeScript
  * An Aptos wallet configured for the Shelby network
  * ShelbyUSD tokens for file uploads (1 ShelbyUSD per upload)



## Environment Setup

To integrate with Aptos wallets, this guide uses the [Aptos Wallet Adapter package](https://aptos.dev/build/sdks/wallet-adapter/dapp). Follow these steps to configure your environment:

### Install the Wallet Adapter Package

Install the required wallet adapter dependency:
    
    
    npm install @aptos-labs/wallet-adapter-react

### Configure the Wallet Provider

Initialize the `AptosWalletAdapterProvider` in your application:
    
    
    import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
    import { PropsWithChildren } from "react";
    import { Network } from "@aptos-labs/ts-sdk";
    
    export const WalletProvider = ({ children }: PropsWithChildren) => {
    return (
      <AptosWalletAdapterProvider
        autoConnect={true}
        dappConfig={{
          network: Network.SHELBYNET,
          aptosApiKeys: {
            shelbynet: process.env.SHELBYNET_API_KEY
          }
        }}
        onError={(error) => {
          console.log("Wallet connection error:", error);
        }}
      >
        {children}
      </AptosWalletAdapterProvider>
    );
    };

## File Upload Process

Uploading a file to the Shelby network involves three sequential steps:

  1. **File Encoding** : Split the file into chunks and generate commitment hashes
  2. **On-Chain Registration** : Submit a transaction to register the file metadata
  3. **RPC Upload** : Upload the actual file data to Shelby storage providers



### Step 1: File Encoding

File encoding involves splitting the file into chunks, generating commitment hashes for each chunk, and creating a blob merkle root hash. These hashes are used for verification with storage providers.
    
    
    import {
      type BlobCommitments,
      createDefaultErasureCodingProvider,
      generateCommitments,
    } from "@shelby-protocol/sdk/browser";
    
    export const encodeFile = async (file: File): Promise<BlobCommitments> => {
      // Convert file to Buffer format
      const data = Buffer.isBuffer(file)
        ? file
        : Buffer.from(await file.arrayBuffer());
    
      // Create the erasure coding provider
      const provider = await createDefaultErasureCodingProvider();
    
      // Generate commitment hashes for the file
      const commitments = await generateCommitments(provider, data);
    
      return commitments;
    };

### Step 2: On-Chain Registration

Before uploading, ensure your account has sufficient ShelbyUSD tokens. Visit the [Shelby faucet](../../../../apis/faucet/shelbyusd) to fund your account if needed.

Register the file metadata on the Aptos blockchain by creating and submitting a transaction:
    
    
    import {
      expectedTotalChunksets,
      ShelbyBlobClient,
    } from "@shelby-protocol/sdk/browser";
    
    // Create the registration transaction payload
    const payload = ShelbyBlobClient.createRegisterBlobPayload({
      account: account.address,
      blobName: file.name,
      blobMerkleRoot: commitments.blob_merkle_root,
      numChunksets: expectedTotalChunksets(commitments.raw_data_size),
      expirationMicros: (1000 * 60 * 60 * 24 * 30 + Date.now()) * 1000, // 30 days from now
      blobSize: commitments.raw_data_size,
    });

Submit the transaction using the wallet adapter:

Ensure your wallet is configured for the Shelby network. Petra (and some other wallets) wallet lets you define a custom network, create one called `shelbynet` and use these settings:

  * **Node URL** : <https://api.shelbynet.shelby.xyz/v1>
  * **Faucet URL** : <https://faucet.shelbynet.shelby.xyz>
  * **Indexer URL** : <https://api.shelbynet.shelby.xyz/v1/graphql>



In addition, to upload a file, you will need your account to have two assets:

  * **APT tokens** : Used to pay for gas fees when sending transactions
  * **ShelbyUSD tokens** : Used to pay for the upload the file to the Shelby network



To fund your account with ShelbyUSD tokens, you can provide your account address to the **Shelby Faucet** found below.

### Faucet

Submit the previously created register blob payload with the wallet
    
    
    import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
    import {
      type InputTransactionData,
      useWallet,
    } from "@aptos-labs/wallet-adapter-react";
    
    const { signAndSubmitTransaction } = useWallet();
    
    // Submit the registration transaction
    const transaction: InputTransactionData = {
      data: payload,
    };
    
    const transactionSubmitted = await signAndSubmitTransaction(transaction);
    
    // Initialize Aptos client
    export const aptosClient = new Aptos(
      new AptosConfig({
        network: Network.SHELBYNET,
        clientConfig: {
          API_KEY: process.env.APTOS_API_KEY,
        },
      })
    );
    
    // Wait for transaction confirmation
    await aptosClient.waitForTransaction({
      transactionHash: transactionSubmitted.hash,
    });

### Step 3: RPC Upload

After successful on-chain registration, upload the file data to the Shelby RPC. The RPC validates the file against the registered commitment hashes before accepting the upload.

**Important** : The RPC upload must occur after on-chain registration, as the RPC verifies the file's registration status before processing the upload.
    
    
    import { ShelbyClient } from "@shelby-protocol/sdk/browser";
    import { Network } from "@aptos-labs/ts-sdk";
    import { useWallet } from "@aptos-labs/wallet-adapter-react";
    
    const { account } = useWallet();
    
    // Initialize Shelby client
    const shelbyClient = new ShelbyClient({
      network: Network.SHELBYNET,
      apiKey: process.env.SHELBY_API_KEY,
    });
    
    // Upload file data to Shelby RPC
    await shelbyClient.rpc.putBlob({
      account: account.address,
      blobName: file.name,
      blobData: new Uint8Array(await file.arrayBuffer()),
    });

After successful upload, your file is stored on the Shelby network and can be retrieved using the download functionality.

[OverviewClient-side specific functionality for browser environments](/sdks/typescript/browser)[Downloading FilesLearn how to download files from the Shelby network in a browser environment](/sdks/typescript/browser/guides/download)

### On this page

PrerequisitesEnvironment SetupInstall the Wallet Adapter PackageConfigure the Wallet ProviderFile Upload ProcessStep 1: File EncodingStep 2: On-Chain RegistrationStep 3: RPC Upload