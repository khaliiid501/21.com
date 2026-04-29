import { createFeatureStore } from '@/lib/persist'
import { branchesSeed } from './seed'
import type { Branch } from './types'

export const useBranchStore = createFeatureStore<Branch>('branches', branchesSeed)
