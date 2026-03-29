# webui2

New web interface for git-bug. Built with Vite 8 + React 19 + TypeScript 6 + Tailwind v4 + shadcn/ui + TanStack Router + Apollo Client 4.

## Quickstart

You need two processes running:

```bash
# 1. Go backend (from repo root)
go run . webui --no-open --port 3000

# 2. Vite dev server (from this directory)
pnpm install
pnpm dev
```

Open http://localhost:5173. Vite proxies `/graphql`, `/gitfile`, `/gitraw`, `/upload`, and `/auth` to the Go server on port 3000.

Node 22 is required. If you use asdf, `.tool-versions` pins the right version automatically.

## Routes

| Path                           | Page                                           |
| ------------------------------ | ---------------------------------------------- |
| `/`                            | Repo picker — auto-redirects for single repo   |
| `/$repo/tree/$ref/...path`     | Code browser — directory listing               |
| `/$repo/blob/$ref/...path`     | Code browser — file viewer                     |
| `/$repo/commits/$ref`          | Commit history                                 |
| `/$repo/commit/$hash`          | Commit detail with collapsible file diffs       |
| `/$repo/issues`                | Issue list with search, filters, pagination     |
| `/$repo/issues/new`            | New issue form                                 |
| `/$repo/issues/$id`            | Issue detail and timeline                      |
| `/$repo/user/$id`              | User profile with their issues                 |
| `/auth/select-identity`        | OAuth identity adoption (first-time login)     |

`_` is the URL segment for the default (unnamed) repository. Named repositories use their registered name.

## Code structure

```
src/
├── routes/             # File-based routing (TanStack Router)
│   ├── __root.tsx      # Root layout (Shell + error boundary)
│   ├── index.tsx       # Repo picker (/)
│   ├── $repo.tsx       # Repo layout — normalizes slug, preloads refs
│   ├── $repo/
│   │   ├── index.tsx   # Redirect to tree/{defaultRef}
│   │   ├── _code.tsx   # Code browser layout (breadcrumb, ref selector)
│   │   ├── _code/      # tree/$ref/$, blob/$ref/$, commits/$ref
│   │   ├── _issues.tsx # Issues layout — preloads labels + identities
│   │   ├── _issues/    # issues/, issues/new, issues/$id, user/$id
│   │   └── commit/     # commit/$hash
│   └── auth/           # select-identity
├── components/
│   ├── bugs/           # Issue components (BugRow, Timeline, ...)
│   ├── code/           # Code browser (FileTree, FileViewer, ...)
│   ├── content/        # Markdown renderer with repo-aware links
│   ├── layout/         # Header + Shell
│   └── ui/             # shadcn/ui + ButtonLink, BackLink
├── graphql/            # .graphql source files — edit these, then run codegen
├── __generated__/      # Generated typed hooks — do not edit
├── assets/             # Logo SVG
├── lib/                # apollo.ts, auth.tsx, theme.tsx, utils.ts
├── routeTree.gen.ts    # Auto-generated route tree — do not edit
└── App.tsx             # Router instance + context
```

## Routing

Routes use [TanStack Router](https://tanstack.com/router) with file-based routing and automatic code splitting. The `@tanstack/router-plugin` Vite plugin generates `routeTree.gen.ts` from the `src/routes/` directory.

Pathless layout routes (`_code.tsx`, `_issues.tsx`) group child routes that share data loading or layout without adding URL segments.

The router context provides:
- `preloadQuery` — Apollo `createQueryPreloader` for data loading in route loaders
- `ref` — normalized repo slug (null for default repo), set by `$repo.tsx` `beforeLoad`
- `labelsRef`, `identitiesRef` — preloaded shared queries, set by `_issues.tsx` `beforeLoad`

Custom link components:
- `ButtonLink` — `createLink()`-wrapped anchor with button styling and preload-on-intent
- `BackLink` — uses `router.history.back()` when possible, falls back to a typed Link

## Data loading

Data is loaded in route loaders using Apollo's `preloadQuery` + `useReadQuery` pattern:

```ts
export const Route = createFileRoute("/$repo/issues/$id")({
  loader: async ({ context: { preloadQuery, ref }, params: { id } }) => {
    const bugDetailRef = preloadQuery<BugDetailQuery>(BugDetailDocument, {
      variables: { ref, prefix: id },
    });
    return { bugDetailRef: await preloadQuery.toPromise(bugDetailRef) };
  },
});
```

The router waits for `toPromise()` before transitioning, then the component reads data with `useReadQuery()`. Cascading queries (e.g. last commits after tree loads) stay as component-level `useQuery`.

Search params that affect data loading use `loaderDeps` so the loader re-runs when they change (e.g. issue filters, pagination cursors).

After changing any `.graphql` file, regenerate typed hooks:

```bash
pnpm codegen
```

## Tooling

| Tool | Purpose |
| --- | --- |
| [oxlint](https://oxc.rs) | Linter with type-aware rules (replaces ESLint) |
| [oxfmt](https://oxc.rs) | Formatter with import + Tailwind class sorting |
| [valibot](https://valibot.dev) | Runtime validation for search params and fetch responses |
| [@tsconfig/bases](https://github.com/tsconfig/bases) | Shared tsconfig presets (vite-react + strictest) |

```bash
pnpm lint        # oxlint (type-aware, 0 warnings target)
pnpm lint:fix    # oxlint with auto-fix
pnpm fmt         # oxfmt format
pnpm fmt:check   # oxfmt check only
pnpm check       # lint + format check
```

## Auth

Three modes, configured at server start:

- **`local`** — single user derived from git config; all writes enabled, no login UI.
- **`external`** — multi-user via OAuth providers; unauthenticated requests get 401.
- **`readonly`** — no identity; all write actions hidden in the UI.

`AuthProvider` (`src/lib/auth.tsx`) fetches server config + user identity on load and exposes `{ user, mode, loginProviders }` to the component tree.

## Build for production

The Go binary embeds the compiled frontend via `//go:embed all:dist` in `webui2/handler.go`:

```bash
pnpm build           # outputs to webui2/dist/
cd .. && go build .  # embeds dist/ into the binary
```

## Theming

`ThemeProvider` (`src/lib/theme.tsx`) toggles the `dark` class on `<html>`. CSS variables for both modes are defined in `src/index.css` using Tailwind v4's `@theme inline` block. Components pick them up automatically.
