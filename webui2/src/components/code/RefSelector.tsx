import { GitBranch, Tag, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { GitRefType, type GitRef } from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RefSelectorProps {
  refs: GitRef[];
  currentRef: string;
  onSelect: (ref: GitRef) => void;
}

// Branch / tag selector dropdown for the code browser. Shown in two groups
// (branches, tags) with an inline search filter.
export function RefSelector({ refs, currentRef, onSelect }: RefSelectorProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = refs.filter((r) => r.shortName.toLowerCase().includes(filter.toLowerCase()));
  const branches = filtered.filter((r) => r.type === GitRefType.Branch);
  const tags = filtered.filter((r) => r.type === GitRefType.Tag);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
          <GitBranch className="size-3.5" />
          {currentRef}
          <ChevronsUpDown className="text-muted-foreground size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <p className="text-muted-foreground mb-2 px-1 text-xs font-semibold">Switch branch / tag</p>
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
              <p className="text-muted-foreground px-2 py-1 text-xs">Branches</p>
              {branches.map((ref) => (
                <RefItem
                  key={ref.name}
                  ref_={ref}
                  active={ref.shortName === currentRef}
                  onSelect={() => {
                    onSelect(ref);
                    setOpen(false);
                    setFilter("");
                  }}
                />
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <p className="text-muted-foreground px-2 py-1 text-xs">Tags</p>
              {tags.map((ref) => (
                <RefItem
                  key={ref.name}
                  ref_={ref}
                  active={ref.shortName === currentRef}
                  onSelect={() => {
                    onSelect(ref);
                    setOpen(false);
                    setFilter("");
                  }}
                />
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <p className="text-muted-foreground px-2 py-2 text-xs">No results</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RefItem({
  ref_,
  active,
  onSelect,
}: {
  ref_: GitRef;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-muted",
        active && "font-medium",
      )}
    >
      {ref_.type === GitRefType.Branch ? (
        <GitBranch className="text-muted-foreground size-3 shrink-0" />
      ) : (
        <Tag className="text-muted-foreground size-3 shrink-0" />
      )}
      <span className="flex-1 truncate font-mono">{ref_.shortName}</span>
      {active && <Check className="text-muted-foreground size-3" />}
    </button>
  );
}
