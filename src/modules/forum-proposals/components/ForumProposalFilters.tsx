import { Search, X } from 'lucide-react';
import { FORUM_PROPOSAL_TYPES } from '@/api/forum';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_FORUM_PROPOSAL_CATEGORIES } from '../constants';
import type { CategoryFilter } from '../types';

type ForumProposalFiltersProps = {
  search: string;
  category: CategoryFilter;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: CategoryFilter) => void;
};

function isCategoryFilter(value: string): value is CategoryFilter {
  return value === ALL_FORUM_PROPOSAL_CATEGORIES || (FORUM_PROPOSAL_TYPES as readonly string[]).includes(value);
}

export function ForumProposalFilters({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}: ForumProposalFiltersProps) {
  return (
    <div className='mb-4 grid grid-cols-[1fr_180px] gap-3'>
      <div className='relative'>
        <Search className='-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground' />
        <Input
          type='search'
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder='Search topics'
          className='h-9 rounded-none bg-card pr-9 pl-9 text-xs shadow-none'
        />
        {search && (
          <button
            type='button'
            aria-label='Clear search'
            className='-translate-y-1/2 absolute top-1/2 right-3 inline-flex size-4 items-center justify-center text-muted-foreground hover:text-foreground'
            onClick={() => onSearchChange('')}
          >
            <X size={13} />
          </button>
        )}
      </div>

      <Select
        value={category}
        onValueChange={(value) => {
          if (isCategoryFilter(value)) onCategoryChange(value);
        }}
      >
        <SelectTrigger className='h-9 w-full rounded-none bg-card text-xs shadow-none'>
          <SelectValue placeholder='All categories' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ALL_FORUM_PROPOSAL_CATEGORIES}>All categories</SelectItem>
            {FORUM_PROPOSAL_TYPES.map((proposalType) => (
              <SelectItem key={proposalType} value={proposalType}>
                {proposalType}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
