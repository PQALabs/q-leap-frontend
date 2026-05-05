import { AlertCircle, ArrowUpDown, ChevronDown, ChevronUp, ListFilter } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ILiquidationPosition } from '@/api/liquidation/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LiquidationRow } from './LiquidationRow';

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------
function SkeletonRow() {
  return (
    <tr className='border-border border-b'>
      {Array.from({ length: 7 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
        <td key={i} className={cn('px-4 py-4', i === 0 && 'pl-6', i === 6 && 'pr-6')}>
          <Skeleton className='h-5 w-full' />
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className='py-16 text-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
            <ListFilter size={20} className='text-muted-foreground' />
          </div>
          <p className='font-medium text-foreground text-sm'>No liquidatable positions</p>
          <p className='text-muted-foreground text-xs'>All positions are currently healthy</p>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <tr>
      <td colSpan={7} className='py-16 text-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40'>
            <AlertCircle size={20} className='text-red-500' />
          </div>
          <p className='font-medium text-foreground text-sm'>Failed to load positions</p>
          <Button size='sm' variant='outline' onClick={onRetry}>
            Retry
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Sort types
// ---------------------------------------------------------------------------
type SortKey = 'healthFactor' | 'totalDebtUsd';
type SortDir = 'asc' | 'desc';

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <ArrowUpDown size={12} className='text-muted-foreground/60' />;
  if (sorted === 'asc') return <ChevronUp size={12} className='text-foreground' />;
  return <ChevronDown size={12} className='text-foreground' />;
}

// ---------------------------------------------------------------------------
// LiquidationTable
// ---------------------------------------------------------------------------
interface LiquidationTableProps {
  positions: ILiquidationPosition[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function LiquidationTable({ positions, isLoading, isError, onRetry }: LiquidationTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('healthFactor');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!positions.length) return positions;
    return [...positions].sort((a, b) => {
      const aVal = sortKey === 'healthFactor' ? Number(a.healthFactor) : Number(a.totalDebtUsd);
      const bVal = sortKey === 'healthFactor' ? Number(b.healthFactor) : Number(b.totalDebtUsd);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [positions, sortKey, sortDir]);

  const columns = [
    { key: null, label: 'User Address', align: 'left' as const },
    { key: 'healthFactor' as SortKey, label: 'Health Factor', align: 'center' as const },
    { key: null, label: 'Debt Asset', align: 'center' as const },
    { key: 'totalDebtUsd' as SortKey, label: 'Debt Value', align: 'right' as const },
    { key: null, label: 'Collateral Asset', align: 'left' as const },
    { key: null, label: 'Est Profit', align: 'right' as const },
    { key: null, label: 'Action', align: 'right' as const },
  ];

  return (
    <div className='overflow-x-auto rounded-xs border border-border'>
      <table className='w-full min-w-[800px] text-sm'>
        <thead>
          <tr className='border-border border-b bg-muted/50'>
            {columns.map((col, idx) => (
              <th
                key={col.label}
                className={cn(
                  'px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider',
                  idx === 0 && 'pl-6 text-left',
                  idx === columns.length - 1 && 'pr-6',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.key && 'cursor-pointer select-none'
                )}
                onClick={col.key ? () => handleSort(col.key as SortKey) : undefined}
              >
                <span className='inline-flex items-center gap-1'>
                  {col.label}
                  {col.key && <SortIcon sorted={sortKey === col.key ? sortDir : false} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <SkeletonRow key={i} />
            ))
          ) : isError ? (
            <ErrorState onRetry={onRetry} />
          ) : sorted.length === 0 ? (
            <EmptyState />
          ) : (
            sorted.map((position, i, arr) => (
              <LiquidationRow key={position.userAddress} position={position} isLast={i === arr.length - 1} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
