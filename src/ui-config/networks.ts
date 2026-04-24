import { qdayMainnet, qdayTestnet } from '@/constants/wagmi';
import type { BaseNetworkConfig } from '@/types/config/types';

export const networkConfigs: Record<string, BaseNetworkConfig> = {
  [qdayMainnet.id]: {
    name: 'Qday',
    publicJsonRPCUrl: ['https://rpc.qday.io'],
    addresses: {
      walletBalanceProvider: '0x07DC923859b68e9399d787bf52c4Aa9eBe3490aF',
      uiPoolDataProvider: '0x6062ad399E47BF75AEa0b3c5BE7077c1E8664Dcb',
      uiIncentiveDataProvider: '0x9842E5B7b7C6cEDfB1952a388e050582Ff95645b',
      chainlinkFeedRegistry: '0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0',
    },
    protocolDataUrl: '',
    baseUniswapAdapter: '0xf86Be05f535EC2d217E4c6116B3fa147ee5C05A1',
    baseAsset: 'ETH',
    baseAssetWrappedAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    // incentives hardcoded information
    rewardTokenSymbol: '',
    rewardTokenAddress: '',
    rewardTokenDecimals: 18,
    explorerLink: qdayMainnet.blockExplorers.default.url,
    rpcOnly: true,
    isTestnet: false,
  },
  [qdayTestnet.id]: {
    name: 'Qday Testnet',
    publicJsonRPCUrl: ['https://rpc.qday.info'],
    addresses: {
      walletBalanceProvider: '',
      uiPoolDataProvider: '0x72A2EB1C439983193dcc7A9B9C7C615eD52B0C75',
      uiIncentiveDataProvider: '',
      chainlinkFeedRegistry: '',
    },
    protocolDataUrl: '',
    baseUniswapAdapter: '0xf86Be05f535EC2d217E4c6116B3fa147ee5C05A1',
    baseAsset: 'qDay',
    baseAssetWrappedAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    // incentives hardcoded information
    rewardTokenSymbol: '',
    rewardTokenAddress: '',
    rewardTokenDecimals: 18,
    explorerLink: qdayTestnet.blockExplorers.default.url,
    rpcOnly: true,
    isTestnet: true,
  },
} as const;
