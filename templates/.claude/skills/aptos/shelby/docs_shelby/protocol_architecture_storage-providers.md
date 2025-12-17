---
url: https://docs.shelby.xyz/protocol/architecture/storage-providers
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

# Storage Providers

The storage providers of the Shelby Protocol

The Storage Provider nodes store data for the Shelby network.

## Cavalier

Cavalier is the Jump Crypto reference implementation of the protocol's Storage Provider. The Cavalier client is a high performance C codebase, written using utilities open sourced as part of the [firedancer](https://github.com/firedancer-io/firedancer) project.

## Tiles

Modern CPUs contain large numbers of cores. These cores communicate over local networks, and their caches use sophisticated algorithms to coordinate across the cache hierarchy1. The relationship between local cpu caches, local-socket memory, and remote cpu caches, must be carefully managed by programmers to have any hope of extracting high performance from these systems.

Multi-threaded applications struggle with this complexity, leaving performance on the table, or worse, experiencing unpredictable performance due to cache conflicts and NUMA penalties. Cavalier leverages a "tile" architecture in which application components run in isolated processes, on dedicated CPU cores, and communicate through shared memory, to avoid these struggles.

Building the system around communicating tiles means:

  * Explicit Communication: Moving data between cores is explicit, avoiding performance surprises.
  * Resource Locality: A tile controls its core's caches. Explicit core scheduling prevents interference by other processes and threads.
  * Isolation: Tile state is isolated. Security-sensitive tiles can run in sandboxes; hiding their sensitive state from the rest of the system.



The tile model echoes other popular programming approaches seen in languages like erlang and go (independent actors communicating over channels), and frameworks like [Seastar](https://seastar.io/) which embrace the shared-nothing-with-message-passing pattern.

## Workspaces

Cavalier uses a shared memory management concept called a "workspace." Workspaces implement the shared memory infrastructure that enables tile communication. A workspace is a section of shared memory that is (usually) backed by huge pages (for TLB efficiency) and is created in a cpu topology aware manner. A workspace can hold sections of application state, shared memory queues, shared memory data buffers, and even dynamic memory allocators (which allocate within a section of the workspace). Workspaces hold information about their layout, allowing debugging tools to inspect state and (where appropriate) allowing tiles to hold persistent state in their workspace across application restarts.

# Kinds of Tiles

Tile-architecture applications tend to end up with a few different kinds of tiles:

  * Application Logic: Implement core business logic and track some local state.
  * State Management: Own application wide databases. Respond to queries over shared memory, and often persist key data in their workspaces.
  * Hardware Interfacing: Manage network cards, network connections, disks, etc. Implement kernel bypass networking primitives, perform networking stack work, multiplex across many hard drives, etc.
  * Message routing and multiplexing: Load balance across shared application or state tiles, join queues with robust and consistent ordering, etc.



The pattern does not impose an event model for tiles, each can use an appropriate event model for their purpose. For example a tile managing a large number of TCP sessions may want an event-driven epoll-style loop, but something managing hardware might want to spin while polling hardware registers.

# Cavalier Tiles

Cavalier creates a small number of tiles (potentially many copies of each):

  1. System tile - General orchestration, metrics reporting, status checking.
  2. Server tile(s) - Manage communication with RPC nodes.
  3. Engine tile - Manage access to local drives.
  4. Aptos client tile - Connect to aptos services to gather L1 state and provide SP-local access to relevant state.



Cavalier at current size has a minimal footprint, but as the system scales up, we are designing components such that scaling is possible. For example:

  * As RPC connection requirements grow, we can add more server tiles.
  * As local metadata grows in size, we can shard access across multiple Aptos client tiles.



## Engine Tile (Drive Interaction)

The engine tile manages all physical storage operations using `io_uring` for high-performance asynchronous I/O across multiple drives. We maintain separate read and write queues (of fixed depths) per drive, allowing fine-tuned control over I/O concurrency based on each drive's characteristics. The hard drives have minimal partition tables, and we use direct I/O to bypass page cache, providing predictable performance.

The tile listens for I/O requests from other tiles and enqueues requests to the drives (assuming the drive queues are not exceeded). As I/O completions occur, responses are sent back to the server tile through shared memory queues.

## Server Tile

The server tile implements a single-threaded event-driven `epoll` style event loop to manage multiple concurrent TCP connections. The tile communicates with both the client and engine tiles through shared memory queues, forwarding metadata validation requests to the client tile and actual I/O operations to the engine tile.

The tile tracks each connected client (RPC node), and runs a lightweight protocol using protobufs for communication. Each connection maintains dedicated incoming and outgoing buffers, with ring buffers used for outgoing data to gracefully handle partial writes when the network becomes congested, and some backpressure managment business logic.

## Aptos Blockchain Client Tile

The Aptos client tile sends HTTP requests (using `libcurl`) to an Aptos Indexer to fetch L1 state, then maintains a database of blobs and chunks that the Storage Provider is responsible for. The tile responds to metadata requests from the other tiles, acting like a local database. Addionally, as blobs relevant to this Storage Provider expire, the client tile will inform the engine tile that chunks are ready for deletion.

## Footnotes

  1. See [AMD's CCX architecture](https://chipsandcheese.com/p/pushing-amds-infinity-fabric-to-its) ↩




[RPCsThe RPCs of the Shelby Protocol](/protocol/architecture/rpcs)[Smart ContractsThe smart contracts of the Shelby Protocol](/protocol/architecture/smart-contracts)

### On this page

CavalierTilesWorkspacesKinds of TilesCavalier TilesEngine Tile (Drive Interaction)Server TileAptos Blockchain Client TileFootnotes