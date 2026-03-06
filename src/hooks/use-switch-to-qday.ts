import { useCallback } from 'react';
import { useSwitchChain } from 'wagmi';
import { env } from '@/config/env';
import { qdayMainnet, qdayTestnet } from '@/constants/wagmi';

/**
 * Hook for switching to the correct Qday chain based on environment
 * Uses Qday Testnet for testnet, Qday Mainnet for production
 */
export function useSwitchToQday() {
  const { mutateAsync, isPending, error, isSuccess } = useSwitchChain();

  // Get the target chain based on environment
  const targetChain = env.USE_TESTNET ? qdayTestnet : qdayMainnet;
  const targetChainId = targetChain.id;

  const switchToQday = useCallback(() => {
    return mutateAsync({
      chainId: targetChainId,
      addEthereumChainParameter: {
        chainName: targetChain.name,
        nativeCurrency: {
          name: targetChain.nativeCurrency.name,
          symbol: targetChain.nativeCurrency.symbol,
          decimals: targetChain.nativeCurrency.decimals,
        },
        rpcUrls: [...targetChain.rpcUrls.default.http],
        blockExplorerUrls: targetChain.blockExplorers?.default.url
          ? [targetChain.blockExplorers.default.url]
          : undefined,
      },
    });
  }, [mutateAsync, targetChainId, targetChain]);

  return {
    switchToQday,
    targetChain,
    targetChainId,
    isPending,
    error,
    isSuccess,
  };
}
