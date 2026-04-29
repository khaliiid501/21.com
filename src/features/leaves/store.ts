import { createFeatureStore } from '@/lib/persist'
import { leaveTypesSeed, leaveRequestsSeed, leaveBalancesSeed } from './seed'
import type { LeaveType, LeaveRequest, LeaveBalance } from './types'

export const useLeaveTypeStore = createFeatureStore<LeaveType>(
  'leave-types',
  leaveTypesSeed
)

export const useLeaveRequestStore = createFeatureStore<LeaveRequest>(
  'leave-requests',
  leaveRequestsSeed
)

export const useLeaveBalanceStore = createFeatureStore<LeaveBalance>(
  'leave-balances',
  leaveBalancesSeed
)
