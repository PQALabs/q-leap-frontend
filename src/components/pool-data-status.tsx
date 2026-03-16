'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PoolDataError() {
  const t = useTranslations('common');
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-3'>
      <AlertCircle className='size-8 text-destructive' />
      <p className='font-medium text-foreground'>{t('poolDataError')}</p>
      <p className='text-muted-foreground text-sm'>{t('poolDataErrorHint')}</p>
    </div>
  );
}
