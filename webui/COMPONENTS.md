# Component Status Tracker

Status legend: done / partial / todo / n/a

## Shared Components (`src/components/shared/`)

| Component | Fragments | Split/Compound | Stories | Interaction Tests | Snapshot Tests | Notes |
|-----------|-----------|----------------|---------|-------------------|---------------|-------|
| comment-card | done (`IdentitySummary`) | done (Root/AuthorAvatar/Card/CardHeader/CardBody) | done | n/a (display only) | done | Uses `withApollo` decorator |
| empty-state | n/a | n/a (simple wrapper) | done | n/a | done | |
| issue-filters | n/a (callbacks only) | todo (single export, complex) | done | todo (dropdowns, search, keyboard nav) | todo | Has complex floating-ui interactions, needs `withApollo` |
| issue-row | done (`BugSummary`, spreads `IdentitySummary`+`LabelFields`) | done (Root/StatusIcon/TitleArea/Meta/CommentCount) | done | n/a (display only) | done | Uses `withApollo` + `withRouter` |
| label-badge | done (`LabelFields`) | n/a | done | n/a | done | Uses `withApollo` decorator |
| pagination | n/a | done (Root/Info/Previous/Next) | done | n/a (links only) | done | |
| query-input | n/a | done (Root/Icon/Input/Completions) | done | partial (1 play function) | done | Complex autocomplete |
| section-heading | n/a | n/a | done | n/a | done | |
| status-badge | n/a | n/a | done | n/a | done | |
| status-tabs | n/a | done (Root/Tab/OpenIndicator/ClosedIndicator/Count) | done | n/a (links only) | done | |
| write-preview | n/a | done (Root/Tabs/WriteSlot/PreviewSlot) | done | partial (1 play function) | done | |

## Bug Components (`src/components/bugs/`)

| Component | Fragments | Split/Compound | Stories | Interaction Tests | Snapshot Tests | Notes |
|-----------|-----------|----------------|---------|-------------------|---------------|-------|
| timeline | done (5 sub-fragments + connection) | done (internal sub-components use `useSuspenseFragment`) | done | todo (comment editing) | done | 4 stories: FullTimeline, CreateOnly, EmptyMessage, StatusReopen |
| comment-box | n/a (mutations only) | n/a | todo | todo (textarea, submit, status toggle) | todo | Uses `useAuth`, needs Apollo mock |
| title-editor | n/a (mutation only) | n/a | done | todo (inline edit, save/cancel, keyboard) | done | Uses `useAuth` |
| label-editor | partial (uses `LabelFields` via LabelBadge) | n/a | done | todo (dropdown, checkbox toggling) | todo | Demo story with local state |

## Code Components (`src/components/code/`)

| Component | Fragments | Split/Compound | Stories | Interaction Tests | Snapshot Tests | Notes |
|-----------|-----------|----------------|---------|-------------------|---------------|-------|
| ref-selector | done (`RefSelectorRefs` on connection) | n/a | done | todo (dropdown, search, keyboard nav) | done | Uses `withApollo` decorator |
| file-viewer | done (`FileViewerBlob`) | n/a | done | todo (copy, line select, shift-click range) | done | Shiki WASM excluded from browser tests |
| file-tree | n/a (data from 2 queries, local interface) | n/a | done | n/a (links only) | done | |
| file-diff-view | todo (owns `DIFF_QUERY`, no fragment) | todo (Hunk is internal) | todo | todo (collapsible sections) | todo | |
| commit-list | todo (owns `COMMITS_QUERY`, no fragment) | todo (CommitRow is internal) | todo | todo (load more button) | todo | |
| code-breadcrumb | n/a | n/a | done | n/a (links only) | done | |

## Content Components (`src/components/content/`)

| Component | Fragments | Split/Compound | Stories | Interaction Tests | Snapshot Tests | Notes |
|-----------|-----------|----------------|---------|-------------------|---------------|-------|
| markdown | n/a | n/a | done | n/a | done | |

## Layout Components (`src/components/layout/`)

| Component | Fragments | Split/Compound | Stories | Interaction Tests | Snapshot Tests | Notes |
|-----------|-----------|----------------|---------|-------------------|---------------|-------|
| header | n/a | todo (RepoNav is internal) | todo | todo (theme toggle) | todo | Uses `useAuth` + router |
| shell | n/a | n/a | n/a (layout wrapper) | n/a | n/a | |

## UI Primitives (`src/components/ui/`)

All built on @base-ui/react. Fragment/split columns are n/a for these.

| Component | Stories | Interaction Tests | Snapshot Tests | Notes |
|-----------|---------|-------------------|---------------|-------|
| avatar | done | n/a | done | Compound (Avatar/Image/Fallback/Badge/Group) |
| back-link | todo | n/a | todo | |
| badge | done | n/a | done | |
| button | done | n/a | done | |
| button-link | todo | n/a | todo | TanStack Router wrapper |
| input | done | n/a | done | |
| listbox | done | n/a | todo | Compound (Content/ScrollArea/Search/Group/Item/Empty) |
| popover | todo | n/a | todo | |
| separator | done | n/a | done | |
| skeleton | done | n/a | done | |
| textarea | done | n/a | done | |

## Route Pages (no stories expected, but may need component extraction)

| Route | Fragments | Extractable UI | Notes |
|-------|-----------|----------------|-------|
| `/$repo/_issues/issues/$id` | done (spreads BugSummary, IdentitySummary, TimelineItems) | todo: participants list | Accesses participant fields directly |
| `/$repo/_issues/issues/index` | done (spreads BugSummary) | todo: completion providers | Large file, complex query parsing |
| `/$repo/_issues/user/$id` | partial (spreads BugSummary, IdentitySummary) | todo: profile header | Accesses identity fields directly |
| `/$repo/_code/tree/$ref/$` | todo | n/a | Accesses tree/commit fields directly, data from 2 queries |
| `/$repo/commit/$hash` | todo | todo: commit header | Accesses all commit fields directly |
| `/$repo/_code` | done (uses RefSelectorRefs via preload) | n/a | Layout route |
| `/$repo/_issues` | done (preloads labels with LabelFields) | n/a | Layout route |
| `/$repo` | done (REFS_QUERY with RefSelectorRefs) | n/a | Layout route |

## Infrastructure

- **Apollo mock decorator** (`withApollo`): Provides mock `ApolloClient` with `dataMasking: false`, `keyFields` for Label/GitBlob/connections, and mock UserIdentity data for `useAuth()`
- **Router decorator** (`withRouter`): Provides catch-all TanStack Router for `<Link>` components
- **Snapshot setup** (`vitest.setup.ts`): Mocks `useSuspenseFragment` as passthrough for happy-dom
