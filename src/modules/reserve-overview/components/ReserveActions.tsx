'use client';

import { Wallet } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useConnection } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntersectionStore } from '@/stores/use-intersection-store';
import type { ComputedReserveData, UserSummary } from '@/stores/use-pool-data-store';
import { BorrowRepayPanel } from './BorrowRepayPanel';
import { SupplyWithdrawPanel } from './SupplyWithdrawPanel';

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------
interface ReserveActionsProps {
  reserve: ComputedReserveData;
  user: UserSummary | undefined;
  marketRefPriceInUsd: string;
}

export function ReserveActions({ reserve, user, marketRefPriceInUsd }: ReserveActionsProps) {
  const { address } = useConnection();
  const t = useTranslations('modules.market.ReserveActions');
  const tHeader = useTranslations('header');
  const setTargetInView = useIntersectionStore.use.setTargetInView();
  const searchParams = useSearchParams();
  const isConnected = !!address;

  // Determine default tab from URL search param: ?action=borrow → borrow-repay tab
  const action = searchParams.get('action');
  const defaultTab = action === 'borrow' || action === 'repay' ? 'borrow-repay' : 'supply-withdraw';

  return (
    <div className='relative rounded-xs border border-border bg-card p-5'>
      <Tabs defaultValue={defaultTab}>
        <TabsList className='w-full'>
          <TabsTrigger value='supply-withdraw' className='flex-1'>
            {t('supplyWithdraw')}
          </TabsTrigger>
          <TabsTrigger value='borrow-repay' className='flex-1'>
            {t('borrowRepay')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='supply-withdraw' className='pt-4'>
          <SupplyWithdrawPanel reserve={reserve} user={user} marketRefPriceInUsd={marketRefPriceInUsd} />
        </TabsContent>

        <TabsContent value='borrow-repay' className='pt-4'>
          <BorrowRepayPanel reserve={reserve} user={user} marketRefPriceInUsd={marketRefPriceInUsd} />
        </TabsContent>
      </Tabs>

      {/* ── Blur overlay when wallet not connected ── */}
      {!isConnected && (
        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xs bg-card/80 p-8 backdrop-blur-sm'>
          <Wallet className='size-10 text-muted-foreground' />
          <p className='font-semibold text-foreground'>{t('connectWalletTitle')}</p>
          <p className='text-center text-muted-foreground text-sm'>{t('connectWalletDescription')}</p>
          <Button className='mt-2' onClick={() => setTargetInView('connectWallet')} icon={<Wallet size={14} />}>
            {tHeader('connectWallet')}
          </Button>
        </div>
      )}
    </div>
  );
}
