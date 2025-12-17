---
name: aptos-move-prover
description: Expert on Move Prover formal verification - specification language (MSL), preconditions, postconditions, invariants, aborts_if, ensures, requires, modifies, emits, global invariants, schema patterns, quantifiers, helper functions, pragma directives, verification strategies, and debugging proofs. Triggers on keywords move prover, formal verification, spec, invariant, ensures, requires, aborts_if, precondition, postcondition, quantifier, schema, pragma
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---

# Move Prover Expert

## Purpose

Provide deep expertise on the Move Prover - a formal verification tool that mathematically proves correctness properties of Move smart contracts. The Prover uses the Move Specification Language (MSL) to express properties and verifies them using SMT solvers (Z3, CVC5).

## When to Use

Auto-invoke when users mention:
- **Move Prover** - formal verification, prove, verification
- **Specifications** - spec blocks, spec module, spec fun
- **Properties** - invariants, preconditions, postconditions
- **MSL Keywords** - ensures, requires, aborts_if, modifies, emits
- **Advanced** - quantifiers, schema, global invariants, pragma
- **Verification** - soundness, completeness, verification errors
- **Debugging** - proof failures, counterexamples, timeout

## Move Prover Overview

### What is the Move Prover?

The Move Prover is a **formal verification tool** that:
- Mathematically proves contract properties hold for ALL possible inputs
- Uses SMT (Satisfiability Modulo Theories) solvers
- Finds bugs that testing might miss
- Provides mathematical guarantees of correctness
- Generates counterexamples for failed proofs

### Why Use the Move Prover?

**Testing vs Verification:**
```move
// Testing: Checks specific inputs
#[test]
fun test_transfer() {
    transfer(alice, bob, 100);  // Only tests this one case
}

// Verification: Proves for ALL inputs
spec transfer {
    ensures sender_balance == old(sender_balance) - amount;
    ensures recipient_balance == old(recipient_balance) + amount;
    // Proven for ALL possible values of amount, sender, recipient!
}
```

**Benefits:**
- ✅ Catches edge cases testing misses
- ✅ Proves absence of integer overflow/underflow
- ✅ Guarantees invariants always hold
- ✅ Verifies access control is sound
- ✅ Documents intended behavior formally

## Specification Language (MSL) Basics

### Spec Blocks

```move
module 0x1::counter {
    struct Counter has key {
        value: u64
    }

    public fun increment(addr: address) acquires Counter {
        let counter = borrow_global_mut<Counter>(addr);
        counter.value = counter.value + 1;
    }

    spec increment {
        // Specification for increment function
        requires exists<Counter>(addr);
        ensures global<Counter>(addr).value == old(global<Counter>(addr).value) + 1;
    }
}
```

### Spec Module

```move
spec module {
    // Module-level specifications
    pragma verify = true;  // Enable verification for this module
    pragma aborts_if_is_strict;  // Require complete abort specifications
}
```

## Core Specification Constructs

### 1. Preconditions - `requires`

Conditions that must be true when function is called:

```move
public fun withdraw(account: &signer, amount: u64) acquires Balance {
    let addr = signer::address_of(account);
    let balance = borrow_global_mut<Balance>(addr);
    balance.coins = balance.coins - amount;
}

spec withdraw {
    requires exists<Balance>(signer::address_of(account));
    requires global<Balance>(signer::address_of(account)).coins >= amount;
    // Function only called when these conditions are true
}
```

**Multiple requires:**
```move
spec withdraw {
    requires exists<Balance>(addr);
    requires global<Balance>(addr).coins >= amount;
    requires amount > 0;
    requires amount <= MAX_WITHDRAW;
}
```

### 2. Postconditions - `ensures`

Conditions that must be true after function executes:

```move
public fun transfer(from: address, to: address, amount: u64) acquires Balance {
    let from_balance = borrow_global_mut<Balance>(from);
    from_balance.coins = from_balance.coins - amount;

    let to_balance = borrow_global_mut<Balance>(to);
    to_balance.coins = to_balance.coins + amount;
}

spec transfer {
    // Postconditions
    ensures global<Balance>(from).coins == old(global<Balance>(from).coins) - amount;
    ensures global<Balance>(to).coins == old(global<Balance>(to).coins) + amount;

    // Conservation of funds
    ensures global<Balance>(from).coins + global<Balance>(to).coins ==
            old(global<Balance>(from).coins + global<Balance>(to).coins);
}
```

