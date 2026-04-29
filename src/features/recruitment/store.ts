import { createFeatureStore } from '@/lib/persist'
import { openingsSeed, candidatesSeed, interviewsSeed } from './seed'
import type { JobOpening, Candidate, Interview } from './types'

export const useJobOpeningStore = createFeatureStore<JobOpening>(
  'job-openings',
  openingsSeed
)
export const useCandidateStore = createFeatureStore<Candidate>(
  'candidates',
  candidatesSeed
)
export const useInterviewStore = createFeatureStore<Interview>(
  'interviews',
  interviewsSeed
)
