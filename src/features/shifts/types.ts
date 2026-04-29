import type { LocalizedString, ID, ISODate } from '@/types/common'

export type Shift = {
  id: ID
  name: LocalizedString
  startTime: string
  endTime: string
  breakMinutes: number
  daysOfWeek: number[]
  createdAt: ISODate
  updatedAt: ISODate
}

export type ShiftAssignment = {
  id: ID
  employeeId: ID
  shiftId: ID
  fromDate: ISODate
  toDate?: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}
