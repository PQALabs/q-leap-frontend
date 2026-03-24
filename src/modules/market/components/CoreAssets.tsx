'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Check, ChevronDown, ChevronUp, Copy, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { formatApy } from '@/utils/format';
import { CoreAssetsMobile } from './CoreAssetsMobile';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CoreAsset {
  id: string;
  name: string;
  symbol: string;
  subtitle: string;
  underlyingAsset: string; // full contract address for copying
  logoUrl?: string; // path to token logo (e.g. /token-icons/WABEL.svg)
  iconBg: string;
  iconColor: string;
  iconLabel: string;
  supplyApy: number; // stored as number for proper sorting
  totalSupplied: React.ReactNode;
  totalSuppliedNative: string; // e.g. "1,234.56 DAI"
  borrowApy: number;
  totalBorrowed: React.ReactNode;
  totalBorrowedNative: string; // e.g. "567.89 DAI"
  walletBalance: string | null;
  isStablecoin?: boolean;
}

// ---------------------------------------------------------------------------
// Sort icon
// ---------------------------------------------------------------------------
function SortIndicator({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <ArrowUpDown size={12} className='text-muted-foreground/50' />;
  if (sorted === 'asc') return <ChevronUp size={12} className='text-foreground' />;
  return <ChevronDown size={12} className='text-foreground' />;
}

// ---------------------------------------------------------------------------
// Copy address button
// ---------------------------------------------------------------------------
function CopyAddressButton({ address, title }: { address: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='inline-flex cursor-pointer items-center text-muted-foreground/60 transition-colors hover:text-foreground'
      title={title}
    >
      {copied ? <Check size={12} className='text-success' /> : <Copy size={12} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
function buildColumns(onDetails: (asset: CoreAsset) => void, t: (key: string) => string): ColumnDef<CoreAsset>[] {
  return [
    {
      id: 'asset',
      header: t('asset'),
      enableSorting: false,
      cell: ({ row }) => {
        const { name, subtitle, underlyingAsset, logoUrl, iconBg, iconColor, iconLabel } = row.original;
        return (
          <div className='flex items-center gap-3'>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                width={36}
                height={36}
                className='h-9 w-9 shrink-0 rounded-full object-cover'
              />
            ) : (
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-base shadow-sm',
                  iconBg,
                  iconColor
                )}
              >
                {iconLabel}
              </div>
            )}
            <div>
              <div className='font-semibold text-foreground'>{name}</div>
              <div className='flex items-center gap-1 text-muted-foreground text-xs'>
                {subtitle}
                <CopyAddressButton address={underlyingAsset} title={t('copyAddress')} />
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'supplyApy',
      header: ({ column }) => (
        <button
          type='button'
          className='ml-auto flex items-center gap-1 uppercase'
          onClick={column.getToggleSortingHandler()}
        >
          {t('supplyApy')}
          <SortIndicator sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className='block text-right font-semibold text-success'>{formatApy(getValue<number>())}</span>
      ),
    },
    {
      accessorKey: 'totalSupplied',
      header: () => <span className='block text-right'>{t('totalSupplied')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='text-right'>
          <div className='text-foreground'>{row.original.totalSupplied}</div>
          <div className='text-muted-foreground text-xs'>{row.original.totalSuppliedNative}</div>
        </div>
      ),
    },
    {
      accessorKey: 'borrowApy',
      header: ({ column }) => (
        <button
          type='button'
          className='ml-auto flex items-center gap-1 uppercase'
          onClick={column.getToggleSortingHandler()}
        >
          {t('borrowApy')}
          <SortIndicator sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className='block text-right text-destructive'>{formatApy(getValue<number>())}</span>
      ),
    },
    {
      accessorKey: 'totalBorrowed',
      header: () => <span className='block text-right'>{t('totalBorrowed')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='text-right'>
          <div className='text-foreground'>{row.original.totalBorrowed}</div>
          <div className='text-muted-foreground text-xs'>{row.original.totalBorrowedNative}</div>
        </div>
      ),
    },
    // {
    //   accessorKey: 'walletBalance',
    //   header: () => <span className='block text-right'>Wallet Balance</span>,
    //   enableSorting: false,
    //   cell: ({ getValue }) => (
    //     <span className='block text-right text-muted-foreground'>{getValue<string | null>() ?? '—'}</span>
    //   ),
    // },
    {
      id: 'actions',
      header: () => null,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <Button size='xs' variant='outline' onClick={() => onDetails(row.original)}>
            {t('details')}
          </Button>
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface CoreAssetsProps {
  assets?: CoreAsset[];
  onDetailsClick?: (asset: CoreAsset) => void;
}

export function CoreAssets({ assets, onDetailsClick }: CoreAssetsProps) {
  const t = useTranslations('modules.market.CoreAssets');
  const [globalFilter, setGlobalFilter] = useState('');
  const [stablecoinsOnly, setStablecoinsOnly] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const onDetails = useCallback((asset: CoreAsset) => onDetailsClick?.(asset), [onDetailsClick]);
  const columns = useMemo(() => buildColumns(onDetails, t), [onDetails, t]);

  const filteredData = useMemo(
    () => (stablecoinsOnly ? assets?.filter((a) => a.isStablecoin) : assets),
    [assets, stablecoinsOnly]
  );

  const table = useReactTable({
    data: filteredData ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.trim().toLowerCase();
      const { name, symbol, subtitle, underlyingAsset } = row.original;
      return (
        name.toLowerCase().includes(q) ||
        symbol.toLowerCase().includes(q) ||
        subtitle.toLowerCase().includes(q) ||
        underlyingAsset.toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className='flex flex-col gap-5 rounded-xs border border-border bg-card p-6 shadow-xs'>
      {/* Heading */}
      <h2 className='font-bold text-foreground text-xl'>{t('title')}</h2>

      {/* Controls row */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {/* Search */}
        <div className='relative min-w-[180px] max-w-xs flex-1'>
          <Search
            size={14}
            className='-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 text-muted-foreground'
          />
          <input
            type='text'
            placeholder={t('searchPlaceholder')}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className='h-9 w-full rounded-xs border border-border bg-background pr-3 pl-8 text-foreground text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'
          />
        </div>

        {/* Stablecoins only toggle */}
        <label className='flex cursor-pointer select-none items-center gap-2'>
          <span className='text-muted-foreground text-sm'>{t('stablecoinsOnly')}</span>
          <Switch checked={stablecoinsOnly} onCheckedChange={setStablecoinsOnly} />
        </label>
      </div>

      {/* Table — desktop (md+) */}
      <div className='hidden overflow-x-auto rounded-xs border border-border md:block'>
        <table className='w-full min-w-[640px] text-sm'>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className='border-border border-b bg-muted/60 font-semibold text-muted-foreground text-xs uppercase tracking-wider'
              >
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-3 py-3',
                      idx === 0 && 'pl-5 text-left',
                      idx === headerGroup.headers.length - 1 && 'pr-5',
                      header.column.getCanSort() && 'cursor-pointer select-none'
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='py-12 text-center text-muted-foreground text-sm'>
                  {t('noAssetsFound')}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i, arr) => (
                <tr
                  key={row.id}
                  className={cn(
                    'group border-border transition-colors hover:bg-accent/40',
                    i !== arr.length - 1 && 'border-b'
                  )}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-3 py-4',
                        idx === 0 && 'pl-5',
                        idx === row.getVisibleCells().length - 1 && 'pr-5'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile (<md) */}
      <div className='md:hidden'>
        <CoreAssetsMobile assets={filteredData ?? []} onDetailsClick={onDetailsClick} />
      </div>
    </div>
  );
}
