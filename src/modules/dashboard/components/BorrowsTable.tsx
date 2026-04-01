import { HandCoins } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AssetCell } from '@/components/asset-cell';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import type { ComputedUserReserve } from '@/math-utils/formatters/user';
import { formatTokenAmount, formatUsd } from '@/utils/format';

interface BorrowsTableProps {
  borrowedReserves: ComputedUserReserve[];
  totalBorrowUsd: number;
  borrowApy: string | null;
  borrowPowerUsed: number;
  getBorrowApy: (ur: ComputedUserReserve) => string;
}

export function BorrowsTable({
  borrowedReserves,
  totalBorrowUsd,
  borrowApy,
  borrowPowerUsed,
  getBorrowApy,
}: BorrowsTableProps) {
  const t = useTranslations('modules.market.Dashboard');

  return (
    <section className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-3'>
        <h2 className='font-bold text-foreground text-xl'>{t('yourBorrows')}</h2>
        <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
          {t('balance')} {formatUsd(totalBorrowUsd)}
        </span>
        <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
          {t('apy')} {borrowApy ?? '—'}
        </span>
        <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
          {t('borrowPowerUsed')} {borrowPowerUsed > 0 ? `${borrowPowerUsed.toFixed(2)}%` : '0%'}
        </span>
      </div>

      {borrowedReserves.length === 0 ? (
        <Empty className='rounded-xs border border-border bg-card'>
          <EmptyMedia variant='icon'>
            <HandCoins size={20} />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('noBorrowsTitle')}</EmptyTitle>
            <EmptyDescription>{t('noBorrowsDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='overflow-x-auto rounded-xs border border-border'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-border border-b bg-muted/30'>
                <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                  {t('asset')}
                </th>
                <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                  {t('debt')}
                </th>
                <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                  {t('apy')}
                </th>
                <th className='px-4 py-3 text-right font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-card'>
              {borrowedReserves.map((ur) => {
                const reserveLink = `/reserve-overview?underlyingAsset=${ur.reserve.underlyingAsset}`;
                return (
                  <tr key={ur.reserve.underlyingAsset} className='border-border border-b last:border-b-0'>
                    <td className='px-4 py-3'>
                      <AssetCell
                        symbol={ur.reserve.symbol}
                        underlyingAsset={ur.reserve.underlyingAsset}
                        copyTitle={t('copyAddress')}
                        href={reserveLink}
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-col'>
                        <span className='font-medium text-foreground'>{formatUsd(ur.totalBorrowsUSD)}</span>
                        <span className='text-muted-foreground text-xs'>
                          {formatTokenAmount(ur.totalBorrows)} {ur.reserve.symbol}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='font-medium text-amber-600'>{getBorrowApy(ur)}%</span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button size='sm' variant='outline' asChild>
                          <Link href={`${reserveLink}&action=borrow`}>{t('borrow')}</Link>
                        </Button>
                        <Button size='sm' variant='ghost' asChild>
                          <Link href={`${reserveLink}&action=borrow`}>{t('repay')}</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
