'use client';

import { CheckCircle2, ExternalLink, Loader2, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useWalletClient } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { getTokenLogoUrl } from '@/config/token-logos';
import { getEvmMessage } from '@/lib/get-evm-message';

interface SupplySuccessDialogProps {
  open: boolean;
  onClose: () => void;
  /** Human-readable amount supplied */
  amount: string;
  /** Token symbol, e.g. "USDC" or "QDAY" (for display) */
  symbol: string;
  /** The ERC20 reserve symbol (e.g. "WQDAY"), used for aToken name in wallet. Falls back to symbol. */
  reserveSymbol?: string;
  /** Transaction hash */
  txHash?: `0x${string}`;
  /** Block explorer base URL, e.g. "https://explorer.qday.info" */
  explorerUrl?: string;
  /** aToken contract address for this reserve */
  aTokenAddress?: `0x${string}`;
  /** Token decimals (used for wallet_watchAsset) */
  decimals?: number;
}

export function SupplySuccessDialog({
  open,
  onClose,
  amount,
  symbol,
  reserveSymbol,
  txHash,
  explorerUrl,
  aTokenAddress,
  decimals = 18,
}: SupplySuccessDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const t = useTranslations('modules.market.SuccessDialog');
  const { data: walletClient } = useWalletClient();

  const logoUrl = getTokenLogoUrl(symbol);
  const formattedAmount = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  const txUrl = explorerUrl && txHash ? `${explorerUrl}/tx/${txHash}` : undefined;
  const aTokenSymbol = `a${reserveSymbol ?? symbol}`;

  const handleAddToWallet = async () => {
    if (!aTokenAddress) return;

    // Use the connected wallet's provider (from wagmi) instead of window.ethereum,
    // which may point to a different wallet extension.
    const provider = walletClient?.transport as any;
    if (!provider?.request) {
      toast.error(t('noConnectedWallet'));
      return;
    }

    setIsAdding(true);
    try {
      const wasAdded = await provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: aTokenAddress,
            symbol: aTokenSymbol.slice(0, 11),
            decimals,
          },
        },
      });
      if (wasAdded) {
        setIsAdded(true);
        toast.success(t('addedToWallet', { symbol: aTokenSymbol }));
      }
    } catch (error) {
      console.error('Failed to add aToken to wallet:', error);
      toast.error(t('failedAddToWallet'), { description: getEvmMessage(error) });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <div className='flex flex-col items-center gap-5 pt-4'>
          {/* ── Success icon ── */}
          <div className='flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50'>
            <CheckCircle2 className='size-10 text-emerald-600' />
          </div>

          {/* ── Title ── */}
          <DialogTitle className='text-center font-bold text-2xl'>{t('allDone')}</DialogTitle>
          <DialogDescription className='text-center text-base text-muted-foreground'>
            {t('youSupplied')} <span className='font-semibold text-foreground'>{formattedAmount}</span>{' '}
            <span className='font-semibold text-foreground'>{symbol}</span>
          </DialogDescription>

          {/* ── Add aToken to wallet ── */}
          {aTokenAddress && (
            <div className='flex w-full items-center gap-3 rounded-lg border border-border p-4'>
              {logoUrl ? (
                <img src={logoUrl} alt={symbol} className='size-10 rounded-full object-cover' />
              ) : (
                <div className='flex size-10 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground text-sm'>
                  {symbol.charAt(0)}
                </div>
              )}
              <div className='flex flex-1 flex-col gap-1'>
                <span className='font-medium text-foreground text-sm'>
                  {t('addToWallet', { symbol: aTokenSymbol })}
                </span>
                <button
                  type='button'
                  onClick={handleAddToWallet}
                  disabled={isAdding || isAdded}
                  className='flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1 font-medium text-foreground text-xs transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-60'
                >
                  {isAdding ? <Loader2 size={12} className='animate-spin' /> : <Wallet size={12} />}
                  {isAdded ? t('added') : isAdding ? t('adding') : t('addToWalletButton')}
                </button>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className='flex w-full flex-col gap-2'>
            <Button className='w-full' size='lg' onClick={onClose}>
              {t('okClose')}
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
