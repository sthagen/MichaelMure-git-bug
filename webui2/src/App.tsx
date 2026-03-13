import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { RepoShell } from '@/lib/repo'
import { RepoPickerPage } from '@/pages/RepoPickerPage'
import { BugListPage } from '@/pages/BugListPage'
import { BugDetailPage } from '@/pages/BugDetailPage'
import { NewBugPage } from '@/pages/NewBugPage'
import { CodePage } from '@/pages/CodePage'
import { UserProfilePage } from '@/pages/UserProfilePage'
import { CommitPage } from '@/pages/CommitPage'
import { IdentitySelectPage } from '@/pages/IdentitySelectPage'

// Route structure:
//   /                          → repo picker
//   /:repo                     → code browser (repo home)
//   /:repo/issues              → issue list
//   /_/auth/select-identity    → OAuth identity adoption (first-time login)
//
// The /_/auth/* prefix uses "_" as a reserved namespace so it never collides
// with a real repo slug.
const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <RepoPickerPage /> },
      // Reserved namespace for app-level pages that are not repo-scoped.
      {
        path: '_',
        children: [
          { path: 'auth/select-identity', element: <IdentitySelectPage /> },
        ],
      },
      {
        path: ':repo',
        element: <RepoShell />,
        children: [
          { index: true, element: <CodePage /> },
          { path: 'issues', element: <BugListPage /> },
          { path: 'issues/new', element: <NewBugPage /> },
          { path: 'issues/:id', element: <BugDetailPage /> },
          { path: 'user/:id', element: <UserProfilePage /> },
          { path: 'commit/:hash', element: <CommitPage /> },
        ],
      },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
