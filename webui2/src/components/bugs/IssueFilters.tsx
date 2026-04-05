import { ArrowUpDown, ChevronDown, Tag, User, X, Search, Check } from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

import { LabelBadge } from "@/components/shared/LabelBadge";

// Max authors shown in the non-searching state. We intentionally cap this to
// avoid a giant list — the current-user + recently-seen pattern covers the
// common case; typing to search handles the rest.
const INITIAL_AUTHOR_LIMIT = 8;

// Returns the value passed to author:... in the query string.
// Preference order: login (never has spaces, safest) > name > humanId.
// We avoid humanId-as-query where possible because it's opaque to the user;
// the backend Match() also accepts login/name substring matches.
//
// Uses || (not ??) so that empty-string login/name fall through to the next
// option. git-bug identities can have login="" (empty, not null) when the
// login field was never set; ?? would return "" and the filter would silently
// produce author:"" which buildQueryString then drops, making the filter a no-op.
function authorQueryValue(i: {
  login?: string | null;
  name?: string | null;
  humanId: string;
}): string {
  return i.login || i.name || i.humanId;
}

export type SortValue = "creation-desc" | "creation-asc" | "edit-desc" | "edit-asc";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "creation-desc", label: "Newest" },
  { value: "creation-asc", label: "Oldest" },
  { value: "edit-desc", label: "Recently updated" },
  { value: "edit-asc", label: "Least recently updated" },
];

export interface LabelItem {
  name: string;
  color: { R: number; G: number; B: number };
}

export interface IdentityItem {
  id: string;
  humanId: string;
  name?: string | null;
  email?: string | null;
  login?: string | null;
  displayName: string;
  avatarUrl?: string | null;
}

interface IssueFiltersProps {
  labels: readonly LabelItem[];
  identities: readonly IdentityItem[];
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  selectedAuthorId: string | null;
  onAuthorChange: (humanId: string | null, queryValue: string | null) => void;
  /** humanIds of authors appearing in the current bug list, used to rank the initial suggestions */
  recentAuthorIds?: string[];
  sort: SortValue;
  onSortChange: (sort: SortValue) => void;
}

