import { truncateMarkdownText } from '../utils';

type MarkdownTruncateProps = {
  source: string;
  maxLength?: number;
};

export function MarkdownTruncate({ source, maxLength = 200 }: MarkdownTruncateProps) {
  const truncatedText = truncateMarkdownText(source, maxLength);

  if (!truncatedText) {
    return null;
  }

  return <p className='mt-2 max-w-full text-muted-foreground text-sm leading-6'>{truncatedText}</p>;
}
