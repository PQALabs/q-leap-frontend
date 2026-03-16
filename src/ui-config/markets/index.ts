import { qdayMainnet, qdayTestnet } from '@/constants/wagmi';
import type { MarketDataType } from '@/types/config/types';

export enum CustomMarket {
  qday = 'qday',
  qdayTestnet = 'qdayTestnet',
}

export const marketsData: { [key in keyof typeof CustomMarket]: MarketDataType } = {
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x88757f2f99175387ab4c6a4b3067c77a695b0349'.toLowerCase(),
      LENDING_POOL: '0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe',
      WETH_GATEWAY: '0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70',
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
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xf11d1dAc1abEdb5eEb32375154939AE7348c4227'.toLowerCase(),
      LENDING_POOL: '0xc31F921Bcdb22A5B8D3A40088c7ac75F3Ac8EFD8',
      WETH_GATEWAY: '0xA24f64a37ac7Eb21748A3062EE6c1D86533F8aB7',
    },
  },
} as const;
