'use client';

import { MessageSquare, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type ThreadStatsBlockProps = {
  totalComments: number;
  uniqueCommenters: number;
};

type StatItemProps = {
  value: number;
  icon: React.ReactNode;
};

function StatItem({ value, icon }: StatItemProps) {
  return (
    <div className='flex items-center gap-1.5'>
      <span className='font-semibold text-foreground text-sm'>{value}</span>
      <span className='text-muted-foreground'>{icon}</span>
    </div>
  );
}

export function ThreadStatsBlock({ totalComments, uniqueCommenters }: ThreadStatsBlockProps) {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Proposal link copied');
    } catch {
      toast.error('Failed to copy proposal link');
    }
  };

  return (
    <div className='mt-6 flex items-center gap-6'>
      <StatItem value={totalComments} icon={<MessageSquare className='size-4' />} />
      <StatItem value={uniqueCommenters} icon={<Users className='size-4' />} />
      <Button variant='ghost' size='icon-sm' aria-label='Share' className='ml-auto lg:hidden' onClick={handleShare}>
        <Share2 className='size-4' />
      </Button>
    </div>
  );
}
