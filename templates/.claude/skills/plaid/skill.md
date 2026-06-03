---
name: plaid
description: Expert guidance for Plaid banking API integration — Link flow, Auth (routing/account numbers for ACH), Transactions (sync/categorize), Identity (KYC/account holder), Accounts (balance/types), and webhook handling. Invoke when user mentions Plaid, bank connections, ACH verification, account ownership, transaction history, KYC, or Plaid webhooks. Example queries — "connect a bank account with Plaid", "retrieve ACH routing numbers", "sync transactions since last webhook", "verify user identity via Plaid".
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, WebFetch
model: sonnet
---

# Plaid Integration Expert

Guide Plaid Link, Auth, Transactions, Identity, Accounts, balances, and webhook integrations with consent and token-safety checks.

## Fast Workflow

1. Identify the product flow: account linking, ACH auth, transaction sync, identity verification, balances, or webhook handling.
2. Inspect the existing Link token endpoint, public token exchange, item/access-token storage, product list, and webhook receiver before editing.
3. Keep Plaid secrets and access tokens server-side, store tokens encrypted where appropriate, and avoid logging account or identity data.
4. Use sandbox/development/production environments deliberately; do not mix tokens or assumptions across them.
5. For current API details, read local docs if present or official Plaid docs before changing banking-data behavior.

## Detailed Reference

Read `references/full-guide.md` when you need Link setup, token exchange, Auth, Transactions sync, Identity, Accounts, balances, webhooks, environments, and security checklists. Keep this entrypoint loaded first, then load only the reference sections relevant to the task.

## Documentation

Use official Plaid docs when local docs are absent.

## Safety Checks

- Do not invent product limits, API behavior, prices, compliance requirements, or security guarantees.
- Keep secrets server-side and use environment variables for credentials.
- Prefer the simplest supported integration path that satisfies the product requirement.
