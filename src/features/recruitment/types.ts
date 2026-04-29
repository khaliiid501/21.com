import type { LocalizedString, ID, ISODate } from '@/types/common'

export type OpeningStatus = 'open' | 'closed'
export type CandidateStage =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
export type InterviewType = 'phone' | 'video' | 'onsite'
export type InterviewResult = 'pass' | 'fail' | 'pending'

export type JobOpening = {
  id: ID
  title: LocalizedString
  departmentId: ID
  positionId: ID
  description: string
  requirements: string
  status: OpeningStatus
  postedAt: ISODate
  closedAt?: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}

export type Candidate = {
  id: ID
  firstName: string
  lastName: string
  email: string
  phone: string
  jobOpeningId: ID
  stage: CandidateStage
  resumeUrl?: string
  appliedAt: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}

export type Interview = {
  id: ID
  candidateId: ID
  interviewerId: ID
  scheduledAt: ISODate
  type: InterviewType
  result?: InterviewResult
  notes: string
  createdAt: ISODate
  updatedAt: ISODate
}
