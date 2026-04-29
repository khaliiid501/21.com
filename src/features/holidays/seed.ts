import { nowIso } from '@/lib/id'
import type { Holiday } from './types'

export function holidaysSeed(): Holiday[] {
  const now = nowIso()
  return [
    {
      id: 'h-newyear',
      name: { en: 'New Year', ar: 'رأس السنة' },
      date: '2026-01-01',
      isRecurring: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-foundation',
      name: { en: 'Founding Day', ar: 'يوم التأسيس' },
      date: '2026-02-22',
      isRecurring: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-eidfitr',
      name: { en: 'Eid Al-Fitr', ar: 'عيد الفطر' },
      date: '2026-03-20',
      isRecurring: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-eidadha',
      name: { en: 'Eid Al-Adha', ar: 'عيد الأضحى' },
      date: '2026-05-26',
      isRecurring: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-national',
      name: { en: 'Saudi National Day', ar: 'اليوم الوطني السعودي' },
      date: '2026-09-23',
      isRecurring: true,
      createdAt: now,
      updatedAt: now,
    },
  ]
}
