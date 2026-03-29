import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { useBugCreateMutation } from "@/__generated__/graphql";
import { Markdown } from "@/components/content/Markdown";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
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
    const result = await createBug({
      variables: { input: { title: title.trim(), message: message.trim() } },
    });
    const humanId = result.data?.bugCreate.bug.humanId;
    if (humanId) {
      void navigate({
        to: "/$repo/issues/$id",
        params: { repo: repo!, id: humanId },
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/$repo/issues"
        params={{ repo: repo! }}
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
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <div>
          <div className="mb-2">
            <div className="flex gap-2">
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
          <ButtonLink to="/$repo/issues" params={{ repo: repo! }} variant="ghost">
            Cancel
          </ButtonLink>
          <Button type="submit" disabled={!title.trim() || loading}>
            {loading ? "Creating…" : "Submit new issue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
