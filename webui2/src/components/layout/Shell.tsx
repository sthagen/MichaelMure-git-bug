import { Outlet } from 'react-router-dom'
import { Header } from './Header'

// Top-level page wrapper used as the root layout in App.tsx. Renders the
// Header above the current route's page component via <Outlet>.
export function Shell() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
