import { createFeatureStore } from '@/lib/persist'
import { employeesSeed } from './seed'
import type { Employee } from './types'

export const useEmployeeStore = createFeatureStore<Employee>('employees', employeesSeed)
