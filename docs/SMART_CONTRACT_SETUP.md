# Smart Contract Setup Guide

> **Version:** 1.0.0 | **Last updated:** 2026-06-05
> **Audience:** Backend / smart contract developers onboarding to Q-LEAP

---

## Table of Contents

1. [Overview](#1-overview)
2. [Contract Architecture](#2-contract-architecture)
3. [QDay Testnet — Quick Start (Recommended)](#3-qday-testnet--quick-start-recommended)
4. [Deploying to a New Network](#4-deploying-to-a-new-network)
5. [Wiring Addresses into the Frontend](#5-wiring-addresses-into-the-frontend)
6. [Regenerating Contract Hooks](#6-regenerating-contract-hooks)
7. [Verifying the Setup](#7-verifying-the-setup)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Overview

Q-LEAP is a lending protocol built on the **QDay EVM network**. The frontend connects to a suite of smart contracts inherited from the Aave V2 / WETH Gateway pattern:

| Contract | Role |
|----------|------|
| **LendingPoolAddressProvider** | Registry — resolves all other contract addresses on-chain |
| **LendingPool** | Core — handles deposit, borrow, repay, withdraw, liquidation |
| **WETHGateway** | Wraps native QDAY ↔ WQDAY for protocol interactions |
| **UIPoolDataProviderV2** | Read aggregator — returns reserve and user data in one call |
| **UniswapV3RepayAdapter** | Flash-loan repay-with-collateral via swap |

The frontend **does not deploy contracts**. It reads contract addresses from `src/ui-config/`, calls them via wagmi/viem, and generates typed React hooks from ABIs stored in `src/abi/`.

For local development the simplest path is to point at the **QDay Testnet** contracts that are already live. Deploy to a new network only when you need an isolated environment.

---

## 2. Contract Architecture

```
LendingPoolAddressProvider  (registry)
        │
        ├── LendingPool            (core operations)
        ├── UIPoolDataProviderV2   (read aggregator)
        └── WETHGateway            (native token adapter)
                                   
UniswapV3RepayAdapter        (independent — references LendingPool directly)
ERC-20 tokens                (each reserve asset — deployed separately)
```

**Dependency order for deployment:**

1. Deploy `LendingPoolAddressProvider`
2. Deploy `LendingPool`, register it in the provider
3. Deploy `WETHGateway`, pass the `LendingPool` address to the constructor
4. Deploy `UIPoolDataProviderV2`, pass the `LendingPoolAddressProvider` address
5. Deploy `UniswapV3RepayAdapter`, pass the `LendingPool` address
6. Add reserve assets (ERC-20 tokens) via `LendingPool.initReserve`

---

## 3. QDay Testnet — Quick Start (Recommended)

All contracts are already deployed on QDay Testnet. For most development work you only need to configure your local environment to talk to them.

### 3.1 Add QDay Testnet to MetaMask

| Field | Value |
|-------|-------|
| Network name | QDay Testnet |
| RPC URL | `https://rpc.qday.info` |
| Chain ID | `44003` |
| Currency symbol | `QDAY` |
| Block Explorer | `https://explorer.qday.info` |

### 3.2 Get testnet QDAY

Request QDAY from the team faucet or ask a team member to transfer from a funded wallet.

### 3.3 Configure environment

```bash
cp .env.example .env.local
```

Set the following in `.env.local`:

```bash
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_LIQUIDATION=true
NEXT_PUBLIC_ENABLE_FORUM=true
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_AUTH_LOGIN_MESSAGE="Sign in to QLEAP Address: {address} Nonce: {nonce}"
```

### 3.4 Verify contract addresses are set

Open `src/ui-config/markets/index.ts` and confirm the `qdayTestnet` market has addresses filled in:

```typescript
// src/ui-config/markets/index.ts
[CustomMarket.qdayTestnet]: {
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: '0xf11d1dAc1abEdb5eEb32375154939AE7348c4227',
    LENDING_POOL:                  '0xc31F921Bcdb22A5B8D3A40088c7ac75F3Ac8EFD8',
    WETH_GATEWAY:                  '0x46602aFE192A0a65eA6F48f76CCA677e42172c43',
    REPAY_WITH_COLLATERAL_ADAPTER: '0x9A676e781A523b5d0C0e43731313A708CB607508',
  },
  ...
}
```

Open `src/ui-config/networks.ts` and confirm the testnet network config:

```typescript
// src/ui-config/networks.ts
[ChainId.qdayTestnet]: {
  uiPoolDataProvider: '0x72A2EB1C439983193dcc7A9B9C7C615eD52B0C75',
  baseUniswapAdapter: '0xf86Be05f535EC2d217E4c6116B3fa147ee5C05A1',
  baseAssetWrappedAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  ...
}
```

If both are filled in, your setup is complete. Run the app:

```bash
pnpm dev
```

---

## 4. Deploying to a New Network

Follow this section only if you need fresh contracts on a private chain, a local Hardhat/Foundry node, or QDay Mainnet.

### 4.1 Prerequisites

- Node.js ≥ 18, a package manager (`pnpm` / `yarn`)
- A funded deployer wallet private key
- RPC endpoint for the target network

### 4.2 Clone and configure the contracts repository

```bash
# The contracts repo is separate from this frontend repo.
# Ask the team lead for the repository URL.
git clone <contracts-repo-url>
cd <contracts-repo>
cp .env.example .env
```

Edit `.env` in the contracts repo:

```bash
DEPLOYER_PRIVATE_KEY=0x...        # funded deployer wallet
RPC_URL=https://rpc.qday.info      # target network RPC
CHAIN_ID=44003                     # target chain ID
WRAPPED_NATIVE_TOKEN=0x...         # WQDAY / WETH address on target network
```

### 4.3 Deploy contracts

```bash
# Install dependencies
pnpm install

# Run the full deployment sequence
pnpm deploy:all --network <network-name>
```

The deployment script outputs addresses for each contract. **Save all addresses — you will need them in step 5.**

Expected output:

```
LendingPoolAddressProvider deployed at: 0x...
LendingPool deployed at:                0x...
WETHGateway deployed at:               0x...
UIPoolDataProviderV2 deployed at:      0x...
UniswapV3RepayAdapter deployed at:     0x...
```

### 4.4 Initialize reserves

After deployment, add each reserve asset so users can deposit and borrow:

```bash
pnpm run add-reserve \
  --network <network-name> \
  --asset 0x<token-address> \
  --ltv 7500 \
  --liquidation-threshold 8000 \
  --liquidation-bonus 10500
```

Repeat for each reserve token.

### 4.5 Verify contracts on the block explorer

```bash
pnpm hardhat verify --network <network-name> <contract-address> <constructor-args...>
```

Verification is required before the team lead enables the market in the frontend config.

---

## 5. Wiring Addresses into the Frontend

After deployment (or when addresses change), update two files.

### 5.1 Market addresses — `src/ui-config/markets/index.ts`

Locate the `CustomMarket` entry for your network and fill in the deployed addresses:

```typescript
[CustomMarket.qday]: {  // or qdayTestnet
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: '0x<LendingPoolAddressProvider>',
    LENDING_POOL:                  '0x<LendingPool>',
    WETH_GATEWAY:                  '0x<WETHGateway>',
    REPAY_WITH_COLLATERAL_ADAPTER: '0x<UniswapV3RepayAdapter>',
  },
  ...
}
```

Use checksum addresses (mixed-case). Run `viem`'s `getAddress()` or the block explorer's copy button to get the correct form.

### 5.2 Network-level addresses — `src/ui-config/networks.ts`

Fill in the auxiliary contract addresses under the matching `ChainId`:

```typescript
[ChainId.qdayMainnet]: {  // or qdayTestnet
  walletBalanceProvider:    '0x<WalletBalanceProvider>',
  uiPoolDataProvider:       '0x<UIPoolDataProviderV2>',
  uiIncentiveDataProvider:  '0x<UIIncentiveDataProvider>',  // if deployed
  baseUniswapAdapter:       '0x<UniswapV3RepayAdapter>',
  baseAssetWrappedAddress:  '0x<WQDAY-token>',
  ...
}
```

### 5.3 Enable the market

The `ENABLE_TESTNET` runtime flag controls visibility. To show QDay Mainnet in the UI, update the Kubernetes ConfigMap (or `.env.local` for local development):

```bash
NEXT_PUBLIC_ENABLE_TESTNET=false  # show Mainnet only
# or
NEXT_PUBLIC_ENABLE_TESTNET=true   # show both
```

### 5.4 Update documentation

After updating addresses, also update the address table in [docs/NETWORKS_AND_ABIS.md](./NETWORKS_AND_ABIS.md) §1 so the record of record stays accurate.

---

## 6. Regenerating Contract Hooks

The frontend uses auto-generated typed React hooks from the ABIs in `src/abi/`. If any ABI changes, regenerate:

```bash
pnpm wagmi generate
```

Configuration lives in `wagmi.config.ts` at the project root. Output goes to `src/abi/generated.ts` — never edit this file manually.

**When to regenerate:**

- You updated a function signature in a deployed contract and updated the matching ABI file in `src/abi/`
- You added a new contract and ABI file
- After pulling changes that include ABI updates

Always commit the regenerated `src/abi/generated.ts` alongside the ABI change.

---

## 7. Verifying the Setup

### 7.1 Start the frontend

```bash
pnpm dev
```

### 7.2 Connect a wallet on QDay Testnet

Open `http://localhost:3000`, click **Connect Wallet**, select MetaMask, and switch to **QDay Testnet** when prompted.

### 7.3 Check reserve data loads

The dashboard fetches pool data every 15 seconds via `UIPoolDataProviderV2`. If reserve cards appear (showing APY, total supplied, etc.) the contract connection is working.

### 7.4 Attempt a deposit

1. Go to a reserve asset
2. Click **Supply**
3. Enter an amount, confirm the `approve` transaction, then confirm the `deposit` transaction
4. Verify your supplied balance appears in the dashboard

### 7.5 Check the browser console

No `CALL_EXCEPTION` or `contract not found` errors should appear. The most common causes are:

- Wrong contract address in `markets/index.ts`
- Wrong chain ID — wallet is on a different network than the frontend expects
- ABI mismatch — contract was upgraded but `src/abi/*.ts` was not updated

---

## 8. Troubleshooting

### "Contract not found" / `CALL_EXCEPTION`

The address in `src/ui-config/markets/index.ts` or `networks.ts` is wrong for the current chain. Double-check that the chain ID in the config matches the wallet's connected network.

### Reserve data does not appear

`UIPoolDataProviderV2` may not be deployed or its address in `networks.ts` is incorrect. Confirm the address on the block explorer and that at least one reserve has been initialized via `LendingPool.initReserve`.

### "Approve" succeeds but "deposit" reverts

The `LendingPool` is likely paused, or the reserve is frozen. Check with the team admin wallet. Protocol state can be verified on the block explorer by reading `LendingPool.paused()`.

### `pnpm wagmi generate` fails

Ensure `wagmi.config.ts` lists the correct paths to ABI files. If you added a new ABI file, add an entry to `wagmi.config.ts` before running generate.

### MetaMask does not show QDay Testnet

Add the network manually using the values in [§3.1](#31-add-qday-testnet-to-metamask). QDay is not in MetaMask's default network list.

### Native QDAY transactions revert via WETHGateway

The `WETHGateway` must be approved as a credit delegatee if borrowing native QDAY. Check `debtToken.borrowAllowance(user, wethGateway)` before calling `borrowETH`.
