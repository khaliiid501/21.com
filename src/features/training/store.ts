import { createFeatureStore } from '@/lib/persist'
import { coursesSeed, enrollmentsSeed } from './seed'
import type { TrainingCourse, TrainingEnrollment } from './types'

export const useTrainingCourseStore = createFeatureStore<TrainingCourse>(
  'training-courses',
  coursesSeed
)
export const useTrainingEnrollmentStore = createFeatureStore<TrainingEnrollment>(
  'training-enrollments',
  enrollmentsSeed
)
