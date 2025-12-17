---
url: https://docs.shelby.xyz/protocol/architecture/overview
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

# Overview

How Shelby works

# Key Components

The Shelby system consists of the following major components:

  1. **Aptos Smart Contract** \- manages the state of the system and manages correctness-critical operations, such as auditing for data correctness.
  2. **Storage Provider (SP) servers** \- storage servers which store chunks of user data.
  3. **Shelby RPC servers** \- used by end users to access stored blobs.
  4. **Private Network** \- Private fiber network used for internal communication.



Users connect to Shelby by using the SDK to access a Shelby RPC server, over the public internet. Shelby RPC servers have both public internet connectivity and private network connectivity. The RPC servers will reach Storage Provider servers using this private bandwidth to satisfy user requests.

All actors in the network have access to the Aptos L1 blockchain, which includes the Shelby smart contract. Each participant interacts with the smart contract to coordinate their actions.

# Accounts and Blob Naming

A user's blobs are stored in a user-specific namespace. Shelby uses the hex representation of the Aptos account which is interacting with Shelby as the user namespace. A single user can create as many accounts as they want or need. Blob names are user-defined, and must be unique within the user's namespace. A fully qualified blob name is something like `0x123..../user/defined/path/goes/here.dat`. Blob names can be up to 1024 characters, and must not end in `/`.

There are no directories in the system. Accounts only hold blob data. Note that it is possible to create both `<account>/foo` as a blob and `<account>/foo/bar`.

The [CLI](../tools/cli) and other tools follow a "canonical" directory layout when uploading or downloading local directory-like structures recursively.

That is, if an input directory is laid out as:
    
    
    $ tree .
    .
    |-- bar
    `-- foo
        |-- baz
        `-- buzz
    2 directories, 3 files

The blobs uploaded to Shelby will have these blob names:
    
    
    <account>/<some-prefix>/bar
    <account>/<some-prefix>/foo/baz
    <account>/<some-prefix>/foo/buzz

Users are still free to later upload `<account>/<some-prefix>/foo` as a separate object. However, this violates the canonical structure and would prevent standard tools from being able to recursively download the collection as a single directory.

# Chunking

User data is chunked according to an erasure coding scheme in Shelby. Erasure coding allows the system to recover from data loss without storing a large number of extra copies of user data in the system. Shelby uses [Clay Codes](https://www.usenix.org/system/files/conference/fast18/fast18-vajha.pdf) as its erasure coding scheme.

User data (blobs) are first split into fixed size "chunksets". These chunksets are then erasure coded into "chunks". If a user's data size is not a multiple of the chunkset size, the SDK will fill the last chunk with zeros to ensure that chunks are of the appropriate size throughout the system. Reads will never return this zero padding, but it will exist internally within the system. At this time, chunksets are 10 megabytes of user data and each chunk is 1 megabyte.

Each chunkset contains 16 total chunks in our erasure coding scheme. The first 10 of these chunks are the original user data. The remaining 6 chunks are "parity" chunks, which contain the data needed to recover chunks lost due to disk or node failure.

To read/rebuild a block of data, we need to gather 10 chunks of the chunkset. These can be the 10 data chunks (as these are the original user data chunks), or any 10 chunks combination of data+parity chunks.

Shelby can also use the Clay Code bandwidth-optimized repair algorithm to recover chunks lost due to disk or node failure. This algorithm provides a mechanism to read a chunk from a chunkset without fetching 10 full chunks worth of data. Instead it will read a much smaller portion of data from a larger number of servers. This optimized repair algorithm can reduce the network traffic during recovery by as much as 4x compared to standard Reed-Solomon erasure coding while preserving the same optimal storage footprint.

# Placement Groups

Shelby uses placement groups to efficiently manage where data is stored across the network without requiring massive metadata overhead. Placement groups also allow us to control for data locality, or specify failure domains, in a flexible manner.

Instead of tracking the location of every individual chunk, Shelby assigns each blob to a placement group and stores all of that blob's chunks on the same set of storage providers. This dramatically reduces the amount of metadata that must be stored on the Aptos blockchain.

When you store a blob, the Shelby system:

  1. Randomly assigns the blob to one of many placement groups for load balancing and data availability
  2. Stores all chunks of the blob across the 16 storage providers in that placement group



Each placement group contains exactly 16 slots for storage providers, matching the erasure coding scheme. All chunks from a blob—both the 10 data chunks and 6 parity chunks—are stored on the same set of 16 storage providers.

To read data, the RPC server performing the read looks up which placement group contains the desired blob, then retrieves the chunks from the 16 storage providers assigned to that placement group.

For another example of Placement Group usage, see the [Ceph RADOS paper](https://ceph.com/assets/pdfs/weil-rados-pdsw07.pdf).

# Read Procedure

The following describes what happens in the system when clients request to read data from Shelby:

  1. The client selects an available RPC server from the network.
  2. The client establishes a payment mechanism and session with the selected RPC server.
  3. The client sends HTTP requests to the RPC server specifying the desired blob or byte range, along with payment authorization.
  4. (optionally) The RPC server consults a local cache and returns data from local cache if present.
  5. The RPC server queries the smart contract to identify which storage providers hold the chunks for the requested blob.
  6. The RPC server retrieves the necessary chunks from the storage providers over the DoubleZero private network, using a micropayment channel managed by the smart contract to pay the storage provider for the read.
  7. The RPC server validates the chunks against the blob metadata, reassembles the requested data, and returns it to the client.
  8. The client can perform additional reads using the same session, with payments deducted incrementally as data is transferred.



# Write Procedure

The following describes what happens in the system when clients request to write data to Shelby:

  1. The client selects an available RPC server from the network.
  2. The SDK computes the erasure coded version of the blob locally, processing chunk-by-chunk to minimize memory usage.
  3. The SDK calculates cryptographic commitments for each erasure coded chunk.
  4. The SDK submits a transaction to the Aptos blockchain containing the blob's metadata and merkle root of chunk commitments. Storage payment is processed on-chain at this point.
  5. The SDK transmits the original, non-erasure-coded data to the RPC server to conserve bandwidth.
  6. The Shelby RPC server independently erasure codes the received data and recomputes chunk commitments to verify consistency with the on-chain metadata.
  7. The RPC server validates that its computed values match the on-chain state.
  8. The RPC server distributes the erasure coded chunks to the assigned storage providers based on the blob's placement group.
  9. Each storage provider validates its received chunk and returns a signed acknowledgment.
  10. The RPC server aggregates the acknowledgments from all storage providers and submits a final transaction to the smart contract.
  11. The smart contract transitions the blob to "written" state, confirming it is durably stored and available for reads.



[Quick StartHow to get started with the Shelby Protocol](/protocol/quickstart)[RPCsThe RPCs of the Shelby Protocol](/protocol/architecture/rpcs)

### On this page

Key ComponentsAccounts and Blob NamingChunkingPlacement GroupsRead ProcedureWrite Procedure