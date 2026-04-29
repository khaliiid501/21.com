import type { ID, ISODate } from '@/types/common'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave'

export type AttendanceRecord = {
  id: ID
  employeeId: ID
  date: ISODate
  checkIn?: string
  checkOut?: string
  status: AttendanceStatus
  workedHours: number
  overtime: number
  createdAt: ISODate
  updatedAt: ISODate
}