### 3. Abort Conditions - `aborts_if`

Specify when function should abort:

```move
const ERROR_INSUFFICIENT_BALANCE: u64 = 1;
const ERROR_NOT_INITIALIZED: u64 = 2;

public fun withdraw(addr: address, amount: u64) acquires Balance {
    assert!(exists<Balance>(addr), ERROR_NOT_INITIALIZED);
    let balance = borrow_global_mut<Balance>(addr);
    assert!(balance.coins >= amount, ERROR_INSUFFICIENT_BALANCE);
    balance.coins = balance.coins - amount;
}

spec withdraw {
    aborts_if !exists<Balance>(addr) with ERROR_NOT_INITIALIZED;
    aborts_if global<Balance>(addr).coins < amount with ERROR_INSUFFICIENT_BALANCE;

    // These are the ONLY ways this function can abort
}
```

**Conditional aborts:**
```move
spec withdraw {
    // Only aborts if these conditions are met
    aborts_if !exists<Balance>(addr);
    aborts_if exists<Balance>(addr) && global<Balance>(addr).coins < amount;
}
```

### 4. Abort Specification Completeness

```move
spec module {
    pragma aborts_if_is_strict;
    // Now MUST specify all abort conditions
}

public fun transfer(from: address, to: address, amount: u64) acquires Balance {
    assert!(exists<Balance>(from), 1);
    assert!(exists<Balance>(to), 2);
    assert!(global<Balance>(from).coins >= amount, 3);

    // ... transfer logic
}

spec transfer {
    // Must list ALL abort conditions
    aborts_if !exists<Balance>(from);
    aborts_if !exists<Balance>(to);
    aborts_if global<Balance>(from).coins < amount;
    // Missing any condition = verification error
}
```

### 5. Modified Resources - `modifies`

Specify which global resources are modified:

```move
spec withdraw {
    modifies global<Balance>(addr);
    // Only Balance at addr is modified, nothing else
}

spec transfer {
    modifies global<Balance>(from);
    modifies global<Balance>(to);
    // Only these two resources are modified
}
```

### 6. Event Emission - `emits`

Specify events that should be emitted:

```move
#[event]
struct TransferEvent has drop, store {
    from: address,
    to: address,
    amount: u64,
}

public fun transfer(from: address, to: address, amount: u64) {
    // ... transfer logic
    event::emit(TransferEvent { from, to, amount });
}

spec transfer {
    emits TransferEvent {
        from: from,
        to: to,
        amount: amount
    } to @my_module;
}
```

## Advanced Features

### The `old()` Operator

Access values from before function execution:

```move
spec increment {
    ensures global<Counter>(addr).value == old(global<Counter>(addr).value) + 1;
    //                                      ^^^ value before function ran
}

spec swap {
    ensures a == old(b);
    ensures b == old(a);
}
```

### Global State Access

```move
spec withdraw {
    // Access global state
    let balance = global<Balance>(addr);
    let initial_coins = old(global<Balance>(addr).coins);

    ensures balance.coins == initial_coins - amount;
}
```

### Let Bindings in Specs

```move
spec transfer {
    let from_balance = global<Balance>(from);
    let to_balance = global<Balance>(to);
    let from_initial = old(from_balance.coins);
    let to_initial = old(to_balance.coins);

    ensures from_balance.coins == from_initial - amount;
    ensures to_balance.coins == to_initial + amount;
}
```

### Conditional Ensures

```move
spec withdraw {
    ensures result == true ==> global<Balance>(addr).coins == old(global<Balance>(addr).coins) - amount;
    ensures result == false ==> global<Balance>(addr).coins == old(global<Balance>(addr).coins);
}
```

## Quantifiers

### Universal Quantification - `forall`

Prove property holds for ALL values:

```move
spec module {
    // For all addresses, if Balance exists, coins >= 0
    invariant forall addr: address:
        exists<Balance>(addr) ==> global<Balance>(addr).coins >= 0;
}

spec transfer {
    // Conservation: total supply unchanged
    ensures forall addr: address where addr != from && addr != to:
        global<Balance>(addr).coins == old(global<Balance>(addr).coins);
}
```

### Existential Quantification - `exists`

Prove property holds for AT LEAST ONE value:

```move
spec module {
    // There exists at least one admin
    invariant exists addr: address:
        exists<AdminCap>(addr);
}
```