// Label and author filter dropdowns shown in the issue list header bar.
//
// The author dropdown has two display modes:
//   - Not searching: shows current user first, then recently-seen authors from
//     the visible bug list (recentAuthorIds), then alphabetical fill up to
//     INITIAL_AUTHOR_LIMIT. This surfaces the most useful choices with no typing.
//   - Searching: filters the full identity list reactively as-you-type.
//
// Note: onAuthorChange passes TWO values — humanId (for UI matching, unique) and
// queryValue (login/name for the query string). They're kept separate because
// two identities can share the same display name, but humanId is always unique.
export function IssueFilters({
  labels,
  identities,
  selectedLabels,
  onLabelsChange,
  selectedAuthorId,
  onAuthorChange,
  recentAuthorIds = [],
  sort,
  onSortChange,
}: IssueFiltersProps) {
  const { user } = useAuth();
  const [labelSearch, setLabelSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");

  const validLabels = useMemo(
    () => labels.toSorted((a, b) => a.name.localeCompare(b.name)),
    [labels],
  );

  const allIdentities = useMemo(
    () => identities.toSorted((a, b) => a.displayName.localeCompare(b.displayName)),
    [identities],
  );

  const filteredLabels = labelSearch.trim()
    ? validLabels.filter((l) => l.name.toLowerCase().includes(labelSearch.toLowerCase()))
    : validLabels;

  // Selected labels float to top, then alphabetical
  const sortedLabels = [
    ...filteredLabels.filter((l) => selectedLabels.includes(l.name)),
    ...filteredLabels.filter((l) => !selectedLabels.includes(l.name)),
  ];

  // Build the displayed identity list:
  // - When searching: filter full list reactively as-you-type
  // - When not searching: show current user first, then recently-seen authors,
  //   then others up to INITIAL_AUTHOR_LIMIT
  const isSearching = authorSearch.trim() !== "";

  const matchesSearch = (i: (typeof allIdentities)[number]) => {
    const q = authorSearch.toLowerCase();
    return (
      i.displayName.toLowerCase().includes(q) ||
      (i.name ?? "").toLowerCase().includes(q) ||
      (i.login ?? "").toLowerCase().includes(q) ||
      (i.email ?? "").toLowerCase().includes(q)
    );
  };

  let visibleIdentities: typeof allIdentities;
  if (isSearching) {
    visibleIdentities = allIdentities.filter(matchesSearch);
  } else {
    const pinned = new Set<string>();
    const result: typeof allIdentities = [];

    // 1. Current user
    if (user) {
      const me = allIdentities.find((i) => i.id === user.id);
      if (me) {
        result.push(me);
        pinned.add(me.id);
      }
    }
    // 2. Selected author (if not already added)
    if (selectedAuthorId) {
      const sel = allIdentities.find((i) => i.humanId === selectedAuthorId);
      if (sel && !pinned.has(sel.id)) {
        result.push(sel);
        pinned.add(sel.id);
      }
    }
    // 3. Recently seen authors (recentAuthorIds are humanIds from bug rows)
    for (const humanId of recentAuthorIds) {
      const match = allIdentities.find((i) => i.humanId === humanId);
      if (match && !pinned.has(match.id)) {
        result.push(match);
        pinned.add(match.id);
      }
    }
    // 4. Fill up to limit with remaining alphabetical
    for (const i of allIdentities) {
      if (result.length >= INITIAL_AUTHOR_LIMIT) break;
      if (!pinned.has(i.id)) result.push(i);
    }
    visibleIdentities = result;
  }

  function toggleLabel(name: string) {
    if (selectedLabels.includes(name)) {
      onLabelsChange(selectedLabels.filter((l) => l !== name));
    } else {
      onLabelsChange([...selectedLabels, name]);
    }
  }

  const selectedAuthorIdentity = allIdentities.find((i) => i.humanId === selectedAuthorId);

  return (
    <div className="flex shrink-0 items-center gap-1">
      {/* Label filter */}
      <Popover
        onOpenChange={(open) => {
          if (!open) setLabelSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              selectedLabels.length > 0
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Tag className="size-3.5" />
            Labels
            {selectedLabels.length > 0 && (
              <span className="bg-muted rounded-full px-1.5 py-0.5 text-xs leading-none">
                {selectedLabels.length}
              </span>
            )}
            <ChevronDown className="size-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="bg-popover w-56 p-0 shadow-lg">
          {/* Search */}
          <div className="border-border flex items-center gap-2 border-b px-3 py-2">
            <Search className="text-muted-foreground size-3.5 shrink-0" />
            <input
              autoFocus
              placeholder="Search labels…"
              value={labelSearch}
              onChange={(e) => setLabelSearch(e.target.value)}
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-hidden"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {sortedLabels.length === 0 && (
              <p className="text-muted-foreground px-2 py-3 text-center text-xs">No labels found</p>
            )}
            {sortedLabels.map((label) => {
              const active = selectedLabels.includes(label.name);
              return (
                <button
                  key={label.name}
                  onClick={() => toggleLabel(label.name)}
                  className="hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: `rgb(${label.color.R},${label.color.G},${label.color.B})`,
                      opacity: active ? 1 : 0.35,
                    }}
                  />
                  <LabelBadge name={label.name} color={label.color} />
                  {active && <Check className="text-foreground ml-auto size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
          {selectedLabels.length > 0 && (
            <div className="border-border border-t p-1">
              <button
                onClick={() => onLabelsChange([])}
                className="text-muted-foreground hover:bg-muted flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs"
              >
                <X className="size-3" />
                Clear labels
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Author filter */}
      <Popover
        onOpenChange={(open) => {
          if (!open) setAuthorSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              selectedAuthorId
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {selectedAuthorIdentity ? (
              <>
                <Avatar className="size-4">
                  <AvatarImage
                    src={selectedAuthorIdentity.avatarUrl ?? undefined}
                    alt={selectedAuthorIdentity.displayName}
                  />
                  <AvatarFallback className="text-[8px]">
                    {selectedAuthorIdentity.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {selectedAuthorIdentity.displayName}
              </>
            ) : (
              <>
                <User className="size-3.5" />
                Author
              </>
            )}
            <ChevronDown className="size-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="bg-popover w-56 p-0 shadow-lg">
          {/* Search */}
          <div className="border-border flex items-center gap-2 border-b px-3 py-2">
            <Search className="text-muted-foreground size-3.5 shrink-0" />
            <input
              autoFocus
              placeholder="Search authors…"
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-hidden"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {visibleIdentities.length === 0 && (
              <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                No authors found
              </p>
            )}
            {visibleIdentities.map((identity) => {
              const active = selectedAuthorId === identity.humanId;
              return (
                <button
                  key={identity.id}
                  onClick={() =>
                    onAuthorChange(
                      active ? null : identity.humanId,
                      active ? null : authorQueryValue(identity),
                    )
                  }
                  className="hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                >
                  <Avatar className="size-5 shrink-0">
                    <AvatarImage src={identity.avatarUrl ?? undefined} alt={identity.displayName} />
                    <AvatarFallback className="text-[8px]">
                      {identity.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate">{identity.displayName}</div>
                    {identity.login && identity.login !== identity.displayName && (
                      <div className="text-muted-foreground truncate text-xs">
                        @{identity.login}
                      </div>
                    )}
                  </div>
                  {active && <Check className="text-foreground size-3.5 shrink-0" />}
                </button>
              );
            })}
            {!isSearching && allIdentities.length > INITIAL_AUTHOR_LIMIT && (
              <p className="text-muted-foreground px-2 py-1.5 text-center text-xs">
                {allIdentities.length - visibleIdentities.length} more — type to search
              </p>
            )}
          </div>
          {selectedAuthorId && (
            <div className="border-border border-t p-1">
              <button
                onClick={() => onAuthorChange(null, null)}
                className="text-muted-foreground hover:bg-muted flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs"
              >
                <X className="size-3" />
                Clear author
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Sort */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              sort !== "creation-desc"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <ArrowUpDown className="size-3.5" />
            {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort"}
            <ChevronDown className="size-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="bg-popover w-56 p-1 shadow-lg">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className="hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm whitespace-nowrap"
            >
              {opt.label}
              {sort === opt.value && (
                <Check className="text-foreground ml-auto size-3.5 shrink-0" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
