# Blockchain & Smart Contract Specification

> **Version:** 1.0.0 | **Last updated:** 2026-06-02
> **Scope:** Q-LEAP lending protocol — QDay EVM network

---

## Table of Contents

1. [Contract Address Registry](#1-contract-address-registry)
2. [ABI & SDK Directory](#2-abi--sdk-directory)
3. [Supported EVM Chains](#3-supported-evm-chains)
4. [Contract Interaction Patterns](#4-contract-interaction-patterns)
5. [Admin & Governance Notes](#5-admin--governance-notes)

---

## 1. Contract Address Registry

### QDay Mainnet (Chain ID: 44001)

> **⚠ Status: Contract addresses not yet set. This market is disabled until addresses are verified and filled in.**

| Contract | Address |
|----------|---------|
| LendingPoolAddressProvider | — |
| LendingPool | — |
| WETHGateway | — |
| UIPoolDataProviderV2 | — |
| UniswapV3RepayAdapter | — |

**Network details:**

```
RPC URL:          https://rpc.qday.io
Chain ID:         44001
Native currency:  QDAY (18 decimals)
Block Explorer:   https://explorer.qday.io
```

#### How to configure Mainnet addresses

Once the contracts are deployed and verified on [explorer.qday.io](https://explorer.qday.io), follow these steps:

**Step 1 — Verify each contract on the block explorer**

Before filling in any address, confirm the contract is verified and the ABI matches the expected interface.

**Step 2 — Update the market config**

Edit `src/ui-config/markets/index.ts`, `CustomMarket.qday` entry:

```typescript
addresses: {
  LENDING_POOL_ADDRESS_PROVIDER: '0x...', // checksum address
  LENDING_POOL: '0x...',
  WETH_GATEWAY: '0x...',
  // Add REPAY_WITH_COLLATERAL_ADAPTER if UniswapV3RepayAdapter is deployed
},
```

**Step 3 — Update this document**

Replace the `—` placeholders in the table above with the confirmed addresses.

**Step 4 — Update the diagram**

In `docs/ARCHITECTURE.md` §1, remove the `⚠ Contract addresses TBD` note from the Mainnet box.

**Step 5 — Re-enable the market in the UI**

The `ENABLE_TESTNET` ConfigMap flag controls which networks are shown. Once Mainnet is ready, update the Kubernetes ConfigMap to reflect the production state.

---

### QDay Testnet (Chain ID: 44003)

| Contract | Address |
|----------|---------|
| LendingPoolAddressProvider | `0xf11d1dAc1abEdb5eEb32375154939AE7348c4227` |
| LendingPool | `0xc31F921Bcdb22A5B8D3A40088c7ac75F3Ac8EFD8` |
| WETHGateway | `0x46602aFE192A0a65eA6F48f76CCA677e42172c43` |
| RepayWithCollateralAdapter | `0x9A676e781A523b5d0C0e43731313A708CB607508` |
| UIPoolDataProviderV2 | TBD — derive from AddressProvider |

**Network details:**

```
RPC URL:          https://rpc.qday.info
Chain ID:         44003
Native currency:  QDAY (18 decimals)
Block Explorer:   https://explorer.qday.info
```

### Other Supported Chains (Wallet Connectivity Only)

The frontend supports connecting wallets on these chains, but the Q-LEAP lending protocol is only deployed on QDay networks. Users are prompted to switch to QDay when they attempt protocol interactions from another chain.

| Chain | Chain ID |
|-------|----------|
| Ethereum Mainnet | 1 |
| Sepolia Testnet | 11155111 |
| BNB Smart Chain | 56 |
| Arbitrum One | 42161 |
| Polygon | 137 |

---

## 2. ABI & SDK Directory

### ABI Files

All ABIs live in `src/abi/` as typed TypeScript constants.

| File | Contract | Purpose |
|------|----------|---------|
| `erc20-abi.ts` | ERC-20 Token | `approve`, `allowance`, `balanceOf`, `transfer` |
| `lending-pool-abi.ts` | LendingPool | `deposit`, `borrow`, `repay`, `withdraw`, `liquidationCall` |
| `ui-pool-data-provider-v2-abi.ts` | UIPoolDataProviderV2 | `getReservesData`, `getUserReservesData` — read-only aggregator |
| `weth-gateway-abi.ts` | WETHGateway | Native QDAY ↔ WQDAY wrapping for protocol interactions |
| `uniswap-v3-repay-adapter-abi.ts` | UniswapV3RepayAdapter | Flash-loan-based repay-with-collateral |
| `debt-token-abi.ts` | VariableDebtToken | `approveDelegation` for credit delegation |
| `generated.ts` | All of the above | **Auto-generated typed React hooks** — do not edit manually |

### Code Generation

Typed React hooks are generated from ABIs using the wagmi CLI:

```bash
# Regenerate after ABI changes
pnpm wagmi generate
```

Configuration is in `wagmi.config.ts` at the project root. The output goes to `src/abi/generated.ts`. Always regenerate and commit this file whenever an ABI is updated.

### Key Libraries

| Library | Version | Role |
|---------|---------|------|
| `wagmi` | ^3.5.0 | React hooks for wallet + contract interactions |
| `viem` | ^2.47.0 | Low-level EVM types, encoding, RPC calls |
| `ethers` | ^6.16.0 | Supplemental utilities (BigNumber formatting) |
| `@metamask/sdk` | ~0.33.1 | MetaMask mobile deep-link / QR fallback connector |

### Wallet Connectors

Configured in `src/lib/wagmi-config.ts`:

| Connector | Method | Notes |
|-----------|--------|-------|
| EIP-6963 injected | `rdns: 'io.metamask'` | Primary desktop connector |
| MetaMask SDK | QR code / deep link | Mobile and non-injected fallback |
| WalletConnect | — | Disabled (commented out) |

---

## 3. Supported EVM Chains

Chains are defined in `src/constants/wagmi.ts` and exported as `EVM_CHAINS`.

```typescript
export const qdayMainnet = defineChain({
  id: 44001,
  name: 'QDay Mainnet',
  nativeCurrency: { name: 'QDay', symbol: 'QDAY', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.qday.io'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://explorer.qday.io' } },
});

export const qdayTestnet = defineChain({
  id: 44003,
  name: 'QDay Testnet',
  nativeCurrency: { name: 'QDay', symbol: 'QDAY', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.qday.info'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://explorer.qday.info' } },
});
```

Testnet availability in the UI is controlled by the `ENABLE_TESTNET` runtime flag (Kubernetes ConfigMap).

---

## 4. Contract Interaction Patterns

### Read — Pool Data (every 15 seconds)

```typescript
// src/providers/static-pool-data-provider.tsx
useReadContracts({
  contracts: [
    { address: uiPoolDataProvider, abi: UiPoolDataProviderV2ABI, functionName: 'getReservesData' },
    { address: uiPoolDataProvider, abi: UiPoolDataProviderV2ABI, functionName: 'getUserReservesData' },
  ],
  query: { refetchInterval: 15_000 },
});
```

### Write — Deposit

```typescript
// Approve first, then deposit
await writeContractAsync({ abi: ERC20_ABI, functionName: 'approve', args: [lendingPool, amount] });
await writeContractAsync({ abi: LENDING_POOL_ABI, functionName: 'deposit', args: [asset, amount, account, 0] });
```

### Write — Native Token (QDAY) via WETHGateway

```typescript
// WETHGateway wraps native QDAY → WQDAY before depositing
await writeContractAsync({
  abi: WETH_GATEWAY_ABI,
  functionName: 'depositETH',
  args: [lendingPool, account, 0],
  value: amount,  // msg.value
});
```

### Math — RAY Values

All interest rates and indexes returned from contracts use RAY notation (27 decimals). Use `src/math-utils/ray-math.ts` for all arithmetic:

```typescript
import { rayMul, rayDiv, wadToRay } from '@/math-utils/ray-math';
```

---

## 5. Admin & Governance Notes

### LendingPool Admin Functions

The `LendingPoolAddressProvider` owner controls:
- Adding/removing reserves
- Setting reserve parameters (LTV, liquidation threshold, fees)
- Pausing the protocol
- Upgrading implementation contracts

**Current admin wallet:** Not documented here — store separately in a secure vault.

### No Multi-Sig Configured

As of this documentation, no multi-sig (e.g., Safe) has been configured for protocol governance. This is a known risk — single-key admin means no threshold protection. Recommended future action: migrate to a 2-of-3 Safe before Mainnet launch.

### Feature Flags (Runtime)

Feature availability is controlled at the infrastructure level via Kubernetes ConfigMap, not smart contracts:

| Flag | Effect |
|------|--------|
| `ENABLE_TESTNET=true` | Shows QDay Testnet in network selector |
| `ENABLE_FORUM=true` | Enables forum module in navigation |
| `ENABLE_LIQUIDATION=true` | Enables liquidation dashboard |

These flags are read at runtime from the `/api/config` Next.js route, which reads pod environment variables injected by the ConfigMap.