### Range Quantifiers

```move
spec module {
    // For all indices in vector, value is positive
    invariant forall i in 0..len(balances):
        balances[i] > 0;
}

spec sum_vector {
    ensures result == sum(0..len(v), |i| v[i]);
}
```

## Global Invariants

### Module Invariants

Properties that hold for entire module:

```move
spec module {
    // Global supply never exceeds max
    invariant [global]
        forall addr: address:
            exists<Supply>(addr) ==>
            global<Supply>(addr).total <= MAX_SUPPLY;

    // Conservation of total supply
    invariant [global]
        sum_of_balances() == global<TotalSupply>(@admin).value;
}
```

### Struct Invariants

Properties that always hold for a struct:

```move
struct Balance has key {
    coins: u64,
    locked: u64,
}

spec Balance {
    // Available coins >= locked coins
    invariant coins >= locked;

    // Locked amount is multiple of lock unit
    invariant locked % LOCK_UNIT == 0;
}
```

### Update Invariants

Properties about state changes:

```move
spec module {
    // Balance can only increase or decrease, never become negative
    invariant update [global]
        forall addr: address:
            old(exists<Balance>(addr)) ==>
            exists<Balance>(addr) &&
            global<Balance>(addr).coins <= old(global<Balance>(addr).coins) + MAX_DEPOSIT;
}
```

## Schema - Reusable Specifications

### Defining Schema

```move
spec schema BalanceExists {
    addr: address;
    requires exists<Balance>(addr);
}

spec schema SufficientBalance {
    addr: address;
    amount: u64;
    requires global<Balance>(addr).coins >= amount;
}

spec schema BalanceNotChanged {
    addr: address;
    ensures global<Balance>(addr).coins == old(global<Balance>(addr).coins);
}
```

### Using Schema

```move
spec withdraw {
    include BalanceExists;
    include SufficientBalance;
}

spec deposit {
    include BalanceExists { addr: recipient };
}

// Apply to multiple functions
spec withdraw, transfer, burn {
    include BalanceExists;
}
```

### Schema with Variables

```move
spec schema TransferEnsures {
    from: address;
    to: address;
    amount: u64;

    ensures global<Balance>(from).coins == old(global<Balance>(from).coins) - amount;
    ensures global<Balance>(to).coins == old(global<Balance>(to).coins) + amount;
}

spec transfer {
    include TransferEnsures;
}
```

### Schema Composition

```move
spec schema ValidTransfer {
    from: address;
    to: address;
    amount: u64;

    include BalanceExists { addr: from };
    include BalanceExists { addr: to };
    include SufficientBalance { addr: from };
}

spec transfer {
    include ValidTransfer;
    include TransferEnsures;
}
```

## Helper Functions

### Spec Functions

Define helper functions for specifications:

```move
spec module {
    // Sum of all balances
    fun sum_of_balances(): u64 {
        sum(all_addresses(), |addr| {
            if (exists<Balance>(addr)) {
                global<Balance>(addr).coins
            } else {
                0
            }
        })
    }

    // Check if address is admin
    fun is_admin(addr: address): bool {
        exists<AdminCap>(addr)
    }

    // Get total supply
    fun total_supply(): u64 {
        global<Supply>(@admin).total
    }
}

spec transfer {
    // Conservation using helper function
    ensures sum_of_balances() == old(sum_of_balances());
}
```

### Spec-Only Functions

Functions only used in specifications:

```move
spec module {
    fun balance_of(addr: address): u64 {
        if (exists<Balance>(addr)) {
            global<Balance>(addr).coins
        } else {
            0
        }
    }
}

spec transfer {
    ensures balance_of(from) == old(balance_of(from)) - amount;
    ensures balance_of(to) == old(balance_of(to)) + amount;
}
```

## Pragma Directives

### Verification Control

```move
spec module {
    // Enable/disable verification for module
    pragma verify = true;

    // Timeout for each function (seconds)
    pragma timeout = 60;

    // Random seed for solver
    pragma random_seed = 123;

    // Require strict abort specs
    pragma aborts_if_is_strict;

    // Require partial abort specs (default)
    pragma aborts_if_is_partial;
}
```

### Function-Specific Pragmas

```move
spec complex_function {
    pragma verify = false;  // Skip verification of this function
}

spec timeout_function {
    pragma timeout = 120;  // Increase timeout to 2 minutes
}

spec opaque_function {
    pragma opaque;  // Don't inline this function in proofs
}
```

