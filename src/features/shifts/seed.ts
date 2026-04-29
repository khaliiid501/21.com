import { nowIso } from '@/lib/id'
import type { Shift, ShiftAssignment } from './types'

export function shiftsSeed(): Shift[] {
  const now = nowIso()
  return [
    {
      id: 'shift-morning',
      name: { en: 'Morning Shift', ar: 'الفترة الصباحية' },
      startTime: '08:00',
      endTime: '17:00',
      breakMinutes: 60,
      daysOfWeek: [0, 1, 2, 3, 4],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'shift-evening',
      name: { en: 'Evening Shift', ar: 'الفترة المسائية' },
      startTime: '14:00',
      endTime: '23:00',
      breakMinutes: 60,
      daysOfWeek: [0, 1, 2, 3, 4],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'shift-night',
      name: { en: 'Night Shift', ar: 'الفترة الليلية' },
      startTime: '22:00',
      endTime: '06:00',
      breakMinutes: 45,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'shift-weekend',
      name: { en: 'Weekend Shift', ar: 'مناوبة نهاية الأسبوع' },
      startTime: '10:00',
      endTime: '18:00',
      breakMinutes: 60,
      daysOfWeek: [5, 6],
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function shiftAssignmentsSeed(): ShiftAssignment[] {
  const now = nowIso()
  return [
    {
      id: 'sa-001',
      employeeId: 'emp-001',
      shiftId: 'shift-morning',
      fromDate: '2024-01-01',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sa-002',
      employeeId: 'emp-002',
      shiftId: 'shift-morning',
      fromDate: '2024-01-01',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sa-003',
      employeeId: 'emp-006',
      shiftId: 'shift-evening',
      fromDate: '2024-01-01',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sa-004',
      employeeId: 'emp-008',
      shiftId: 'shift-night',
      fromDate: '2024-06-15',
      createdAt: now,
      updatedAt: now,
    },
  ]
}
