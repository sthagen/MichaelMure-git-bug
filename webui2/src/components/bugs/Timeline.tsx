import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { Tag, GitPullRequestClosed, Pencil, CircleDot } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Markdown } from '@/components/content/Markdown'
import { LabelBadge } from './LabelBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Status,
  type BugDetailQuery,
  useBugEditCommentMutation,
  BugDetailDocument,
} from '@/__generated__/graphql'
import { useAuth } from '@/lib/auth'
import { useRepo } from '@/lib/repo'

type TimelineNode = NonNullable<
  NonNullable<NonNullable<BugDetailQuery['repository']>['bug']>['timeline']['nodes'][number]
>

interface TimelineProps {
  bugPrefix: string
  items: TimelineNode[]
}

// Ordered sequence of events on a bug: comments (create and add-comment) and
// inline events (label changes, status changes, title edits). Comment items
// support inline editing for the logged-in user.
export function Timeline({ bugPrefix, items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        switch (item.__typename) {
          case 'BugCreateTimelineItem':
          case 'BugAddCommentTimelineItem':
            return <CommentItem key={item.id} item={item} bugPrefix={bugPrefix} />
          case 'BugLabelChangeTimelineItem':
            return <LabelChangeItem key={item.id} item={item} />
          case 'BugSetStatusTimelineItem':
            return <StatusChangeItem key={item.id} item={item} />
          case 'BugSetTitleTimelineItem':
            return <TitleChangeItem key={item.id} item={item} />
          default:
            return null
        }
      })}
    </div>
  )
}

// ── Comment (create or add-comment) ──────────────────────────────────────────

type CommentItem = Extract<
  TimelineNode,
  { __typename: 'BugCreateTimelineItem' | 'BugAddCommentTimelineItem' }
>

function CommentItem({ item, bugPrefix }: { item: CommentItem; bugPrefix: string }) {
  const { user } = useAuth()
  const repo = useRepo()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(item.message ?? '')

  const [editComment, { loading }] = useBugEditCommentMutation({
    refetchQueries: [{ query: BugDetailDocument, variables: { prefix: bugPrefix } }],
  })

  function handleSave() {
    if (editValue.trim() === (item.message ?? '').trim()) {
      setEditing(false)
      return
    }
    editComment({
      variables: { input: { targetPrefix: item.id, message: editValue } },
    }).then(() => setEditing(false))
  }

  function handleCancel() {
    setEditValue(item.message ?? '')
    setEditing(false)
  }

  const canEdit = user !== null && user.id === item.author.id

  return (
    <div className="flex gap-3">
      <Avatar className="mt-1 size-8 shrink-0">
        <AvatarImage src={item.author.avatarUrl ?? undefined} alt={item.author.displayName} />
        <AvatarFallback className="text-xs">
          {item.author.displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 rounded-md border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2 text-sm">
          <Link to={repo ? `/${repo}/user/${item.author.humanId}` : `/user/${item.author.humanId}`} className="font-medium text-foreground hover:underline">
            {item.author.displayName}
          </Link>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
          {item.edited && !editing && (
            <span className="text-xs text-muted-foreground">edited</span>
          )}
          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="ml-auto rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-2 p-3">
            {/* Ctrl/Cmd+Enter saves; Escape cancels — standard editor shortcuts */}
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-24 font-mono text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancel()
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave() }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3">
            {item.message ? (
              <Markdown content={item.message} />
            ) : (
              <p className="text-sm italic text-muted-foreground">No description provided.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Inline events ─────────────────────────────────────────────────────────────

type LabelChangeItem = Extract<TimelineNode, { __typename: 'BugLabelChangeTimelineItem' }>
type StatusChangeItem = Extract<TimelineNode, { __typename: 'BugSetStatusTimelineItem' }>
type TitleChangeItem = Extract<TimelineNode, { __typename: 'BugSetTitleTimelineItem' }>

function EventRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pl-2 text-sm text-muted-foreground">
      <span className="flex size-8 shrink-0 items-center justify-center">{icon}</span>
      {children}
    </div>
  )
}

function LabelChangeItem({ item }: { item: LabelChangeItem }) {
  const repo = useRepo()
  return (
    <EventRow icon={<Tag className="size-4" />}>
      <span>
        <Link to={repo ? `/${repo}/user/${item.author.humanId}` : `/user/${item.author.humanId}`} className="font-medium text-foreground hover:underline">{item.author.displayName}</Link>{' '}
        {item.added.length > 0 && (
          <>
            added{' '}
            {item.added.map((l) => (
              <LabelBadge key={l.name} name={l.name} color={l.color} />
            ))}{' '}
          </>
        )}
        {item.removed.length > 0 && (
          <>
            removed{' '}
            {item.removed.map((l) => (
              <LabelBadge key={l.name} name={l.name} color={l.color} />
            ))}{' '}
          </>
        )}
        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
      </span>
    </EventRow>
  )
}

function StatusChangeItem({ item }: { item: StatusChangeItem }) {
  const repo = useRepo()
  const isOpen = item.status === Status.Open
  return (
    <EventRow
      icon={
        isOpen ? (
          <CircleDot className="size-4 text-green-600 dark:text-green-400" />
        ) : (
          <GitPullRequestClosed className="size-4 text-purple-600 dark:text-purple-400" />
        )
      }
    >
      <span>
        <Link to={repo ? `/${repo}/user/${item.author.humanId}` : `/user/${item.author.humanId}`} className="font-medium text-foreground hover:underline">{item.author.displayName}</Link>{' '}
        {isOpen ? 'reopened' : 'closed'} this{' '}
        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
      </span>
    </EventRow>
  )
}

function TitleChangeItem({ item }: { item: TitleChangeItem }) {
  const repo = useRepo()
  return (
    <EventRow icon={<Pencil className="size-4" />}>
      <span>
        <Link to={repo ? `/${repo}/user/${item.author.humanId}` : `/user/${item.author.humanId}`} className="font-medium text-foreground hover:underline">{item.author.displayName}</Link> changed the
        title from <span className="line-through">{item.was}</span> to{' '}
        <span className="font-medium text-foreground">{item.title}</span>{' '}
        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
      </span>
    </EventRow>
  )
}