### Solver Configuration

```move
spec module {
    // Use specific SMT solver
    pragma solver = "z3";  // or "cvc5"

    // Increase memory limit
    pragma memory_limit = 16384;  // MB

    // Verification condition generation
    pragma verify_duration_estimate = 300;
}
```

## Advanced Patterns

### Pattern 1: Access Control Verification

```move
struct AdminCap has key {}

public fun admin_only_function(admin: &signer) acquires AdminCap {
    let admin_addr = signer::address_of(admin);
    assert!(exists<AdminCap>(admin_addr), ERROR_NOT_ADMIN);
    // ... admin operations
}

spec admin_only_function {
    // Precondition: caller must have AdminCap
    requires exists<AdminCap>(signer::address_of(admin));

    // Abort condition
    aborts_if !exists<AdminCap>(signer::address_of(admin));
}

spec module {
    // Global invariant: only one admin exists
    invariant [global]
        forall addr1: address, addr2: address:
            exists<AdminCap>(addr1) && exists<AdminCap>(addr2) ==> addr1 == addr2;
}
```

### Pattern 2: Supply Conservation

```move
spec module {
    // Helper: sum of all balances
    fun total_balance(): u64 {
        sum(all_addresses(), |addr| {
            if (exists<Balance>(addr)) {
                global<Balance>(addr).coins
            } else {
                0
            }
        })
    }

    // Invariant: total balance equals total supply
    invariant [global]
        total_balance() == global<TotalSupply>(@deployer).value;
}

spec mint {
    // Minting increases total supply
    ensures global<TotalSupply>(@deployer).value ==
            old(global<TotalSupply>(@deployer).value) + amount;
}

spec burn {
    // Burning decreases total supply
    ensures global<TotalSupply>(@deployer).value ==
            old(global<TotalSupply>(@deployer).value) - amount;
}

spec transfer {
    // Transfer doesn't change total supply
    ensures global<TotalSupply>(@deployer).value ==
            old(global<TotalSupply>(@deployer).value);
}
```

### Pattern 3: Integer Overflow Prevention

```move
spec add_balance {
    // Precondition: addition won't overflow
    requires global<Balance>(addr).coins + amount <= MAX_U64;

    // Postcondition: new balance is sum
    ensures global<Balance>(addr).coins == old(global<Balance>(addr).coins) + amount;

    // Won't abort due to overflow (arithmetic is checked in Move)
    aborts_if false;  // No custom aborts
}
```

### Pattern 4: Reentrancy Safety (N/A in Move)

```move
// Move has no reentrancy issues, but can verify atomicity
spec withdraw_and_call {
    // State changes are atomic
    ensures global<Balance>(addr).coins == old(global<Balance>(addr).coins) - amount;

    // No intermediate states observable
    modifies global<Balance>(addr);
}
```

### Pattern 5: Temporal Properties

```move
spec module {
    // Once frozen, always frozen
    invariant update [global]
        forall addr: address:
            old(exists<Frozen>(addr)) ==> exists<Frozen>(addr);

    // Can only freeze, never unfreeze
    invariant update [global]
        forall addr: address:
            !old(exists<Frozen>(addr)) || exists<Frozen>(addr);
}
```

## Complex Specification Examples

### Example 1: Escrow Contract

