import { nowIso } from '@/lib/id'
import type { Department } from './types'

export function departmentsSeed(): Department[] {
  const now = nowIso()
  return [
    {
      id: 'dept-eng',
      name: { en: 'Engineering', ar: 'الهندسة' },
      code: 'ENG',
      description: {
        en: 'Software engineering and product development',
        ar: 'هندسة البرمجيات وتطوير المنتجات',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dept-hr',
      name: { en: 'Human Resources', ar: 'الموارد البشرية' },
      code: 'HR',
      description: {
        en: 'People operations and culture',
        ar: 'عمليات الموظفين والثقافة المؤسسية',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dept-fin',
      name: { en: 'Finance', ar: 'المالية' },
      code: 'FIN',
      description: {
        en: 'Accounting, payroll, and financial planning',
        ar: 'المحاسبة والرواتب والتخطيط المالي',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dept-sales',
      name: { en: 'Sales', ar: 'المبيعات' },
      code: 'SLS',
      description: {
        en: 'Customer acquisition and account management',
        ar: 'اكتساب العملاء وإدارة الحسابات',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dept-mkt',
      name: { en: 'Marketing', ar: 'التسويق' },
      code: 'MKT',
      description: {
        en: 'Brand, growth, and communications',
        ar: 'العلامة التجارية والنمو والاتصالات',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dept-ops',
      name: { en: 'Operations', ar: 'العمليات' },
      code: 'OPS',
      description: {
        en: 'Day-to-day business operations',
        ar: 'العمليات التشغيلية اليومية',
      },
      createdAt: now,
      updatedAt: now,
    },
  ]
}
