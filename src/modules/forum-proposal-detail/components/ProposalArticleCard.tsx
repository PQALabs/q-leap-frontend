import MarkdownPreview from '@uiw/react-markdown-preview';
import { Dot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProposalCategory } from '@/modules/forum-proposals/components/ProposalCategory';
import type { ProposalDetailViewModel } from '../types';
import { ThreadStatsBlock } from './ThreadStatsBlock';

type ProposalArticleCardProps = {
  proposal: ProposalDetailViewModel;
};

export function ProposalArticleCard({ proposal }: ProposalArticleCardProps) {
  return (
    <Card className='rounded-none border-border/80 bg-card py-0 shadow-none'>
      <CardContent className='p-6 md:p-10 lg:p-12'>
        <div className='flex items-center gap-3'>
          {/* <UserAvatar label={proposal.author} /> */}
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <div className='mt-1 flex items-center gap-2'>
              <ProposalCategory category={proposal.category} />
            </div>
            <div className='flex flex-wrap items-center gap-2 font-medium text-sm'>
              <span className='text-foreground'>Author: {proposal.author}</span>
              <Dot />
              <span className='text-muted-foreground'>{proposal.authorRole}</span>
              {proposal.createdAt ? <span className='ml-auto text-muted-foreground'>{proposal.createdAt}</span> : null}
            </div>
          </div>
        </div>

        <Separator className='my-8' />

        <article>
          <h1 className='font-bold font-serif text-3xl text-foreground leading-10'>{proposal.title}</h1>

          <div
            className='[&_.wmde-markdown]:!bg-transparent [&_.wmde-markdown]:!text-foreground [&_.wmde-markdown_a]:!text-primary [&_.wmde-markdown_blockquote]:!border-border [&_.wmde-markdown_code]:!bg-muted [&_.wmde-markdown_h1]:!border-0 [&_.wmde-markdown_h2]:!border-0 mt-8 text-base leading-7 [&_.wmde-markdown]:font-sans [&_.wmde-markdown_h1]:font-serif [&_.wmde-markdown_h1]:text-3xl [&_.wmde-markdown_h2]:mt-8 [&_.wmde-markdown_h2]:font-serif [&_.wmde-markdown_h2]:text-2xl [&_.wmde-markdown_h3]:mt-6 [&_.wmde-markdown_h3]:font-serif [&_.wmde-markdown_li]:my-1 [&_.wmde-markdown_p]:my-4 [&_.wmde-markdown_ul]:my-4'
            data-color-mode='dark'
          >
            <MarkdownPreview source={proposal.description} />
          </div>
        </article>

        <Separator className='mt-8' />

        <ThreadStatsBlock totalComments={proposal.totalComments} uniqueCommenters={proposal.uniqueCommenters} />
      </CardContent>
    </Card>
  );
}
