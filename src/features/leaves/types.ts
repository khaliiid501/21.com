import type { LocalizedString, ID, ISODate } from '@/types/common'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type LeaveType = {
  id: ID
  name: LocalizedString
  defaultDays: number
  isPaid: boolean
  color: string
  createdAt: ISODate
  updatedAt: ISODate
}

export type LeaveRequest = {
  id: ID
  employeeId: ID
  leaveTypeId: ID
  fromDate: ISODate
  toDate: ISODate
  days: number
  reason: string
  status: LeaveStatus
  approvedBy?: ID
  approvedAt?: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}

export type LeaveBalance = {
  id: ID
  employeeId: ID
  leaveTypeId: ID
  year: number
  entitled: number
  used: number
  createdAt: ISODate
  updatedAt: ISODate
}
