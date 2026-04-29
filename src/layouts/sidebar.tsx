import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BuildingIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { navGroups } from './sidebar-config'

export function Sidebar() {
  const { t } = useTranslation('common')

  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 flex-col border-e md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-md">
          <BuildingIcon className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none">
            {t('appNameShort')}
          </span>
          <span className="text-muted-foreground text-xs leading-none mt-1">
            {t('appName')}
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-4 p-3">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              {group.groupKey && (
                <div className="text-muted-foreground px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wider">
                  {t(group.groupKey)}
                </div>
              )}
              {group.links.map((link) => {
                const Icon = link.icon
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      )
                    }
                  >
                    <Icon className="size-4" />
                    <span>{t(link.labelKey)}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
