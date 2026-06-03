# Technical Documentation — QLeap DeFi Lending Protocol UI

## Overview

This app is a frontend interface for an **on-chain lending protocol** (Aave v2 architecture) running on the **QDay blockchain** (testnet + mainnet). Users connect their wallet (MetaMask / wagmi) and interact directly with smart contracts via Supply, Withdraw, Borrow, Repay, and Liquidation operations. There is also a **Forum** module for governance discussion and a **Moderation** panel for admins.

---

## 1. Architecture

```
/src
├── app/[locale]/
│   ├── (home)/           ← Market, Dashboard, Reserve, Price, Profile, Liquidation
│   └── forum/            ← Forum + Moderation pages
├── modules/              ← Feature modules (UI + logic)
├── hooks/                ← Blockchain interaction hooks (supply, borrow, repay...)
├── math-utils/           ← All financial calculation formulas
├── stores/               ← Zustand global state (pool data)
├── providers/            ← Context providers (protocol data, pool data)
├── api/                  ← REST API client (forum, liquidation, moderation...)
└── abi/                  ← Smart contract ABIs + wagmi-generated hooks
```

**Smart contracts (QDay Testnet):**

| Contract | Address |
|---|---|
| `LENDING_POOL` | `0xc31F921Bcdb22A5B8D3A40088c7ac75F3Ac8EFD8` |
| `LENDING_POOL_ADDRESS_PROVIDER` | `0xf11d1dAc1abEdb5eEb32375154939AE7348c4227` |
| `WETH_GATEWAY` | `0x46602aFE192A0a65eA6F48f76CCA677e42172c43` |
| `REPAY_WITH_COLLATERAL_ADAPTER` | `0x9A676e781A523b5d0C0e43731313A708CB607508` |

---

## 2. Pages / Routes

| Route | Module | Description |
|---|---|---|
| `/` | Market | All asset pools list, market-wide statistics |
| `/dashboard` | Dashboard | Personal position of the connected wallet |
| `/reserve-overview?asset=&marketName=` | ReserveOverview | Single asset detail: Supply/Withdraw/Borrow/Repay |
| `/price` | PriceFeed | QDAY/USD price via Chainlink oracle |
| `/profile` | UserProfile | Update user profile |
| `/liquidation` | Liquidation | List of positions eligible for liquidation |
| `/forum` | ForumProposals | Governance proposal list |
| `/forum/[proposalId]` | ForumProposalDetail | Proposal detail + threaded comments |
| `/forum/moderation/reports` | ModerationReports | Comment report queue |
| `/forum/moderation/moderators` | ModerationModerators | Manage moderator list |
| `/forum/moderation/banned` | ModerationBanned | Manage banned addresses |

---

## 3. Feature: Market Overview (`/`)

### Flow

```
1. StaticPoolDataProvider fetches data from UIPoolDataProviderV2 (on-chain)
2. Raw data is stored in Zustand store usePoolDataStore
3. useFormattedPoolData → formatReserve() computes financial metrics per reserve
4. useMarketSummary aggregates all reserves into summary + table data (single pass)
5. Render: MarketSummary (stat cards) + CoreAssets (asset table)
```

### Computed Parameters

| Parameter | Formula | Source file |
|---|---|---|
| `totalLiquidity` | `totalDebt + availableLiquidity` | `math-utils/formatters/reserve/index.ts:75` |
| `utilizationRate` | `totalDebt / totalLiquidity` | `math-utils/formatters/reserve/index.ts:76` |
| `supplyAPY` | `(liquidityRate / SECONDS_PER_YEAR + 1)^SECONDS_PER_YEAR − 1` | `math-utils/formatters/reserve/index.ts:83` |
| `variableBorrowAPY` | `(variableBorrowRate / SECONDS_PER_YEAR + 1)^SECONDS_PER_YEAR − 1` | `math-utils/formatters/reserve/index.ts:88` |
| `stableBorrowAPY` | `(stableBorrowRate / SECONDS_PER_YEAR + 1)^SECONDS_PER_YEAR − 1` | `math-utils/formatters/reserve/index.ts:93` |
| `liquidationBonus` | `reserveLiquidationBonus − 10^LTV_PRECISION` | `math-utils/formatters/reserve/index.ts:78` |
| `totalLockedInUsd` | `Σ (totalLiquidity × priceInMRC × marketRefPriceInUsd)` | `modules/market/hooks/useMarketSummary.ts:29` |
| `totalBorrowedInUsd` | `Σ (totalDebt × priceInMRC × marketRefPriceInUsd)` | `modules/market/hooks/useMarketSummary.ts:37` |
| `utilizationRate (market)` | `totalBorrowed / totalLocked × 100` | `modules/market/hooks/useMarketSummary.ts:73` |
| `weightedAPY` | `Σ (supplyAPY × liquidityUsd) / totalLockedInUsd` | `modules/market/hooks/useMarketSummary.ts:44` |

