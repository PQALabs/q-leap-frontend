import { createConfig, http } from 'wagmi';
import { arbitrum, bsc, mainnet, polygon, sepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { env } from '@/config/env';
import { EVM_CHAINS, qdayMainnet, qdayTestnet } from '@/constants/wagmi';
import { isMobileDevice } from './utils';

export const config = createConfig({
  chains: EVM_CHAINS,
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: env.APP_NAME,
        url: env.APP_URL,
        iconUrl: 'https://wagmi.io/favicon.ico',
      },
      // On mobile, allow MetaMask mobile app; on desktop, prefer browser extension
      extensionOnly: !isMobileDevice(),
    }),
    // walletConnect({
    //   projectId: env.WC_PROJECT_ID,
    //   qrModalOptions: {
    //     themeVariables: {
    //       '--wcm-z-index': '9999999',
    //     },
    //   },
    // }),
  ],
  transports: {
    [bsc.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [qdayMainnet.id]: http(),
    [qdayTestnet.id]: http(),
  },
});
