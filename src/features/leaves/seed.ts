import { nowIso } from '@/lib/id'
import type { LeaveType, LeaveRequest, LeaveBalance } from './types'

export function leaveTypesSeed(): LeaveType[] {
  const now = nowIso()
  return [
    {
      id: 'lt-annual',
      name: { en: 'Annual Leave', ar: 'إجازة سنوية' },
      defaultDays: 21,
      isPaid: true,
      color: '#10b981',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lt-sick',
      name: { en: 'Sick Leave', ar: 'إجازة مرضية' },
      defaultDays: 14,
      isPaid: true,
      color: '#f59e0b',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lt-maternity',
      name: { en: 'Maternity Leave', ar: 'إجازة أمومة' },
      defaultDays: 70,
      isPaid: true,
      color: '#ec4899',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lt-unpaid',
      name: { en: 'Unpaid Leave', ar: 'إجازة بدون راتب' },
      defaultDays: 30,
      isPaid: false,
      color: '#6b7280',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lt-emergency',
      name: { en: 'Emergency Leave', ar: 'إجازة طارئة' },
      defaultDays: 5,
      isPaid: true,
      color: '#ef4444',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function leaveRequestsSeed(): LeaveRequest[] {
  const now = nowIso()
  return [
    {
      id: 'lr-001',
      employeeId: 'emp-007',
      leaveTypeId: 'lt-maternity',
      fromDate: '2026-04-01',
      toDate: '2026-06-09',
      days: 70,
      reason: 'Maternity leave',
      status: 'approved',
      approvedBy: 'emp-001',
      approvedAt: '2026-03-15T10:00:00Z',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lr-002',
      employeeId: 'emp-003',
      leaveTypeId: 'lt-annual',
      fromDate: '2026-05-15',
      toDate: '2026-05-22',
      days: 8,
      reason: 'Family vacation',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lr-003',
      employeeId: 'emp-004',
      leaveTypeId: 'lt-sick',
      fromDate: '2026-04-20',
      toDate: '2026-04-22',
      days: 3,
      reason: 'Flu recovery',
      status: 'approved',
      approvedBy: 'emp-002',
      approvedAt: '2026-04-20T08:00:00Z',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lr-004',
      employeeId: 'emp-008',
      leaveTypeId: 'lt-emergency',
      fromDate: '2026-04-25',
      toDate: '2026-04-26',
      days: 2,
      reason: 'Family emergency',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lr-005',
      employeeId: 'emp-005',
      leaveTypeId: 'lt-annual',
      fromDate: '2026-03-01',
      toDate: '2026-03-07',
      days: 7,
      reason: 'Eid holiday extension',
      status: 'rejected',
      approvedBy: 'emp-001',
      approvedAt: '2026-02-25T14:00:00Z',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function leaveBalancesSeed(): LeaveBalance[] {
  const now = nowIso()
  const employees = [
    'emp-001',
    'emp-002',
    'emp-003',
    'emp-004',
    'emp-005',
    'emp-006',
    'emp-007',
    'emp-008',
    'emp-009',
    'emp-010',
  ]
  const types = [
    { id: 'lt-annual', entitled: 21 },
    { id: 'lt-sick', entitled: 14 },
    { id: 'lt-emergency', entitled: 5 },
  ]
  const balances: LeaveBalance[] = []
  employees.forEach((emp, i) => {
    types.forEach((t) => {
      balances.push({
        id: `bal-${emp}-${t.id}`,
        employeeId: emp,
        leaveTypeId: t.id,
        year: 2026,
        entitled: t.entitled,
        used: (i + (t.id === 'lt-annual' ? 5 : 1)) % t.entitled,
        createdAt: now,
        updatedAt: now,
      })
    })
  })
  return balances
}
