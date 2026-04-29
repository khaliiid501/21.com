import type { LocalizedString, ID, ISODate } from '@/types/common'

export type EnrollmentStatus = 'enrolled' | 'in-progress' | 'completed'

export type TrainingCourse = {
  id: ID
  title: LocalizedString
  description: string
  durationHours: number
  instructor: string
  category: string
  createdAt: ISODate
  updatedAt: ISODate
}

export type TrainingEnrollment = {
  id: ID
  employeeId: ID
  courseId: ID
  enrolledAt: ISODate
  status: EnrollmentStatus
  score?: number
  completedAt?: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}
