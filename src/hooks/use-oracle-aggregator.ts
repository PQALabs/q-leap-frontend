import { parseAbi } from 'viem';
import { useReadContract } from 'wagmi';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

const addressesProviderAbi = parseAbi(['function getPriceOracle() view returns (address)']);

const oracleAbi = parseAbi(['function getSourceOfAsset(address asset) view returns (address)']);

export function useOracleAggregator(assetAddress: string | undefined) {
  const { currentMarketData, chainId } = useProtocolDataContext();
  const addressesProviderAddress = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER as `0x${string}`;

  // 1. Get Price Oracle address
  const { data: oracleAddress, isLoading: isLoadingOracle } = useReadContract({
    address: addressesProviderAddress,
    abi: addressesProviderAbi,
    functionName: 'getPriceOracle',
    chainId,
  });

  // 2. Get Aggregator (Source of Asset) address
  const { data: aggregatorAddress, isLoading: isLoadingAggregator } = useReadContract({
    address: oracleAddress as `0x${string}`,
    abi: oracleAbi,
    functionName: 'getSourceOfAsset',
    args: assetAddress ? [assetAddress as `0x${string}`] : undefined,
    chainId,
    query: {
      enabled: !!oracleAddress && !!assetAddress,
    },
  });

  return {
    aggregatorAddress: aggregatorAddress as string | undefined,
    isLoading: isLoadingOracle || isLoadingAggregator,
  };
}
