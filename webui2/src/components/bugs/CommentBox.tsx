import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Markdown } from '@/components/content/Markdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { Status } from '@/__generated__/graphql'
import {
  useBugAddCommentMutation,
  useBugAddCommentAndCloseMutation,
  useBugAddCommentAndReopenMutation,
  useBugStatusCloseMutation,
  useBugStatusOpenMutation,
  BugDetailDocument,
} from '@/__generated__/graphql'

interface CommentBoxProps {
  bugPrefix: string
  bugStatus: Status
  /** Current repo slug, passed as `ref` in refetch query variables. */
  ref_?: string | null
}

// Write/preview comment form at the bottom of BugDetailPage. Also contains the
// Close / Reopen button. Hidden entirely in read-only mode (no logged-in user).
export function CommentBox({ bugPrefix, bugStatus, ref_ }: CommentBoxProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState(false)

  const refetchVars = { variables: { ref: ref_, prefix: bugPrefix } }
  const refetch = { refetchQueries: [{ query: BugDetailDocument, ...refetchVars }] }

  const [addComment, { loading: addingComment }] = useBugAddCommentMutation(refetch)
  const [addAndClose, { loading: addingAndClosing }] = useBugAddCommentAndCloseMutation(refetch)
  const [addAndReopen, { loading: addingAndReopening }] = useBugAddCommentAndReopenMutation(refetch)
  const [statusClose, { loading: closing }] = useBugStatusCloseMutation(refetch)
  const [statusOpen, { loading: reopening }] = useBugStatusOpenMutation(refetch)

  const isOpen = bugStatus === Status.Open
  const busy = addingComment || addingAndClosing || addingAndReopening || closing || reopening
  const hasMessage = message.trim().length > 0

  async function handleComment() {
    await addComment({ variables: { input: { prefix: bugPrefix, message: message.trim() } } })
    setMessage('')
    setPreview(false)
  }

  async function handleToggleStatus() {
    if (isOpen) {
      if (hasMessage) {
        await addAndClose({ variables: { input: { prefix: bugPrefix, message: message.trim() } } })
      } else {
        await statusClose({ variables: { input: { prefix: bugPrefix } } })
      }
    } else {
      if (hasMessage) {
        await addAndReopen({ variables: { input: { prefix: bugPrefix, message: message.trim() } } })
      } else {
        await statusOpen({ variables: { input: { prefix: bugPrefix } } })
      }
    }
    setMessage('')
    setPreview(false)
  }

  if (!user) return null

  return (
    <div className="flex gap-3">
      <Avatar className="mt-1 size-8 shrink-0">
        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
        <AvatarFallback className="text-xs">
          {user.displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 rounded-md border border-border">
        {/* Write / Preview tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setPreview(false)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              !preview
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setPreview(true)}
            disabled={!hasMessage}
            className={`px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
              preview
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Preview
          </button>
        </div>

        {preview ? (
          <div className="min-h-[120px] px-4 py-3">
            <Markdown content={message} />
          </div>
        ) : (
          <Textarea
            placeholder="Leave a comment…"
            className="min-h-[120px] rounded-none border-0 shadow-none focus-visible:ring-0"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={busy}
          />
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={busy}
            className="min-w-[7.5rem]"
          >
            {isOpen ? 'Close issue' : 'Reopen issue'}
          </Button>
          <Button
            size="sm"
            onClick={handleComment}
            disabled={!hasMessage || busy}
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
