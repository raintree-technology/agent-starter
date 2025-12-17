---
url: https://docs.shelby.xyz/sdks/typescript/core/specifications
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

Core types and functions shared between Node.js and browser environments

## ShelbyBlobClient

Blockchain-focused client for managing blob commitments and metadata on-chain.

Prop

Type

`aptos``object`

`deployer``object`

`indexer``object`

`getBlobMetadata``function`

`getAccountBlobs``function`

`getBlobs``function`

`getBlobActivities``function`

`getBlobsCount``function`

`getBlobActivitiesCount``function`

`registerBlob``function`

### Methods

#### `registerBlob({account, blobName, blobMerkleRoot, size, expirationMicros, options})`

Registers a blob on the blockchain by writing its commitments.

Parameter| Type| Description  
---|---|---  
`account`| `Account`| The account to register the blob for  
`blobName`| `BlobName`| The name/path of the blob  
`blobMerkleRoot`| `string`| The merkle root of the blob  
`size`| `number`| The size of the blob in bytes  
`expirationMicros`| `number`| The expiration time in microseconds  
`options`| `WriteBlobCommitmentsOptions`| Optional write blob commitments options  
  
**Returns:** `Promise<{ transaction: PendingTransactionResponse }>`

#### `confirmBlobChunks({signer, account, blobName, signedChunksetChunkCommitments, options})`

Confirms the blob chunks for a given blob.

Parameter| Type| Description  
---|---|---  
`signer`| `Account`| The account to confirm the blob chunks for  
`account`| `AccountAddressInput`| The account address  
`blobName`| `string`| The name/path of the blob  
`signedChunksetChunkCommitments`| `SignedChunkCommitment[][]`| The signed chunk commitments for the blob  
`options`| `ConfirmBlobChunksOptions`| Optional confirm blob chunks options  
  
**Returns:** `Promise<{ transaction: PendingTransactionResponse }>`

#### `getBlobMetadata({account, name})`

Retrieves blob metadata from the blockchain.

Parameter| Type| Description  
---|---|---  
`account`| `AccountAddressInput`| The account address  
`name`| `string`| The name/path of the blob  
  
**Returns:** `Promise<BlobMetadata>`

#### `getAccountBlobs({account})`

Gets all blob metadata for a specific account.

Parameter| Type| Description  
---|---|---  
`account`| `AccountAddressInput`| The account address  
  
**Returns:** `Promise<BlobMetadata[]>`

* * *

## ShelbyRPCClient

The client to interact with the Shelby RPC node which is responsible for storing, confirming, and retrieving blobs from the storage layer.

Prop

Type

`baseUrl``string`

`apiKey``string | undefined`

`rpcConfig``ShelbyRPCConfig`

`indexer``object`

`putBlob``function`

`getBlob``function`

### Methods

#### `putBlob({account, blobName, blobData})`

Uploads blob data to Shelby storage using multipart upload for reliability.

Parameter| Type| Description  
---|---|---  
`account`| `AccountAddressInput`| The account address to store the blob under  
`blobName`| `string`| The name/path of the blob  
`blobData`| `Uint8Array`| The blob data to upload  
  
#### `getBlob({account, blobName, range?})`

Downloads blob data as a readable stream with optional byte range support.

Parameter| Type| Description  
---|---|---  
`account`| `AccountAddressInput`| The account address  
`blobName`| `string`| The name/path of the blob  
`range`| `{ start: number; end?: number }`| Optional byte range  
  
**Returns:** `Promise<ShelbyBlob>`

* * *

### ShelbyBlob

A blob is a representation of a file (or a part of a file) that is stored on the Shelby network.

Prop

Type

`account``object`

`name``string`

`readable``object`

`contentLength``number`

### BlobMetadata

The metadata of a blob that describes the blob and its properties.

Prop

Type

`owner``object`

`name``string`

`blobNameSuffix``string`

`blobMerkleRoot``object`

`size``number`

`encoding``Required<object & Partial<object>>`

`expirationMicros``number`

`sliceAddress``object`

`isWritten``boolean`

### ClayEncoding

The encoding of a blob that describes the encoding of the blob.

Prop

Type

`erasure_n``number`

`erasure_k``number`

`erasure_d``number`

`chunkSizeBytes``number`

`variant``"clay"`

[OverviewThe core package contains environment agnostic types and functions to interact with the Shelby network.](/sdks/typescript/core)[OverviewServer-side specific functionality for Node.js environments](/sdks/typescript/node)

### On this page

ShelbyBlobClientMethods`registerBlob({account, blobName, blobMerkleRoot, size, expirationMicros, options})``confirmBlobChunks({signer, account, blobName, signedChunksetChunkCommitments, options})``getBlobMetadata({account, name})``getAccountBlobs({account})`ShelbyRPCClientMethods`putBlob({account, blobName, blobData})``getBlob({account, blobName, range?})`ShelbyBlobBlobMetadataClayEncoding