> **Precision:** All calculations use `BigNumber.js` with RAY = 10²⁷, WAD = 10¹⁸. APY is computed via `rayPow()` (exponentiation by squaring).

---

## 4. Feature: Dashboard (`/dashboard`)

### Flow

```
1. Fetch user from useFormattedPoolData (aggregates the full wallet position)
2. useDashboardData splits into suppliedReserves and borrowedReserves
3. Render: Supplies Table + Borrows Table + DashboardStatCards
```

### Computed Parameters

| Parameter | Formula | Source file |
|---|---|---|
| `totalSupplyUsd` | `user.totalCollateralUSD` | `modules/dashboard/hooks/useDashboardData.ts:34` |
| `totalBorrowUsd` | `user.totalBorrowsUSD` | `modules/dashboard/hooks/useDashboardData.ts:35` |
| `netWorth` | `totalSupplyUsd − totalBorrowUsd` | `modules/dashboard/hooks/useDashboardData.ts:54` |
| `healthFactor` | See §7 | `modules/dashboard/hooks/useDashboardData.ts:55` |
| `ltv` (current) | `totalBorrowUsd / totalSupplyUsd × 100` | `modules/dashboard/hooks/useDashboardData.ts:56` |
| `supplyApy` (weighted) | `Σ (underlyingBalanceUSD × supplyAPY) / totalSupplyUsd × 100` | `modules/dashboard/hooks/useDashboardData.ts:42` |
| `borrowApy` (weighted) | `Σ (totalBorrowsUSD × variableBorrowAPY) / totalBorrowUsd × 100` | `modules/dashboard/hooks/useDashboardData.ts:43` |
| `netApy` | `(weightedSupplyApy − weightedBorrowApy) / totalSupplyUsd × 100` | `modules/dashboard/hooks/useDashboardData.ts:46` |
| `borrowPowerUsed` | `totalBorrow / (availableBorrowsUsd + totalBorrow) × 100` | `modules/dashboard/hooks/useDashboardData.ts:65` |

### User Summary Pipeline

```
rawUserReserves
  → generateUserReserveSummary()         ← computes actual balances with accrued interest
      ├── underlyingBalance               = getLinearBalance()           (aToken deposit balance)
      ├── variableBorrows                 = getCompoundedBalance()       (variable debt)
      └── stableBorrows                   = getCompoundedStableBalance() (stable debt)
  → calculateUserReserveTotals()          ← computes weighted LTV and liquidation threshold
      ├── currentLtv            = Σ (collateral × baseLTV) / totalCollateral
      └── currentLiqThreshold   = Σ (collateral × liqThreshold) / totalCollateral
  → generateRawUserSummary()
      ├── availableBorrows       = totalCollateral × LTV − totalBorrows
      └── healthFactor           = (totalCollateral × liqThreshold) / totalBorrows
```

---

## 5. Feature: Reserve Overview — Supply & Withdraw

### Supply Flow

```
User enters amount
  → Validate: amount ≤ walletBalance, reserve.isActive, !reserve.isFrozen
  → [ERC-20] Approve spending if allowance < amount
      approve(lendingPool, amount)
  → [Native QDAY] No approval needed
  → supply(underlyingAsset, amount, onBehalfOf, referralCode=0)
  → On success: refresh() pool data + refetchBalance()
```

### Withdraw Flow

```
User enters amount
  → Compute maxWithdrawAmount (see below)
  → Compute projected HF after withdrawal
  → Validate blocking errors (see §5.3)
  → [Native WQDAY→QDAY] Approve aToken for WETHGateway first
  → withdraw(asset, amount, to)
      amount = MAX_UINT256 when withdrawing full balance with no active debt
  → On success: refresh() pool data
```

### `maxWithdrawAmount` Calculation

