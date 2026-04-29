import { nowIso } from '@/lib/id'
import type { TrainingCourse, TrainingEnrollment } from './types'

export function coursesSeed(): TrainingCourse[] {
  const now = nowIso()
  return [
    {
      id: 'crs-001',
      title: { en: 'Effective Leadership', ar: 'القيادة الفعالة' },
      description: 'Foundations of modern people leadership.',
      durationHours: 16,
      instructor: 'Dr. Hessa Al-Mansour',
      category: 'Leadership',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'crs-002',
      title: { en: 'Advanced React Patterns', ar: 'أنماط React المتقدمة' },
      description: 'Hooks, suspense, and concurrent UIs.',
      durationHours: 24,
      instructor: 'Yousuf Al-Mutlaq',
      category: 'Engineering',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'crs-003',
      title: { en: 'Workplace Communication', ar: 'التواصل في بيئة العمل' },
      description: 'Improve clarity and empathy at work.',
      durationHours: 8,
      instructor: 'Reem Al-Tamimi',
      category: 'Soft Skills',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'crs-004',
      title: { en: 'Data Privacy & Compliance', ar: 'خصوصية البيانات والامتثال' },
      description: 'GDPR, PDPL, and data handling best practices.',
      durationHours: 6,
      instructor: 'Tariq Al-Jaber',
      category: 'Compliance',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function enrollmentsSeed(): TrainingEnrollment[] {
  const now = nowIso()
  return [
    {
      id: 'enr-001',
      employeeId: 'emp-002',
      courseId: 'crs-001',
      enrolledAt: '2026-02-15',
      status: 'completed',
      score: 92,
      completedAt: '2026-03-20',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'enr-002',
      employeeId: 'emp-003',
      courseId: 'crs-002',
      enrolledAt: '2026-03-01',
      status: 'in-progress',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'enr-003',
      employeeId: 'emp-004',
      courseId: 'crs-002',
      enrolledAt: '2026-03-01',
      status: 'completed',
      score: 88,
      completedAt: '2026-04-10',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'enr-004',
      employeeId: 'emp-005',
      courseId: 'crs-004',
      enrolledAt: '2026-04-05',
      status: 'enrolled',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'enr-005',
      employeeId: 'emp-006',
      courseId: 'crs-003',
      enrolledAt: '2026-02-01',
      status: 'completed',
      score: 95,
      completedAt: '2026-02-12',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'enr-006',
      employeeId: 'emp-008',
      courseId: 'crs-003',
      enrolledAt: '2026-04-12',
      status: 'in-progress',
      createdAt: now,
      updatedAt: now,
    },
  ]
}
