'use client';

import { Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useConnection } from 'wagmi';
import { Separator } from '@/components/ui/separator';
import { useCollateralToggle } from '@/hooks/use-collateral-toggle';
import { usePoolDataStore } from '@/stores/use-pool-data-store';
import { BorrowsTable } from './components/BorrowsTable';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { DashboardStatCards } from './components/DashboardStatCards';
import { SuppliesTable } from './components/SuppliesTable';
import { useDashboardData } from './hooks/useDashboardData';

export function Dashboard() {
  const t = useTranslations('modules.market.Dashboard');
  const { address } = useConnection();
  const isLoading = usePoolDataStore.use.isLoading();
  const user = usePoolDataStore.use.user();
  const reserves = usePoolDataStore.use.reserves();
  const refresh = usePoolDataStore.use.refresh();

  const collateralToggle = useCollateralToggle({ onSuccess: () => refresh() });

  const {
    suppliedReserves,
    borrowedReserves,
    totalSupplyUsd,
    totalBorrowUsd,
    netWorth,
    healthFactor,
    ltv,
    netApy,
    supplyApy,
    totalCollateralUsd,
    borrowApy,
    borrowPowerUsed,
    getSupplyApy,
    getBorrowApy,
  } = useDashboardData();

  if (isLoading) return <DashboardSkeleton />;

  if (!address) {
    return (
      <main className='mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-20'>
        <Wallet size={48} className='text-muted-foreground' />
        <h2 className='font-bold text-2xl'>{t('connectWalletTitle')}</h2>
        <p className='text-muted-foreground'>{t('connectWalletDescription')}</p>
      </main>
    );
  }

  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:py-10'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h1 className='font-bold text-2xl text-foreground'>{t('title')}</h1>
            <p className='text-muted-foreground text-sm'>{t('subtitle')}</p>
          </div>
        </div>
      </div>

      <Separator />

      <DashboardStatCards
        netWorth={netWorth}
        netApy={netApy}
        healthFactor={healthFactor}
        ltv={ltv}
        totalBorrowUsd={totalBorrowUsd}
      />

      <SuppliesTable
        suppliedReserves={suppliedReserves}
        user={user}
        reserves={reserves}
        collateralToggle={collateralToggle}
        totalSupplyUsd={totalSupplyUsd}
        supplyApy={supplyApy}
        totalCollateralUsd={totalCollateralUsd}
        getSupplyApy={getSupplyApy}
      />

      <Separator />

      <BorrowsTable
        borrowedReserves={borrowedReserves}
        totalBorrowUsd={totalBorrowUsd}
        borrowApy={borrowApy}
        borrowPowerUsed={borrowPowerUsed}
        getBorrowApy={getBorrowApy}
      />
    </main>
  );
}
