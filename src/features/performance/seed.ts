import { nowIso } from '@/lib/id'
import type { PerformanceReview } from './types'

export function performanceSeed(): PerformanceReview[] {
  const now = nowIso()
  return [
    {
      id: 'pr-001',
      employeeId: 'emp-003',
      reviewerId: 'emp-002',
      period: '2025-H2',
      rating: 5,
      strengths: 'Excellent technical execution; strong mentorship of juniors.',
      improvements: 'Could lead more cross-team initiatives.',
      goals: 'Drive design system adoption across product squads.',
      status: 'finalized',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pr-002',
      employeeId: 'emp-004',
      reviewerId: 'emp-002',
      period: '2025-H2',
      rating: 4,
      strengths: 'Reliable delivery and great code reviews.',
      improvements: 'Public speaking and presenting work.',
      goals: 'Lead a backend architecture review.',
      status: 'finalized',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pr-003',
      employeeId: 'emp-005',
      reviewerId: 'emp-001',
      period: '2026-H1',
      rating: 4,
      strengths: 'Diligent and detail-oriented in financial reporting.',
      improvements: 'Automate recurring reconciliations.',
      goals: 'Implement a quarterly close checklist.',
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pr-004',
      employeeId: 'emp-006',
      reviewerId: 'emp-001',
      period: '2026-H1',
      rating: 5,
      strengths: 'Surpassed sales targets two quarters in a row.',
      improvements: 'Improve CRM hygiene.',
      goals: 'Hit 120% of annual quota.',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
  ]
}
