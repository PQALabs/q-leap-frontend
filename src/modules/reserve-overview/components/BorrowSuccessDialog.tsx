'use client';

import { CheckCircle2, ExternalLink, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface BorrowSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  /** Human-readable amount borrowed */
  amount: string;
  /** Token symbol, e.g. "USDC" or "QDAY" */
  symbol: string;
  /** Transaction hash */
  txHash?: `0x${string}`;
  /** Block explorer base URL */
  explorerUrl?: string;
}

export function BorrowSuccessDialog({ open, onClose, amount, symbol, txHash, explorerUrl }: BorrowSuccessDialogProps) {
  const t = useTranslations('modules.market.SuccessDialog');
  const router = useRouter();

  const formattedAmount = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  const txUrl = explorerUrl && txHash ? `${explorerUrl}/tx/${txHash}` : undefined;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <div className='flex flex-col items-center gap-5 pt-4'>
          {/* ── Success icon ── */}
          <div className='flex size-16 items-center justify-center rounded-full'>
            <CheckCircle2 className='size-10 text-emerald-600' />
          </div>

          {/* ── Title ── */}
          <DialogTitle className='text-center font-bold text-2xl'>{t('allDone')}</DialogTitle>
          <DialogDescription className='text-center text-base text-muted-foreground'>
            {t('youBorrowed')} <span className='font-semibold text-foreground'>{formattedAmount}</span>{' '}
            <span className='font-semibold text-foreground'>{symbol}</span>
          </DialogDescription>

          {/* ── Actions ── */}
          <div className='flex w-full flex-col gap-2'>
            <Button className='w-full' size='lg' onClick={onClose}>
              {t('okClose')}
            </Button>

            <Button
              variant='outline'
              className='w-full'
              size='lg'
              icon={<LayoutDashboard size={14} />}
              onClick={() => {
                onClose();
                router.push('/dashboard');
              }}
            >
              {t('goToDashboard')}
            </Button>

            {txUrl && (
              <Button variant='outline' className='w-full' size='lg' asChild>
                <a href={txUrl} target='_blank' rel='noopener noreferrer'>
                  {t('reviewTx')}
                  <ExternalLink size={14} className='ml-1' />
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
