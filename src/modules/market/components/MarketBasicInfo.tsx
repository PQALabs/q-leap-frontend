'use client';

import Image from 'next/image';

interface MarketBasicInfoProps {
  name: string;
  description: string;
  logoUrl?: string;
  netWorth: number;
  netApy: string | null;
  onViewTransactions?: () => void;
}

export function MarketBasicInfo({ name, description }: MarketBasicInfoProps) {
  return (
    <div className='relative flex flex-col gap-4 rounded-2xl'>
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
    </div>
  );
}
