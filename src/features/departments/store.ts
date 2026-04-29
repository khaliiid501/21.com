import { createFeatureStore } from '@/lib/persist'
import { departmentsSeed } from './seed'
import type { Department } from './types'

export const useDepartmentStore = createFeatureStore<Department>(
  'departments',
  departmentsSeed
)
