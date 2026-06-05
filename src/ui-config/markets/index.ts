import { qdayMainnet, qdayTestnet } from '@/constants/wagmi';
import type { MarketDataType } from '@/types/config/types';

export enum CustomMarket {
  qday = 'qday',
  qdayTestnet = 'qdayTestnet',
}

export const marketsData: { [key in keyof typeof CustomMarket]: MarketDataType } = {
  // TODO: Fill in verified Mainnet contract addresses before enabling this market.
  // See docs/NETWORKS_AND_ABIS.md — "How to configure Mainnet addresses".
  [CustomMarket.qday]: {
    chainId: qdayMainnet.id,
    logo: '',
    activeLogo: '',
    aTokenPrefix: 'A',
    enabledFeatures: {
      faucet: true,
      governance: true,
      staking: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '',
      LENDING_POOL: '',
      WETH_GATEWAY: '',
    },
  },
  [CustomMarket.qdayTestnet]: {
    chainId: qdayTestnet.id,
    logo: '',
    activeLogo: '',
    aTokenPrefix: 'A',
    enabledFeatures: {
      faucet: false,
      governance: false,
      staking: false,
      incentives: false,
      collateralRepay: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xf11d1dAc1abEdb5eEb32375154939AE7348c4227'.toLowerCase(),
      LENDING_POOL: '0xc31F921Bcdb22A5B8D3A40088c7ac75F3Ac8EFD8',
      WETH_GATEWAY: '0x46602aFE192A0a65eA6F48f76CCA677e42172c43',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x9A676e781A523b5d0C0e43731313A708CB607508',
    },
  },
} as const;
