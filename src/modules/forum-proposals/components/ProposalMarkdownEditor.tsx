import type { MDEditorProps } from '@uiw/react-md-editor';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const MDEditor = dynamic<MDEditorProps>(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

const markdownEditorClassName = cn(
  'proposal-md-editor rounded-none border border-input bg-muted text-xs shadow-none',
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
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function ProposalMarkdownEditor({
  value,
  colorMode,
  isInvalid,
  disabled,
  onChange,
  onBlur,
}: ProposalMarkdownEditorProps) {
  return (
    <div data-color-mode={colorMode} className={disabled ? 'pointer-events-none opacity-50' : undefined}>
      <style>
        {`
          .proposal-md-editor,
          .proposal-md-editor * {
            --color-fg-default: var(--foreground);
            --color-canvas-default: var(--muted);
            --color-border-default: var(--input);
            --color-canvas-subtle: var(--muted);
            --color-fg-muted: var(--muted-foreground);
          }

          .proposal-md-editor .w-md-editor-text-input {
            color: var(--foreground) !important;
            -webkit-text-fill-color: var(--foreground) !important;
            caret-color: var(--foreground) !important;
            opacity: 1 !important;
          }

          .proposal-md-editor .w-md-editor-text-input::placeholder {
            color: var(--muted-foreground) !important;
            -webkit-text-fill-color: var(--muted-foreground) !important;
            opacity: 1 !important;
          }
        `}
      </style>
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
