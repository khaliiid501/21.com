import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { useDirection } from '@/i18n/use-direction'

export function AppLayout() {
  useDirection()
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="bg-background flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
