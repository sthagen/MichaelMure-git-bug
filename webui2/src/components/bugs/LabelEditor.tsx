import { Settings2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LabelBadge } from './LabelBadge'
import { useAuth } from '@/lib/auth'
import {
  useValidLabelsQuery,
  useBugChangeLabelsMutation,
  BugDetailDocument,
} from '@/__generated__/graphql'

interface LabelEditorProps {
  bugPrefix: string
  currentLabels: Array<{ name: string; color: { R: number; G: number; B: number } }>
  /** Current repo slug, passed as `ref` in refetch query variables. */
  ref_?: string | null
}

// Gear-icon popover in the BugDetailPage sidebar for adding/removing labels.
// Loads all valid labels from the repo and toggles them via bugChangeLabels.
// Hidden in read-only mode.
export function LabelEditor({ bugPrefix, currentLabels, ref_ }: LabelEditorProps) {
  const { user } = useAuth()
  const { data } = useValidLabelsQuery({ skip: !user, variables: { ref: ref_ } })
  const [changeLabels] = useBugChangeLabelsMutation({
    refetchQueries: [{ query: BugDetailDocument, variables: { ref: ref_, prefix: bugPrefix } }],
  })

  const validLabels = data?.repository?.validLabels.nodes ?? []
  const currentNames = new Set(currentLabels.map((l) => l.name))

  async function toggleLabel(name: string) {
    const isSet = currentNames.has(name)
    await changeLabels({
      variables: {
        input: {
          prefix: bugPrefix,
          added: isSet ? [] : [name],
          Removed: isSet ? [name] : [],
        },
      },
    })
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Labels
        </h3>
        {user && validLabels.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <Settings2 className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                Apply labels
              </p>
              <div className="space-y-1">
                {validLabels.map((label) => {
                  const active = currentNames.has(label.name)
                  return (
                    <button
                      key={label.name}
                      onClick={() => toggleLabel(label.name)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      <span
                        className={`size-2 rounded-full border-2 transition-colors ${
                          active ? 'border-transparent' : 'border-muted-foreground/40 bg-transparent'
                        }`}
                        style={active ? { backgroundColor: `rgb(${label.color.R},${label.color.G},${label.color.B})` } : {}}
                      />
                      <LabelBadge name={label.name} color={label.color} />
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {currentLabels.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {currentLabels.map((label) => (
            <LabelBadge key={label.name} name={label.name} color={label.color} />
          ))}
        </div>
      )}
    </div>
  )
}
