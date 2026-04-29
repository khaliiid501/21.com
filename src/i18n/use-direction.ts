import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useDirection() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const apply = (lng: string) => {
      const isAr = lng.startsWith('ar')
      document.documentElement.dir = isAr ? 'rtl' : 'ltr'
      document.documentElement.lang = isAr ? 'ar' : 'en'
    }
    apply(i18n.language)
    i18n.on('languageChanged', apply)
    return () => {
      i18n.off('languageChanged', apply)
    }
  }, [i18n])
}
