import type { LocalizedString, ID, ISODate } from '@/types/common'

export type Holiday = {
  id: ID
  name: LocalizedString
  date: ISODate
  isRecurring: boolean
  createdAt: ISODate
  updatedAt: ISODate
}
