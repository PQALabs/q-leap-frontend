'use client';

import { useTranslations } from 'next-intl';
import { AssetCell } from '@/components/asset-cell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatApy } from '@/utils/format';
import type { CoreAsset } from './CoreAssets';

// ---------------------------------------------------------------------------
// Single card
// ---------------------------------------------------------------------------
function AssetCard({
  asset,
  onDetails,
  t,
}: {
  asset: CoreAsset;
  onDetails?: (asset: CoreAsset) => void;
  t: (key: string) => string;
}) {
  return (
    <div className='rounded-lg border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm'>
      {/* Header — icon + name */}
      <div className='flex items-center justify-between gap-3'>
        <AssetCell
          symbol={asset.symbol}
          underlyingAsset={asset.underlyingAsset}
          size={36}
          copyTitle={t('copyAddress')}
        />

        <Button size='xs' variant='outline' onClick={() => onDetails?.(asset)}>
          {t('details')}
        </Button>
      </div>

      {/* Metrics grid */}
      <div className='mt-4 grid grid-cols-2 gap-3'>
        <MetricCell label={t('supplyApy')} value={formatApy(asset.supplyApy)} valueClass='text-success' />
        <MetricCell label={t('totalSupplied')} value={asset.totalSupplied} subtitle={asset.totalSuppliedNative} />
        <MetricCell label={t('borrowApy')} value={formatApy(asset.borrowApy)} valueClass='text-destructive' />
        <MetricCell label={t('totalBorrowed')} value={asset.totalBorrowed} subtitle={asset.totalBorrowedNative} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric cell helper
// ---------------------------------------------------------------------------
function MetricCell({
  label,
  value,
  subtitle,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  valueClass?: string;
}) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-muted-foreground text-xs uppercase tracking-wide'>{label}</span>
      <span className={cn('font-semibold text-sm', valueClass ?? 'text-foreground')}>{value}</span>
      {subtitle && <span className='text-muted-foreground text-xs'>{subtitle}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile card list
// ---------------------------------------------------------------------------
interface CoreAssetsMobileProps {
  assets?: CoreAsset[];
  onDetailsClick?: (asset: CoreAsset) => void;
}

export function CoreAssetsMobile({ assets, onDetailsClick }: CoreAssetsMobileProps) {
  const t = useTranslations('modules.market.CoreAssets');

  if (!assets || assets.length === 0) {
    return <p className='py-12 text-center text-muted-foreground text-sm'>{t('noAssetsFound')}</p>;
  }

  return (
    <div className='flex flex-col gap-3'>
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} onDetails={onDetailsClick} t={t} />
      ))}
    </div>
  );
}
