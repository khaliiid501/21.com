import { nowIso } from '@/lib/id'
import type { Salary, Allowance, Deduction, PayPeriod, Payslip } from './types'

const employees = [
  { id: 'emp-001', salary: 14000 },
  { id: 'emp-002', salary: 35000 },
  { id: 'emp-003', salary: 22000 },
  { id: 'emp-004', salary: 17500 },
  { id: 'emp-005', salary: 11500 },
  { id: 'emp-006', salary: 21000 },
  { id: 'emp-007', salary: 9000 },
  { id: 'emp-008', salary: 10000 },
  { id: 'emp-009', salary: 16000 },
  { id: 'emp-010', salary: 5000 },
]

export function salariesSeed(): Salary[] {
  const now = nowIso()
  return employees.map((e) => ({
    id: `sal-${e.id}`,
    employeeId: e.id,
    baseSalary: e.salary,
    currency: 'SAR',
    effectiveFrom: '2026-01-01',
    createdAt: now,
    updatedAt: now,
  }))
}

export function allowancesSeed(): Allowance[] {
  const now = nowIso()
  return employees.flatMap((e) => [
    {
      id: `allow-h-${e.id}`,
      employeeId: e.id,
      type: 'housing' as const,
      amount: Math.round(e.salary * 0.25),
      isRecurring: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `allow-t-${e.id}`,
      employeeId: e.id,
      type: 'transport' as const,
      amount: 800,
      isRecurring: true,
      createdAt: now,
      updatedAt: now,
    },
  ])
}

export function deductionsSeed(): Deduction[] {
  const now = nowIso()
  return employees.flatMap((e) => [
    {
      id: `ded-i-${e.id}`,
      employeeId: e.id,
      type: 'insurance' as const,
      amount: Math.round(e.salary * 0.0975),
      isRecurring: true,
      createdAt: now,
      updatedAt: now,
    },
  ])
}

export function payPeriodsSeed(): PayPeriod[] {
  const now = nowIso()
  return [
    {
      id: 'pp-2026-02',
      year: 2026,
      month: 2,
      status: 'paid',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pp-2026-03',
      year: 2026,
      month: 3,
      status: 'paid',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pp-2026-04',
      year: 2026,
      month: 4,
      status: 'finalized',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function payslipsSeed(): Payslip[] {
  const now = nowIso()
  const slips: Payslip[] = []
  const periods = ['pp-2026-02', 'pp-2026-03']
  periods.forEach((periodId) => {
    employees.forEach((e) => {
      const totalAllowances = Math.round(e.salary * 0.25) + 800
      const totalDeductions = Math.round(e.salary * 0.0975)
      const gross = e.salary + totalAllowances
      slips.push({
        id: `ps-${periodId}-${e.id}`,
        employeeId: e.id,
        payPeriodId: periodId,
        gross,
        totalAllowances,
        totalDeductions,
        netSalary: gross - totalDeductions,
        generatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
    })
  })
  return slips
}
