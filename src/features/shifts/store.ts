import { createFeatureStore } from '@/lib/persist'
import { shiftsSeed, shiftAssignmentsSeed } from './seed'
import type { Shift, ShiftAssignment } from './types'

export const useShiftStore = createFeatureStore<Shift>('shifts', shiftsSeed)

export const useShiftAssignmentStore = createFeatureStore<ShiftAssignment>(
  'shift-assignments',
  shiftAssignmentsSeed
)
