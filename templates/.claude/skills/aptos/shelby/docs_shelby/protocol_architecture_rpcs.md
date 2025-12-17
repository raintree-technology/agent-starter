---
url: https://docs.shelby.xyz/protocol/architecture/rpcs
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

# RPCs

The RPCs of the Shelby Protocol

The Shelby Protocol uses RPC servers as the primary user-facing protocol access layer. A reference implementation, in typescript, of the RPC server exposes a straightforward blob read/write interface, handles Aptos L1 interactions, and interacts with Storage Providers on behalf of end users.

The client SDK works natively with the reference implementation endpoints. When reading blobs, it is also possible to interact directly with the HTTP endpoints in situations where it would be complicated to use the SDK.

We anticipate value-add RPC services which will build off additional features for specialized usage on top of the reference implementation for example, RPC servers could transform data, process data, cache data, etc.

# RPC Server Responsibilities

The RPC server exposes friendly HTTP REST APIs to read and write data to and from Storage Provider servers. RPC servers will have a user-facing network interface(s) (typically the public internet) and private network facing network interface(s).

### Core Features

  * HTTP endpoints: RESTful blob storage APIs with support for standard operations, range requests, and multipart uploads.
  * Provide user-friendly payment mechanisms and session management.
  * Storage Provider connection management: Keep these connections healthy and functioning well, gracefully handle loss of storage providers.
  * Erasure coding and commitment calculations: Done as part of the read and write workflows.
  * Blockchain integration: Interact with Aptos L1 to inspect blob/chunk state and carry out operations.



### Reading Data

The interface exposed for reading is designed to be flexible and composable with other systems. The RPC supports plain `HTTP GET` to fetch entire blobs as well as range requests for advanced usage and concurrent downloads. See the full read path detailed in the [Overview](./overview.mdx) for interactions between components.

The RPC server provides graceful degradation when Storage Providers are unavailable, automatically falling back to parity chunks and providing clear error responses when operations cannot be completed.

#### Request Hedging

Future implementations will include request hedging, which is over-requesting data from Storage Providers and using the first set of valid responses received to reply to the end user. This technique is particularly effective in distributed systems where tail latency can be highly variable.

For example, if we need 10 of 16 chunks in our chunkset to answer the user, we can request 14 chunks and use the first 10 full replies to reply at lower client-facing latency. Careful network congestion management and traffic prioritization is required for this technique to be effective.

### Writing Data

To write data, the client SDK is the primary interface. The client SDK interacts with the RPC server to perform these writes. See the full write path as detailed in the [Overview](./overview.mdx) for full system interaction.

Internal to the SDK and RPC, we support both HTTP PUT and multi-part uploads, which are helpful when large files need to be uploaded over potentially flaky connections (parts can be retried).

# Performance Notes

The RPC server implementation prioritizes performance through several key architectural decisions that minimize latency, reduce memory usage, and maximize throughput under varying load conditions.

## Streaming Data Pipeline

As clients upload blobs, the RPC server begins processing data immediately as it arrives, rather than waiting for complete uploads. The data path uses streams, ensuring that data flows through the system without large buffers and latency bubbles. When data is transformed (i.e. erasure coded), it is done so as a part of this data path in small streaming chunks. This approach provides several benefits:

  * Reduced time-to-first-byte.
  * Constant memory usage per connection, allowing a higher connection count and high levels of concurrency.



## Connection Pooling and Reuse

Storage Provider connections are maintained in a connection pool. These connections are able to be reused for many concurrent requests through request tracking mechanisms in the protocol. Pooling the connections keeps latency low (no time spent establishing connections) keeps flow control state fresh (no cold start ramp up period as the protocol estimates channel properties).

## Resource Management

Other techniques are in use to control resource usage, including:

  * Bounded queues: Connection pools and processing queues have fixed capacities to prevent memory exhaustion during traffic spikes.
  * Backpressure handling: When Storage Providers or network connections become congested, the system applies backpressure up the chain rather than buffering unlimited data.
  * Garbage collection: Sessions, pending uploads, and cached metadata are automatically expired to prevent resource leaks during long-running operations.



## Scalability

To scale horizontally, the reference RPC server public interfaces and internals are mostly stateless. Session management requires some database state, currently handled by local persistent databases. All other portions of read and write requests supported by the RPC server are stateless. This allows easy horizontal scaling, more instances can be added and requests sharded/load-balanced across them without much trouble.

Because the small amount of persistent session state is carefully managed, these RPC servers can also be started, stopped, and restarted seamlessly.

# Monitoring, Observability, and Operational Considerations

Every request receives a unique correlation ID that flows through all system components, enabling distributed tracing of complex operations that span multiple Storage Providers and blockchain interactions. This tracing capability is essential for debugging performance issues and understanding system behavior under load.

The RPC server exposes operational metrics including request latency, Storage Provider connection health, throughput statistics, and error rates through standard monitoring interfaces.

[OverviewHow Shelby works](/protocol/architecture/overview)[Storage ProvidersThe storage providers of the Shelby Protocol](/protocol/architecture/storage-providers)

### On this page

RPC Server ResponsibilitiesCore FeaturesReading DataRequest HedgingWriting DataPerformance NotesStreaming Data PipelineConnection Pooling and ReuseResource ManagementScalabilityMonitoring, Observability, and Operational Considerations