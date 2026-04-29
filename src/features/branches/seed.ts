import { nowIso } from '@/lib/id'
import type { Branch } from './types'

export function branchesSeed(): Branch[] {
  const now = nowIso()
  return [
    {
      id: 'br-riyadh',
      name: { en: 'Riyadh HQ', ar: 'المقر الرئيسي - الرياض' },
      address: '2245 Olaya Street',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      phone: '+966 11 234 5678',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'br-jeddah',
      name: { en: 'Jeddah Branch', ar: 'فرع جدة' },
      address: '4521 King Road',
      city: 'Jeddah',
      country: 'Saudi Arabia',
      phone: '+966 12 345 6789',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'br-dxb',
      name: { en: 'Dubai Office', ar: 'مكتب دبي' },
      address: 'Sheikh Zayed Road',
      city: 'Dubai',
      country: 'United Arab Emirates',
      phone: '+971 4 123 4567',
      createdAt: now,
      updatedAt: now,
    },
  ]
}
