'use client';

import { useMarketSummary } from '../hooks/useMarketSummary';
import { CoreAssets } from './CoreAssets';
import { CoreAssetsSkeleton, MarketSummarySkeleton } from './MarketSkeletons';
import { MarketSummary } from './MarketSummary';

export function MarketContent() {
  const {
    isLoading,
    totalLockedInUsd,
    totalAvailableInUsd,
    totalBorrowedInUsd,
    utilizationRate,
    utilizationRateLabel,
    coreAssets,
  } = useMarketSummary();

  return (
    <>
      {/* ② Summary */}
      {isLoading ? (
        <MarketSummarySkeleton />
      ) : (
        <MarketSummary
          totalMarketSize={totalLockedInUsd}
          totalAvailable={totalAvailableInUsd}
          totalBorrowed={totalBorrowedInUsd}
          utilizationRate={utilizationRate}
          utilizationRateLabel={utilizationRateLabel}
        />
      )}

      {/* ③ Core assets */}
      {isLoading ? <CoreAssetsSkeleton /> : <CoreAssets assets={coreAssets} />}
    </>
  );
}
