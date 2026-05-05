import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { env } from '@/config/env';
import { Liquidation } from '@/modules/liquidation/Liquidation';

export const metadata: Metadata = {
  title: 'Liquidation Queue',
  description: 'View and execute liquidations on under-collateralized positions.',
};

export default function LiquidationPage() {
  if (!env.ENABLE_LIQUIDATION) {
    notFound();
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <Liquidation />
    </div>
  );
}
