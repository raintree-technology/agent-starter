---
url: https://docs.shelby.xyz/sdks/typescript/node/specifications
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

# Specifications

Server-side specific functionality for Node.js environments

On this page, we use `https://api.shelby.dev` as a placeholder base URL for the Shelby API. In order to obtain the correct base URL, please make a request in our Discord server.

## ShelbyNodeClient

Node.js-specific implementation that extends the core ShelbyClient with server-side blob operations.

Prop

Type

`coordination``object`

`rpc``object`

`config``object`

`aptos``object`

`_provider?``object`

`getProvider``function`

`baseUrl``string`

`upload``function`

`download``function`

The `ShelbyNodeClient` class extends the base `ShelbyClient` and adds Node.js-specific methods for blob operations with multipart upload support and streaming downloads. It combines the functionality of `ShelbyBlobClient` and `ShelbyRPCClient` (both documented in the [core specifications](/sdks/typescript/core/specifications)) to provide a complete Node.js solution.

### Methods

#### `upload({ signer, blobData, blobName, expirationMicros, options })`

Uploads a blob to the Shelby network, handling both blockchain commitments and storage upload.

Parameter| Type| Description  
---|---|---  
`signer`| `Account`| The signer of the transaction  
`blobData`| `Buffer`| The data to upload  
`blobName`| `BlobName`| The name of the blob  
`expirationMicros`| `number`| The expiration time of the blob in microseconds  
`options`| `WriteBlobCommitmentsOptions`| The options for the upload  
  
**Returns:** `Promise<{ transaction: CommittedTransactionResponse; blobCommitments: BlobCommitments }>`

#### `download({account, blobName, range?})`

Downloads blob data as a ShelbyBlob with a readable stream.

Parameter| Type| Description  
---|---|---  
`account`| `AccountAddressInput`| The account address  
`blobName`| `string`| The name/path of the blob  
`range`| `{ start: number; end?: number }`| Optional byte range  
  
**Returns:** `Promise<ShelbyBlob>`

### Properties

The `ShelbyNodeClient` provides access to the underlying clients:

#### `coordination: ShelbyBlobClient`

The blockchain coordination client for managing blob commitments and metadata. See [ShelbyBlobClient documentation](/sdks/typescript/core/specifications#shelbyblobclient) for details.

#### `rpc: ShelbyRPCClient`

The RPC client for blob storage operations. See [ShelbyRPCClient documentation](/sdks/typescript/core/specifications#shelbyrcpclient) for details.

### Examples

#### Complete Upload and Download Flow
    
    
    import { ShelbyNodeClient } from '@shelby-protocol/sdk/node'
    import { Account, Network } from '@aptos-labs/ts-sdk'
    
    // Create node client
    const client = new ShelbyNodeClient({
      network: Network.SHELBYNET
    })
    
    // Create or get account
    const account = Account.generate()
    
    // Prepare blob data
    const blobData = Buffer.from('Hello, Shelby!')
    const blobName = 'greeting.txt'
    const expirationMicros = Date.now() * 1000 + 3600_000_000 // 1 hour from now
    
    // Upload blob (commits to blockchain and uploads to storage)
    const { transaction, blobCommitments } = await client.upload({
      signer: account,
      blobData,
      blobName,
      expirationMicros,
    })
    
    console.log('Upload completed:', transaction.hash)
    
    // Download blob
    const blob = await client.download({
      account: account.accountAddress,
      blobName,
    })
    
    console.log('Downloaded blob:', blob.name, blob.contentLength, 'bytes')

[OverviewServer-side specific functionality for Node.js environments](/sdks/typescript/node)[Uploading a FileLearn how to upload a file to the Shelby network from a Node.js environment](/sdks/typescript/node/guides/uploading-file)

### On this page

ShelbyNodeClientMethods`upload({ signer, blobData, blobName, expirationMicros, options })``download({account, blobName, range?})`Properties`coordination: ShelbyBlobClient``rpc: ShelbyRPCClient`ExamplesComplete Upload and Download Flow