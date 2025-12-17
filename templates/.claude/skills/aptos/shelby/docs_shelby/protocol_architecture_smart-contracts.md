---
url: https://docs.shelby.xyz/protocol/architecture/smart-contracts
fetched: 2025-11-16
---

[](/)

Search

`⌘``K`

Protocol

Learn about Shelby

Getting Started

[Introduction](/protocol)[Quick Start](/protocol/quickstart)

Architecture

[Overview](/protocol/architecture/overview)[RPCs](/protocol/architecture/rpcs)[Storage Providers](/protocol/architecture/storage-providers)[Smart Contracts](/protocol/architecture/smart-contracts)[Token Economics](/protocol/architecture/token-economics)[White Paper](/protocol/architecture/white-paper)[Networks](/protocol/architecture/networks)

[](https://github.com/shelby)

# Smart Contracts

The smart contracts of the Shelby Protocol

Shelby's coordination and settlement processes are underpinned by Aptos smart contracts that act as the system's single source of truth. All critical state -- including storage commitments, audit outcomes, micropayment channel metadata, and system participation -- is managed and updated on-chain through these contracts. Maintaining a single on-chain state streamlines interactions among system components (Storage Providers, RPCs, SDKs).

## Blob Metadata

The [overview](/protocol/architecture/overview) shows how the system interacts with the smart contract during the read and write of blobs. Each of these flows interacts with the blob metadata stored in the smart contract.

### Write Path

Metadata for a blob is initialized when the SDK submits the transaction to register the blob. The user provides the blob and its name to the SDK. The SDK computes then sends a cryptographic blob commitment, along with payment and encoding information, to the smart contract as a signed Aptos transaction. (The construction of the blob commitment allows both simple verification of chunk contents by storage providers and small proofs during audits.)

The smart contract executes the transaction: it takes payment of the write according to the current prices of the blob size and length of expiration; it assigns the blob to a placement group, which defines the set of storage providers that will store erasure coded chunks of the blob.

The metadata is then updated when storage providers store data. Once a storage provider has stored a chunk, it produces a signed acknowledgement of the stored chunk and sends this to the RPC server, which aggregates and adds the acknowledgements on-chain. (If the RPC is unresponsive, the storage provider can send the acknowledgement directly on-chain.) When enough acknowledgements are registered with the smart contract, it transitions the blob to "written" state, confirming it is durably stored and available for reads.

### Read Path

On the read path, the blob metadata is accessed by the SDK and RPC by directly reading the smart contract state or reading derived information via an indexer. The read path does not require updates to the on-chain state, which is necessary for low latency and high throughput.

## Micropayments

Shelby deploys a micropayment channel smart contract, which is used by RPC servers to pay storage provider for reads. The micropayment channel only requires an on-chain update for creation and settlement, and all intermediate payments are guaranteed by the sender's signature, which the receiver can settle in bulk on-chain. These optimistic payments allow the read requests to occur fast without on-chain overheads.

## System participation

The smart contract manages the set of storage providers, placement groups, and the mapping of storage providers to placement group slots. Storage providers join and leave the system by submitting transactions to the smart contract; when executed the smart contract updates the placement group slots to reflect the new set of providers.

## Audits

Data is periodically audited within Shelby, to reward storage providers for storing data, and to punish any storage provider that reneges on their storage promises.

When the blob is registered, the write payment is deposited into the smart contract. Only storage providers that have acknowledged writes are paid the write payments, at regular audit intervals. If a storage provider claims to have written a blob but cannot produce a succinct proof of that write to a smart contract audit, it is penalized. More details on the formalation of audits are available in the [whitepaper](/protocol/architecture/white-paper).

[Storage ProvidersThe storage providers of the Shelby Protocol](/protocol/architecture/storage-providers)[Token EconomicsThe token economics of the Shelby Protocol](/protocol/architecture/token-economics)

### On this page

Blob MetadataWrite PathRead PathMicropaymentsSystem participationAudits