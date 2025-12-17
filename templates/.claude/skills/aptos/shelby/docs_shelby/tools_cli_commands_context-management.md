---
url: https://docs.shelby.xyz/tools/cli/commands/context-management
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

# Context Management

Managing contexts for the Shelby CLI

The Shelby CLI uses contexts to manage different networks and their endpoints, this is useful for quickly switching between different networks without having to manually update the configuration file each time. By default, the configuration for the contexts are stored in the `~/.shelby/config.yaml` file.

## `shelby context create`

To create a new context, you can use the `shelby context create` command.

**Interactive Mode**
    
    
    shelby context create 

**Non-interactive Mode**
    
    
    shelby context create --name <CONTEXT_NAME> --shelby-rpc-endpoint <SHELBY_RPC_ENDPOINT> --aptos-network <APTOS_NETWORK>

### Options

Flag| Description  
---|---  
`--name <context-name>`| Label for the context.  
`--shelby-rpc-endpoint <url>`| Shelby RPC endpoint (`https://…`).  
`--shelby-indexer-endpoint <url>`| Shelby indexer endpoint (`https://…`).  
`--shelby-rpc-api-key <key>`| API key injected into Shelby RPC requests.  
`--shelby-indexer-api-key <key>`| API key injected into Shelby indexer requests.  
`--aptos-network <network>`| Aptos network name (`custom`, `local`, `shelbynet`).  
`--aptos-fullnode <url>`| Override the Aptos fullnode endpoint.  
`--aptos-indexer <url>`| Override the Aptos indexer endpoint. Required for blob listing.  
`--aptos-faucet <url>`| Override the Aptos faucet endpoint.  
`--aptos-pepper <url>`| Override the Aptos pepper endpoint.  
`--aptos-prover <url>`| Override the Aptos prover endpoint.  
`--aptos-api-key <key>`| API key injected into Aptos requests.  
  
## `shelby context list`

To list all contexts, you can use the `shelby context list` command.
    
    
    shelby context list

Example Output
    
    
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

## `shelby context use`

You can choose a context to use by default by using the `shelby context use` command. This context will automatically be used when running any command that requires a context.
    
    
    shelby context use <CONTEXT_NAME>

Example Output
    
    
    ✅ Now using context 'shelbynet'

## `shelby context update`

Update the configuration for a context in place.

**Interactive Mode**
    
    
    shelby context update <CONTEXT_NAME>

**Non-interactive Mode**
    
    
    shelby context update <CONTEXT_NAME> --shelby-rpc-endpoint <SHELBY_RPC_ENDPOINT> --aptos-network <APTOS_NETWORK> --aptos-indexer <INDEXER_URL>

### Options

Flag| Description  
---|---  
`--shelby-rpc-endpoint <url>`| Update the Shelby RPC endpoint.  
`--shelby-indexer-endpoint <url>`| Update the Shelby indexer endpoint.  
`--shelby-rpc-api-key <key>`| Update the Shelby RPC API key.  
`--shelby-indexer-api-key <key>`| Update the Shelby indexer API key.  
`--aptos-network <network>`| Update the Aptos network name.  
`--aptos-fullnode <url>`| Update the Aptos fullnode endpoint.  
`--aptos-indexer <url>`| Update the Aptos indexer endpoint.  
`--aptos-faucet <url>`| Update the Aptos faucet endpoint.  
`--aptos-pepper <url>`| Update the Aptos pepper endpoint.  
`--aptos-prover <url>`| Update the Aptos prover endpoint.  
`--aptos-api-key <key>`| Update the Aptos API key.  
  
## `shelby context delete`

Delete a context from the configuration file.
    
    
    shelby context delete <CONTEXT_NAME>

Example Output
    
    
    ✅ Context 'shelbynet' deleted successfully

The CLI refuses to delete the current default context. Run `shelby context use <other-context>` first if you need to remove it.

[Account ManagementManaging accounts for the Shelby CLI](/tools/cli/commands/account-management)[Uploads and DownloadsUpload and download files using the Shelby CLI](/tools/cli/commands/uploads-and-downloads)

### On this page

`shelby context create`Options`shelby context list``shelby context use``shelby context update`Options`shelby context delete`