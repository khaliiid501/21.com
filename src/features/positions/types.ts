import type { LocalizedString, ID, ISODate } from '@/types/common'

export type PositionLevel = 'junior' | 'mid' | 'senior' | 'lead'

export type Position = {
  id: ID
  title: LocalizedString
  departmentId: ID
  level: PositionLevel
  description: string
  minSalary: number
  maxSalary: number
  createdAt: ISODate
  updatedAt: ISODate
}
