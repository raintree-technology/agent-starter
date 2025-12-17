---
url: https://docs.shelby.xyz/protocol/architecture/networks
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

# Networks

The networks of the Shelby Protocol

This page is a reference guide for the network urls and capabilities of the available networks. To actually use the Shelby network, please follow the [Quickstart](/protocol/quickstart).

# shelbynet

Shelby currently operates a single developer prototype network called `shelbynet`. `shelbynet` will be wiped roughly once a week, or faster.

To support `shelbynet`, a new set of Aptos validators is running as well, under the network name of `shelbynet`. Use `shelbynet` as the network name when interacting with Aptos Explorer. This network is isolated from the Aptos mainnet, Aptos testnet, and Aptos devnet.

## Limits and Capabilities

Storage Capacity: approximately 10 TiB.

## `shelbynet` component URLs and Addresses

Component| URL  
---|---  
Indexer| <https://api.shelbynet.shelby.xyz/v1/graphql>  
Shelby RPC| <https://api.shelbynet.shelby.xyz/shelby>  
Aptos Full Node| <https://api.shelbynet.shelby.xyz/v1>  
  
The [Shelby Smart Contract](/protocol/architecture/smart-contracts) is deployed by account `0xc63d6a5efb0080a6029403131715bd4971e1149f7cc099aac69bb0069b3ddbf5`. See [Aptos Explorer](https://explorer.aptoslabs.com/account/0xc63d6a5efb0080a6029403131715bd4971e1149f7cc099aac69bb0069b3ddbf5?network=shelbynet) to explore this account.

## API Keys

Learn about API keys [here](/sdks/typescript/acquire-api-keys).

## Shelby RPC server

A single RPC server is running for Shelby devnet. This server is running in a cloud environment. We use a private network configured in the cloud environment to conect the RPC server to the storage providers.

The RPC server is routed to public internet using Geomi, accessible using the URL above.

## Storage Providers

For Shelby devnet, we are running 16 storage providers in a cloud environment. These providers are running in a single region, with a private network connecting them. Each Storage Provider has 1 TiB of disk.

[White PaperThe Shelby Protocol white paper](/protocol/architecture/white-paper)

### On this page

shelbynetLimits and Capabilities`shelbynet` component URLs and AddressesAPI KeysShelby RPC serverStorage Providers