import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'

import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table/data-table'
import { Badge } from '@/components/ui/badge'
import { useLeaveBalanceStore, useLeaveTypeStore } from '@/features/leaves/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import type { LeaveBalance } from '../types'

export function LeaveBalancesPage() {
  const { t } = useTranslation(['leaves', 'common'])
  const localized = useLocalizedField()
  const balances = useLeaveBalanceStore((s) => s.items)
  const types = useLeaveTypeStore((s) => s.items)
  const employees = useEmployeeStore((s) => s.items)

  const columns = useMemo<ColumnDef<LeaveBalance>[]>(() => {
    return [
      {
        id: 'employee',
        header: t('fields.employee'),
        accessorFn: (row) => {
          const e = employees.find((e) => e.id === row.employeeId)
          return e ? `${localized(e.firstName)} ${localized(e.lastName)}` : ''
        },
      },
      {
        id: 'leaveType',
        header: t('fields.leaveType'),
        accessorFn: (row) => {
          const lt = types.find((t) => t.id === row.leaveTypeId)
          return lt ? localized(lt.name) : ''
        },
      },
      { accessorKey: 'year', header: t('fields.year') },
      { accessorKey: 'entitled', header: t('fields.entitled') },
      { accessorKey: 'used', header: t('fields.used') },
      {
        id: 'remaining',
        header: t('fields.remaining'),
        cell: ({ row }) => {
          const r = row.original
          const remaining = r.entitled - r.used
          return (
            <Badge variant={remaining < 3 ? 'warning' : 'success'}>
              {remaining}
            </Badge>
          )
        },
      },
    ]
  }, [t, localized, employees, types])

  return (
    <div>
      <PageHeader title={t('balances')} />
      <DataTable
        columns={columns}
        data={balances}
        searchKey={'year' as keyof LeaveBalance}
      />
    </div>
  )
}
