import type { LocalizedString, ID, ISODate } from '@/types/common'

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern'
export type EmployeeStatus = 'active' | 'on-leave' | 'terminated'
export type Gender = 'male' | 'female'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

export type Employee = {
  id: ID
  employeeNumber: string
  firstName: LocalizedString
  lastName: LocalizedString
  email: string
  phone: string
  departmentId: ID
  positionId: ID
  managerId?: ID
  branchId: ID
  hireDate: ISODate
  employmentType: EmploymentType
  status: EmployeeStatus
  nationalId: string
  dateOfBirth: ISODate
  gender: Gender
  maritalStatus: MaritalStatus
  address: string
  salary: number
  avatarUrl?: string
  createdAt: ISODate
  updatedAt: ISODate
}
