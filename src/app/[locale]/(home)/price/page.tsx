import { Suspense } from 'react';
import { PriceFeed } from '@/modules/price/PriceFeed';

export default function PricePage() {
  return (
    <Suspense>
      <PriceFeed />
    </Suspense>
  );
}
