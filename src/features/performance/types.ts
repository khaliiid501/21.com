import type { ID, ISODate } from '@/types/common'

export type ReviewStatus = 'draft' | 'submitted' | 'finalized'

export type PerformanceReview = {
  id: ID
  employeeId: ID
  reviewerId: ID
  period: string
  rating: number
  strengths: string
  improvements: string
  goals: string
  status: ReviewStatus
  createdAt: ISODate
  updatedAt: ISODate
}
