'use client';

import { useTranslations } from 'next-intl';
import { MARKET_NAME } from '@/config/market';
import { CoreAssets } from './components/CoreAssets';
import { MarketBasicInfo } from './components/MarketBasicInfo';
import { CoreAssetsSkeleton, MarketSummarySkeleton } from './components/MarketSkeletons';
import { MarketSummary } from './components/MarketSummary';
import { useMarketSummary } from './hooks/useMarketSummary';

export function Market() {
  const t = useTranslations('modules.market.Market');

  const {
    isLoading,
    netWorth,
    netApy,
    totalLockedInUsd,
    totalAvailableInUsd,
    totalBorrowedInUsd,
    utilizationRate,
    utilizationRateLabel,
    coreAssets,
  } = useMarketSummary();

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-6 pt-0 pb-8 md:pt-8'>
      {/* ① Basic info */}
      <MarketBasicInfo name={MARKET_NAME} description={t('marketDescription')} netWorth={netWorth} netApy={netApy} />

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
    </main>
  );
}
