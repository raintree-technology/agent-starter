---
url: https://docs.shelby.xyz/tools/cli
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

# Getting Started

Shelby CLI Getting Started Guide

The Shelby CLI offers an intuitive way to interact with Shelby. It lets you upload blobs to and download blobs from Shelby, and also manage multiple accounts or networks (called contexts).

## Installation

**Prerequisites:** This guide assumes you have [`Node.js`](https://nodejs.org/) and [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed. If you don't have them installed, please install them before proceeding.

Install the Shelby CLI

npm

pnpm

yarn

bun
    
    
    npm i -g @shelby-protocol/cli

## Quick Start

### Initialize Shelby

Start off by initializing the CLI with the `shelby init` command. This will create a shelby cli configuration file at `~/.shelby/config.yaml`.
    
    
    shelby init

**Note** : The CLI will ask you to provide an API key. While optional, this step is highly recommended to avoid ratelimits. Learn more about getting an API key [here](/sdks/typescript/acquire-api-keys).

If you accept the defaults, your config file (`~/.shelby/config.yaml`) will contain the following:
    
    
    cat ~/.shelby/config.yaml

~/.shelby/config.yaml
    
    
    contexts:
      local:
        aptos_network:
          name: local
          fullnode: http://127.0.0.1:8080/v1
          faucet: http://127.0.0.1:8081
          indexer: http://127.0.0.1:8090/v1/graphql
          pepper: https://api.devnet.aptoslabs.com/keyless/pepper/v0
          prover: https://api.devnet.aptoslabs.com/keyless/prover/v0
        shelby_network:
          rpc_endpoint: http://localhost:9090/
      shelbynet:
        aptos_network:
          name: shelbynet
          fullnode: https://api.shelbynet.shelby.xyz/v1
          faucet: https://faucet.shelbynet.shelby.xyz
          indexer: https://api.shelbynet.shelby.xyz/v1/graphql
          pepper: https://api.devnet.aptoslabs.com/keyless/pepper/v0
          prover: https://api.devnet.aptoslabs.com/keyless/prover/v0
        shelby_network:
          rpc_endpoint: https://api.shelbynet.shelby.xyz/shelby
    accounts:
      alice:
        private_key: ed25519-priv-0x8...
        address: "0xfcba...a51c"
    default_context: shelbynet
    default_account: alice

### List Contexts (Optional)

Ensure that the context was created successfully by listing the available contexts (list of networks). The `(default)` network is the one that is currently selected.
    
    
    shelby context list

Output
    
    
    Aptos Configurations:
    ┌─────────┬─────────┬───────────────────────┬──────────────────────┬──────────────────────┬────────┐
    │ Name    │ Network │ Fullnode              │ Indexer              │ Faucet               │ API    │
    │         │         │                       │                      │                      │ Key    │
    ├─────────┼─────────┼───────────────────────┼──────────────────────┼──────────────────────┼────────┤
    │ local   │ local   │ http://127.0.0.1:8080 │ http://127.0.0.1:809 │ http://127.0.0.1:808 │        │
    │         │         │ /v1                   │ 0/v1/graphql         │ 1                    │        │
    ├─────────┼─────────┼───────────────────────┼──────────────────────┼──────────────────────┼────────┤
    │ shelbyn │ shelbyn │ https://api.shelbynet │ https://api.shelbyne │ https://faucet.shelb │        │
    │ et (def │ et      │ .shelby.xyz/v1        │ t.shelby.xyz/v1/grap │ ynet.shelby.xyz      │        │
    │ ault)   │         │                       │ hql                  │                      │        │
    └─────────┴─────────┴───────────────────────┴──────────────────────┴──────────────────────┴────────┘
    
    Shelby Configurations:
    ┌───────────┬───────────────────────────────┬──────────────────────────────┬───────────┬───────────┐
    │ Name      │ RPC                           │ Indexer                      │ RPC API   │ Indexer   │
    │           │                               │                              │ Key       │ API Key   │
    ├───────────┼───────────────────────────────┼──────────────────────────────┼───────────┼───────────┤
    │ local     │ http://localhost:9090/        │                              │           │           │
    ├───────────┼───────────────────────────────┼──────────────────────────────┼───────────┼───────────┤
    │ shelbynet │ https://api.shelbynet.shelby. │                              │           │           │
    │ (default) │ xyz/shelby                    │                              │           │           │
    └───────────┴───────────────────────────────┴──────────────────────────────┴───────────┴───────────┘

### List Accounts (optional)

To retrieve the list of accounts, you can use the `shelby account list` command. The `(default)` account is the one that is currently selected.
    
    
    shelby account list

Output
    
    
    ┌──────────────┬────────────────────────────────────────────────┬──────────────────┐
    │ Name         │ Address                                        │ Private Key      │
    ├──────────────┼────────────────────────────────────────────────┼──────────────────┤
    │ alice        │ 0xfcb......................................0fb │ ed25519-priv-0x8 │
    │ (default)    │ c276e3e598938e00a51c                           │ adf5...          │
    └──────────────┴────────────────────────────────────────────────┴──────────────────┘

You will use the value in the `Address` column as the recipient address for funding.

### Fund Account

To upload and download files to Shelby, you'll need both

  1. **Aptos tokens** (for gas fees) and
  2. **ShelbyUSD tokens** (for Shelby operations like upload)



#### Aptos Tokens

FaucetShelby CLI

### Fund your account

Enter the address of the account you want to fund with APT tokens

Fund

The command below will output the faucet page URL with your active account pre-populated
    
    
    shelby faucet --no-open # remove the --no-open flag to automatically open in browser

Make sure the aptos cli is aware of your account and configured. The init command will also print out a command you can run to configure the profile, something like:
    
    
    aptos init --profile shelby-alice --assume-yes --private-key ed25519-priv-0xa... --network custom --rest-url https://api.shelbynet.aptoslabs.com --faucet-url https://faucet.shelbynet.shelby.xyz/

Aptos tokens are used to pay for gas fees. To fund your account with Aptos tokens, you can use `aptos` CLI.
    
    
    aptos account fund-with-faucet --profile shelby-alice --amount 1000000000000000000

#### ShelbyUSD Tokens

FaucetShelby CLI

### Faucet

The command below will output the faucet page URL with your active account pre-populated
    
    
    shelby faucet --no-open # remove the --no-open flag to automatically open in browser

### Verify Account Balance
    
    
    shelby account balance

Output
    
    
    👤  Account Information
    ────────────────────────────────────────────
    🏷️  Alias:        alice
    🌐  Context:      shelbynet
    
    🔑  Address:      <ADDRESS>
    🔗  Aptos Explorer:  https://explorer.aptoslabs.com/account/<ADDRESS>?network=shelbynet
    🗂️  Shelby Explorer: https://explorer.shelby.xyz/shelbynet/account/<ADDRESS>
    ────────────────────────────────────────────
    
    💰  Balance:
    
    ┌─────────┬───────────────────────────────────┬─────────────────────┬───────────────────┐
    │ Token   │ Asset                             │ Balance             │ Raw Units         │
    ├─────────┼───────────────────────────────────┼─────────────────────┼───────────────────┤
    │ APT     │ 0x1::aptos_coin::AptosCoin        │ 9.998885 APT        │ 999,888,500       │
    ├─────────┼───────────────────────────────────┼─────────────────────┼───────────────────┤
    │ ShelbyU │ 0x1b18363a9f1fe5e6ebf247daba5cc1c │ 9.99993056          │ 999,993,056       │
    │ SD      │ 18052bb232efdc4c50f556053922d98e1 │ ShelbyUSD           │                   │
    └─────────┴───────────────────────────────────┴─────────────────────┴───────────────────┘

### Upload a file
    
    
    # Uploads "filename.txt" to Shelby under a custom path or name (files/filename.txt), expiring tomorrow (auto-confirms payment)
    # Expiration date/time (required). Examples: "tomorrow", "in 2 days", "next Friday", "2025-12-31", UNIX timestamp
    shelby upload /Users/User/.../filename.txt files/filename.txt -e tomorrow --assume-yes

Output
    
    
    🚀  Upload Summary
    ────────────────────────────────────────────
    📦  File:        /Users/User/.../filename.txt
    📁  Blob Name:   files/filename.txt
    
    🧮  Filelist created (1 entry)
    ⏱️  Took: 0.00013s
    ⚙️  Flag: --assume-yes (auto-confirmed)
    
    🕒  Expires:  Oct 11, 2025, 4:26:56 PM
    ✔ Upload complete — took 1.53s
    
    🌐  Aptos Explorer:
       https://explorer.aptoslabs.com/txn/<TXN_HASH>?network=shelbynet
    
    🗂️  Shelby Explorer:
       https://explorer.shelby.xyz/shelbynet/account/<ACCOUNT_ADDRESS>
    
    ────────────────────────────────────────────
    ✨  Done!

### Verify Upload

You can verify the upload by clicking on the Shelby Explorer link or by running the command below
    
    
    shelby account blobs

Output
    
    
    🔍  Retrieving blobs for alice
    👤  Address: <ACCOUNT_ADDRESS>
    🗂️  Shelby Explorer: https://explorer.shelby.xyz/shelbynet/account/<ACCOUNT_ADDRESS>
    
    ✅  Retrieved 2 blobs
    ────────────────────────────────────────────
    📦  Stored Blobs
    ┌─────────────────────────────────────────────┬───────────────┬─────────────────────────┐
    │ Name                                        │ Size          │ Expires                 │
    ├─────────────────────────────────────────────┼───────────────┼─────────────────────────┤
    │ <FILE_NAME>                                 │ 494 B         │ Oct 11, 2025, 4:03 PM   │
    └─────────────────────────────────────────────┴───────────────┴─────────────────────────┘
    ✨  Done!

### Download the file
    
    
    shelby download files/filename.txt /Users/User/Desktop/filename.txt

* * *

## Troubleshooting

### `Insufficient Shelby tokens` Error

**Error:** `Insufficient Shelby tokens. Please fund your account with Shelby tokens to continue.`

**Solution:** This means you need ShelbyUSD tokens (not just Aptos tokens) to perform uploads. Visit the [Shelby faucet](/apis/faucet/shelbyusd) and fund your account with ShelbyUSD tokens.

[CLI ManagementManage your Shelby CLI installation](/tools/cli/management)

### On this page

InstallationQuick StartInitialize ShelbyList Contexts (Optional)List Accounts (optional)Fund AccountAptos TokensShelbyUSD TokensVerify Account BalanceUpload a fileVerify UploadDownload the fileTroubleshooting`Insufficient Shelby tokens` Error