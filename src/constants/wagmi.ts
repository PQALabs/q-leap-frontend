import { type Chain, defineChain } from 'viem';
import { arbitrum, bsc, mainnet, polygon, sepolia } from 'viem/chains';

export const qdayMainnet = defineChain({
  id: 44001,
  name: 'QDay Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QDay',
    symbol: 'QDAY',
  },
  rpcUrls: {
    default: { http: ['https://rpc.qday.io'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.qday.io' },
  },
});

export const qdayTestnet = defineChain({
  id: 44003,
  name: 'QDay Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QDay',
    symbol: 'QDAY',
  },
  rpcUrls: {
    default: { http: ['https://rpc.qday.info'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.qday.info' },
  },
});

export const EVM_CHAINS: [Chain, ...Chain[]] = [mainnet, bsc, sepolia, arbitrum, polygon, qdayMainnet, qdayTestnet];

export const EVM_CHAINS_IDS: number[] = EVM_CHAINS.map((chain) => chain.id);
