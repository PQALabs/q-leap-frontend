import { type Icon, Icons } from '@/components/icons';
import { EVM_CHAINS_IDS } from './wagmi';

export const WALLET_IDS = {
  walletConnect: 'walletConnect',
  metaMask: 'metaMaskSDK',
};

export const EVM_CONNECTORS_INFO: Record<
  string,
  {
    icon: Icon;
    isMultipleChain: boolean;
    name: string;
    allowedChains?: number[];
  }
> = {
  [WALLET_IDS.metaMask]: {
    icon: Icons.metamask,
    isMultipleChain: false,
    name: 'MetaMask',
    allowedChains: EVM_CHAINS_IDS,
  },
  [WALLET_IDS.walletConnect]: {
    icon: Icons.walletConnect,
    isMultipleChain: false,
    name: 'WalletConnect',
    allowedChains: EVM_CHAINS_IDS,
  },
};
