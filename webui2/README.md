# webui2

New web interface for git-bug. Built with Vite + React + TypeScript + Tailwind + shadcn/ui.

## Quickstart

You need two processes running:

```bash
# 1. Go backend (from repo root)
go run . webui --no-open --port 3000

# 2. Vite dev server (from this directory)
pnpm install
pnpm dev
```

Open http://localhost:5173. Vite proxies `/graphql`, `/api`, and `/auth` to the Go server on port 3000.

Node 22 is required. If you use asdf, `.tool-versions` pins the right version automatically.

## Routes

| Path                    | Page                                                     |
|-------------------------|----------------------------------------------------------|
| `/`                     | Repo picker — auto-redirects when there is only one repo |
| `/_`                    | Default repo (issues + code browser)                     |
| `/_/issues`             | Issue list with search and label filtering               |
| `/_/issues/new`         | New issue form                                           |
| `/_/issues/:id`         | Issue detail and timeline                                |
| `/_/user/:id`           | User profile                                             |
| `/_/commit/:hash`       | Commit detail with collapsible file diffs                |
| `/auth/select-identity` | OAuth identity adoption (first-time login)               |

`_` is the URL segment for the default (unnamed) repository. Named repositories use their registered name.

## Code structure

```
src/
├── pages/          # One file per route
├── components/
│   ├── bugs/       # Issue components (BugRow, Timeline, ...)
│   ├── code/       # Code browser (FileTree, FileViewer, ...)
│   ├── content/    # Markdown renderer
│   ├── layout/     # Header + Shell
│   └── ui/         # shadcn/ui — never edit manually
│                   # Update with: npx shadcn update <component>
├── graphql/        # .graphql source files — edit these, then run codegen
├── __generated__/  # Generated typed hooks — do not edit
└── lib/            # apollo.ts, auth.tsx, theme.tsx, gitApi.ts, repo.tsx, utils.ts
```

## Data flow

**Bug tracking** uses GraphQL (`/graphql`). Queries and mutations are defined in `src/graphql/*.graphql` and codegen produces typed React hooks into `src/__generated__/graphql.ts`. After changing any `.graphql` file run:

```bash
pnpm codegen
```

**Code browser** uses REST endpoints at `/api/repos/{owner}/{repo}/git/*` implemented in `api/http/git_browse_handler.go`. `_` is used for both owner and repo (local single-user setup). The TypeScript client is `src/lib/gitApi.ts`.

| Endpoint                              | Description                             |
|---------------------------------------|-----------------------------------------|
| `GET /git/refs`                       | List branches and tags                  |
| `GET /git/trees/{ref}?path=`          | Directory listing with last-commit info |
| `GET /git/blobs/{ref}?path=`          | File content                            |
| `GET /git/raw/{ref}/{path}`           | Raw file download                       |
| `GET /git/commits?ref=&limit=&after=` | Paginated commit log                    |
| `GET /git/commits/{sha}`              | Commit metadata + changed file list     |
| `GET /git/commits/{sha}/diff?path=`   | Per-file structured diff (lazy-loaded)  |

## Auth

Three modes, configured at server start:

- **`local`** — single user derived from git config; all writes enabled, no login UI.
- **`oauth`** — multi-user via external providers; all API endpoints require a valid session; unauthenticated requests get 401.
- **`readonly`** — no identity; all write actions hidden in the UI.

`AuthContext` (`src/lib/auth.tsx`) fetches `serverConfig` + `userIdentity` on load and exposes `{ user, mode, oauthProviders }` to the whole tree.

## Build for production

The Go binary embeds the compiled frontend via `//go:embed all:dist` in `webui2/handler.go`. The Makefile `build-webui2` target runs the Vite build before compiling Go:

```bash
# From repo root
make build
```

Or manually:

```bash
pnpm build           # outputs to webui2/dist/
cd .. && go build .  # embeds dist/ into the binary
```

## Theming

`ThemeProvider` (`src/lib/theme.tsx`) toggles the `dark` class on `<html>`. CSS variables for both modes are defined in `src/index.css`. shadcn/ui components pick them up automatically.
