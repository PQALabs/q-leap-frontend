import type { MDEditorProps } from '@uiw/react-md-editor';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const MDEditor = dynamic<MDEditorProps>(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

const commentEditorClassName = cn(
  'comment-md-editor rounded-none border-0 bg-card text-card-foreground shadow-none',
  '[&.w-md-editor]:bg-card! [&.w-md-editor]:text-card-foreground!',
  '[&_.w-md-editor-toolbar]:h-[57px] [&_.w-md-editor-toolbar]:border-border! [&_.w-md-editor-toolbar]:bg-card! [&_.w-md-editor-toolbar]:px-4!',
  '[&_.w-md-editor-toolbar_button]:rounded-sm! [&_.w-md-editor-toolbar_button]:text-muted-foreground! [&_.w-md-editor-toolbar_button:hover]:bg-accent! [&_.w-md-editor-toolbar_button:hover]:text-accent-foreground!',
  '[&_.w-md-editor-toolbar_button.active]:bg-secondary! [&_.w-md-editor-toolbar_button.active]:text-secondary-foreground!',
  '[&_.w-md-editor-content]:bg-card!',
  '[&_.w-md-editor-text-input]:bg-card! [&_.w-md-editor-text-input]:text-card-foreground! [&_.w-md-editor-text-input]:caret-foreground!',
  '[&_.w-md-editor-text-input::placeholder]:text-muted-foreground!',
  '[&_.w-md-editor-text-pre]:text-card-foreground!',
  '[&_.w-md-editor-text-pre_*]:text-card-foreground!',
  '[&_.w-md-editor-text-pre_code]:text-card-foreground!',
  '[&_.w-md-editor-bar]:hidden!'
);

type CommentMarkdownEditorProps = {
  value: string;
  isInvalid: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function CommentMarkdownEditor({ value, isInvalid, onChange, onBlur }: CommentMarkdownEditorProps) {
  return (
    <div>
      <style>
        {`
          .comment-md-editor,
          .comment-md-editor * {
            --color-fg-default: var(--card-foreground);
            --color-canvas-default: var(--card);
            --color-border-default: var(--border);
            --color-canvas-subtle: var(--muted);
            --color-fg-muted: var(--muted-foreground);
            --color-neutral-muted: var(--secondary);
            --color-accent-fg: var(--accent-foreground);
          }

          .comment-md-editor .w-md-editor-text-input {
            color: var(--card-foreground) !important;
            -webkit-text-fill-color: var(--card-foreground) !important;
            caret-color: var(--foreground) !important;
            opacity: 1 !important;
          }

          .comment-md-editor .w-md-editor-text-input::placeholder {
            color: var(--muted-foreground) !important;
            -webkit-text-fill-color: var(--muted-foreground) !important;
            opacity: 1 !important;
          }

          .comment-md-editor .w-md-editor-content {
            overflow: visible !important;
            padding: 16px !important;
            box-sizing: border-box !important;
          }

          .comment-md-editor .w-md-editor-input {
            height: 200px !important;
            overflow: visible !important;
            width: 100% !important;
          }

          .comment-md-editor .w-md-editor-text {
            background: var(--card) !important;
            border: 1px solid var(--input) !important;
            border-radius: calc(var(--radius) - 4px) !important;
            box-sizing: border-box !important;
            height: 200px !important;
            margin: 0 !important;
            min-height: 200px !important;
            overflow: hidden !important;
            padding: 16px !important;
            width: 100% !important;
          }

          .comment-md-editor .w-md-editor-text-pre,
          .comment-md-editor .w-md-editor-text-input {
            padding: 16px !important;
          }

          .comment-md-editor .w-md-editor-text-pre {
            visibility: hidden !important;
          }
        `}
      </style>
      <MDEditor
        value={value}
        onChange={(value) => onChange(value ?? '')}
        onBlur={onBlur}
        preview='edit'
        height={273}
        overflow={false}
        textareaProps={{
          'aria-invalid': isInvalid,
          placeholder: 'Type here. Use the toolbar or Markdown for formatting. Drag or paste images.',
        }}
        className={commentEditorClassName}
      />
    </div>
  );
}
