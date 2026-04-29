import type { LocalizedString, ID, ISODate } from '@/types/common'

export type Branch = {
  id: ID
  name: LocalizedString
  address: string
  city: string
  country: string
  phone?: string
  createdAt: ISODate
  updatedAt: ISODate
}
