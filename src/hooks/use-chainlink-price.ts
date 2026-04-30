'use client';

import { useMemo } from 'react';
import { parseAbi } from 'viem';
import { useReadContracts } from 'wagmi';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

/**
 * Chainlink V3 AggregatorV3Interface – we only need latestRoundData + decimals + description.
 */
const aggregatorV3Abi = parseAbi([
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() view returns (uint8)',
  'function description() view returns (string)',
]);

export interface ChainlinkPriceData {
  /** Formatted price as a JS number */
  price: number | null;
  /** Raw answer from latestRoundData (BigInt) */
  rawAnswer: bigint | null;
  /** Aggregator decimals */
  decimals: number | null;
  /** Aggregator description (e.g. "WQDAY / QDAY") */
  description: string | null;
  /** Round ID */
  roundId: bigint | null;
  /** Timestamp of latest update (seconds) */
  updatedAt: number | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Refetch function */
  refetch: () => void;
}

/**
 * Hook to read real-time price from a Chainlink V3 Aggregator contract.
 *
 * @param aggregatorAddress - The deployed aggregator proxy address.
 * @param pollInterval - Polling interval in ms (default: 10_000 = 10s).
 */
export function useChainlinkPrice(aggregatorAddress: `0x${string}`, pollInterval = 10_000): ChainlinkPriceData {
  const { chainId } = useProtocolDataContext();

  const {
    data: contractResults,
    isLoading,
    isError,
    refetch,
  } = useReadContracts({
    contracts: [
      {
        address: aggregatorAddress,
        abi: aggregatorV3Abi,
        functionName: 'latestRoundData',
        chainId,
      },
      {
        address: aggregatorAddress,
        abi: aggregatorV3Abi,
        functionName: 'decimals',
        chainId,
      },
      {
        address: aggregatorAddress,
        abi: aggregatorV3Abi,
        functionName: 'description',
        chainId,
      },
    ],
    query: {
      refetchInterval: pollInterval,
    },
  });

  return useMemo(() => {
    const roundData = contractResults?.[0];
    const decimalsData = contractResults?.[1];
    const descriptionData = contractResults?.[2];

    if (!roundData?.result || !decimalsData?.result) {
      return {
        price: null,
        rawAnswer: null,
        decimals: null,
        description: (descriptionData?.result as string) ?? null,
        roundId: null,
        updatedAt: null,
        isLoading,
        isError,
        refetch,
      };
    }

    const [roundId, answer, , updatedAt] = roundData.result as [bigint, bigint, bigint, bigint, bigint];
    const dec = Number(decimalsData.result);
    const price = Number(answer) / 10 ** dec;

    return {
      price,
      rawAnswer: answer,
      decimals: dec,
      description: (descriptionData?.result as string) ?? null,
      roundId,
      updatedAt: Number(updatedAt),
      isLoading,
      isError,
      refetch,
    };
  }, [contractResults, isLoading, isError, refetch]);
}
