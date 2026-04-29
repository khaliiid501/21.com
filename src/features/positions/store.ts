import { createFeatureStore } from '@/lib/persist'
import { positionsSeed } from './seed'
import type { Position } from './types'

export const usePositionStore = createFeatureStore<Position>('positions', positionsSeed)
