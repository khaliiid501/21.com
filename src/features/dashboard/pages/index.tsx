import { useTranslation } from 'react-i18next'
import {
  UsersIcon,
  PlaneIcon,
  CalendarCheckIcon,
  UserPlusIcon,
  WalletIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { format, subDays, parseISO } from 'date-fns'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '../components/kpi-card'
import { useEmployeeStore } from '@/features/employees/store'
import { useDepartmentStore } from '@/features/departments/store'
import { useLeaveRequestStore } from '@/features/leaves/store'
import { useLeaveTypeStore } from '@/features/leaves/store'
import { useAttendanceStore } from '@/features/attendance/store'
import { useJobOpeningStore } from '@/features/recruitment/store'
import { useCandidateStore } from '@/features/recruitment/store'
import { usePayslipStore } from '@/features/payroll/store'
import { useLocalizedField } from '@/lib/localized'
import { formatMoney, todayIso } from '@/lib/date'
import { useAppStore } from '@/store/app-store'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common'])
  const localized = useLocalizedField()
  const locale = useAppStore((s) => s.locale)

  const employees = useEmployeeStore((s) => s.items)
  const departments = useDepartmentStore((s) => s.items)
  const leaveRequests = useLeaveRequestStore((s) => s.items)
  const leaveTypes = useLeaveTypeStore((s) => s.items)
  const attendance = useAttendanceStore((s) => s.items)
  const openings = useJobOpeningStore((s) => s.items)
  const candidates = useCandidateStore((s) => s.items)
  const payslips = usePayslipStore((s) => s.items)

  const today = todayIso()
  const onLeaveToday = leaveRequests.filter(
    (r) => r.status === 'approved' && r.fromDate <= today && r.toDate >= today
  ).length

  const todays = attendance.filter((a) => a.date === today)
  const presentToday = todays.filter(
    (a) => a.status === 'present' || a.status === 'late'
  ).length
  const attendanceRate =
    todays.length === 0
      ? 0
      : Math.round((presentToday / todays.length) * 100)

  const openCount = openings.filter((o) => o.status === 'open').length

  const latestPeriodId = [...payslips]
    .sort((a, b) => b.payPeriodId.localeCompare(a.payPeriodId))[0]?.payPeriodId
  const monthlyPayroll = latestPeriodId
    ? payslips
        .filter((p) => p.payPeriodId === latestPeriodId)
        .reduce((sum, p) => sum + p.netSalary, 0)
    : 0

  const headcountByDept = departments.map((d) => ({
    name: localized(d.name),
    count: employees.filter((e) => e.departmentId === d.id).length,
  }))

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const day = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
    const records = attendance.filter((a) => a.date === day)
    const present = records.filter(
      (r) => r.status === 'present' || r.status === 'late'
    ).length
    return {
      day: format(parseISO(day), 'MMM d'),
      present,
      absent: records.filter((r) => r.status === 'absent').length,
    }
  })

  const leaveBreakdown = leaveTypes
    .map((lt) => ({
      name: localized(lt.name),
      value: leaveRequests.filter(
        (r) => r.leaveTypeId === lt.id && r.status !== 'cancelled'
      ).length,
      color: lt.color,
    }))
    .filter((entry) => entry.value > 0)

  const stages: Array<'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'> = [
    'applied',
    'screening',
    'interview',
    'offer',
    'hired',
    'rejected',
  ]
  const funnel = stages.map((s) => ({
    stage: t(`stages.${s}`),
    count: candidates.filter((c) => c.stage === s).length,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label={t('kpi.totalEmployees')}
          value={employees.length}
          icon={UsersIcon}
        />
        <KpiCard
          label={t('kpi.onLeaveToday')}
          value={onLeaveToday}
          icon={PlaneIcon}
        />
        <KpiCard
          label={t('kpi.attendanceRate')}
          value={`${attendanceRate}%`}
          icon={CalendarCheckIcon}
        />
        <KpiCard
          label={t('kpi.openPositions')}
          value={openCount}
          icon={UserPlusIcon}
        />
        <KpiCard
          label={t('kpi.monthlyPayroll')}
          value={formatMoney(monthlyPayroll, 'SAR', locale)}
          icon={WalletIcon}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.headcountByDepartment')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={headcountByDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-popover)',
                    color: 'var(--color-popover-foreground)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('charts.attendanceTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  interval={4}
                />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-popover)',
                    color: 'var(--color-popover-foreground)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  name={t('attendance.present')}
                  dataKey="present"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  name={t('attendance.absent')}
                  dataKey="absent"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('charts.leaveBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={leaveBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {leaveBreakdown.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color || CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-popover)',
                    color: 'var(--color-popover-foreground)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('charts.recruitmentFunnel')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-popover)',
                    color: 'var(--color-popover-foreground)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
