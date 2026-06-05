# Where We Left Off — Strategy Memo

> **Written:** 2026-06-02 | **Branch at pause:** `feat/user-profile`
> **Purpose:** Onboarding context for the next developer picking up this project after a hold period.

---

## 1. Current State

### Fully Implemented & Stable

| Feature               | Location                                  | Notes                                             |
| --------------------- | ----------------------------------------- | ------------------------------------------------- |
| Market overview       | `src/modules/market/`                     | Displays all reserves with supply/borrow APY      |
| Reserve detail        | `src/modules/reserve-overview/` (assumed) | Per-asset supply/borrow UI                        |
| Supply flow           | `src/hooks/use-supply.ts`                 | ERC20 approve → LendingPool.deposit               |
| Borrow flow           | `src/hooks/use-borrow.ts`                 | Health factor check → LendingPool.borrow          |
| Repay flow            | `src/hooks/use-repay.ts`                  | Standard repay                                    |
| Withdraw flow         | `src/hooks/use-withdraw.ts`               | LendingPool.withdraw                              |
| Repay with collateral | `src/hooks/use-liquidation.ts`            | UniswapV3RepayAdapter — Testnet only              |
| Wallet auth           | `src/lib/wagmi-config.ts`                 | MetaMask (EIP-6963 + SDK fallback)                |
| Forum auth            | `src/stores/use-forum-auth-store.ts`      | Nonce-based wallet signature → JWT                |
| Forum — proposals     | `src/modules/forum/`                      | CRUD, Markdown editor                             |
| Forum — comments      | `src/modules/forum/`                      | Create, upvote, report                            |
| Moderation tools      | `src/modules/moderation/`                 | Ban addresses, resolve reports, manage moderators |
| Liquidation dashboard | `src/modules/liquidation/`                | View and execute liquidations                     |
| User profile          | `src/modules/user-profile/`               | Avatar, preferences — last active branch          |
| Notifications         | `src/api/notifications/`                  | API client exists                                 |
| i18n                  | `src/messages/` + `src/i18n/`             | Internationalization scaffolded                   |
| Dark/light theme      | `next-themes`                             | Fully working                                     |
| Docker deployment     | `docker/Dockerfile`                       | Multi-stage, non-root, dumb-init                  |
| Kubernetes GitOps     | ArgoCD + Kargo                            | Pipeline established                              |

### Partially Built / Unstable

| Feature                      | Status             | Known Issue                                                             |
| ---------------------------- | ------------------ | ----------------------------------------------------------------------- |
| i18n coverage                | Framework in place | Not all strings are translated — `src/messages/` may be incomplete      |
| UIPoolDataProviderV2 address | Not hardcoded      | Must be derived at runtime from AddressProvider — verify on both chains |
| WalletConnect                | Disabled           | Connector is commented out in `wagmi-config.ts`                         |

### Known Bottlenecks

| Area                | Issue                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| Pool data polling   | Fixed 15s interval — no push mechanism; high RPC load under many users   |
| JWT security        | localStorage storage is XSS-vulnerable                                   |
| Single-key admin    | No multi-sig on LendingPool admin — critical before scaling TVL          |
| No audit            | Smart contracts unaudited — hard ceiling on trust before significant TVL |
| Trivy scan disabled | `picomatch` CVE blocks CI scan — dependency needs update                 |

---

## 2. Feature Expansion Backlog

Priority order as of the project pause.

### P0 — Security & Production Readiness

- [ ] **Migrate JWT to HttpOnly cookie** — eliminates XSS session theft risk
- [ ] **Add Safe multisig for protocol admin** — 2-of-3 threshold on LendingPoolAddressProvider owner
- [ ] **Re-enable Trivy CVE scan in CI** — update `picomatch` to fix CVE-2026-33671
- [ ] **Commission smart contract security audit** — required before significant Mainnet TVL

### P1 — Core Protocol Features

- [ ] **Staking module** — `enabledFeatures.staking: true` on Mainnet config but UI not built
- [ ] **Governance/voting module** — `enabledFeatures.governance: true` on Mainnet but UI not built
- [ ] **Incentives/rewards display** — `enabledFeatures.incentives: true` flagged but not surfaced
- [ ] **Faucet (Testnet)** — `enabledFeatures.faucet: true` on Mainnet config — build Testnet token faucet UI
- [ ] **WalletConnect support** — re-enable connector for broader wallet compatibility

### P2 — UX Improvements

- [ ] **Real-time pool data** — replace 15s polling with WebSocket or SSE push from backend
- [ ] **Notifications UI** — the API client exists; build the notification panel component
- [ ] **Full i18n coverage** — audit all user-facing strings and complete translations
- [ ] **Transaction history** — per-user on-chain event history (requires backend indexer)

### P3 — Infrastructure

- [ ] **Automated contract address registry** — load addresses from AddressProvider on-chain rather than hardcoding
- [ ] **End-to-end tests** — no E2E test suite exists; add Playwright coverage for critical user flows
- [ ] **Increase unit test coverage** — especially math utilities and transaction hooks

---

## 3. Historical Architecture Decisions

### Why Next.js App Router with server-side API proxying?

The backend is a ClusterIP-only Kubernetes service. To avoid exposing it publicly (CORS, attack surface), the Next.js server acts as a reverse proxy. This also enables future server-side rendering of personalized data without CORS headers. Decision made during initial architecture planning.

### Why wagmi v3 + viem instead of ethers.js directly?

wagmi provides auto-generated typed hooks from ABIs (via wagmi CLI), React Query integration for caching and refetching, and SSR-safe hydration. ethers.js is kept as a supplemental utility for formatting. Decision made at project start.

### Why Zustand for global state?

Lightweight compared to Redux; supports `persist` middleware for localStorage auth state; works without a provider wrapper. The `auto-zustand-selectors-hook` library eliminates manual selector boilerplate. Chosen for simplicity given the scope of the app.

### Why QDay-specific chains instead of a standard EVM?

Q-LEAP is purpose-built for the QDay network (post-quantum resistant blockchain). The app supports other EVM chains only for wallet connectivity — the lending protocol contracts are deployed exclusively on QDay.

### Why the forum authentication uses wallet signatures?

The app has no email/password system. All identity is wallet-based. The signature-based nonce flow (SIWE-style) is the standard Web3 authentication pattern. It proves wallet ownership without exposing private keys.

### Why `NEXT_PUBLIC_ENABLE_*` flags exist alongside runtime ConfigMap flags?

Build-time `NEXT_PUBLIC_*` flags were used early in development for quick local testing. The Kubernetes ConfigMap runtime flags (`ENABLE_*` without `NEXT_PUBLIC_`) allow feature toggling without rebuilding the Docker image. Both mechanisms coexist — the runtime flags take precedence in production.

---

## 4. Development Branching Context

| Branch              | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `main`              | Production-ready code                                  |
| `develop`           | Integration branch                                     |
| `feat/user-profile` | Last active — user profile update (see recent commits) |

**Recent commits at pause:**

- `feat: user profile update`
- `feat: refactor and enhance ui`
- `feat: notification, enhancement and polish`
- `feat: moderation tools`
