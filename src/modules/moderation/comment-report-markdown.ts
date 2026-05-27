export const commentReportMarkdownClass =
  '[&_.wmde-markdown]:!bg-transparent [&_.wmde-markdown]:!text-foreground [&_.wmde-markdown]:font-sans [&_.wmde-markdown_a]:!text-primary [&_.wmde-markdown_blockquote]:!border-border [&_.wmde-markdown_code]:!bg-muted [&_.wmde-markdown_h1]:!border-0 [&_.wmde-markdown_h1]:text-xl [&_.wmde-markdown_h2]:!border-0 [&_.wmde-markdown_h2]:text-lg [&_.wmde-markdown_h3]:text-base [&_.wmde-markdown_li]:my-1 [&_.wmde-markdown_p]:my-2 [&_.wmde-markdown_ul]:my-2';

export function truncateWords(text: string, limit: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return `${words.slice(0, limit).join(' ')}…`;
}
