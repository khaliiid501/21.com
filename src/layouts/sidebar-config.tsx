import {
  LayoutDashboardIcon,
  UsersIcon,
  Building2Icon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarCheckIcon,
  PlaneIcon,
  ScaleIcon,
  ClockIcon,
  PartyPopperIcon,
  CalendarDaysIcon,
  ReceiptIcon,
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UserPlusIcon,
  UsersRoundIcon,
  CalendarIcon,
  StarIcon,
  GraduationCapIcon,
  BookOpenIcon,
  SettingsIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavLink = {
  to: string
  labelKey: string
  icon: LucideIcon
  end?: boolean
}

export type NavGroup = {
  groupKey?: string
  links: NavLink[]
}

export const navGroups: NavGroup[] = [
  {
    links: [
      { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboardIcon, end: true },
    ],
  },
  {
    groupKey: 'groups.core',
    links: [
      { to: '/employees', labelKey: 'nav.employees', icon: UsersIcon },
      { to: '/departments', labelKey: 'nav.departments', icon: Building2Icon },
      { to: '/positions', labelKey: 'nav.positions', icon: BriefcaseIcon },
      { to: '/branches', labelKey: 'nav.branches', icon: MapPinIcon },
    ],
  },
  {
    groupKey: 'groups.time',
    links: [
      { to: '/attendance', labelKey: 'nav.attendance', icon: CalendarCheckIcon },
      { to: '/leaves/requests', labelKey: 'nav.leaveRequests', icon: PlaneIcon },
      { to: '/leaves/balances', labelKey: 'nav.leaveBalances', icon: ScaleIcon },
      { to: '/leaves/types', labelKey: 'nav.leaveTypes', icon: PlaneIcon },
      { to: '/shifts', labelKey: 'nav.shifts', icon: ClockIcon },
      { to: '/holidays', labelKey: 'nav.holidays', icon: PartyPopperIcon },
    ],
  },
  {
    groupKey: 'groups.payroll',
    links: [
      { to: '/payroll/periods', labelKey: 'nav.payPeriods', icon: CalendarDaysIcon },
      { to: '/payroll/payslips', labelKey: 'nav.payslips', icon: ReceiptIcon },
      { to: '/payroll/salaries', labelKey: 'nav.salaries', icon: WalletIcon },
      { to: '/payroll/allowances', labelKey: 'nav.allowances', icon: TrendingUpIcon },
      { to: '/payroll/deductions', labelKey: 'nav.deductions', icon: TrendingDownIcon },
    ],
  },
  {
    groupKey: 'groups.talent',
    links: [
      { to: '/recruitment/openings', labelKey: 'nav.openings', icon: UserPlusIcon },
      { to: '/recruitment/candidates', labelKey: 'nav.candidates', icon: UsersRoundIcon },
      { to: '/recruitment/interviews', labelKey: 'nav.interviews', icon: CalendarIcon },
      { to: '/performance', labelKey: 'nav.performance', icon: StarIcon },
      { to: '/training/courses', labelKey: 'nav.courses', icon: GraduationCapIcon },
      { to: '/training/enrollments', labelKey: 'nav.enrollments', icon: BookOpenIcon },
    ],
  },
  {
    links: [{ to: '/settings', labelKey: 'nav.settings', icon: SettingsIcon }],
  },
]
