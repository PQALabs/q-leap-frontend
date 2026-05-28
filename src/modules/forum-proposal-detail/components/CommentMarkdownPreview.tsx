'use client';

import MarkdownPreview from '@uiw/react-markdown-preview';

const commentMarkdownPreviewClassName =
  '[&_.wmde-markdown]:!bg-transparent [&_.wmde-markdown]:!text-foreground [&_.wmde-markdown]:font-sans [&_.wmde-markdown_a]:!text-primary [&_.wmde-markdown_blockquote]:!border-border [&_.wmde-markdown_code]:!bg-muted [&_.wmde-markdown_h1]:!border-0 [&_.wmde-markdown_h1]:text-xl [&_.wmde-markdown_h2]:!border-0 [&_.wmde-markdown_h2]:text-lg [&_.wmde-markdown_h3]:text-base [&_.wmde-markdown_li]:my-1 [&_.wmde-markdown_p]:my-2 [&_.wmde-markdown_ul]:my-2';

type CommentMarkdownPreviewProps = {
  source: string;
  className?: string;
};

export function CommentMarkdownPreview({ source, className }: CommentMarkdownPreviewProps) {
  return (
    <div className={`${commentMarkdownPreviewClassName} ${className ?? ''}`} data-color-mode='dark'>
      <MarkdownPreview source={source} />
    </div>
  );
}
