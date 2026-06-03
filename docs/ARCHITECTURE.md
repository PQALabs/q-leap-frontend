# Q-LEAP Technical Architecture & System Specification

> **Version:** 1.0.0 | **Last updated:** 2026-06-02
> **Scope:** Frontend (`q-leap-frontend`) — Next.js 15 + Wagmi + QDay EVM

---

## Table of Contents

1. [System Component Diagram](#1-system-component-diagram)
2. [Cryptographic & Key Management Spec](#2-cryptographic--key-management-spec)
3. [State & Data Model Documentation](#3-state--data-model-documentation)
4. [End-to-End User Action Flow Diagram](#4-end-to-end-user-action-flow-diagram)
5. [Codebase Structural Architecture Diagram](#5-codebase-structural-architecture-diagram)

---

## 1. System Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                   │
│                                                                             │
│  ┌─────────────────────────┐   ┌──────────────────────────────────────┐     │
│  │    Next.js Frontend     │   │       Wallet Extension               │     │
│  │   (q-leap-frontend)     │   │  (MetaMask / EIP-6963 compatible)    │     │
│  └──────────┬──────────────┘   └──────────────┬───────────────────────┘     │
│             │                                 │                             │
│             │ HTTP /api/v1/*                  │ JSON-RPC (eth_*)            │
└─────────────┼─────────────────────────────────┼─────────────────────────────┘
              │                                 │
              ▼                                 ▼
┌─────────────────────────┐       ┌───────────────────────────────────────────┐
│  Kubernetes Cluster     │       │              QDay Network                 │
│                         │       │                                           │
│  ┌────────────────────┐ │       │  ┌──────────────────────────────────┐     │
│  │  Next.js Server Pod│ │       │  │  QDay Mainnet (Chain ID: 44001)  │     │
│  │                    │ │       │  │  (Not deployed yet)              │     │
│  │  (Server-Side      │ │       │  │  RPC: https://rpc.qday.io        │     │
│  │   API Rewrites)    │ │       │  │  ⚠ Contract addresses TBD        │     │
│  └────────┬───────────┘ │       │  └──────────────────────────────────┘     │
│           │             │       │                                           │
│           │ ClusterDNS  │       │  ┌──────────────────────────────────┐     │
│           ▼             │       │  │  QDay Testnet (Chain ID: 44003)  │     │
│  ┌────────────────────┐ │       │  │  RPC: https://rpc.qday.info      │     │
│  │  q-leap-backend    │ │       │  │  Explorer: explorer.qday.info    │     │
│  │  (ClusterIP only,  │ │       │  └──────────────┬───────────────────┘     │
│  │   no public access)│ │       │                 │                         │
│  │                    │ │       │  ┌──────────────▼───────────────────┐     │
│  │  • Auth / JWT      │ │       │  │  Smart Contracts (Testnet only)  │     │
│  │  • Forum API       │ │       │  │  - LendingPool                   │     │
│  │  • User Profile    │ │       │  │  - LendingPoolAddressProvider    │     │
│  │  • Liquidation     │ │       │  │  - UIPoolDataProviderV2          │     │
│  └────────────────────┘ │       │  │  - WETHGateway                   │     │
│                         │       │  │  - UniswapV3RepayAdapter         │     │
│  ┌────────────────────┐ │       │  └──────────────────────────────────┘     │
│  │  ConfigMap         │ │       └───────────────────────────────────────────┘
│  │  • User Profile    │ │
│  │  • Liquidation     │ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │  ConfigMap         │ │
│  │  (Runtime Flags)   │ │
│  │  ENABLE_TESTNET    │ │
│  │  ENABLE_FORUM      │ │
│  │  ENABLE_LIQUIDATION│ │
│  └────────────────────┘ │
└─────────────────────────┘
```

### Key Data Flows

| Flow                     | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| Browser → Next.js Server | HTTP to `/api/v1/*` — same-domain, no CORS                              |
| Next.js Server → Backend | Rewrite to `http://q-leap-backend` via ClusterDNS                       |
| Browser → Wallet         | `window.ethereum` JSON-RPC (`eth_requestAccounts`, `personal_sign`)     |
| Browser → QDay RPC       | `viem`/`wagmi` reads on-chain data (reserves, user positions) every 15s |
| Wallet → QDay Network    | Signs and broadcasts transactions                                       |

---

## 2. Cryptographic & Key Management Spec

### Scope Statement

This project uses a **client-side-only key model**:

- There is no server-side private key storage
- There is no AWS IAM role assumption, Huawei Cloud Agency, or any cloud secrets vault (Secrets Manager, CSMS) involved in any signing operation
- The backend (`q-leap-backend`) never receives, stores, or processes any private key material
- All cryptographic signing is fully delegated to the user's wallet extension (MetaMask) running in its own isolated browser sandbox

This means the protocol has no ability to sign transactions on behalf of users. Every on-chain action requires an explicit approval from the user's wallet.

### Core Principle

**The frontend never stores or handles private keys.** All signing operations are performed by the wallet extension (MetaMask) inside its own isolated sandbox.

### Wallet Connection Flow

Two connector types are supported: MetaMask (EIP-6963) and WalletConnect.

```
User clicks "Connect Wallet"
        ↓
Existing connection is disconnected first
(prevents "Connector already connected" wagmi error)
        ↓
[Option A — MetaMask / EIP-6963]
  wagmi calls window.ethereum.request({ method: 'eth_requestAccounts' })
  MetaMask shows permission dialog → User approves

[Option B — WalletConnect]
  wagmi opens QR code / deep link flow
  User scans / approves in mobile wallet
        ↓
Returns wallet address — NO private key exposed
        ↓
Auto-switch to QDay network (useSwitchToQday → wallet_switchEthereumChain)
  → User rejects switch: toast error shown; wallet stays connected on wrong chain
  → isWrongChain UI shown in DialogConnectWallet until user switches
        ↓
wagmi internal state stores connection (account address + chainId)
Note: walletAddress is NOT stored in a custom Zustand store —
      it lives in wagmi's own state, read via useConnection() / useAccount()
```

### Forum Authentication (Signature-Based)

Entry point: `DialogForumLogin` — a multi-step dialog (`connect → sign → signing → preferences → saving`).

```
[Guard] Token exists + address matches stored user?
  → Yes: close dialog immediately (session reuse — no re-sign needed)
  → No: proceed below
        ↓
[Step: connect]  (skipped if wallet already connected)
User picks MetaMask or WalletConnect → wallet connected
        ↓
[Step: sign → signing]
1. POST /auth/nonce { address }  →  { nonce: number }
        ↓
2. wagmi signMessage():
   message = env.AUTH_LOGIN_MESSAGE
             with {address} and {nonce} interpolated
        ↓  (wallet signs — frontend never sees the private key)
3. Returns EVM signature (hex string)
        ↓
4. POST /auth/login { address, nonce, signature }  →  { token: "jwt..." }
        ↓
5. GET /auth/me (with fresh token)  →  { user: IAuthUser }
        ↓
6. setAuth(token, user)  →  stored in Zustand + persisted to localStorage
        ↓
[Step: preferences]  (first-time login only)
Check localStorage["forum_prefs_set_{address}"]
  → Already set: skip preferences, close dialog
  → Not set: show "Security preference" UI
      User chooses:
        • "Session only" (requireSignature: false) — recommended
        • "Sign each action" (requireSignature: true)
      If preference differs from server value:
        sign message "QLEAP:UPDATE_PREFERENCES\ntimestamp:{ts}"
        PATCH /auth/me/preferences { requireSignature, signatureTimestamp }
          header: X-Signature: <signature>
      localStorage.setItem("forum_prefs_set_{address}", "1")
      → Preferences won't show again for this address
        ↓
Login complete — dialog closes
```

### JWT Token Lifecycle

| Property        | Detail                                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Storage         | `localStorage["forum-auth"]` — Zustand persist, stores only `token` + `user` (not `hasHydrated`)               |
| Injection       | Axios request interceptor — injects `Authorization: Bearer <token>` only if header not already set by caller    |
| Expiry handling | 401 interceptor → `clearAuth()` + toast, **only if a token was present** (avoids clearing state on public endpoints) |
| Nonce           | Single-use; backend invalidates after successful login                                                          |
| Session refresh | `ForumAuthSync` runs `GET /auth/me` on mount whenever a token exists (`staleTime: 5 min`) to keep `user` fresh  |
| Wallet sync     | `ForumAuthSync` watches for `token → null` transition and calls wagmi `disconnect()` to clear wallet state      |
| Hydration guard | `hasHydrated` flag prevents any auth action before Zustand rehydrates from `localStorage`                       |

### Security Notes

| Concern                | Status                                                    |
| ---------------------- | --------------------------------------------------------- |
| Private keys           | Never leave MetaMask sandbox                              |
| Backend API            | ClusterIP — browser has no direct route                   |
| `BACKEND_INTERNAL_URL` | Server-only env var — not prefixed with `NEXT_PUBLIC_`    |
| JWT in localStorage    | Vulnerable to XSS — consider upgrading to HttpOnly cookie |

---

## 3. State & Data Model Documentation

### Off-chain: Backend Database

**Database:** PostgreSQL (managed by `q-leap-backend`)

The frontend never talks to the database directly — all access goes through the REST API at `/api/v1/*`.

#### User / Auth

```typescript
interface IAuthUser {
  id: number;
  walletAddress: string; // checksum EVM address
  role: "user" | "moderator" | "admin";
  requireSignature: boolean; // force re-sign on each session if true
  isActive: boolean;
}

interface IAuthSession {
  id: string;
  nonce: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  current?: boolean;
}
```

#### Forum

```typescript
interface Proposal {
  id: number;
  title: string;
  description: string; // Markdown content
  category: string;
  status: "active" | "closed" | "archived";
  author: IAuthUser;
  createdAt: string;
}

interface Comment {
  id: number;
  content: string; // Markdown content
  proposalId: number;
  author: IAuthUser;
  upvotes: number;
  isBanned: boolean;
  reports: CommentReport[];
  createdAt: string;
}
```

### On-chain: Smart Contract State

Read via `UIPoolDataProviderV2` contract — returns humanized data (18-decimal normalized).

```typescript
interface ComputedReserveData {
  id: string;
  underlyingAsset: string; // token contract address
  name: string;
  symbol: string;
  decimals: number;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  liquidityRate: string; // RAY (27 decimals) — supply APY
  variableBorrowRate: string; // RAY — borrow APR
  totalLiquidity: string;
  availableLiquidity: string;
  priceInMarketReferenceCurrency: string;
  aTokenAddress: string;
  variableDebtTokenAddress: string;
}

interface UserReserveData {
  reserve: ComputedReserveData;
  scaledATokenBalance: string;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: string;
}

interface UserSummary {
  totalLiquidityUSD: string;
  totalCollateralUSD: string;
  totalBorrowsUSD: string;
  availableBorrowsUSD: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
  healthFactor: string; // < 1.0 means position is liquidatable
}
```

### On-chain ↔ Off-chain Sync

There are two independent sync mechanisms running in parallel:

**1. Backend Indexer (authoritative for historical & event data)**

The backend runs its own on-chain indexer that listens to smart contract events (e.g., `Deposit`, `Borrow`, `Repay`, `LiquidationCall`) and persists them to PostgreSQL. This is the source of truth for liquidation positions, transaction history, and any data that requires querying past events.

```
QDay RPC node
  → Backend indexer (event listener)
  → PostgreSQL (q-leap-backend)
  → REST API → Frontend
```

**2. Frontend RPC Polling (real-time reserve & user state)**

The frontend independently polls the `UIPoolDataProviderV2` contract every 15 seconds for live pool state (rates, liquidity, user positions). This does not go through the backend.

```
wagmi useReadContracts (every 15s)
  → UIPoolDataProviderV2.getReservesData()
  → UIPoolDataProviderV2.getUserReservesData()
        ↓
usePoolData hook → humanize raw data → usePoolDataStore (Zustand)
        ↓
Components subscribe to store slices
```

| Data type                        | Source                        |
| -------------------------------- | ----------------------------- |
| Reserve rates, liquidity, prices | Frontend RPC poll             |
| User supply / borrow positions   | Frontend RPC poll             |
| Liquidatable positions list      | Backend indexer → REST API    |
| Forum proposals & comments       | Backend PostgreSQL → REST API |
| User profile & auth              | Backend PostgreSQL → REST API |

---

## 4. End-to-End User Action Flow Diagram

Each protocol operation has two hook variants:
- **ERC20** — for standard ERC20 tokens
- **Native** — for native QDAY token, routed through `WETHGateway`

All hooks share the same state machine pattern: a `status` string, an `isBusy` boolean, and an `onSuccess` callback that fires after on-chain confirmation.

---

### Flow 1: Supply

#### ERC20 Supply — `useSupply`

**Status states:** `idle → approving → confirming-approve → supplying → confirming-supply → success | error`

```
User enters amount → clicks "Supply"
        ↓
Read ERC20.allowance(userAddress, LendingPool)  [polls every 5s]
        ↓
needsApproval = allowance < amount?
  → Yes:
      ERC20.approve(LendingPool, parseUnits(amount, decimals))
      Wait for receipt (confirming-approve)
      On confirmed: refetchAllowance → status = idle
  → No: skip to deposit
        ↓
LendingPool.deposit(
  tokenAddress,          // asset
  parseUnits(amount, decimals),
  userAddress,           // onBehalfOf
  0                      // referralCode
)
Wait for receipt (confirming-supply)
        ↓
onSuccess() → pool data refresh (15s poll picks up new balance)
```

#### Native QDAY Supply — `useSupplyNative`

**Status states:** `idle → supplying → confirming → success | error`

```
User enters amount → clicks "Supply"
        ↓
No approval needed — native QDAY sent as msg.value
        ↓
WETHGateway.depositETH(
  lendingPoolAddress,    // lendingPool
  userAddress,           // onBehalfOf
  0,                     // referralCode
  { value: parseEther(amount) }
)
Wait for receipt
        ↓
onSuccess()
```

---

### Flow 2: Withdraw

#### ERC20 Withdraw — `useWithdraw`

**Status states:** `idle → withdrawing → confirming → success | error`

```
User enters amount (or clicks "Max") → clicks "Withdraw"
        ↓
No approval needed — LendingPool burns aTokens from msg.sender directly
        ↓
withdrawAmount = isMax ? MAX_UINT256 : parseUnits(amount, decimals)

LendingPool.withdraw(
  tokenAddress,          // asset
  withdrawAmount,        // MAX_UINT256 = full balance (principal + accrued interest)
  userAddress            // to
)
Wait for receipt
        ↓
onSuccess()
```

> Passing `MAX_UINT256` tells the contract to withdraw the full position. The contract calculates the exact amount on-chain.

#### Native QDAY Withdraw — `useWithdrawNative`

**Status states:** `idle → approving → confirming-approve → withdrawing → confirming → success | error`

```
User enters amount (or clicks "Max") → clicks "Withdraw"
        ↓
Read aToken(aWQDAY).allowance(userAddress, WETHGateway)  [polls every 5s]
        ↓
needsApproval = aTokenAllowance < amount?
  → Yes:
      approveAmount = isMax ? MAX_UINT256 : parseEther(amount)
      aToken.approve(WETHGateway, approveAmount)
      Wait for receipt (confirming-approve)
      On confirmed: refetchAllowance → status = idle
  → No: skip to withdraw
        ↓
withdrawAmount = isMax ? MAX_UINT256 : parseEther(amount)

WETHGateway.withdrawETH(
  lendingPoolAddress,    // lendingPool
  withdrawAmount,
  userAddress            // to
)
Wait for receipt
        ↓
onSuccess()
```

> Unlike ERC20 withdraw, the gateway must `transferFrom` the user's aTokens, so approval **is required**.

---

### Flow 3: Borrow

#### ERC20 Borrow — `useBorrow`

**Status states:** `idle → borrowing → confirming → success | error`

```
User enters amount → clicks "Borrow"
        ↓
No approval needed — protocol mints variable debt tokens to user
        ↓
LendingPool.borrow(
  tokenAddress,          // asset
  parseUnits(amount, decimals),
  BigInt(2),             // interestRateMode: 2 = variable (always variable)
  0,                     // referralCode
  userAddress            // onBehalfOf
)
Wait for receipt
        ↓
onSuccess() → health factor recomputed on next 15s pool poll
```

#### Native QDAY Borrow — `useBorrowNative`

**Status states:** `idle → approving-delegation → confirming-delegation → borrowing → confirming → success | error`

```
User enters amount → clicks "Borrow"
        ↓
Read variableDebtToken.borrowAllowance(userAddress, WETHGateway)  [polls every 5s]
(uses DebtTokenAbi.borrowAllowance — not ERC20 allowance)
        ↓
needsDelegation = delegationAllowance < amount?
  → Yes:
      variableDebtToken.approveDelegation(WETHGateway, MAX_UINT256)
      Wait for receipt (confirming-delegation)
      On confirmed: refetchDelegation → status = idle
  → No: skip to borrow
        ↓
WETHGateway.borrowETH(
  lendingPoolAddress,    // lendingPool
  parseEther(amount),
  BigInt(2),             // interestRateMode: variable
  0                      // referralCode
)
Wait for receipt
        ↓
onSuccess()
```

> `approveDelegation` is an Aave-specific concept on the variable debt token — it is NOT an ERC20 approve. It authorises the gateway to borrow debt on behalf of the user.

---

### Flow 4: Repay

#### ERC20 Repay — `useRepay`

**Status states:** `idle → approving → confirming-approve → repaying → confirming-repay → success | error`

```
User enters amount (or clicks "Repay All") → clicks "Repay"
        ↓
Read ERC20.allowance(userAddress, LendingPool)  [polls every 5s]
        ↓
needsApproval = allowance < amount?
  → Yes:
      approveAmount = isMax
        ? parseUnits(amount, decimals) × 101/100  ← 1% buffer for accrued interest
        : parseUnits(amount, decimals)             ← exact amount
      ERC20.approve(LendingPool, approveAmount)
      Wait for receipt (confirming-approve)
      On confirmed: refetchAllowance → status = idle
  → No: skip to repay
        ↓
repayAmount = isMax ? MAX_UINT256 : parseUnits(amount, decimals)

LendingPool.repay(
  tokenAddress,          // asset
  repayAmount,           // MAX_UINT256 = repay all (contract takes exact debt only)
  BigInt(2),             // rateMode: variable
  userAddress            // onBehalfOf
)
Wait for receipt
        ↓
onSuccess()
```

> On "Repay All": approval uses a 1% buffer over the displayed debt to cover interest accruing between approval and repay tx. The contract itself only deducts the exact outstanding debt — no overpayment occurs.

#### Native QDAY Repay — `useRepayNative`

**Status states:** `idle → repaying → confirming → success | error`

```
User enters amount → clicks "Repay"
        ↓
No approval needed — native QDAY sent as msg.value
        ↓
WETHGateway.repayETH(
  lendingPoolAddress,    // lendingPool
  parseEther(amount),    // amount of debt to repay
  BigInt(2),             // rateMode: variable
  userAddress,           // onBehalfOf
  { value: parseEther(amount) }
)
Wait for receipt
        ↓
onSuccess()
```

> For "Repay All" on native QDAY: a tiny dust debt may remain after the tx because interest continues accruing during block confirmation time. There is no workaround — the caller must handle this edge case at the UI level.

---

### Flow 5: Repay with Collateral — `useRepayWithCollateral`

**Status states:** `idle | quoting → approving → confirming-approve | revoking → confirming-revoke → executing → confirming-exec → (success: reset to idle) | error`

This is the most complex flow. It uses `UniswapV3RepayAdapter` to atomically swap collateral for debt asset and repay — without the user needing to hold the debt token.

```
User selects collateral + debt asset + enters debt amount
        ↓
─── Step 1: Quote (auto, debounced 400ms, re-polls every 10s) ───────────────
simulateContract(adapter.getAmountsIn(
  debtAmount + flashLoanPremium?,  // quoted output
  collateralAsset,
  debtAsset
))
Returns: [amountIn, relPrice, inUsd, outUsd, path]

collateralNeeded = amountIn
maxCollateral    = amountIn × (10000 + slippageBps) / 10000  ← default 2%
useEthPath       = path.length > 2  (multi-hop route detected)

If quote returns amountIn=0: show "no pool found" error, block execute
        ↓
─── Step 2: Flash loan decision ─────────────────────────────────────────────
needsFlashLoan = hfBeforeCollateralEffect <= 1.01
  → If withdrawing collateral first would drop HF too close to liquidation,
    use flash loan to do repay + withdrawal atomically.
  → Otherwise use direct swapAndRepay.
        ↓
─── Step 3: Approve (if needed) ─────────────────────────────────────────────
Read collateralAToken.allowance(userAddress, adapter)
needsApproval = aTokenAllowance < maxCollateral?
  → Yes:
      approvalAmount = maxCollateral × 101/100  ← 1% buffer over slippage-padded quote
      collateralAToken.approve(adapter, approvalAmount)
      Wait for receipt (confirming-approve)

isInfiniteAllowance = allowance > 1e15 tokens
  → UI shows "Revoke" button (sets allowance to 0)
        ↓
─── Step 4: Live balance guard (immediately before execute) ─────────────────
Fetch live aToken balance from chain
If liveBalance < maxCollateral: abort with "insufficient collateral" error
(Prevents SafeMath underflow on consecutive repays with stale UI state)
        ↓
─── Step 5: Execute ─────────────────────────────────────────────────────────

[Direct mode — needsFlashLoan=false]
adapter.swapAndRepay(
  collateralAsset,
  debtAsset,
  maxCollateral,         // collateralAmount (max, with slippage)
  debtAmountRaw,         // debtRepayAmount
  rateMode,              // 2 = variable
  EMPTY_PERMIT,          // { amount:0, deadline:0, v:0, r:0x0, s:0x0 }
  useEthPath
)

[Flash loan mode — needsFlashLoan=true]
encodedParams = abi.encode(
  collateralAsset, maxCollateral, rateMode,
  0, 0, 0, 0x0, 0x0,    // empty permit
  useEthPath
)
LendingPool.flashLoan(
  adapter,               // receiverAddress
  [debtAsset],           // assets
  [debtAmountRaw],       // amounts
  [0],                   // modes: 0 = repay in same tx (no debt left)
  userAddress,           // onBehalfOf
  encodedParams,
  0                      // referralCode
)

Wait for receipt (confirming-exec)
        ↓
onSuccess() → fetchAllowance() → reset() (state cleared for next repay cycle)
```

---

### Flow 6: Forum Post

```
User clicks "New Proposal"
        ↓
Check useForumAuthStore.token
  → null or address mismatch: open DialogForumLogin → complete auth flow (see §2)
        ↓
POST /api/v1/proposals { title, description, category }
  Headers: Authorization: Bearer <jwt>
        ↓
React Query invalidates → list re-fetches
```

---

### Flow 7: Liquidation

```
Liquidator visits /liquidation
        ↓
GET /api/v1/liquidation/positions
  → List of positions where healthFactor < 1.0 (from backend indexer)
        ↓
Liquidator selects position + collateral asset to receive
        ↓
ERC20.approve(LendingPool, debtToCover)
LendingPool.liquidationCall(
  collateralAsset,
  debtAsset,
  user,                  // borrower being liquidated
  debtToCover,
  false                  // receiveAToken: false = receive underlying collateral
)
        ↓
Liquidator receives collateral at liquidation discount — borrower's debt reduced
```

---

## 5. Codebase Structural Architecture Diagram

### Directory Structure

```
src/
├── app/                          # Next.js App Router — routing layer
│   ├── layout.tsx                # Root layout: mounts all Providers
│   ├── (main)/                   # Main app page group
│   │   ├── market/               # Market list page
│   │   ├── reserve-overview/     # Reserve detail page
│   │   ├── dashboard/            # User portfolio
│   │   ├── forum/                # Governance forum
│   │   ├── liquidation/          # Liquidation dashboard
│   │   └── profile/              # User profile
│   └── api/config/               # Runtime flags endpoint (reads Kubernetes ConfigMap)
│
├── providers/                    # React Context layer (mount order matters)
│   ├── WagmiProvider             # Wallet connectivity (outermost)
│   ├── ThemeProvider             # Dark / light mode
│   ├── QueryClientProvider       # React Query
│   ├── ProtocolDataProvider      # Market & network selection
│   ├── StaticPoolDataProvider    # Pool data + error boundary
│   └── ForumAuthSync             # Runs /auth/me on mount; disconnects wallet on token clear
│
├── stores/                       # Zustand global state
│   ├── use-forum-auth-store.ts   # JWT + user object (persisted to localStorage)
│   ├── use-pool-data-store.ts    # On-chain pool data (in-memory)
│   └── use-intersection-store.ts # UI intersection / visibility tracking
│
├── hooks/                        # Business logic hooks
│   ├── use-pool-data.ts          # Read on-chain pool & user data
│   ├── use-supply.ts             # Supply transaction flow
│   ├── use-borrow.ts             # Borrow transaction flow
│   ├── use-repay.ts              # Repay transaction flow
│   ├── use-withdraw.ts           # Withdraw transaction flow
│   ├── use-liquidation.ts        # Liquidation calculation & execution
│   ├── use-collateral-toggle.ts  # Enable / disable collateral
│   ├── use-switch-to-qday.ts     # Prompt user to switch to QDay network
│   ├── use-chainlink-price.ts    # Chainlink oracle price feed
│   └── use-oracle-aggregator.ts  # Multi-source price aggregation
│
├── api/                          # Axios HTTP clients
│   ├── auth/                     # Nonce, login, logout, /me
│   ├── forum/                    # Proposals + comments CRUD
│   ├── user/                     # User profile & avatar
│   ├── liquidation/              # Fetch liquidatable positions
│   ├── moderation/               # Ban, reports, moderator management
│   └── notifications/            # User notifications
│
├── abi/                          # Smart contract ABIs (TypeScript)
│   ├── erc20-abi.ts
│   ├── lending-pool-abi.ts
│   ├── ui-pool-data-provider-v2-abi.ts
│   ├── weth-gateway-abi.ts
│   ├── uniswap-v3-repay-adapter-abi.ts
│   ├── debt-token-abi.ts
│   └── generated.ts              # Auto-generated typed hooks (wagmi CLI)
│
├── modules/                      # Feature-specific UI logic
│   ├── market/
│   ├── dashboard/
│   ├── forum/
│   ├── liquidation/
│   ├── moderation/
│   └── user-profile/
│
├── components/                   # Shared, reusable UI components
│
├── math-utils/                   # DeFi math primitives
│   ├── ray-math.ts               # 27-decimal RAY arithmetic
│   ├── unit-math.ts              # Token unit conversions
│   └── formatters.ts             # Human-readable display formatting
│
├── config/
│   ├── env.ts                    # Build-time env vars
│   └── runtime-config.ts         # Runtime feature flags (from /api/config)
│
└── lib/
    ├── wagmi-config.ts           # Wagmi instance (chains + connectors)
    ├── compute-health-factor.ts  # Health factor calculation logic
    └── format-health-factor.ts   # Health factor display formatting
```

### Module Dependency Graph

The app is organized into three independent dependency hierarchies that run in parallel. Understanding which branch a feature belongs to immediately tells a developer where to look and what state management layer to use.

---

#### Branch 1 — DeFi Protocol (on-chain data + transactions)

This branch owns everything related to reading blockchain state and writing transactions. It is the most complex branch because it involves both asynchronous RPC calls and user-initiated contract writes.

The entry point is `lib/wagmi-config.ts`, which bootstraps the wallet connection layer — defining which chains are supported and which connectors (MetaMask variants) are available. Everything on-chain flows through this config.

`ProtocolDataProvider` sits on top of wagmi and acts as the app's market selector. It holds the currently active market (`qday` or `qdayTestnet`) and resolves the correct set of contract addresses from `src/ui-config/markets/index.ts`. Any component that needs to know "which network are we on?" reads from this context.

`StaticPoolDataProvider` uses the resolved addresses to poll `UIPoolDataProviderV2` on-chain every 15 seconds. It transforms raw blockchain data (RAY-scaled integers) into human-readable numbers and writes the result into `usePoolDataStore` — a Zustand store that acts as the in-memory cache for all reserve and user position data.

`usePoolData()` is the single hook that components use to read from that store. It also runs `compute-health-factor.ts` to derive the user's current liquidation risk from raw position data.

The transaction hooks (`useSupply`, `useBorrow`, `useRepay`, `useWithdraw`, `useLiquidation`, `useCollateralToggle`) each wrap a specific contract interaction. They all follow the same pattern: validate inputs using data from `usePoolData`, build the transaction, hand it to wagmi's `useWriteContract`, which forwards it to MetaMask for signing, and then broadcasts it to the QDay RPC node.

There are also three utility hooks that components use independently without going through the full pool data chain: `useSwitchToQday` detects when the user's wallet is on the wrong network and prompts a switch; `useChainlinkPrice` reads a single asset price directly from the Chainlink oracle contract; and `useOracleAggregator` combines prices from multiple sources for display purposes.

```
lib/wagmi-config.ts
  └── chains: [qdayMainnet, qdayTestnet, ETH, BSC, Arbitrum, Polygon]
  └── connectors: [EIP-6963 MetaMask, MetaMask SDK]
        ↓
ProtocolDataProvider (React Context)
  └── currentMarket (qday | qdayTestnet)
  └── currentChainId
  └── reads market config → resolves contract addresses
        ↓
StaticPoolDataProvider
  └── useReadContracts() every 15s
        → UIPoolDataProviderV2.getReservesData()
        → UIPoolDataProviderV2.getUserReservesData()
  └── humanizes raw data → usePoolDataStore (Zustand)
        ↓
usePoolData() hook
  └── reads usePoolDataStore → { reserves, userReserves, userSummary }
  └── compute-health-factor.ts — calculates liquidation risk
        ↓
Transaction hooks
  ├── useSupply()           → ERC20.approve + LendingPool.deposit
  ├── useBorrow()           → LendingPool.borrow
  ├── useRepay()            → LendingPool.repay
  ├── useWithdraw()         → LendingPool.withdraw
  ├── useLiquidation()      → LendingPool.liquidationCall
  └── useCollateralToggle() → LendingPool.setUserUseReserveAsCollateral
  all └── useWriteContract() → MetaMask → QDay RPC
        ↓
modules/market/, modules/dashboard/, modules/liquidation/

Utility hooks (consumed directly by components, bypass pool data chain):
  ├── useSwitchToQday()      — prompts network switch if wrong chain
  ├── useChainlinkPrice()    — reads oracle price feed on-chain
  └── useOracleAggregator()  — aggregates prices from multiple sources
```

---

#### Branch 2 — Forum & Auth (off-chain, JWT-gated)

This branch owns everything that requires a user to be authenticated via wallet signature. It is completely independent of Branch 1 — the forum does not read on-chain state and does not use wagmi's contract hooks.

Identity in this app is wallet-based. `useForumAuthStore` is a Zustand store persisted to `localStorage` that holds the JWT token and the current user object (including their role: `user`, `moderator`, or `admin`). This is the single source of truth for whether a user is logged in.

`ForumAuthSync` is a provider that runs on app mount and watches `localStorage` for auth changes. Its primary purpose is to keep auth state consistent across multiple browser tabs — if a user logs out in one tab, the other tabs are notified.

Every outbound API call passes through the Axios interceptor in `api/axios-client.ts`. The interceptor automatically injects the `Authorization: Bearer <token>` header if a token exists in the store. If the server returns a 401, the interceptor calls `clearAuth()` to wipe the token and shows a toast notification prompting the user to sign in again.

React Query sits on top of the Axios client and handles caching, deduplication, and refetching for all forum data. The stale time is set to 5 seconds with no automatic refetch on window focus — meaning data is considered fresh for 5 seconds and then re-fetched on the next read.

```
useForumAuthStore (Zustand, persisted to localStorage)
  └── token: JWT | null
  └── user: { id, walletAddress, role, isActive }
        ↓
ForumAuthSync provider
  └── watches localStorage on mount
  └── syncs auth state across browser tabs
        ↓
Axios interceptor (api/axios-client.ts)
  └── injects Authorization: Bearer <token> on every request
  └── on 401 → clearAuth() + toast
        ↓
React Query hooks (staleTime: 5s, no refetch on mount)
  ├── useProposals()     → GET /api/v1/proposals
  ├── useComments()      → GET /api/v1/proposals/:id/comments
  └── useNotifications() → GET /api/v1/notifications
        ↓
modules/forum/, modules/moderation/, modules/user-profile/
```

---

#### Branch 3 — Runtime Config (feature flags)

This branch controls which features are visible in the UI without requiring a code change or a new Docker image build. It is the simplest branch but important to understand because it is the mechanism used to enable or disable entire modules in production.

Feature flags live in a Kubernetes ConfigMap and are injected as environment variables into the Next.js server pod. The Next.js route at `app/api/config/route.ts` reads these env vars and exposes them as a JSON response. On app load, `config/runtime-config.ts` fetches this endpoint once and makes the flags available throughout the app.

`ProtocolDataProvider` and the navigation layer read these flags to decide whether to render the Forum, Liquidation, and Testnet network options. If `ENABLE_FORUM=false`, the forum route and navigation link are never rendered — the module code still exists in the bundle but is unreachable.

```
Kubernetes ConfigMap (ENABLE_TESTNET, ENABLE_FORUM, ENABLE_LIQUIDATION)
        ↓
app/api/config/route.ts  (Next.js server route)
  └── reads pod env vars → returns JSON
        ↓
config/runtime-config.ts
  └── fetched once on app load
        ↓
ProtocolDataProvider + navigation — shows/hides features
```

### Data Flow Contracts

This section describes how data passes between layers of the app, where validation occurs at each boundary, and how sensitive material is handled in memory.

#### How data passes between layers

Every user-initiated transaction follows the same pipeline from UI input to on-chain execution:

```
User input (form)
        ↓  [Layer 1 — UI validation]
        zod schema parse → rejects invalid shape, missing fields, wrong types
        react-hook-form → manages field state, triggers zod on submit
        ↓
Parsed & typed values (TypeScript primitives: string, bigint)
        ↓  [Layer 2 — Amount normalization]
        bignumber.js → converts human-readable decimal ("1.5 USDC")
                     → contract-scale integer ("1500000" for 6-decimal token)
        ↓
Contract arguments (typed via ABI)
        ↓  [Layer 3 — Contract boundary validation]
        TypeScript ABI types (abi/generated.ts) → compile-time check
        viem.isAddress() → runtime check on any address argument
        ↓
wagmi useWriteContract()
        ↓  [Layer 4 — Wallet boundary]
        Serialized tx payload passed to MetaMask via window.ethereum
        MetaMask displays human-readable tx summary to user
        ↓
Signed transaction (opaque bytes — frontend never sees private key)
        ↓
QDay RPC node → broadcast to network
```

For API calls (forum, auth), the flow is simpler:

```
User input (form)
        ↓  zod schema parse
Typed request body
        ↓  Axios client → injects JWT header
HTTP request → q-leap-backend (via Next.js server rewrite)
        ↓
JSON response → React Query cache → component re-render
```

#### Where input validation occurs

Validation happens at two distinct layers, each serving a different purpose:

| Layer             | Location                                  | What it validates                   | What it rejects                                      |
| ----------------- | ----------------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| UI layer          | `react-hook-form` + `zod`                 | Field presence, type, range, format | Empty amounts, negative numbers, malformed addresses |
| Contract boundary | TypeScript ABI types + `viem.isAddress()` | Argument types match ABI spec       | Wrong type passed to contract call at compile time   |

There is intentionally no validation inside the transaction hooks themselves — they trust that the UI layer has already validated inputs. This keeps the hooks simple and avoids duplicate logic.

#### Cryptographic zeroing-out of memory

**This does not apply to this project.** Cryptographic zeroing-out of memory is a practice used when a process holds a private key or seed phrase in a memory buffer and needs to overwrite that buffer with zeros after use to prevent the key from being recovered by a memory dump.

In Q-LEAP frontend, no private key material ever enters the JavaScript runtime. The wallet extension (MetaMask) maintains its own isolated process/sandbox where key material lives. The frontend only ever receives a wallet address (public) and a signature (public). There is nothing in the frontend's memory that requires zeroing.

If the backend ever needs to handle key material in future (e.g., an admin hot wallet for protocol operations), that logic must live in `q-leap-backend` and follow server-side key management practices documented in a separate backend architecture doc.
