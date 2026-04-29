import { useTranslation } from 'react-i18next'
import { MoonIcon, SunIcon, LanguagesIcon, MenuIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store/app-store'

export function Topbar() {
  const { t, i18n } = useTranslation('common')
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const setLocale = useAppStore((s) => s.setLocale)
  const mockUserName = useAppStore((s) => s.mockUserName)
  const mockRole = useAppStore((s) => s.mockRole)

  const switchLanguage = (lng: 'en' | 'ar') => {
    void i18n.changeLanguage(lng)
    setLocale(lng)
  }

  const initials = mockUserName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  return (
    <header className="bg-background flex h-14 items-center justify-between gap-3 border-b px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('language')}>
              <LanguagesIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => switchLanguage('en')}>
              {t('english')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => switchLanguage('ar')}>
              {t('arabic')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={t('theme')}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 ps-1">
              <Avatar className="size-7">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-start sm:flex sm:flex-col">
                <span className="text-xs leading-none font-medium">
                  {mockUserName}
                </span>
                <span className="text-muted-foreground text-[10px] leading-none mt-1 capitalize">
                  {mockRole}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{mockUserName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>{t('settings')}</DropdownMenuItem>
            <DropdownMenuItem disabled>{t('logout')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
