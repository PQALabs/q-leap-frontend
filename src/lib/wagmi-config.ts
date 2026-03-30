import { createConfig, http } from 'wagmi';
import { arbitrum, bsc, mainnet, polygon, sepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { env } from '@/config/env';
import { EVM_CHAINS, qdayMainnet, qdayTestnet } from '@/constants/wagmi';

export const config = createConfig({
  chains: EVM_CHAINS,
  ssr: true,
  connectors: [
    // EIP-6963: target MetaMask specifically via its rdns identifier.
    // This avoids grabbing window.ethereum directly, so other extensions
    // (e.g. TronLink) injecting into window.ethereum won't cause conflicts.
    injected({ target: 'metaMask' }),
    // MetaMask SDK connector — only on client to avoid SSR crashes.
    // Provides QR code / mobile deep-link fallback if EIP-6963 announce fails.
    ...(typeof window !== 'undefined'
      ? [
          metaMask({
            dappMetadata: {
              name: env.APP_NAME,
              url: env.APP_URL,
              iconUrl: 'https://wagmi.io/favicon.ico',
            },
            extensionOnly: true,
          }),
        ]
      : []),
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
