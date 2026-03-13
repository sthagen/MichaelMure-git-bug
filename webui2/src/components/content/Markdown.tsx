import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  content: string
  className?: string
}

// Renders a Markdown string with GitHub-flavoured extensions (tables, task
// lists, strikethrough). Used in Timeline comments and NewBugPage preview.
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-pre:bg-muted prose-pre:text-foreground',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none',
        className,
      )}
    >
      {content}
    </ReactMarkdown>
  )
}
