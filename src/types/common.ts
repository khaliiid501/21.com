export type ID = string

export type ISODate = string

export type LocalizedString = {
  en: string
  ar: string
}

export type Money = {
  amount: number
  currency: string
}

export type Locale = 'en' | 'ar'

export type Theme = 'light' | 'dark'

export type Role = 'admin' | 'hr' | 'manager' | 'employee'

export type WithMeta<T> = T & {
  id: ID
  createdAt: ISODate
  updatedAt: ISODate
}
