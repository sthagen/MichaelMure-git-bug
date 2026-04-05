import { useState } from "react";

import { Status } from "@/__generated__/graphql";
import {
  useBugAddCommentMutation,
  useBugAddCommentAndCloseMutation,
  useBugAddCommentAndReopenMutation,
  useBugStatusCloseMutation,
  useBugStatusOpenMutation,
  BugDetailDocument,
} from "@/__generated__/graphql";
import { Markdown } from "@/components/content/Markdown";
import { Button } from "@/components/ui/button";
import * as CommentCard from "@/components/ui/comment-card";
import { Textarea } from "@/components/ui/textarea";
import * as WritePreview from "@/components/ui/write-preview";
import { useAuth } from "@/lib/auth";

interface CommentBoxProps {
  bugPrefix: string;
  bugStatus: Status;
  /** Current repo slug, passed as `ref` in refetch query variables. */
  ref_?: string | null;
}

// Write/preview comment form at the bottom of BugDetailPage. Also contains the
// Close / Reopen button. Hidden entirely in read-only mode (no logged-in user).
export function CommentBox({ bugPrefix, bugStatus, ref_ }: CommentBoxProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);

  const refetchVars = { variables: { ref: ref_, prefix: bugPrefix } };
  const refetch = { refetchQueries: [{ query: BugDetailDocument, ...refetchVars }] };

  const [addComment, { loading: addingComment }] = useBugAddCommentMutation(refetch);
  const [addAndClose, { loading: addingAndClosing }] = useBugAddCommentAndCloseMutation(refetch);
  const [addAndReopen, { loading: addingAndReopening }] =
    useBugAddCommentAndReopenMutation(refetch);
  const [statusClose, { loading: closing }] = useBugStatusCloseMutation(refetch);
  const [statusOpen, { loading: reopening }] = useBugStatusOpenMutation(refetch);

  const isOpen = bugStatus === Status.Open;
  const busy = addingComment || addingAndClosing || addingAndReopening || closing || reopening;
  const hasMessage = message.trim().length > 0;

  async function handleComment() {
    await addComment({ variables: { input: { prefix: bugPrefix, message: message.trim() } } });
    setMessage("");
    setPreview(false);
  }

  async function handleToggleStatus() {
    if (isOpen) {
      if (hasMessage) {
        await addAndClose({ variables: { input: { prefix: bugPrefix, message: message.trim() } } });
      } else {
        await statusClose({ variables: { input: { prefix: bugPrefix } } });
      }
    } else {
      if (hasMessage) {
        await addAndReopen({
          variables: { input: { prefix: bugPrefix, message: message.trim() } },
        });
      } else {
        await statusOpen({ variables: { input: { prefix: bugPrefix } } });
      }
    }
    setMessage("");
    setPreview(false);
  }

  if (!user) return null;

  return (
    <CommentCard.Root>
      <CommentCard.AuthorAvatar src={user.avatarUrl} name={user.displayName} />
      <CommentCard.Card>
        <WritePreview.Root hasContent={hasMessage} preview={preview} onPreviewChange={setPreview}>
          <WritePreview.Tabs className="border-border border-b px-4 py-2" />
          <WritePreview.WriteSlot>
            <Textarea
              placeholder="Leave a comment…"
              className="min-h-[120px] rounded-none border-0 shadow-none focus-visible:ring-0"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={busy}
            />
          </WritePreview.WriteSlot>
          <WritePreview.PreviewSlot>
            <div className="min-h-[120px] px-4 py-3">
              <Markdown content={message} />
            </div>
          </WritePreview.PreviewSlot>
        </WritePreview.Root>

        <div className="border-border flex items-center justify-end gap-2 border-t px-3 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void handleToggleStatus();
            }}
            disabled={busy}
            className="min-w-[7.5rem]"
          >
            {isOpen ? "Close issue" : "Reopen issue"}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              void handleComment();
            }}
            disabled={!hasMessage || busy}
          >
            Comment
          </Button>
        </div>
      </CommentCard.Card>
    </CommentCard.Root>
  );
}
