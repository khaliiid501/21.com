import type { LocalizedString, ID, ISODate } from '@/types/common'

export type Department = {
  id: ID
  name: LocalizedString
  code: string
  parentDepartmentId?: ID
  managerId?: ID
  description: LocalizedString
  createdAt: ISODate
  updatedAt: ISODate
}
