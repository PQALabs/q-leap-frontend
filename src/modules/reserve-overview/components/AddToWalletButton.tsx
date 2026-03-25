import { Loader2, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useWalletClient } from 'wagmi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getEvmMessage } from '@/lib/get-evm-message';
import { TokenIcon } from './TokenIcon';

interface AddToWalletButtonProps {
  underlyingAsset: string;
  underlyingSymbol: string;
  underlyingDecimals: number;
  aTokenAddress: string;
  aTokenSymbol: string;
}

export function AddToWalletButton({
  underlyingAsset,
  underlyingSymbol,
  underlyingDecimals,
  aTokenAddress,
  aTokenSymbol,
}: AddToWalletButtonProps) {
  const t = useTranslations('modules.market.ReserveOverview');
  const [isAdding, setIsAdding] = useState(false);
  const { data: walletClient } = useWalletClient();

  const addToken = async (address: string, symbol: string, decimals: number) => {
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
            address,
            symbol: symbol.slice(0, 11),
            decimals,
          },
        },
      });
      if (wasAdded) {
        toast.success(t('tokenAddedToWallet', { symbol }));
      }
    } catch (error) {
      console.error('Failed to add token to wallet:', error);
      toast.error(t('failedAddToken'), { description: getEvmMessage(error) });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          disabled={isAdding}
          title={t('addTokenToWallet')}
          className='inline-flex size-6 cursor-pointer items-center justify-center rounded-full border border-muted-foreground/30 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50'
        >
          {isAdding ? <Loader2 size={12} className='animate-spin' /> : <Wallet size={12} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuLabel className='text-muted-foreground text-xs'>{t('underlyingToken')}</DropdownMenuLabel>
        <button
          type='button'
          className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent'
          onClick={() => addToken(underlyingAsset, underlyingSymbol, underlyingDecimals)}
        >
          <TokenIcon symbol={underlyingSymbol} size={24} />
          <span className='font-medium'>{underlyingSymbol}</span>
        </button>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className='text-muted-foreground text-xs'>{t('aaveAToken')}</DropdownMenuLabel>
        <button
          type='button'
          className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent'
          onClick={() => addToken(aTokenAddress, aTokenSymbol, underlyingDecimals)}
        >
          <TokenIcon symbol={underlyingSymbol} size={24} />
          <span className='font-medium'>{aTokenSymbol}</span>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
