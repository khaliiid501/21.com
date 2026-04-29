import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Locale, Theme, Role } from '@/types/common'

type AppState = {
  theme: Theme
  locale: Locale
  sidebarCollapsed: boolean
  mockUserName: string
  mockRole: Role
  setTheme: (theme: Theme) => void
  setLocale: (locale: Locale) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setMockRole: (role: Role) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      locale: 'en',
      sidebarCollapsed: false,
      mockUserName: 'Sarah Al-Qahtani',
      mockRole: 'admin',
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
      setLocale: (locale) => set({ locale }),
      toggleTheme: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setMockRole: (mockRole) => set({ mockRole }),
    }),
    {
      name: 'hrms:app',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark')
        }
      },
    }
  )
)
