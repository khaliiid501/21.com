import { createFeatureStore } from '@/lib/persist'
import {
  salariesSeed,
  allowancesSeed,
  deductionsSeed,
  payPeriodsSeed,
  payslipsSeed,
} from './seed'
import type { Salary, Allowance, Deduction, PayPeriod, Payslip } from './types'

export const useSalaryStore = createFeatureStore<Salary>('salaries', salariesSeed)
export const useAllowanceStore = createFeatureStore<Allowance>(
  'allowances',
  allowancesSeed
)
export const useDeductionStore = createFeatureStore<Deduction>(
  'deductions',
  deductionsSeed
)
export const usePayPeriodStore = createFeatureStore<PayPeriod>(
  'pay-periods',
  payPeriodsSeed
)
export const usePayslipStore = createFeatureStore<Payslip>(
  'payslips',
  payslipsSeed
)
