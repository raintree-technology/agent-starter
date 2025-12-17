---
url: https://docs.shelby.xyz/protocol/architecture/token-economics
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

# Token Economics

The token economics of the Shelby Protocol

# The Economics of Shelby

_Full Tokenomics of the Shelby protocol, including initial distribution, will be published later._

## Overview

The Shelby network uses both a native token and stablecoins:

  * **Shelby token** or **Stablecoins** for user payments
  * **Shelby token** as an internal unit for staking, rewards, and governance



* * *

## Payment and Conversion Flow

  1. **User Payments**

     * Users pay for storage and read operations in stablecoins or Shelby token.
     * User read fees are routed directly to the relevant RPC Operators. RPCs use paymentchannels for reading data from SPs.
     * User storage fees are routed through the protocol on chain.
  2. **Conversion to native tokens**

     * The protocol programmatically converts those storage fees that were paid in stablecoins into Shelby tokens on the open market.
     * Accumulated Shelby tokens form the source of rewards to Storage Providers (SPs).
  3. **Reward Release**

     * SPs are rewarded in the native token.
     * Rewards are released gradually and are conditioned on successful audit outcomes.
     * The release schedule ensures storage integrity and aligns rewards with verified service.
  4. **Burns**

     * A predefined fraction of each conversion is permanently burned.



* * *

## Staking and Roles

### Storage Providers (SPs)

  * Must stake the native token to operate and earn rewards.
  * Storage tasks and reward eligibility are proportional to the individual stake.



### RPC Operators

  * Stake to access additional benefits (e.g., pricing tiers and read routing).



### Delegators

  * Can delegate native tokens to SPs or RPC Operators to share in their rewards.



* * *

## Protocol Fund

The **Protocol Fund** is governed by the community.

**Sources:**

  * A predefined fraction of collected usage fees.
  * Portion of genesis allocation.



**Uses (among others):**

  * Delegation to high-performing operators.
  * Retroactive public goods funding (RetroPGF).
  * Ongoing protocol development and maintenance.



* * *

## Supply and Emissions

  * Total token supply is capped. (No perpetual inflation.)
  * Bootstrap rewards for early participants taper over time and are stake-weighted.
  * Initial allocation with locked releases.
  * RetroPGF distributions are determined through governance rather than algorithmic issuance.



* * *

Shelby tokenomics structure links storage activity, reward issuance, and supply restrictions within a single closed economic loop.

[Smart ContractsThe smart contracts of the Shelby Protocol](/protocol/architecture/smart-contracts)[White PaperThe Shelby Protocol white paper](/protocol/architecture/white-paper)

### On this page

The Economics of ShelbyOverviewPayment and Conversion FlowStaking and RolesStorage Providers (SPs)RPC OperatorsDelegatorsProtocol FundSupply and Emissions