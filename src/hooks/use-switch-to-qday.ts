import { useCallback } from 'react';
import { useSwitchChain } from 'wagmi';
import { getRuntimeConfig } from '@/config/runtime-config';
import { qdayMainnet, qdayTestnet } from '@/constants/wagmi';

/**
 * Hook for switching to the correct Qday chain based on runtime config.
 * ENABLE_TESTNET is now a runtime flag served from /api/config (injected via
 * Kubernetes ConfigMap), so the same image works for both dev and prod.
 */
export function useSwitchToQday() {
  const { mutateAsync, isPending, error, isSuccess } = useSwitchChain();

  // Get the target chain based on runtime config (fetched at app startup)
  const { ENABLE_TESTNET } = getRuntimeConfig();
  const targetChain = ENABLE_TESTNET ? qdayTestnet : qdayMainnet;
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
