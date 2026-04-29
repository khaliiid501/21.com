import { createFeatureStore } from '@/lib/persist'
import { performanceSeed } from './seed'
import type { PerformanceReview } from './types'

export const usePerformanceStore = createFeatureStore<PerformanceReview>(
  'performance',
  performanceSeed
)
