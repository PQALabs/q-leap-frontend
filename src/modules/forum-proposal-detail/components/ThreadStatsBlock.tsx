import { MessageSquare, Users } from 'lucide-react';

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
  return (
    <div className='mt-6 flex items-center gap-6'>
      <StatItem value={totalComments} icon={<MessageSquare className='size-4' />} />
      <StatItem value={uniqueCommenters} icon={<Users className='size-4' />} />
    </div>
  );
}
