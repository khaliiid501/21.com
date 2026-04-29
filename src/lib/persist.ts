import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { newId, nowIso } from '@/lib/id'
import type { ID, ISODate } from '@/types/common'

export type Entity = {
  id: ID
  createdAt: ISODate
  updatedAt: ISODate
}

export type FeatureStore<T extends Entity> = {
  items: T[]
  list: () => T[]
  getById: (id: ID) => T | undefined
  add: (input: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => T
  update: (id: ID, patch: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>) => void
  remove: (id: ID) => void
  reset: () => void
  hydrate: (items: T[]) => void
}

export function createFeatureStore<T extends Entity>(name: string, seed: () => T[]) {
  return create<FeatureStore<T>>()(
    persist(
      (set, get) => ({
        items: [],
        list: () => get().items,
        getById: (id) => get().items.find((i) => i.id === id),
        add: (input) => {
          const created: T = {
            ...(input as unknown as T),
            id: newId(),
            createdAt: nowIso(),
            updatedAt: nowIso(),
          }
          set((s) => ({ items: [created, ...s.items] }))
          return created
        },
        update: (id, patch) => {
          set((s) => ({
            items: s.items.map((i) =>
              i.id === id ? { ...i, ...patch, updatedAt: nowIso() } : i
            ),
          }))
        },
        remove: (id) => {
          set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
        },
        reset: () => set({ items: seed() }),
        hydrate: (items) => set({ items }),
      }),
      {
        name: `hrms:${name}`,
        version: 1,
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          if (state && state.items.length === 0) {
            state.hydrate(seed())
          }
        },
      }
    )
  )
}
