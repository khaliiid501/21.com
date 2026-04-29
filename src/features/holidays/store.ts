import { createFeatureStore } from '@/lib/persist'
import { holidaysSeed } from './seed'
import type { Holiday } from './types'

export const useHolidayStore = createFeatureStore<Holiday>('holidays', holidaysSeed)