```
Step 1: maxAmount = min(suppliedBalance, poolAvailableLiquidity)

Step 2 — only when user HAS debt AND this asset is used as collateral:
  excessHF = healthFactor - 1
  if excessHF > 0:
    totalCollateralInEth = (excessHF × totalBorrowsMRC) / (liqThreshold + 0.01) × 0.99
    maxByHF              = totalCollateralInEth / priceInMRC
    maxAmount            = min(maxAmount, maxByHF)
  else:
    maxAmount = 0   ← HF already ≤ 1, no collateral can be withdrawn

Clamp: if maxAmount < 1e-15 → 0  (eliminates floating-point artifacts)
```

> Source: `modules/reserve-overview/components/SupplyWithdrawPanel.tsx:261–295`

### Blocking Errors — Withdraw

| Condition | Type | Message key |
|---|---|---|
| Projected HF < 1 (when debt exists) | Block | `withdrawHfBlocked` |
| amount > suppliedBalance | Block | `withdrawInsufficientFunds` |
| amount > poolAvailableLiquidity | Block | `withdrawInsufficientLiquidity` |
| Projected HF < 1.5 (when debt exists) | Warning | `withdrawHfDanger` |
| Reserve is collateral and user has debt | Warning | `withdrawHfWarning` |

---

## 6. Feature: Reserve Overview — Borrow & Repay

### Borrow Flow

```
User enters amount
  → Compute maxBorrowAmount (see below)
  → Compute projected HF after borrow
  → Validate blocking errors (see §6.3)
  → [Native QDAY] approveDelegation(wethGateway, amount) on variableDebtToken first
  → borrow(asset, amount, interestRateMode=2, referralCode=0, onBehalfOf)
  → On success: refresh() + refetchBalance()
```

### `maxBorrowAmount` Calculation

```
Step 1: maxUserAmount     = availableBorrowsMRC / priceInMRC
Step 2: cappedByLiquidity = min(maxUserAmount, poolAvailableLiquidity)
Step 3: if collateral is the bottleneck (maxUserAmount ≤ poolLiquidity):
            maxAmount = cappedByLiquidity × 0.99  ← 1% safety buffer
         else:
            maxAmount = cappedByLiquidity

Why the 1% buffer: compensates for ray/wad math rounding differences
                   and interest that accrues between UI render and block inclusion.
```

> Source: `modules/reserve-overview/components/BorrowRepayPanel.tsx:250–278`

### Blocking Errors — Borrow

| Condition | Type | Message key |
|---|---|---|
| `reserve.borrowingEnabled = false` | Block | `borrowingNotAvailable` |
| amount > `maxBorrowAmount × 1.001` | Block | `insufficientCollateral` |
| amount > `poolAvailableLiquidity` | Block | `insufficientLiquidity` |
| Projected HF < **1.01** | Block | `hfBelowOne` |
| Projected HF < 1.5 | Warning | `hfDangerWarning` |

> The threshold is 1.01 instead of 1.0 because the contract uses ray/wad math (27-digit precision). The frontend's floating-point HF can read 1.002 while on-chain it is actually below 1.0, causing a revert with error code 11. The 0.01 buffer prevents this UX failure.

### Repay Flow

```
User selects source: [From Wallet] or [With Collateral]

From Wallet:
  → [ERC-20] approve(lendingPool, amount) if needed
  → repay(asset, amount|MAX_UINT256, rateMode=2, onBehalfOf)
  → [Native QDAY] repayETH(lendingPool, amount, rateMode=2, onBehalfOf)

With Collateral (only when feature flag collateralRepay = true):
  → RepayWithCollateralPanel → REPAY_WITH_COLLATERAL_ADAPTER contract
```

### Max Repay Logic

```
maxRepay       = min(walletBalance, debt)
wantsFullRepay = walletBalance > debt × 1.005   ← wallet has >0.5% buffer over debt

Native (QDAY) — must reserve gas:
  if wantsFullRepay AND (wallet − debt) ≥ 0.001:
    repayAmt = debt                          (wallet surplus covers gas)
  elif !wantsFullRepay AND wallet > 0.001:
    repayAmt = wallet − 0.001                (keep 0.001 QDAY for gas)
  else:
    repayAmt = maxRepay

ERC-20: repayAmt = maxRepay

isRepayMax = wantsFullRepay
  → passes type(uint256).max to the contract so it handles accrued interest automatically
```

