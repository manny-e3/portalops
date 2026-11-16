import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopBar } from './DashboardTopBar'
import { ErrorBoundary } from './ErrorBoundary'
import { CommandPaletteModal } from './CommandPaletteModal'

export function AppLayout() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const location = useLocation()

  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname])

  // Global keyboard shortcut: Cmd+K, Ctrl+K, or slash ('/')
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
        return
      }

      // '/' shortcut when not typing in an input or textarea
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) &&
        !document.activeElement?.isContentEditable
      ) {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex bg-zinc-50 dark:bg-[#07090D] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-emerald-500/20 dark:selection:text-emerald-300 transition-colors duration-200 overflow-hidden">
      {/* 1. Sidebar Navigation (Desktop persistent + Mobile slide-over drawer) */}
      <DashboardSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <DashboardTopBar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-8 w-full max-w-[1600px]">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* 3. Global Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  )
}
