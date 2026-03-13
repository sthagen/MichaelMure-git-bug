# webui2

New web interface for git-bug. Built with Vite + React + TypeScript + Tailwind + shadcn/ui.

## Quickstart

You need two processes running:

```bash
# 1. Go backend (from repo root)
go run . webui --port 3000

# 2. Vite dev server (from this directory)
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/graphql`, `/api`, `/gitfile`, and `/upload` to the Go server on port 3000.

Node 22 is required. If you use asdf, `.tool-versions` pins the right version automatically.

## Code structure

```
src/
├── pages/          # One file per route (BugList, BugDetail, NewBug,
│                   #   UserProfile, Code, Commit)
├── components/
│   ├── bugs/       # Issue components (BugRow, Timeline, CommentBox,
│   │               #   LabelEditor, TitleEditor, LabelBadge, StatusBadge)
│   ├── code/       # Code browser (FileTree, FileViewer, CommitList,
│   │               #   RefSelector, CodeBreadcrumb)
│   ├── content/    # Markdown renderer
│   ├── layout/     # Header + Shell
│   └── ui/         # shadcn/ui — never edit manually
│                   # Update with: npx shadcn update <component>
├── graphql/        # .graphql source files — edit these, then run codegen
├── __generated__/  # Generated typed hooks — do not edit
└── lib/            # apollo.ts, auth.tsx, theme.tsx, gitApi.ts, utils.ts
```

## Data flow

**Bug tracking** uses GraphQL (`/graphql`). Queries and mutations are defined in `src/graphql/*.graphql` and codegen produces typed React hooks into `src/__generated__/graphql.ts`. After changing any `.graphql` file, run:

```bash
npm run codegen
```

**Code browser** uses REST endpoints at `/api/git/*` implemented in Go (`api/http/git_browse_handler.go`). The TypeScript client is `src/lib/gitApi.ts`.

## Auth

`AuthContext` (`src/lib/auth.tsx`) fetches `repository.userIdentity` on load. If the query returns null the UI enters read-only mode and all write actions are hidden. The context is designed for a future OAuth provider: swap `AuthProvider` for an `OAuthAuthProvider` without touching any other component.

## Theming

`ThemeProvider` (`src/lib/theme.tsx`) toggles the `dark` class on `<html>`. CSS variables for both modes are defined in `src/index.css`. shadcn/ui components pick them up automatically.
