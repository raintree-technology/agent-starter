---
url: https://docs.shelby.xyz/protocol
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

# Introduction

What is the Shelby Protocol?

Shelby is a high-performance decentralized blob storage system designed for demanding read-heavy workloads.

Workloads such as video streaming, AI training and inference, and large-scale data analytics require robust storage, significant capacity, and high read bandwidth at reasonable prices, all while maintaining control over their data. To deliver these capabilities to users, Shelby uses:

  * **Paid reads and user-focused incentive model**. Paying for reads ensure that storage providers deliver good service.
  * **The Aptos blockchain as a coordination and settlement layer**. Aptos provides a high-performance, reliable foundation for managing system state, economic logic, and enforcing BFT.
  * **Dedicated private bandwidth**. Performance is limited and inconsistent over the public internet. Shelby uses a dedicated fiber network to ensure consistent high performance.
  * **A novel auditing system**. Ensures data integrity and rewards honest participation in the network.
  * **Efficient erasure coding**. Minimizes recovery bandwidth, reducing costs, while ensuring data is safely stored.
  * **Built by experienced teams**. The Jump Trading Group and Aptos team both are rich with experience building high performance storage and globally distributed systems.



## Key Components

Users interact primarily with the RPC servers through:

  1. Shelby [Typescript SDK](/sdks/typescript)
  2. Shelby [CLI](/tools/cli)
  3. Shelby web applications, such as the [block explorer](https://explorer.shelby.xyz/shelbynet), streaming apps, etc.



The Shelby system consists of the following major components:

  1. **Aptos Smart Contract** \- manages the state of the system and manages correctness-critical operations, such as auditing for data correctness.
  2. **Storage Provider (SP) servers** \- storage servers which store chunks of user data.
  3. **Shelby RPC servers** \- used by end users to read and write blobs.



## Why Aptos?

Shelby uses the Aptos blockchain as its coordination and settlement layer because it offers high transaction throughput, low finality times, and a resource-efficient execution model. This makes it an ideal foundation for managing Shelby's economic logic, including storage commitments, audit outcomes, and payment channels, without compromising scalability. Additionally, the Aptos team brings DNA from Meta's global large-scale platforms, a perfect match for the Shelby project.

## Why Jump Crypto?

Shelby's software stack is not built from scratch; it is founded on engineering principles honed through years of experience developing storage and compute systems for Jump Trading Group's high-performance quantitative research infrastructure. This includes expertise in high-performance I/O, efficient concurrency, and low-level code optimizations, allowing Shelby to deliver a system that is both highly scalable and responsive.

[Quick StartHow to get started with the Shelby Protocol](/protocol/quickstart)

### On this page

Key ComponentsWhy Aptos?Why Jump Crypto?