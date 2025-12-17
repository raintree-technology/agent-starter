---
url: https://docs.shelby.xyz/tools/ai-llms
fetched: 2025-11-16
---

[](/)

Search

`⌘``K`

Tools

Developer tooling

CLI

[Shelby Explorer](/tools/explorer)

Wallet Setup

[AI & LLM Integration](/tools/ai-llms)

[](https://github.com/shelby)

# AI & LLM Integration

Access Shelby documentation for AI agents and LLMs

Shelby documentation provides two methods for programmatic access optimized for AI agents and LLMs.

## Full Documentation Endpoint

Get all documentation in a single plain text file.
    
    
    curl https://docs.shelby.xyz/llms-full.txt

The response includes all pages formatted as:
    
    
    # Page Title (URL)
    
    Page content in markdown...
    
    # Next Page Title (URL)
    
    Next page content...

## Markdown Headers for Individual Pages

Request any documentation page as markdown by setting the `Accept` header to `text/markdown`.
    
    
    curl -H "Accept: text/markdown" https://docs.shelby.xyz/docs/quickstart

This works for all documentation sections:

  * `/docs/*` \- Core documentation
  * `/apis/*` \- API references
  * `/protocol/*` \- Protocol specifications
  * `/examples/*` \- Code examples
  * `/sdks/*` \- SDK documentation



[Add Shelby Devnet to PetraStep-by-step guide to configure Petra wallet for the Shelby network](/tools/wallets/petra-setup)

### On this page

Full Documentation EndpointMarkdown Headers for Individual Pages