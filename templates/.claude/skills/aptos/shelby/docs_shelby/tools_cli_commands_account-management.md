---
url: https://docs.shelby.xyz/tools/cli/commands/account-management
fetched: 2025-11-16
---

[](/)

Search

`⌘``K`

Tools

Developer tooling

CLI

Introduction

[Getting Started](/tools/cli)[CLI Management](/tools/cli/management)

Commands

[Account Management](/tools/cli/commands/account-management)[Context Management](/tools/cli/commands/context-management)[Uploads and Downloads](/tools/cli/commands/uploads-and-downloads)[Faucet](/tools/cli/commands/faucet)[Commitment](/tools/cli/commands/commitment)

[Shelby Explorer](/tools/explorer)

Wallet Setup

[AI & LLM Integration](/tools/ai-llms)

[](https://github.com/shelby)

CLI

# Account Management

Managing accounts for the Shelby CLI

As part of the upload process, the CLI requires that you have a funded account in order to pay for upload and gas fees. The CLI provides a number of commands to help you manage the signer account that is used in the CLI.

## `shelby account`

To create a new account, you can use the `shelby account create` command.

**Interactive Mode**
    
    
    shelby account create 

**Non-interactive Mode**
    
    
    shelby account create --name <ACCOUNT_NAME> --scheme <ACCOUNT_SCHEME> --private-key <PRIVATE_KEY> --address <ACCOUNT_ADDRESS>

### Options

Flag| Description  
---|---  
`--name <account-name>`| The label to store the credentials under.  
`--scheme <signature-scheme>`| Signature scheme for the private key. The CLI currently supports `ed25519`.  
`--private-key <key>`| Raw private key (`ed25519-priv-0x…` format). Required in non-interactive mode.  
`--address <aptos-address>`| Optional Aptos account address (`0x…`). Useful if you generated the key elsewhere.  
  
All four flags must be provided to skip the interactive wizard. Omitting any flag drops you into the TUI and the CLI will generate a fresh account for you.

## `shelby account list`

To list all accounts, you can use the `shelby account list` command.
    
    
    shelby account list

Example Output
    
    
    ┌─────────────┬─────────────────────────────────────────────┬────────────────┐
    │ Name        │ Address                                     │ Private Key    │
    ├─────────────┼─────────────────────────────────────────────┼────────────────┤
    │ alice       │ 0xf4b6c29e32ab75d7088886ef5aa2cfebbe4303ba8 │ ed25519-priv-0 │
    │ (default)   │ 3f3033f76e4e009e0e87fba                     │ x1ed77...      │
    ├─────────────┼─────────────────────────────────────────────┼────────────────┤
    │ bob         │ 0x03206522072ab6bca0d44ea0867d9a3eadb59eb4e │ ed25519-priv-0 │
    │             │ 359d9b55f3dc037463caf8c                     │ x18449...      │
    └─────────────┴─────────────────────────────────────────────┴────────────────┘

## `shelby account use`

You can choose an account to use by default by using the `shelby account use` command. This account will automatically be used when running any command that requires an account.
    
    
    shelby account use <ACCOUNT_NAME>

Example Output
    
    
    ✅ Now using account 'alice'

## `shelby account delete`

Delete an account from the configuration file.
    
    
    shelby account delete <ACCOUNT_NAME>

Example Output
    
    
    ✅ Account 'alice' deleted successfully

## `shelby account blobs`

List all blobs associated with an account.
    
    
    shelby account blobs

Example Output
    
    
    🔍  Retrieving blobs for alice
    👤  Address: 0x0694a79e492d268acf0c6c0b01f42654ac050071a343ebc4226cb6717d63e4ea
    🗂️  Shelby Explorer: https://explorer.shelby.xyz/shelbynet/account/0x0694a79e492d268acf0c6c0b01f42654ac050071a343ebc4226cb6717d63e4ea
    
    ✅  Retrieved 2 blobs
    ────────────────────────────────────────────
    📦  Stored Blobs
    ┌─────────────────────────────────────────────┬───────────────┬─────────────────────────┐
    │ Name                                        │ Size          │ Expires                 │
    ├─────────────────────────────────────────────┼───────────────┼─────────────────────────┤
    │ .gitignore-v1                               │ 494 B         │ Oct 11, 2025, 4:03 PM   │
    ├─────────────────────────────────────────────┼───────────────┼─────────────────────────┤
    │ .gitignore-v2                               │ 494 B         │ Oct 11, 2025, 4:03 PM   │
    └─────────────────────────────────────────────┴───────────────┴─────────────────────────┘
    ✨  Done!

`shelby account blobs` requires your active context to include a Shelby indexer endpoint. Configure one with `shelby context create`/`update` before relying on this command.

### Options

Flag| Description  
---|---  
`-a, --account <name>`| Optional override for the account whose blobs will be listed.  
  
## `shelby account balance`

Display the Aptos (APT) and ShelbyUSD balances for the active account (or a supplied address).
    
    
    shelby account balance

Example Output
    
    
    👤  Account Information
    ────────────────────────────────────────────
    🏷️  Alias:        alice
    🌐  Context:      shelbynet
    
    🔑  Address:      0x0694a79e492d268acf0c6c0b01f42654ac050071a343ebc4226cb6717d63e4ea
    🔗  Aptos Explorer:  https://explorer.aptoslabs.com/account/0x0694a79e492d268acf0c6c0b01f42654ac050071a343ebc4226cb6717d63e4ea?network=shelbynet
    🗂️  Shelby Explorer: https://explorer.shelby.xyz/shelbynet/account/0x0694a79e492d268acf0c6c0b01f42654ac050071a343ebc4226cb6717d63e4ea
    ────────────────────────────────────────────
    
    💰  Balance:
    
    ┌─────────┬───────────────────────────────────┬─────────────────────┬───────────────────┐
    │ Token   │ Asset                             │ Balance             │ Raw Units         │
    ├─────────┼───────────────────────────────────┼─────────────────────┼───────────────────┤
    │ APT     │ 0x1::aptos_coin::AptosCoin        │ 9.998262 APT        │ 999,826,200       │
    ├─────────┼───────────────────────────────────┼─────────────────────┼───────────────────┤
    │ ShelbyU │ 0x1b18363a9f1fe5e6ebf247daba5cc1c │ 9.99986112          │ 999,986,112       │
    │ SD      │ 18052bb232efdc4c50f556053922d98e1 │ ShelbyUSD           │                   │
    └─────────┴───────────────────────────────────┴─────────────────────┴───────────────────┘

### Options

Flag| Description  
---|---  
`-a, --account <name>`| Query a configured account by name instead of the default.  
`-c, --context <name>`| Use balances from a different context/environment.  
`--address <hex>`| Provide a raw Aptos address to query (skips account lookup).  
  
[CLI ManagementManage your Shelby CLI installation](/tools/cli/management)[Context ManagementManaging contexts for the Shelby CLI](/tools/cli/commands/context-management)

### On this page

`shelby account`Options`shelby account list``shelby account use``shelby account delete``shelby account blobs`Options`shelby account balance`Options