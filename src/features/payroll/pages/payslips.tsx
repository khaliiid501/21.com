import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'

import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  usePayslipStore,
  usePayPeriodStore,
} from '@/features/payroll/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { formatMoney } from '@/lib/date'
import { useAppStore } from '@/store/app-store'
import type { Payslip } from '../types'

export function PayslipsPage() {
  const { t } = useTranslation(['payroll', 'common'])
  const localized = useLocalizedField()
  const locale = useAppStore((s) => s.locale)
  const slips = usePayslipStore((s) => s.items)
  const periods = usePayPeriodStore((s) => s.items)
  const employees = useEmployeeStore((s) => s.items)

  const sortedPeriods = useMemo(
    () =>
      [...periods].sort(
        (a, b) =>
          b.year - a.year || b.month - a.month
      ),
    [periods]
  )

  const [periodId, setPeriodId] = useState<string>(
    sortedPeriods[0]?.id ?? ''
  )

  const filtered = useMemo(
    () => slips.filter((s) => !periodId || s.payPeriodId === periodId),
    [slips, periodId]
  )

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, s) => ({
        gross: acc.gross + s.gross,
        net: acc.net + s.netSalary,
        allowances: acc.allowances + s.totalAllowances,
        deductions: acc.deductions + s.totalDeductions,
      }),
      { gross: 0, net: 0, allowances: 0, deductions: 0 }
    )
  }, [filtered])

  const columns = useMemo<ColumnDef<Payslip>[]>(() => {
    return [
      {
        id: 'employee',
        header: t('common:nav.employees'),
        accessorFn: (row) => {
          const e = employees.find((e) => e.id === row.employeeId)
          return e ? `${localized(e.firstName)} ${localized(e.lastName)}` : ''
        },
      },
      {
        accessorKey: 'gross',
        header: t('fields.gross'),
        cell: ({ row }) => formatMoney(row.original.gross, 'SAR', locale),
      },
      {
        accessorKey: 'totalAllowances',
        header: t('fields.totalAllowances'),
        cell: ({ row }) => formatMoney(row.original.totalAllowances, 'SAR', locale),
      },
      {
        accessorKey: 'totalDeductions',
        header: t('fields.totalDeductions'),
        cell: ({ row }) => formatMoney(row.original.totalDeductions, 'SAR', locale),
      },
      {
        accessorKey: 'netSalary',
        header: t('fields.net'),
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatMoney(row.original.netSalary, 'SAR', locale)}
          </span>
        ),
      },
    ]
  }, [t, localized, employees, locale])

  return (
    <div>
      <PageHeader
        title={t('payslips')}
        actions={
          <Select value={periodId} onValueChange={setPeriodId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortedPeriods.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.year}-{String(p.month).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">
              {t('fields.gross')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {formatMoney(totals.gross, 'SAR', locale)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">
              {t('fields.totalAllowances')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {formatMoney(totals.allowances, 'SAR', locale)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">
              {t('fields.totalDeductions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {formatMoney(totals.deductions, 'SAR', locale)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">
              {t('fields.net')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-xl font-semibold">
              {formatMoney(totals.net, 'SAR', locale)}
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        searchKey={'employeeId' as keyof Payslip}
      />
    </div>
  )
}