> Source: `modules/reserve-overview/components/BorrowRepayPanel.tsx:378–407`

---

## 7. Health Factor — Definition & Formula

**Meaning:** Measures how safe a position is.

- HF > 1.5 → Safe
- 1 < HF < 1.5 → Warning (dangerous zone)
- HF ≤ 1 → Eligible for liquidation

**Base formula:**

```
HF = (Σ collateral_i × liquidationThreshold_i) / totalBorrows
```

**In code** (`math-utils/pool-math.ts:156–168`):

```typescript
HF = (collateralBalanceMRC × currentLiquidationThreshold × 10^(-LTV_PRECISION))
     / borrowBalanceMRC

// Returns -1 when there are no borrows → displayed as "∞" in the UI
```

**Projected HF** — calculates the expected HF after a pending action (`lib/compute-health-factor.ts`):

```typescript
amountInUsd = amount × priceInMRC × marketRefPriceInUsd

switch (mode):
  'supply':   newCollateral += amountInUsd  (only if reserve.usageAsCollateralEnabled)
  'withdraw': newCollateral -= amountInUsd  (clamped ≥ 0)
  'borrow':   newBorrows    += amountInUsd
  'repay':    newBorrows    -= amountInUsd  (clamped ≥ 0)

newHF = (newCollateral × liqThreshold) / newBorrows
// Returns "∞" when newBorrows = 0
```

---

## 8. Feature: Liquidation (`/liquidation`)

### Flow

```
1. Fetch liquidation positions from REST API backend
   (backend pre-computes: HF, maxRepayAmount, collaterals per borrower)
2. Display table sorted by HF ascending (most undercollateralized first)
3. Liquidator selects a position → LiquidationDialog
4. Choose: collateral asset to receive, debt amount to cover
5. Preview profit: call API /preview → returns collateralReceived, profitUsd, bonusPct
6. Execute transaction:
   a. Approve debt token for LendingPool if allowance < amount
      (isMax → approve MAX_UINT256)
   b. liquidationCall(collateral, debtAsset, borrower, debtToCover, receiveAToken)
```

### Liquidation Position Data

| Field | Description |
|---|---|
| `userAddress` | Address of the undercollateralized borrower |
| `healthFactor` | Current HF (< 1.0) |
| `totalDebtUsd` | Total debt in USD |
| `maxRepayUsd` | Maximum liquidatable amount (50% protocol cap) |
| `maxRepayAmount` | Corresponding debt token amount |
| `debtAsset` | Token to be repaid |
| `collaterals[].liquidationBonusPct` | Bonus % received on top of collateral value |
| `collaterals[].balanceUsd` | Current collateral value |

### Preview Liquidation Response

| Field | Description |
|---|---|
| `collateralReceived` | Amount of collateral the liquidator receives |
| `collateralReceivedUsd` | USD value of received collateral |
| `debtRepaidUsd` | USD value of debt repaid |
| `bonusPct` | Actual bonus percentage |
| `profitUsd` | Estimated profit = `collateralReceivedUsd − debtRepaidUsd` |
| `isCollateralSufficient` | Whether collateral is sufficient to cover the repay |

### Transaction State Machine

```
idle
  → approving              (signing approve tx)
  → confirming-approve     (waiting for on-chain confirmation)
  → idle                   (approval done, ready to liquidate)
  → liquidating            (signing liquidation tx)
  → confirming-liquidation
  → success / error
```

---

## 9. Feature: Price Feed (`/price`)

- Reads price from **Chainlink Aggregator** at `0xfD26034797B16A26AE5bf78dA013b6ad81F5f324`
- Polls every **15 seconds** (`POLL_INTERVAL = 15_000`)
- Displays: price, decimals, description (pair name), last updated timestamp
- Flash animation: green when price goes up, red when it goes down (1s duration)

---

## 10. Feature: Forum — Proposals

### Flow

```
1. Connect wallet (required to create)
2. Create proposal: title + markdown content + category + snapshotId/onchainId (optional)
3. Backend saves and returns the proposal object
4. Proposal list: filter by category, text search, sort (createdAt ASC/DESC)
5. Infinite scroll pagination
```

### Proposal Categories

`Governance | Risk | Treasury | Development | Others`

### Fields

