# AgentVault

Policy-Based Smart Wallet for AI Agents on Monad.

AgentVault allows users to define hierarchical spending policies and delegate spending authority to AI agents while enforcing constraints on-chain.

---

## Problem

As AI agents become capable of making autonomous financial decisions, giving them direct access to a wallet creates significant risk.

A compromised or malfunctioning agent can:

* Spend unlimited funds
* Transfer money to arbitrary recipients
* Ignore user-defined budgets

AgentVault introduces a policy layer between the agent and the funds.

---

## Solution

AgentVault is a smart contract wallet that stores a hierarchy of spending policies.

Every spending request is validated against:

* Policy allocation limits
* Parent policy allocation limits
* Recipient whitelists
* Spending frequencies

The smart contract itself performs enforcement, meaning an AI agent cannot bypass the rules.

---

## Example

Family Budget

```text
Family Budget
├── Education
│   ├── Tuition
│   └── Books
├── Vacation
└── Rent
```

Example:

* Family Budget = 10000
* Education = 5000
* Tuition = 1000

A request for:

```text
Tuition -> 500
```

succeeds.

A request for:

```text
Tuition -> 1500
```

fails because the Tuition allocation is exceeded.

---

## Features

### Hierarchical Policies

Policies can contain child policies.

```text
Root
 ├── Child A
 ├── Child B
 └── Child C
```

---

### Allocation Enforcement

Policies marked as strict enforce spending caps.

```text
Allocation = 1000

Spend 500
Spend 500

Next spend = rejected
```

---

### Recipient Whitelisting

Policies can restrict transfers to approved addresses.

```text
Policy
 └── University Wallet
```

Any transfer to a non-whitelisted address is rejected.

---

### Agent-Based Spending

An AI agent can execute spending requests while policy validation remains fully on-chain.

---

## Architecture

```text
Frontend (Next.js)
        |
        v
AgentVaultClient
        |
        v
MetaMask
        |
        v
AgentVault Smart Contract
```

No backend is required.

All transactions are signed directly by the user through MetaMask.

---

## Smart Contract

Core contract:

```text
contracts/AgentVault.sol
```

The contract stores:

### PolicyNode

```solidity
struct PolicyNode {
    string name;
    bool strict;
    uint256 allocation;
    uint256 parentId;
    uint256[] children;
    Frequency frequency;
    uint256 frequencyLimit;
}
```

### PolicyUsage

```solidity
struct PolicyUsage {
    uint256 totalDisbursed;
    uint256 periodDisbursed;
    uint256 lastResetTimestamp;
}
```

---

## Deployment

Compile:

```bash
npx hardhat compile
```

Deploy:

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

Save the deployed contract address.

---

## Environment Variables

```env
NEXT_PUBLIC_AGENT_VAULT_ADDRESS=0x...
```

---

## Frontend

Start:

```bash
npm run dev
```

The UI supports:

### Create Root Policy

```json
{
  "name": "Family Budget",
  "allocation": "10000"
}
```

---

### Create Child Policy

```json
{
  "parentId": 0,
  "name": "Education",
  "allocation": "5000",
  "strict": true,
  "frequency": 0,
  "frequencyLimit": "0",
  "recipients": []
}
```

---

### Add Recipient

```json
{
  "policyId": 1,
  "recipient": "0x123..."
}
```

---

### Execute Spend

```json
{
  "policyId": 1,
  "recipient": "0x123...",
  "amount": "500"
}
```

---

## Policy Tree Visualization

The frontend reconstructs the hierarchy by:

1. Fetching all policies
2. Using `parentId`
3. Building a tree in memory
4. Rendering recursively

Root policies are identified using:

```solidity
type(uint256).max
```

as the parent identifier.

---

## Tech Stack

* Solidity
* Hardhat
* Viem
* MetaMask
* Next.js
* TypeScript
* Monad Testnet

---

## One-Line Pitch

**"Describe how an AI agent should handle money, and AgentVault enforces those rules directly on-chain."**
