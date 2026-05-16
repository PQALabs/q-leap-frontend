import type { ForumProposalType } from '@/api/forum';
import { cn } from '@/lib/utils';

type ProposalCategoryProps = {
  category: ForumProposalType | null;
};

const categoryClassNames: Record<ForumProposalType, string> = {
  Governance: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300',
  Risk: 'border-red-300 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300',
  Treasury:
    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300',
  Development:
    'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300',
  Others:
    'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-400/30 dark:bg-slate-400/10 dark:text-slate-300',
};

export function ProposalCategory({ category }: ProposalCategoryProps) {
  if (!category) {
    return null;
  }

  return (
    <span className={cn('border px-2 py-1 font-semibold text-xs uppercase leading-none', categoryClassNames[category])}>
      {category}
    </span>
  );
}
