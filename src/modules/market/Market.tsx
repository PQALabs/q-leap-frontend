'use client';

import { useTranslations } from 'next-intl';
import { MARKET_NAME } from '@/config/market';
import { MarketBasicInfo } from './components/MarketBasicInfo';
import { MarketContent } from './components/MarketContent';

export function Market() {
  const t = useTranslations('modules.market.Market');

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-6 pt-0 pb-8 md:pt-8'>
      {/* ① Basic info */}
      <MarketBasicInfo name={MARKET_NAME} description={t('marketDescription')} />

      {/* ② Summary */}
      <MarketContent />
    </main>
  );
}
