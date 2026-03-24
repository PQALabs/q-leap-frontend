'use client';

import { Info } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UsdValue } from '@/components/usd-value';

interface MarketBasicInfoProps {
  name: string;
  description: string;
  logoUrl?: string;
  netWorth: number;
  netApy: string | null;
  onViewTransactions?: () => void;
}

export function MarketBasicInfo({ name, description, netWorth, netApy, onViewTransactions }: MarketBasicInfoProps) {
  const t = useTranslations('modules.market.MarketBasicInfo');

  return (
    <div className='relative flex flex-col gap-4 rounded-2xl'>
      {/* View Transactions button — top right */}
      {/* <Button
        variant='outline'
        size='sm'
        className='absolute top-5 right-0 hidden font-semibold text-xs uppercase tracking-widest sm:flex'
        onClick={onViewTransactions}
      >
        {t('viewTransactions')}
      </Button> */}

      {/* Logo + Title */}
      <div className='flex items-center gap-3'>
        <Image src={'/qday-logo.svg'} alt={name} width={40} height={40} />
        <div>
          <h1 className='font-bold text-foreground text-xl leading-tight'>{name}</h1>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </div>
      </div>

      {/* Divider */}
      <div className='h-px w-full bg-border' />

      {/* Stats row */}
      <div className='flex flex-wrap items-end gap-8'>
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-center gap-1 text-muted-foreground text-xs'>
            {t('netWorth')}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={12} className='cursor-help text-muted-foreground/70' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  {t('netWorthTooltip')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className='font-bold text-2xl text-foreground'>
            <UsdValue value={netWorth} />
          </span>
        </div>

        {/* Net APY */}
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-center gap-1 text-muted-foreground text-xs'>
            {t('netApy')}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={12} className='cursor-help text-muted-foreground/70' />
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  {t('netApyTooltip')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className='font-semibold text-2xl text-foreground'>{netApy ?? '—'}</span>
        </div>

        {/* Available Rewards */}
        {/* <div className='flex flex-col gap-0.5'>
          <span className='text-muted-foreground text-xs'>Available rewards</span>
          <div className='flex items-center gap-2'>
            <span className='font-bold text-2xl text-foreground'>{availableRewards}</span>
            <button
              type='button'
              onClick={onClaimRewards}
              className='rounded-xs bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-1 font-bold text-white text-xs tracking-wider shadow-md transition-all hover:brightness-110 active:scale-95'
            >
              CLAIM
            </button>
          </div>
        </div> */}
      </div>

      {/* Mobile: View Transactions */}
      {/* <Button
        variant='outline'
        size='sm'
        className='w-full font-semibold text-xs uppercase tracking-widest sm:hidden'
        onClick={onViewTransactions}
      >
        {t('viewTransactions')}
      </Button> */}
    </div>
  );
}