```move
struct Escrow has key {
    amount: u64,
    sender: address,
    recipient: address,
    deadline: u64,
    released: bool,
}

spec module {
    // Escrow invariants
    invariant [global]
        forall addr: address:
            exists<Escrow>(addr) ==>
            (global<Escrow>(addr).amount > 0 &&
             global<Escrow>(addr).deadline > 0);
}

public fun create_escrow(
    sender: &signer,
    recipient: address,
    amount: u64,
    deadline: u64
) {
    // ...
}

spec create_escrow {
    requires amount > 0;
    requires deadline > timestamp::now_seconds();
    requires !exists<Escrow>(signer::address_of(sender));

    ensures exists<Escrow>(signer::address_of(sender));
    ensures global<Escrow>(signer::address_of(sender)).amount == amount;
    ensures global<Escrow>(signer::address_of(sender)).recipient == recipient;
    ensures global<Escrow>(signer::address_of(sender)).deadline == deadline;
    ensures global<Escrow>(signer::address_of(sender)).released == false;
}

public fun release(escrow_addr: address) acquires Escrow {
    let escrow = borrow_global_mut<Escrow>(escrow_addr);
    assert!(timestamp::now_seconds() >= escrow.deadline, ERROR_NOT_EXPIRED);
    assert!(!escrow.released, ERROR_ALREADY_RELEASED);

    escrow.released = true;
    // Transfer amount to recipient
}

spec release {
    let escrow = global<Escrow>(escrow_addr);

    requires exists<Escrow>(escrow_addr);
    requires timestamp::now_seconds() >= escrow.deadline;
    requires !escrow.released;

    ensures global<Escrow>(escrow_addr).released == true;

    // All other fields unchanged
    ensures global<Escrow>(escrow_addr).amount == old(escrow.amount);
    ensures global<Escrow>(escrow_addr).sender == old(escrow.sender);
    ensures global<Escrow>(escrow_addr).recipient == old(escrow.recipient);
    ensures global<Escrow>(escrow_addr).deadline == old(escrow.deadline);
}
```

### Example 2: Multi-Sig Wallet

```move
struct MultiSig has key {
    owners: vector<address>,
    threshold: u64,
    proposal_count: u64,
}

struct Proposal has key {
    approvals: u64,
    executed: bool,
}

spec module {
    // Multi-sig invariants
    invariant [global]
        forall addr: address:
            exists<MultiSig>(addr) ==>
            (global<MultiSig>(addr).threshold > 0 &&
             global<MultiSig>(addr).threshold <= vector::length(&global<MultiSig>(addr).owners));
}

public fun approve_proposal(
    owner: &signer,
    wallet_addr: address,
    proposal_id: u64
) acquires MultiSig, Proposal {
    // ...
}

spec approve_proposal {
    let multisig = global<MultiSig>(wallet_addr);
    let owner_addr = signer::address_of(owner);

    // Preconditions
    requires exists<MultiSig>(wallet_addr);
    requires exists<Proposal>(proposal_id);
    requires vector::contains(&multisig.owners, &owner_addr);
    requires !global<Proposal>(proposal_id).executed;

    // Postcondition: approvals increased
    ensures global<Proposal>(proposal_id).approvals ==
            old(global<Proposal>(proposal_id).approvals) + 1;

    // Proposal executed when threshold reached
    ensures global<Proposal>(proposal_id).approvals >= multisig.threshold ==>
            global<Proposal>(proposal_id).executed;
}
```

### Example 3: Staking with Rewards

```move
struct Stake has key {
    amount: u64,
    start_time: u64,
    reward_rate: u64,
}

spec module {
    // Helper: calculate expected rewards
    fun calculate_rewards(stake: Stake, current_time: u64): u64 {
        let duration = current_time - stake.start_time;
        (stake.amount * stake.reward_rate * duration) / PRECISION
    }
}

public fun claim_rewards(staker: &signer) acquires Stake {
    let addr = signer::address_of(staker);
    let stake = borrow_global<Stake>(addr);

    let current_time = timestamp::now_seconds();
    let rewards = calculate_rewards(stake, current_time);

    // Transfer rewards
}

spec claim_rewards {
    let addr = signer::address_of(staker);
    let stake = global<Stake>(addr);
    let current_time = timestamp::now_seconds();

    requires exists<Stake>(addr);
    requires current_time >= stake.start_time;

    // Rewards calculated correctly
    ensures result == calculate_rewards(stake, current_time);

    // Stake amount unchanged
    ensures global<Stake>(addr).amount == old(stake.amount);
}
```

## Debugging Verification Failures

### Reading Error Messages

```
error: post-condition does not hold
   ┌── example.move:15:9 ───
   │
15 │         ensures global<Balance>(addr).coins == old(global<Balance>(addr).coins) + amount;
   │         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   │
   = Model:
     addr = 0x1
     amount = MAX_U64
     old(global<Balance>(addr).coins) = 1
     Result: overflow in addition
```

**Solution:** Add precondition to prevent overflow
```move
spec deposit {
    requires global<Balance>(addr).coins + amount <= MAX_U64;
    ensures global<Balance>(addr).coins == old(global<Balance>(addr).coins) + amount;
}
```

### Counterexamples

```move
spec transfer {
    ensures global<Balance>(from).coins >= 0;
}

// Prover output:
// Counterexample:
//   from = 0x1
//   to = 0x2
//   amount = 100
//   old(global<Balance>(from).coins) = 50
//   Result: assertion failure (underflow)
```

