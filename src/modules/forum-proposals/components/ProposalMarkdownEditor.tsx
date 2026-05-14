import type { MDEditorProps } from '@uiw/react-md-editor';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const MDEditor = dynamic<MDEditorProps>(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

const markdownEditorClassName = cn(
  'rounded-none border border-input bg-muted text-xs shadow-none',
  '[&.w-md-editor]:bg-muted! [&.w-md-editor]:text-foreground!',
  '[&_.w-md-editor-toolbar]:border-input! [&_.w-md-editor-toolbar]:bg-muted!',
  '[&_.w-md-editor-toolbar_button]:text-muted-foreground! [&_.w-md-editor-toolbar_button:hover]:bg-accent!',
  '[&_.w-md-editor-content]:bg-muted!',
  '[&_.w-md-editor-text]:bg-muted!',
  '[&_.w-md-editor-text-input]:bg-muted! [&_.w-md-editor-text-input]:text-foreground!',
  '[&_.w-md-editor-text-input::placeholder]:text-muted-foreground!',
  '[&_.w-md-editor-text-pre]:text-foreground! [&_.w-md-editor-text-pre>code]:text-foreground!',
  '[&_.w-md-editor-bar]:border-input! [&_.w-md-editor-bar]:bg-muted!'
);

type ProposalMarkdownEditorProps = {
  value: string;
  colorMode: 'light' | 'dark';
  isInvalid: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function ProposalMarkdownEditor({ value, colorMode, isInvalid, onChange, onBlur }: ProposalMarkdownEditorProps) {
  return (
    <div data-color-mode={colorMode}>
      <MDEditor
        value={value}
        onChange={(value) => onChange(value ?? '')}
        onBlur={onBlur}
        preview='edit'
        height={230}
        textareaProps={{
          'aria-invalid': isInvalid,
          className: 'bg-muted text-foreground placeholder:text-muted-foreground',
          placeholder: 'Type here. Use the toolbar or Markdown for formatting. Drag or paste images.',
        }}
        className={markdownEditorClassName}
      />
    </div>
  );
}
