import { format, subDays } from 'date-fns'
import { newId, nowIso } from '@/lib/id'
import type { AttendanceRecord, AttendanceStatus } from './types'

const employeeIds = [
  'emp-001',
  'emp-002',
  'emp-003',
  'emp-004',
  'emp-005',
  'emp-006',
  'emp-008',
  'emp-009',
  'emp-010',
]

function pickStatus(seed: number): AttendanceStatus {
  const m = seed % 10
  if (m === 0) return 'absent'
  if (m === 1 || m === 2) return 'late'
  if (m === 3) return 'leave'
  return 'present'
}

export function attendanceSeed(): AttendanceRecord[] {
  const now = nowIso()
  const records: AttendanceRecord[] = []
  for (let d = 0; d < 30; d++) {
    const day = format(subDays(new Date(), d), 'yyyy-MM-dd')
    employeeIds.forEach((empId, idx) => {
      const status = pickStatus(d * 7 + idx)
      const record: AttendanceRecord = {
        id: newId(),
        employeeId: empId,
        date: day,
        status,
        workedHours:
          status === 'present' ? 8 : status === 'late' ? 7 : 0,
        overtime: status === 'present' && idx % 5 === 0 ? 2 : 0,
        checkIn:
          status === 'present'
            ? '08:30'
            : status === 'late'
              ? '09:45'
              : undefined,
        checkOut:
          status === 'present' || status === 'late' ? '17:30' : undefined,
        createdAt: now,
        updatedAt: now,
      }
      records.push(record)
    })
  }
  return records
}