**Solution:** Add precondition
```move
spec transfer {
    requires global<Balance>(from).coins >= amount;
    ensures global<Balance>(from).coins >= 0;
}
```

### Common Issues

**1. Missing preconditions**
```move
// ❌ Fails: no precondition about existence
spec withdraw {
    ensures global<Balance>(addr).coins == old(global<Balance>(addr).coins) - amount;
}

// ✅ Fixed
spec withdraw {
    requires exists<Balance>(addr);
    ensures global<Balance>(addr).coins == old(global<Balance>(addr).coins) - amount;
}
```

**2. Incomplete abort specifications**
```move
spec module {
    pragma aborts_if_is_strict;
}

// ❌ Fails: missing abort condition
spec transfer {
    aborts_if !exists<Balance>(from);
    // Missing: aborts_if !exists<Balance>(to);
    // Missing: aborts_if global<Balance>(from).coins < amount;
}

// ✅ Fixed
spec transfer {
    aborts_if !exists<Balance>(from);
    aborts_if !exists<Balance>(to);
    aborts_if global<Balance>(from).coins < amount;
}
```

**3. Timeouts**
```move
// Complex verification may timeout
spec complex_function {
    pragma timeout = 300;  // Increase to 5 minutes
}

// Or simplify specification
spec complex_function {
    pragma verify = false;  // Skip for now
}
```

## Running the Move Prover

### Basic Commands

```bash
# Verify all modules in package
aptos move prove

# Verify specific module
aptos move prove --filter MyModule

# Verify with verbose output
aptos move prove --verbose

# Skip timeout warnings
aptos move prove --skip-timeout

# Generate coverage report
aptos move prove --coverage
```

### Configuration File (Move.toml)

```toml
[prover]
# Enable/disable prover
enabled = true

# Timeout per function (seconds)
timeout = 60

# SMT solver
solver = "z3"

# Memory limit (MB)
memory_limit = 8192

# Random seed
random_seed = 42

# Verbosity level (0-4)
verbosity_level = 1
```

### CI/CD Integration

```yaml
# .github/workflows/verify.yml
name: Move Prover

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Aptos CLI
        run: |
          curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

      - name: Install Move Prover
        run: |
          aptos move setup-prover

      - name: Run Move Prover
        run: |
          aptos move prove --verbose
```

## Best Practices

### ✅ Do

- **Start simple** - Add basic specs first, then refine
- **Use schema** - Reuse common specifications
- **Write helper functions** - Keep specs readable
- **Specify aborts completely** - Use `pragma aborts_if_is_strict`
- **Verify invariants** - Especially for critical properties
- **Document with specs** - Specs are executable documentation
- **Run in CI** - Catch regressions early
- **Profile verification** - Identify slow functions

### ❌ Avoid

- **Over-specifying** - Don't prove trivial properties
- **Ignoring timeouts** - Investigate and fix, don't skip
- **Skipping aborts** - Incomplete specs miss bugs
- **Complex quantifiers** - May cause timeouts
- **Verifying everything** - Focus on critical functions
- **Assuming soundness** - Prover can have false positives

## Specification Checklist

For each critical function:

- [ ] Preconditions (`requires`) - What must be true before?
- [ ] Postconditions (`ensures`) - What must be true after?
- [ ] Abort conditions (`aborts_if`) - When should it fail?
- [ ] Modified resources (`modifies`) - What state changes?
- [ ] Events (`emits`) - What events are emitted?
- [ ] Invariants - What always holds?
- [ ] Conservation laws - Are resources conserved?
- [ ] Access control - Is authorization correct?
- [ ] Integer overflow - Are bounds checked?
- [ ] Temporal properties - Do state transitions make sense?

## Response Style

- **Formal but practical** - Explain verification benefits clearly
- **Example-driven** - Show specs with corresponding code
- **Error-aware** - Help debug verification failures
- **Pattern-focused** - Teach reusable specification patterns
- **Tool-savvy** - Reference prover commands and pragmas

## Follow-up Suggestions

After helping with Move Prover, suggest:
- Start with simple function specs
- Add module-level invariants
- Create schema for common patterns
- Set up CI/CD verification
- Profile and optimize slow verifications
- Document critical properties formally
- Review Aptos framework specs as examples
