import { PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AssetCell } from '@/components/asset-cell';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import type { useCollateralToggle } from '@/hooks/use-collateral-toggle';
import type { ComputedUserReserve } from '@/math-utils/formatters/user';
import type { ComputedReserveData, UserSummary } from '@/stores/use-pool-data-store';
import { formatTokenAmount, formatUsd } from '@/utils/format';
import { CollateralCell } from './CollateralCell';

interface SuppliesTableProps {
  suppliedReserves: ComputedUserReserve[];
  user: UserSummary | undefined;
  reserves: ComputedReserveData[];
  collateralToggle: ReturnType<typeof useCollateralToggle>;
  totalSupplyUsd: number;
  supplyApy: string | null;
  totalCollateralUsd: number;
  getSupplyApy: (ur: ComputedUserReserve) => string;
}

export function SuppliesTable({
  suppliedReserves,
  user,
  reserves,
  collateralToggle,
  totalSupplyUsd,
  supplyApy,
  totalCollateralUsd,
  getSupplyApy,
}: SuppliesTableProps) {
  const t = useTranslations('modules.market.Dashboard');

  return (
    <section className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-3'>
        <h2 className='font-bold text-foreground text-xl'>{t('yourSupplies')}</h2>
        <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
          {t('balance')} {formatUsd(totalSupplyUsd)}
        </span>
        <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
          {t('apy')} {supplyApy ?? '—'}
        </span>
        <span className='rounded-md border border-border px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
          {t('collateral')} {formatUsd(totalCollateralUsd)}
        </span>
      </div>

      {suppliedReserves.length === 0 ? (
        <Empty className='rounded-xs border border-border bg-card'>
          <EmptyMedia variant='icon'>
            <PiggyBank size={20} />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('noSuppliesTitle')}</EmptyTitle>
            <EmptyDescription>{t('noSuppliesDescription')}</EmptyDescription>
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
                  {t('balance')}
                </th>
                <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                  {t('apy')}
                </th>
                <th className='px-4 py-3 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                  {t('collateral')}
                </th>
                <th className='px-4 py-3 text-right font-semibold text-[11px] text-muted-foreground uppercase tracking-wider'>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-card'>
              {suppliedReserves.map((ur) => {
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
                        <span className='font-medium text-foreground'>{formatUsd(ur.underlyingBalanceUSD)}</span>
                        <span className='text-muted-foreground text-xs'>
                          {formatTokenAmount(
                            ur.underlyingBalance,
                            Number(ur.underlyingBalance) > 0 && Number(ur.underlyingBalance) < 0.0001 ? 8 : 4
                          )}{' '}
                          {ur.reserve.symbol}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='font-medium text-emerald-600'>{getSupplyApy(ur)}%</span>
                    </td>
                    <td className='px-4 py-3'>
                      <CollateralCell
                        ur={ur}
                        user={user}
                        reserves={reserves}
                        collateralToggle={collateralToggle}
                        cannotUseAsCollateralText={t('cannotUseAsCollateral')}
                        cannotDisableHfText={t('cannotDisableHf')}
                      />
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button size='sm' variant='outline' asChild>
                          <Link href={`${reserveLink}&action=supply`}>{t('supply')}</Link>
                        </Button>
                        <Button size='sm' variant='ghost' asChild>
                          <Link href={`${reserveLink}&action=withdraw`}>{t('withdraw')}</Link>
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
