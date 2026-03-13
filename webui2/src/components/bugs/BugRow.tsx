import { Link } from 'react-router-dom'
import { MessageSquare, CircleDot, CircleCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { LabelBadge } from './LabelBadge'
import { Status } from '@/__generated__/graphql'

interface BugRowProps {
  id: string
  humanId: string
  status: Status
  title: string
  labels: Array<{ name: string; color: { R: number; G: number; B: number } }>
  author: { humanId: string; displayName: string; avatarUrl?: string | null }
  createdAt: string
  commentCount: number
  /** Current repo slug, used to build /:repo/issues/:id and /:repo/user/:id links. */
  repo: string | null
  onLabelClick?: (name: string) => void
}

// Single row in the issue list. Shows status icon, title, labels, author and
// comment count. Labels are clickable to filter the list by that label.
export function BugRow({
  humanId,
  status,
  title,
  labels,
  author,
  createdAt,
  commentCount,
  repo,
  onLabelClick,
}: BugRowProps) {
  const isOpen = status === Status.Open
  const StatusIcon = isOpen ? CircleDot : CircleCheck

  const issueHref = repo ? `/${repo}/issues/${humanId}` : `/issues/${humanId}`
  const authorHref = repo ? `/${repo}/user/${author.humanId}` : `/user/${author.humanId}`

  return (
    <div className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-muted/30">
      <StatusIcon
        className={
          isOpen
            ? 'mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400'
            : 'mt-0.5 size-4 shrink-0 text-purple-600 dark:text-purple-400'
        }
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link
            to={issueHref}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {title}
          </Link>
          {labels.map((label) => (
            <LabelBadge key={label.name} name={label.name} color={label.color} onClick={onLabelClick} />
          ))}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          #{humanId} opened {formatDistanceToNow(new Date(createdAt), { addSuffix: true })} by{' '}
          <Link to={authorHref} className="hover:underline">
            {author.displayName}
          </Link>
        </p>
      </div>

      {commentCount > 0 && (
        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="size-3.5" />
          {commentCount}
        </div>
      )}
    </div>
  )
}
