import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import type { Locale } from '@/types/common'

export function formatDate(value: string | Date, locale: Locale = 'en'): string {
  const d = typeof value === 'string' ? parseISO(value) : value
  return format(d, 'PPP', { locale: locale === 'ar' ? ar : enUS })
}

export function formatDateShort(value: string | Date, locale: Locale = 'en'): string {
  const d = typeof value === 'string' ? parseISO(value) : value
  return format(d, 'yyyy-MM-dd', { locale: locale === 'ar' ? ar : enUS })
}

export function formatTime(value: string, locale: Locale = 'en'): string {
  const [h, m] = value.split(':')
  const d = new Date()
  d.setHours(Number(h), Number(m), 0, 0)
  return format(d, 'p', { locale: locale === 'ar' ? ar : enUS })
}

export function daysBetween(from: string, to: string): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from)) + 1
}

export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatMoney(amount: number, currency = 'SAR', locale: Locale = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
