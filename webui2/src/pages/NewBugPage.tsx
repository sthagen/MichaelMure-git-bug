import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { useBugCreateMutation } from "@/__generated__/graphql";
import { Markdown } from "@/components/content/Markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRepo } from "@/lib/repo";

// New issue form (/:repo/issues/new). Title + body with write/preview tabs.
export function NewBugPage() {
  const navigate = useNavigate();
  const repo = useRepo();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);

  const [createBug, { loading, error }] = useBugCreateMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const result = await createBug({
      variables: { input: { title: title.trim(), message: message.trim() } },
    });
    const humanId = result.data?.bugCreate.bug.humanId;
    if (humanId) {
      void navigate({ to: repo ? `/${repo}/issues/${humanId}` : `/issues/${humanId}` });
    }
  }

  const issuesHref = repo ? `/${repo}/issues` : "/issues";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={issuesHref}
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" />
        Back to issues
      </Link>

      <h1 className="mb-6 text-xl font-semibold">New issue</h1>

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            placeholder="Brief description of the issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">Description</label>
            <div className="flex gap-1 text-sm">
              <button
                type="button"
                onClick={() => setPreview(false)}
                className={`rounded-sm px-2 py-0.5 transition-colors ${
                  !preview ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setPreview(true)}
                disabled={!message.trim()}
                className={`rounded-sm px-2 py-0.5 transition-colors disabled:opacity-40 ${
                  preview ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {preview ? (
            <div className="border-input min-h-[200px] rounded-md border px-3 py-2">
              <Markdown content={message} />
            </div>
          ) : (
            <Textarea
              placeholder="Describe the issue in detail…"
              className="min-h-[200px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
          )}
        </div>

        {error && (
          <p className="text-destructive text-sm">Failed to create issue: {error.message}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              void navigate({ to: issuesHref });
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || loading}>
            {loading ? "Creating…" : "Submit new issue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
