import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/layouts/app-layout'
import { DashboardPage } from '@/features/dashboard/pages'
import { EmployeesPage } from '@/features/employees/pages/list'
import { DepartmentsPage } from '@/features/departments/pages/list'
import { PositionsPage } from '@/features/positions/pages/list'
import { BranchesPage } from '@/features/branches/pages/list'
import { AttendancePage } from '@/features/attendance/pages'
import { LeaveRequestsPage } from '@/features/leaves/pages/requests'
import { LeaveBalancesPage } from '@/features/leaves/pages/balances'
import { LeaveTypesPage } from '@/features/leaves/pages/types'
import { ShiftsPage } from '@/features/shifts/pages'
import { HolidaysPage } from '@/features/holidays/pages'
import { PayPeriodsPage } from '@/features/payroll/pages/periods'
import { PayslipsPage } from '@/features/payroll/pages/payslips'
import { SalariesPage } from '@/features/payroll/pages/salaries'
import { AllowancesPage } from '@/features/payroll/pages/allowances'
import { DeductionsPage } from '@/features/payroll/pages/deductions'
import { OpeningsPage } from '@/features/recruitment/pages/openings'
import { CandidatesPage } from '@/features/recruitment/pages/candidates'
import { InterviewsPage } from '@/features/recruitment/pages/interviews'
import { PerformancePage } from '@/features/performance/pages'
import { TrainingCoursesPage } from '@/features/training/pages/courses'
import { TrainingEnrollmentsPage } from '@/features/training/pages/enrollments'
import { SettingsPage } from '@/features/settings/pages'
import { NotFoundPage } from '@/pages/not-found'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'employees', Component: EmployeesPage },
      { path: 'departments', Component: DepartmentsPage },
      { path: 'positions', Component: PositionsPage },
      { path: 'branches', Component: BranchesPage },
      { path: 'attendance', Component: AttendancePage },
      { path: 'leaves', element: <Navigate to="/leaves/requests" replace /> },
      { path: 'leaves/requests', Component: LeaveRequestsPage },
      { path: 'leaves/balances', Component: LeaveBalancesPage },
      { path: 'leaves/types', Component: LeaveTypesPage },
      { path: 'shifts', Component: ShiftsPage },
      { path: 'holidays', Component: HolidaysPage },
      { path: 'payroll', element: <Navigate to="/payroll/periods" replace /> },
      { path: 'payroll/periods', Component: PayPeriodsPage },
      { path: 'payroll/payslips', Component: PayslipsPage },
      { path: 'payroll/salaries', Component: SalariesPage },
      { path: 'payroll/allowances', Component: AllowancesPage },
      { path: 'payroll/deductions', Component: DeductionsPage },
      { path: 'recruitment', element: <Navigate to="/recruitment/openings" replace /> },
      { path: 'recruitment/openings', Component: OpeningsPage },
      { path: 'recruitment/candidates', Component: CandidatesPage },
      { path: 'recruitment/interviews', Component: InterviewsPage },
      { path: 'performance', Component: PerformancePage },
      { path: 'training', element: <Navigate to="/training/courses" replace /> },
      { path: 'training/courses', Component: TrainingCoursesPage },
      { path: 'training/enrollments', Component: TrainingEnrollmentsPage },
      { path: 'settings', Component: SettingsPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
