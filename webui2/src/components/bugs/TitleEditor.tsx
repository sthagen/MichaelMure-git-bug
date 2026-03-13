import { useState, useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'
import { useBugSetTitleMutation, BugDetailDocument } from '@/__generated__/graphql'

interface TitleEditorProps {
  bugPrefix: string
  title: string
  humanId: string
  /** Current repo slug, passed as `ref` in refetch query variables. */
  ref_?: string | null
}

// Inline title editor in BugDetailPage. Shows the title as plain text with a
// pencil icon on hover (auth-gated). Enter saves, Escape cancels.
export function TitleEditor({ bugPrefix, title, humanId, ref_ }: TitleEditorProps) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  const [setTitle, { loading }] = useBugSetTitleMutation({
    refetchQueries: [{ query: BugDetailDocument, variables: { ref: ref_, prefix: bugPrefix } }],
  })

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  // Keep local value in sync if title prop changes (e.g. after refetch)
  useEffect(() => {
    if (!editing) setValue(title)
  }, [title, editing])

  async function handleSave() {
    const trimmed = value.trim()
    if (trimmed && trimmed !== title) {
      await setTitle({ variables: { input: { prefix: bugPrefix, title: trimmed } } })
    }
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setValue(title)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xl font-semibold"
          disabled={loading}
        />
        <Button size="sm" onClick={handleSave} disabled={loading || !value.trim()}>
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setValue(title)
            setEditing(false)
          }}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-2">
      <h1 className="flex-1 text-2xl font-semibold leading-tight text-foreground">
        {title}
        <span className="ml-2 text-xl font-normal text-muted-foreground">#{humanId}</span>
      </h1>
      {user && (
        <button
          onClick={() => setEditing(true)}
          className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          title="Edit title"
        >
          <Pencil className="size-4" />
        </button>
      )}
    </div>
  )
}
