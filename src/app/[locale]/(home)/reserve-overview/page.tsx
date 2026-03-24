import { Suspense } from 'react';
import { ReserveOverview } from '@/modules/reserve-overview/ReserveOverview';

export default function ReserveOverviewPage() {
  return (
    <Suspense>
      <ReserveOverview />
    </Suspense>
  );
}
