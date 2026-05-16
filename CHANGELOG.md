## [1.0.0-develop.15](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.14...v1.0.0-develop.15) (2026-05-16)

### Features

* forum proposal list & create new proposal ([1f735cd](https://github.com/PQALabs/q-leap-frontend/commit/1f735cddac37e2056671f72ecd48ed0b431e6366))

## [1.0.0-develop.14](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.13...v1.0.0-develop.14) (2026-05-15)

### Bug Fixes

* validate env ([bdcbae1](https://github.com/PQALabs/q-leap-frontend/commit/bdcbae17ae88097b021f2a5b36ce0c901624992e))

## [1.0.0-develop.13](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.12...v1.0.0-develop.13) (2026-05-15)

### Bug Fixes

* **config:** remove NEXT_PUBLIC_ prefix from runtime env vars ([d870af1](https://github.com/PQALabs/q-leap-frontend/commit/d870af1c2d59b9f4e097817225f9dca73f514761))

## [1.0.0-develop.12](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.11...v1.0.0-develop.12) (2026-05-15)

### Bug Fixes

* **config:** update env var names to use NEXT_PUBLIC_ prefix ([0474fce](https://github.com/PQALabs/q-leap-frontend/commit/0474fce7206d2aa105750f059b246f860e89ef2e))

## [1.0.0-develop.11](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.10...v1.0.0-develop.11) (2026-05-15)

### Bug Fixes

* defer runtime config reads to lazy evaluation ([3a8d2e0](https://github.com/PQALabs/q-leap-frontend/commit/3a8d2e02f5d0dd817e230774320d41dad4345f07))

## [1.0.0-develop.10](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.9...v1.0.0-develop.10) (2026-05-15)

### Features

* add runtime feature flags for liquidation and testnet ([d2e735b](https://github.com/PQALabs/q-leap-frontend/commit/d2e735b0a14f6c613a154077125b430b5272c472))
* **config:** replace build-time NEXT_PUBLIC_ENABLE_* with runtime feature flags ([504f4b0](https://github.com/PQALabs/q-leap-frontend/commit/504f4b0b65313afc3fba8b0a7a7bf743325e423d))

### Bug Fixes

* clean up commented code in liquidationtable and adjust import order in providers ([442f434](https://github.com/PQALabs/q-leap-frontend/commit/442f434492660e11b41cc49a4fe859446366a84c))

## [1.0.0-develop.9](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.8...v1.0.0-develop.9) (2026-05-12)

### Bug Fixes

* pin pnpm version in dockerfile to ensure compatibility with node_image ([c4a0d42](https://github.com/PQALabs/q-leap-frontend/commit/c4a0d426c56313272e4d26ab99a3dd331ef2ddff))

## [1.0.0-develop.8](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.7...v1.0.0-develop.8) (2026-05-06)

### Bug Fixes

* validate cd pipeline ([b258ecd](https://github.com/PQALabs/q-leap-frontend/commit/b258ecdbf26b90c3fa653aa68bf15c0f95bcb009))

## [1.0.0-develop.7](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.6...v1.0.0-develop.7) (2026-05-05)

### Bug Fixes

* exclude api routes from next-intl middleware matcher ([37a2fbd](https://github.com/PQALabs/q-leap-frontend/commit/37a2fbde326cd4e733633a3ad731a422c11fae0c))

## [1.0.0-develop.6](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.5...v1.0.0-develop.6) (2026-05-05)

### Bug Fixes

* Add NEXT_PUBLIC_ENABLE_LIQUIDATION build arg to release workflow so the liquidation page is enabled on develop builds. ([9efc828](https://github.com/PQALabs/q-leap-frontend/commit/9efc82836f07690dff31f146bc3c919a9e941bcf))

## [1.0.0-develop.5](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.4...v1.0.0-develop.5) (2026-05-05)

### Bug Fixes

* add NEXT_PUBLIC_ENABLE_LIQUIDATION build arg to dockerfile ([3463839](https://github.com/PQALabs/q-leap-frontend/commit/34638390fe05c7155cb0dd136985401783a31219))

## [1.0.0-develop.4](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.3...v1.0.0-develop.4) (2026-05-05)

### Features

* add liquidation dialog and hooks for liquidation process ([4f8bda0](https://github.com/PQALabs/q-leap-frontend/commit/4f8bda02c0c1d13d0cff7464468e8af03c029e94))
* implement liquidation queue dashboard with position monitoring and management components ([bd8fad1](https://github.com/PQALabs/q-leap-frontend/commit/bd8fad141ef75afb9ec30315ddd43ffa54b4b6aa))
* liquidation feature flag, balance validation in dialog ([94737a3](https://github.com/PQALabs/q-leap-frontend/commit/94737a348fab7cac04ff87ffdd07f039c223d203))

## [1.0.0-develop.3](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.2...v1.0.0-develop.3) (2026-05-05)

### Features

* integrate internationalization for toast messages and ui labels ([2bb3068](https://github.com/PQALabs/q-leap-frontend/commit/2bb30684d58540a009d5a824d69a5f89b8857f48))

## [1.0.0-develop.2](https://github.com/PQALabs/q-leap-frontend/compare/v1.0.0-develop.1...v1.0.0-develop.2) (2026-05-04)

### Bug Fixes

* pass NEXT_PUBLIC_ENABLE_TESTNET and NEXT_PUBLIC_API_URL as build args ([779b801](https://github.com/PQALabs/q-leap-frontend/commit/779b801473d5366db9074686a873a8074730d582))

## 1.0.0-develop.1 (2026-05-04)

### Features

* add CI and release workflows for automated testing and deployment ([1b75973](https://github.com/PQALabs/q-leap-frontend/commit/1b75973384df3f853b787c908dbc587840b4e580))
* add dark and light mode SVG logos ([a05427e](https://github.com/PQALabs/q-leap-frontend/commit/a05427e0649b8db20fb3954b69290daab7354ff8))
* add formatUsdFull utility and apply it to USD balance display ([9c51685](https://github.com/PQALabs/q-leap-frontend/commit/9c51685dbcdea47762ef59a908ec51ba10837f9e))
* add name prop to AssetCell in CoreAssetsMobile component ([c3bfb80](https://github.com/PQALabs/q-leap-frontend/commit/c3bfb80c49e9b0f2d930a813537a013322698029))
* add real-time debt tracking and internationalization to RepayWithCollateralPanel ([1cff39f](https://github.com/PQALabs/q-leap-frontend/commit/1cff39f852e8df9d2d05d019ff8eb7bc44ed6236))
* add revoke allowance functionality to RepayWithCollateral hook and UI ([98c15f7](https://github.com/PQALabs/q-leap-frontend/commit/98c15f7233308f41dcd32a7cabf516c575f70c58))
* add Uniswap V3 repay adapter and update UI to handle max repayment/withdrawal states ([ca58cd0](https://github.com/PQALabs/q-leap-frontend/commit/ca58cd04142b06cb7681780ea9b23fbbfbf4bf5a))
* collapsible UI for borrow/repay/supply/withdraw, adding USD display to amount inputs ([77eb355](https://github.com/PQALabs/q-leap-frontend/commit/77eb3552829a6ae5b55ba6511d8bb87b77d19166))
* dashboard page, borrowing, and repay functionalities ([d47cc6b](https://github.com/PQALabs/q-leap-frontend/commit/d47cc6ba9ddf3cd798f28d3d3d9284acc204f999))
* dust auto-expansion to truncateInputAmount, improve AmountInput usability ([f1f0c81](https://github.com/PQALabs/q-leap-frontend/commit/f1f0c818e34fdc24e3c7d131800712433ae2410b))
* feat: Add "Go to Dashboard" button to all success dialogs ([cc18019](https://github.com/PQALabs/q-leap-frontend/commit/cc1801957cc99c607801ed5e851b48c8633fce9c))
* implement real-time Chainlink price feed module and dashboard page ([7467500](https://github.com/PQALabs/q-leap-frontend/commit/7467500d5ae6480c591f9488c14159b60be9ae52))
* implement repay with collateral functionality and improve dust amount formatting in UI ([1519835](https://github.com/PQALabs/q-leap-frontend/commit/1519835249b9f11e92188f2cf15c49c05d0e3a75))
* implement wallet connection, introduce new UI components, and restructure app routing ([c38a84d](https://github.com/PQALabs/q-leap-frontend/commit/c38a84d6f74d75b3f88296bb8c7e6acd72140f71))
* inject display names into dashboard reserve data and update tables to render asset names ([8d7e393](https://github.com/PQALabs/q-leap-frontend/commit/8d7e3932af1067f0dfe5f2527bab876a420f9835))
* market page and others setup ([02be7c0](https://github.com/PQALabs/q-leap-frontend/commit/02be7c06070cc0e0081db3f70982781fb2f95722))
* refactor dashboard UI by separating components ([4dbbd34](https://github.com/PQALabs/q-leap-frontend/commit/4dbbd341a6df5576201e18da9c6c82697a68a71d))
* supply and withdraw ([9f86404](https://github.com/PQALabs/q-leap-frontend/commit/9f8640482838cdd1ba1d7254b762750e42e2e3d1))
* useMarketSummary, add useCopy, enhance market UI ([36ab3a0](https://github.com/PQALabs/q-leap-frontend/commit/36ab3a0e31589532bc88a5e9975bda60f048c9a9))

### Bug Fixes

* 620, 617, 619, 618 ([5671151](https://github.com/PQALabs/q-leap-frontend/commit/5671151cece3103690ff037810265a5adbfb569e))
* 628, 629 ([592a176](https://github.com/PQALabs/q-leap-frontend/commit/592a1769301a63324b59bfdbe57238f66652b535))
* 631, 632, 633 ([9facf66](https://github.com/PQALabs/q-leap-frontend/commit/9facf66162ac6d916589f43e81d282560d67637c))
* 635, 636, 637, 638, 639 ([e072dcc](https://github.com/PQALabs/q-leap-frontend/commit/e072dccf36225884a135694b4e170fede85b69de))
* add debug log ([59ac273](https://github.com/PQALabs/q-leap-frontend/commit/59ac273d8b8d1be83363b6de52dcd5073bc370d3))
* add debug log ([e1f5b37](https://github.com/PQALabs/q-leap-frontend/commit/e1f5b375269b11c3aad28be41854c9a289579fde))
* add debug log ([3745409](https://github.com/PQALabs/q-leap-frontend/commit/3745409799cf544a3d99b2526398582d0be45da0))
* build issue ([4535f9d](https://github.com/PQALabs/q-leap-frontend/commit/4535f9d634fd2fc46cecd20539576128c3be2d20))
* build issue ([ca365b3](https://github.com/PQALabs/q-leap-frontend/commit/ca365b3a606454ef6bfb422dab4512ff2ee0128b))
* build issue ([2b5dd19](https://github.com/PQALabs/q-leap-frontend/commit/2b5dd19bc9420ba3be2e13ea76ed9d1317b16a72))
* clamp dust branch upper bound to 0.01 regardless of maxdigits ([6799f32](https://github.com/PQALabs/q-leap-frontend/commit/6799f321ada39f7005f293d7153fa168dc84069a))
* connect wallet issue ([8285532](https://github.com/PQALabs/q-leap-frontend/commit/828553283495dc79849eee1553ecc0d8c6411cc3))
* correct truncate floating point precision and test expectations ([d43f6e4](https://github.com/PQALabs/q-leap-frontend/commit/d43f6e4958ad1c2a7f497737321825851c9eaa7f))
* freeze lockfile ([ed6501f](https://github.com/PQALabs/q-leap-frontend/commit/ed6501f40aa60e4eb276093e78fdb081a75e34be))
* freeze lockfile ([7c62a05](https://github.com/PQALabs/q-leap-frontend/commit/7c62a056712bd03987b3269a00f7fe821b79d3d7))
* freeze lockfile ([a2a0904](https://github.com/PQALabs/q-leap-frontend/commit/a2a0904ab6380ada0a1cd68306eb2bafe069df11))
* handle floating-point dust and scientific notation in token amount parsing and approval logic ([0d459a7](https://github.com/PQALabs/q-leap-frontend/commit/0d459a70ed0f2505e23855df7237883fa6cf5466))
* hotfix vercel build issue ([f646130](https://github.com/PQALabs/q-leap-frontend/commit/f646130c4d06abb1a5259221c70a81a65928a508))
* hotfix vercel build issue ([f1db487](https://github.com/PQALabs/q-leap-frontend/commit/f1db48792313c9aaab1c30afb2563d231fb31980))
* hotfix vercel deps issue ([693b1d2](https://github.com/PQALabs/q-leap-frontend/commit/693b1d2a26adf5922a797b95ce7e53326c030b1e))
* improve MAX borrow amount synchronization and error ([f9b50aa](https://github.com/PQALabs/q-leap-frontend/commit/f9b50aaa97c80ac988755d310799fbaf544c463f))
* proxy frontend api calls to backend via next.js rewrites ([f01a947](https://github.com/PQALabs/q-leap-frontend/commit/f01a9476df0a6e160420bb63d48df970d3b42dc0))
* remove not available url ([6f0045e](https://github.com/PQALabs/q-leap-frontend/commit/6f0045edb9ba2d174eb43bc69261b7298c5016dd))
* ui issue ([c5a32e3](https://github.com/PQALabs/q-leap-frontend/commit/c5a32e3a8bfd4689289d816dab974216a26cf64c))
* ui issue ([e02e6c4](https://github.com/PQALabs/q-leap-frontend/commit/e02e6c48d304b74c4d47b56db151d8c811d64f07))
* update REPAY_WITH_COLLATERAL_ADAPTER address in market configuration ([44bd081](https://github.com/PQALabs/q-leap-frontend/commit/44bd081ce61473666e1aee9504b9ced2428d3884))
* update truncation logic for dust values in format token amount tests ([cc101fe](https://github.com/PQALabs/q-leap-frontend/commit/cc101fe4a08d370ad9875777999dd306bcd65066))
