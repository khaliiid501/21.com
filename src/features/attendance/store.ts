import { createFeatureStore } from '@/lib/persist'
import { attendanceSeed } from './seed'
import type { AttendanceRecord } from './types'

export const useAttendanceStore = createFeatureStore<AttendanceRecord>(
  'attendance',
  attendanceSeed
)
