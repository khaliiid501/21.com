import { useTranslation } from 'react-i18next'
import type { LocalizedString } from '@/types/common'

export function useLocalizedField() {
  const { i18n } = useTranslation()
  return (field: LocalizedString | undefined): string => {
    if (!field) return ''
    return i18n.language === 'ar' ? field.ar || field.en : field.en || field.ar
  }
}

export function pickLocalized(field: LocalizedString | undefined, locale: 'en' | 'ar'): string {
  if (!field) return ''
  return locale === 'ar' ? field.ar || field.en : field.en || field.ar
}
