import { useState } from 'react'
import { GitBranch, Tag, Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { GitRef } from '@/__generated__/graphql'
import { cn } from '@/lib/utils'

interface RefSelectorProps {
  refs: GitRef[]
  currentRef: string
  onSelect: (ref: GitRef) => void
}

// Branch / tag selector dropdown for the code browser. Shown in two groups
// (branches, tags) with an inline search filter.
export function RefSelector({ refs, currentRef, onSelect }: RefSelectorProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const filtered = refs.filter((r) =>
    r.shortName.toLowerCase().includes(filter.toLowerCase()),
  )
  const branches = filtered.filter((r) => r.type === 'BRANCH')
  const tags = filtered.filter((r) => r.type === 'TAG')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
          <GitBranch className="size-3.5" />
          {currentRef}
          <ChevronsUpDown className="size-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">Switch branch / tag</p>
        <Input
          placeholder="Filter…"
          className="mb-2 h-7 text-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          autoFocus
        />
        <div className="max-h-64 overflow-y-auto">
          {branches.length > 0 && (
            <div className="mb-1">
              <p className="px-2 py-1 text-xs text-muted-foreground">Branches</p>
              {branches.map((ref) => (
                <RefItem
                  key={ref.name}
                  ref_={ref}
                  active={ref.shortName === currentRef}
                  onSelect={() => { onSelect(ref); setOpen(false); setFilter('') }}
                />
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <p className="px-2 py-1 text-xs text-muted-foreground">Tags</p>
              {tags.map((ref) => (
                <RefItem
                  key={ref.name}
                  ref_={ref}
                  active={ref.shortName === currentRef}
                  onSelect={() => { onSelect(ref); setOpen(false); setFilter('') }}
                />
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">No results</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function RefItem({
  ref_,
  active,
  onSelect,
}: {
  ref_: GitRef
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-muted',
        active && 'font-medium',
      )}
    >
      {ref_.type === 'BRANCH' ? (
        <GitBranch className="size-3 shrink-0 text-muted-foreground" />
      ) : (
        <Tag className="size-3 shrink-0 text-muted-foreground" />
      )}
      <span className="flex-1 truncate font-mono">{ref_.shortName}</span>
      {active && <Check className="size-3 text-muted-foreground" />}
    </button>
  )
}
