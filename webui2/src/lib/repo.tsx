// Provides the current repository slug (the :repo URL segment) to all
// components rendered inside a /:repo/* route.
//
// Usage:
//   - Wrap the /:repo route subtree with <RepoShell /> as the route element.
//   - Read the current slug in any child component with useRepo().
//   - Pass the slug as `ref` to all GraphQL repository queries.

import { createContext, useContext } from 'react'
import { useParams, Outlet } from 'react-router-dom'

const RepoContext = createContext<string | null>(null)

// Route element for /:repo routes. Reads the :repo param and provides it
// via context so any descendant can call useRepo() without prop drilling.
export function RepoShell() {
  const { repo } = useParams<{ repo: string }>()
  return (
    <RepoContext.Provider value={repo ?? null}>
      <Outlet />
    </RepoContext.Provider>
  )
}

// Returns the current repo slug from the nearest RepoShell ancestor.
// Returns null when rendered outside of a /:repo route (e.g. the picker page).
export function useRepo(): string | null {
  return useContext(RepoContext)
}