| Field | Description |
|---|---|
| `title` | Short title |
| `description` | Markdown body |
| `proposalType` | Category |
| `snapshotId` | Snapshot vote ID (if any) |
| `onchainId` | On-chain governance ID (if any) |
| `signature` | Wallet signature of the author |
| `totalComments` | Total comment count |

---

## 11. Feature: Forum — Comments & Signatures

### Signature Authentication

Every forum action **requires a wallet signature**. The backend verifies the signature before persisting any data. This prevents anyone from forging another user's actions.

| Action | Signature Prefix | Message fields |
|---|---|---|
| Create comment | `QLEAP:CREATE_COMMENT` | proposalId, parentCommentId (`root` if top-level), contentHash, timestamp |
| Edit comment | `QLEAP:EDIT_COMMENT` | proposalId, commentId, contentHash, timestamp |
| Delete comment | `QLEAP:DELETE_COMMENT` | proposalId, commentId, timestamp |
| Upvote | `QLEAP:UPVOTE_COMMENT` | proposalId, commentId, timestamp |
| Pin | `QLEAP:PIN_COMMENT` | proposalId, commentId, timestamp |
| Unpin | `QLEAP:UNPIN_COMMENT` | proposalId, commentId, timestamp |
| Report | `QLEAP:REPORT_COMMENT` | proposalId, commentId, reasonHash, timestamp |

**contentHash** = `keccak256(stringToHex(contentMarkdown.trim()))` — ensures content cannot be tampered with after signing.

**reasonHash** = `keccak256(stringToHex(reason))` — same guarantee for report reasons.

### Comment Features

| Feature | Description |
|---|---|
| Threaded replies | 1 level deep (comment → reply) |
| Upvote | Toggle (1 user = 1 vote) |
| Pin | Moderator+ only, pinned comments appear at the top |
| Report | Sends the comment to the moderation queue |
| Edit | Modifies content, increments `editedCount` |
| Delete | Soft delete (`deletedAt`), record is kept in DB |
| Filter | `top_level` (root comments only) or `all` |
| Sort | `createdAt`, `upvotes`, or a combined sort |
| Anchor scroll | URL hash `#comment-{id}` auto-scrolls to the target comment |

### Comment Badges

- `pinned` — comment was pinned by a moderator
- `moderator` / `admin` — role badge on the author's avatar

---

## 12. Feature: Moderation

### Role Permissions

| Role | Permissions |
|---|---|
| `admin` | Manage moderators (add/remove) + all moderator permissions |
| `moderator` | View and resolve reports, ban/unban addresses, delete comments |
| `user` | Create proposals, comments, upvote, report |

All moderation actions use **wallet signatures** for authentication (no sessions or cookies).

### Moderator Management

```
Add moderator:    Admin signs → POST /moderation/moderators/{address}
Remove moderator: Admin signs → DELETE /moderation/moderators/{address}
```

### Ban Workflow

```
Ban:   Mod/Admin signs → POST /moderation/ban/{address}
         body: { reason?, expiresAt? (null = permanent) }
Unban: Mod/Admin signs → DELETE /moderation/ban/{address}
```

Banned addresses are blocked from all forum actions (creating proposals, commenting, upvoting...).

### Report Workflow

```
User reports a comment → status: "pending"
Moderator reviews:
  → Resolve: delete comment + status = "reviewed"
  → Reject:  keep comment + status = "rejected"
```

### Report Statuses

| Status | Description |
|---|---|
| `pending` | Newly reported, not yet reviewed |
| `reviewed` | Reviewed and acted upon (usually with comment deletion) |
| `rejected` | Reviewed and dismissed |

---

## 13. Core Math Utilities

### Precision Constants

| Constant | Value | Used for |
|---|---|---|
| `WAD` | 10¹⁸ | Token amounts |
| `RAY` | 10²⁷ | Interest rates, liquidity indices |
| `HALF_WAD` | 10¹⁸ / 2 | Rounding |
| `HALF_RAY` | 10²⁷ / 2 | Rounding |
| `SECONDS_PER_YEAR` | 31,536,000 | APY/APR conversion |
| `LTV_PRECISION` | 4 | LTV and liquidation threshold (expressed in basis points × 10⁴) |
| `USD_DECIMALS` | 8 | Chainlink USD price decimals |
| `RAY_DECIMALS` | 27 | Normalizing ray values |

### Key Functions

