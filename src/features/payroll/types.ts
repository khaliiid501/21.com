import type { ID, ISODate } from '@/types/common'

export type AllowanceType = 'housing' | 'transport' | 'other'
export type DeductionType = 'tax' | 'insurance' | 'loan' | 'other'
export type PayPeriodStatus = 'draft' | 'finalized' | 'paid'

export type Salary = {
  id: ID
  employeeId: ID
  baseSalary: number
  currency: string
  effectiveFrom: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}

export type Allowance = {
  id: ID
  employeeId: ID
  type: AllowanceType
  amount: number
  isRecurring: boolean
  createdAt: ISODate
  updatedAt: ISODate
}

export type Deduction = {
  id: ID
  employeeId: ID
  type: DeductionType
  amount: number
  isRecurring: boolean
  createdAt: ISODate
  updatedAt: ISODate
}

export type PayPeriod = {
  id: ID
  year: number
  month: number
  status: PayPeriodStatus
  startDate: ISODate
  endDate: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}

export type Payslip = {
  id: ID
  employeeId: ID
  payPeriodId: ID
  gross: number
  netSalary: number
  totalAllowances: number
  totalDeductions: number
  generatedAt: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}
