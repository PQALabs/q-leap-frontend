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
import { ArrowUpDown, ChevronDown, ChevronUp, Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { AssetCell } from '@/components/asset-cell';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UsdValue } from '@/components/usd-value';
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
  underlyingAsset: string; // full contract address
  supplyApy: number; // stored as number for proper sorting
  totalSupplied: number;
  totalSuppliedNative: string; // e.g. "1,234.56 DAI"
  borrowApy: number;
  totalBorrowed: number | null;
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
// Borrow APY header with CSS-only tooltip (immune to React re-renders)
// ---------------------------------------------------------------------------
const BorrowApyHeader = React.memo(function BorrowApyHeader({
  label,
  sorted,
  onSort,
}: {
  label: string;
  sorted: false | 'asc' | 'desc';
  onSort: ((event: unknown) => void) | undefined;
}) {
  return (
    <div className='flex items-center justify-end gap-1'>
      {label}
      <button type='button' className='flex cursor-pointer items-center gap-1 uppercase' onClick={onSort}>
        <SortIndicator sorted={sorted} />
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
function buildColumns(t: (key: string) => string): ColumnDef<CoreAsset>[] {
  return [
    {
      id: 'asset',
      header: t('asset'),
      enableSorting: false,
      cell: ({ row }) => {
        const { symbol, underlyingAsset } = row.original;
        return (
          <AssetCell
            symbol={symbol}
            underlyingAsset={underlyingAsset}
            size={36}
            copyTitle={t('copyAddress')}
            href={`/reserve-overview?underlyingAsset=${underlyingAsset}`}
          />
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
      header: ({ column }) => (
        <button
          type='button'
          className='ml-auto flex items-center gap-1 uppercase'
          onClick={column.getToggleSortingHandler()}
        >
          {t('totalSupplied')}
          <SortIndicator sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => (
        <div className='text-right'>
          <div className='text-foreground'>
            <UsdValue value={row.original.totalSupplied} />
          </div>
          <div className='text-muted-foreground text-xs'>{row.original.totalSuppliedNative}</div>
        </div>
      ),
    },
    {
      accessorKey: 'borrowApy',
      header: ({ column }) => (
        <BorrowApyHeader
          label={t('borrowApy')}
          sorted={column.getIsSorted()}
          onSort={column.getToggleSortingHandler()}
        />
      ),
      cell: ({ getValue }) => (
        <span className='block text-right text-destructive'>{formatApy(getValue<number>())}</span>
      ),
    },
    {
      accessorKey: 'totalBorrowed',
      header: ({ column }) => (
        <button
          type='button'
          className='ml-auto flex items-center gap-1 uppercase'
          onClick={column.getToggleSortingHandler()}
        >
          {t('totalBorrowed')}
          <SortIndicator sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const val = row.original.totalBorrowed;
        return (
          <div className='text-right'>
            <div className='text-foreground'>{val !== null && val >= 0 ? <UsdValue value={val} /> : '—'}</div>
            <div className='text-muted-foreground text-xs'>{row.original.totalBorrowedNative}</div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => null,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <Button size='xs' variant='outline' asChild>
            <Link href={`/reserve-overview?underlyingAsset=${row.original.underlyingAsset}`}>{t('details')}</Link>
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
}

export function CoreAssets({ assets }: CoreAssetsProps) {
  const t = useTranslations('modules.market.CoreAssets');
  const [globalFilter, setGlobalFilter] = useState('');
  const [stablecoinsOnly, setStablecoinsOnly] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => buildColumns(t), [t]);

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
      const { name, symbol, underlyingAsset } = row.original;
      return (
        name.toLowerCase().includes(q) || symbol.toLowerCase().includes(q) || underlyingAsset.toLowerCase().includes(q)
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
        <CoreAssetsMobile assets={filteredData ?? []} />
      </div>
    </div>
  );
}
