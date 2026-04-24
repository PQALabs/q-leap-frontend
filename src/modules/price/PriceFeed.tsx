'use client';

import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChainlinkPrice } from '@/hooks/use-chainlink-price';
import { cn } from '@/lib/utils';
import { usePoolDataStore } from '@/stores/use-pool-data-store';

const AGGREGATOR_ADDRESS = '0xfD26034797B16A26AE5bf78dA013b6ad81F5f324' as `0x${string}`;
const POLL_INTERVAL = 15_000; // 10 seconds

export function PriceFeed() {
  const t = useTranslations('modules.price');
  const tCommon = useTranslations('common');
  const networkConfig = usePoolDataStore.use.networkConfig();
  const explorerLink = networkConfig?.explorerLink;

  const { price, decimals, description, updatedAt, isLoading, isError, refetch } = useChainlinkPrice(
    AGGREGATOR_ADDRESS,
    POLL_INTERVAL
  );

  // ── Flash animation state ──
  const [flash, setFlash] = useState(false);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price !== null && prevPrice !== null && price !== prevPrice) {
      setDirection(price > prevPrice ? 'up' : 'down');
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1000);
      return () => clearTimeout(timer);
    }
    if (price !== null) {
      setPrevPrice(price);
    }
  }, [price, prevPrice]);

  // Update prevPrice after direction is set
  useEffect(() => {
    if (price !== null) {
      setPrevPrice(price);
    }
  }, [price]);

  const formattedPrice = price !== null ? price.toFixed(decimals ?? 8) : '—';
  const updatedAtStr = updatedAt ? new Date(updatedAt * 1000).toLocaleString() : '—';

  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pt-0 pb-12 md:pt-8'>
      {/* Back */}
      <Link
        href='/'
        className='inline-flex w-fit items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground'
      >
        <ArrowLeft size={14} /> {tCommon('back')}
      </Link>

      {/* Header */}
      <div className='flex flex-col gap-1'>
        <h1 className='font-bold text-2xl text-foreground'>{t('title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('subtitle')}</p>
      </div>

      {/* Price Card */}
      <div className='relative overflow-hidden rounded-xs border border-border bg-card'>
        {/* Gradient accent bar */}
        <div className='h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60' />

        <div className='flex flex-col gap-6 p-6 sm:p-8'>
          {/* Pair label */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm'>
                W/Q
              </div>
              <div>
                <p className='font-semibold text-foreground text-lg'>{description ?? 'WQDAY / QDAY'}</p>
                <p className='text-muted-foreground text-xs'>Chainlink V3 Aggregator</p>
              </div>
            </div>
            <Button variant='ghost' size='icon-sm' onClick={() => refetch()} title={t('refresh')}>
              <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} />
            </Button>
          </div>

          {/* Divider */}
          <div className='h-px w-full bg-border' />

          {/* Price display */}
          <div className='flex flex-col items-center gap-2 py-4'>
            {isError ? (
              <p className='font-medium text-destructive'>{t('error')}</p>
            ) : isLoading && price === null ? (
              <div className='flex flex-col items-center gap-2'>
                <div className='h-12 w-48 animate-pulse rounded-md bg-muted' />
                <div className='h-4 w-32 animate-pulse rounded-md bg-muted' />
              </div>
            ) : (
              <>
                <p
                  className={cn(
                    'font-bold font-mono text-4xl text-foreground transition-colors duration-500 sm:text-5xl',
                    flash && direction === 'up' && 'text-emerald-500',
                    flash && direction === 'down' && 'text-red-500'
                  )}
                >
                  {formattedPrice}
                </p>
                <span className='text-muted-foreground text-xs'>
                  {decimals !== null ? `${t('decimals')}: ${decimals}` : ''}
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className='h-px w-full bg-border' />

          {/* Info rows */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <InfoRow label={t('lastUpdated')} value={updatedAtStr} />
            <InfoRow label={t('pollingInterval')} value={`${POLL_INTERVAL / 1000}s`} />
            <InfoRow
              label={t('contractAddress')}
              value={
                <span className='flex items-center gap-1'>
                  <span className='font-mono text-xs'>
                    {AGGREGATOR_ADDRESS.slice(0, 6)}…{AGGREGATOR_ADDRESS.slice(-4)}
                  </span>
                  {explorerLink && (
                    <a
                      href={`${explorerLink}/address/${AGGREGATOR_ADDRESS}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-muted-foreground transition-colors hover:text-foreground'
                      title={t('viewOnExplorer')}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </span>
              }
            />
            <InfoRow label={t('source')} value='Chainlink V3' />
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Small helper ──
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between rounded-md border border-border/50 px-3 py-2'>
      <span className='text-muted-foreground text-xs'>{label}</span>
      <span className='font-medium text-foreground text-xs'>{value}</span>
    </div>
  );
}