| Function | Algorithm | Description |
|---|---|---|
| `calculateCompoundedInterest` | 3rd-order binomial approximation | Compound interest for variable rate |
| `binomialApproximatedRayPow(r, n)` | `1 + n·r + n(n-1)/2·r² + n(n-1)(n-2)/6·r³` | Approximates `(1+r)^n` |
| `getCompoundedBalance` | `principal × compoundedInterest × reserveIndex` | Variable debt after accrual |
| `calculateLinearInterest` | `1 + rate × timeDelta / SECONDS_PER_YEAR` | Linear interest (supply index) |
| `getLinearBalance` | `balance × normalizedIncome` | Actual aToken balance with earned interest |
| `getCompoundedStableBalance` | `principal × compoundedInterest(userStableRate)` | Per-user stable debt after accrual |
| `calculateAvailableBorrowsMRC` | `collateral × LTV − totalBorrows` (clamped ≥ 0) | Remaining borrow capacity |
| `getMarketReferenceCurrencyAndUsdBalance` | `balance × priceInMRC` → `× marketRefPriceInUsd` | Converts token balance → MRC → USD |

---

## 14. Special Token: WQDAY ↔ QDAY

Some reserves support both **ERC-20 (WQDAY)** and the **native token (QDAY)**:

| Operation | WQDAY (ERC-20) | QDAY (native) |
|---|---|---|
| Supply | `approve` → `deposit()` | `depositETH()` via WETHGateway |
| Withdraw | `withdraw()` | `approveAToken` → `withdrawETH()` |
| Borrow | `borrow()` | `approveDelegation` → `borrowETH()` |
| Repay | `approve` → `repay()` | `repayETH()` (sends native value) |

**Gas buffer (native):** 0.001 QDAY is reserved when computing the Max repay amount to prevent the transaction from failing due to insufficient gas.

**Delegation:** Native borrow requires `approveDelegation(wethGateway, amount)` on the `variableDebtToken` because the WETHGateway borrows on behalf of the user.

---

## 15. Full Data Flow

```
Smart Contract (on-chain)
    ↓  UIPoolDataProviderV2.getReservesData() + getUserReservesData()
    ↓  polling interval
StaticPoolDataProvider
    ↓  normalizes marketRefPriceInUsd (÷ 10^6, see note below)
    ↓  setStaticData()
usePoolDataStore (Zustand)
    ├── rawReserves[]
    ├── rawUserReserves[]
    ├── marketRefPriceInUsd        ← human-readable USD price of QDAY
    └── marketRefCurrencyDecimals
    ↓
useFormattedPoolData() — useMemo, recomputes when timestamp changes
    ├── reserves[]  ← formatReserve() per asset
    └── user        ← formatUserSummary() (when wallet is connected)
    ↓
Feature hooks
    ├── useMarketSummary()    → Market page  (totalLockedInUsd, utilizationRate, weightedAPY)
    ├── useDashboardData()    → Dashboard page  (netWorth, netApy, borrowPowerUsed)
    └── (direct usage)        → ReserveOverview page  (USD value display, projected HF)
    ↓
UI Components
```

> `useCurrentTimestamp(1)` ticks every second → triggers `useMemo` recompute → interest accrual is reflected in the UI in real-time without additional blockchain calls.

### `marketRefPriceInUsd` — Normalization Note

> **This value is used app-wide** wherever any token balance is converted to USD:
> Market Overview totals, Dashboard net worth, Reserve Overview amount inputs, User Summary, and Health Factor projections all depend on it.

The QDAY/USD Chainlink aggregator on-chain uses **6 decimals** (not the standard 8).
A raw contract value of `4299000000` represents **$4,299.00**.

`StaticPoolDataProvider` normalizes it before storing:

```typescript
// providers/static-pool-data-provider.tsx
const QDAY_AGGREGATOR_DECIMALS = 6;
marketRefPriceInUsd = normalize(rawPriceInUsd, QDAY_AGGREGATOR_DECIMALS) // ÷ 10^6
```

Every USD conversion downstream then follows the same pattern:

```typescript
// e.g. in useMarketSummary, useDashboardData, generateRawUserSummary
amountInUsd = tokenAmount × priceInMRC × marketRefPriceInUsd
```

If this constant is ever wrong (e.g. the aggregator is replaced with one using 8 decimals),
all USD figures across the entire app will be off by a factor of 100.
