---
url: https://docs.shelby.xyz/tools/cli/commands/commitment
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

# Commitment

Commitment command in Shelby CLI

## `shelby commitment`

Generate blob and chunkset commitments for a local file without uploading. Useful for debugging, introspection, or pre-computing metadata. The command runs entirely offline but requires the CLI to have access to the Clay erasure-code WASM artifacts (the published package includes them by default).

Note that the commitments can also be saved to local files during upload with the `--output-commitments` option.
    
    
    shelby commitment [options]

### Options

None

#### Example
    
    
    shelby commitment README.md out.json

Output:
    
    
    $ jq . out.json  | head
    {
      "schema_version": "1.3",
      "raw_data_size": 1775,
      "blob_merkle_root": "0xecc399a8cb4a198b29f4b9c3fb3b2d0636a53be3298cd8a5c598153c48a90f07",
      "chunkset_commitments": [
        {
          "chunkset_root": "0x4cc2bb1793de54665388b00c31580d3fa2df1e121a6b8d8d67ea9be2b911638c",
          "chunk_commitments": [
            "0x01cf2463b8f772d77e93876e9f4ec99d13a3b513b2d073d60f198575ad3fe9d1",
            "0x30e14955ebf1352266dc2ff8067e68104607e750abb9d3b36582b8af909fcb58",

[Faucetshelby faucet CLI command](/tools/cli/commands/faucet)[Shelby ExplorerExplore the Shelby network, view blobs, and track network activity](/tools/explorer)

### On this page

`shelby commitment`OptionsExample