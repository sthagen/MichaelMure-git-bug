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
import { ErrorPage } from '@/pages/ErrorPage'

// Route structure:
//   /                          → repo picker (or redirect if single repo)
//   /:repo                     → code browser (repo home)
//   /:repo/issues              → issue list
//   /auth/select-identity      → OAuth identity adoption (first-time login)
const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <RepoPickerPage /> },
      { path: 'auth/select-identity', element: <IdentitySelectPage /> },
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
