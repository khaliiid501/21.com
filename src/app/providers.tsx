import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { router } from '@/app/router'
import { Toaster } from '@/components/ui/sonner'
import { useAppStore } from '@/store/app-store'

import '@/i18n'

export function Providers() {
  const theme = useAppStore((s) => s.theme)
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [i18n, locale])

  useEffect(() => {
    const handler = (lng: string) => {
      const next = lng.startsWith('ar') ? 'ar' : 'en'
      if (next !== locale) setLocale(next)
    }
    i18n.on('languageChanged', handler)
    return () => {
      i18n.off('languageChanged', handler)
    }
  }, [i18n, locale, setLocale])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
