import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import {
  PlusIcon,
  MoreVerticalIcon,
  Trash2Icon,
  ReceiptIcon,
  CheckCircle2Icon,
  WalletIcon,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/page-header'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import {
  usePayPeriodStore,
  useSalaryStore,
  useAllowanceStore,
  useDeductionStore,
  usePayslipStore,
} from '@/features/payroll/store'
import { useEmployeeStore } from '@/features/employees/store'
import { nowIso } from '@/lib/id'
import { toast } from '@/components/ui/sonner'
import type { PayPeriod, PayPeriodStatus } from '../types'

function statusVariant(s: PayPeriodStatus) {
  switch (s) {
    case 'draft':
      return 'secondary' as const
    case 'finalized':
      return 'warning' as const
    case 'paid':
      return 'success' as const
  }
}

type FormValues = {
  year: number
  month: number
  startDate: string
  endDate: string
}

function PeriodDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['payroll', 'common'])
  const add = usePayPeriodStore((s) => s.add)
  const today = new Date()

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      startDate: '',
      endDate: '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    add({
      year: Number(data.year),
      month: Number(data.month),
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'draft',
    })
    reset()
    onOpenChange(false)
    toast.success(t('common:saved'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('newPeriod')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.year')}</Label>
              <Input
                type="number"
                {...register('year', { valueAsNumber: true, required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.month')}</Label>
              <Input
                type="number"
                min="1"
                max="12"
                {...register('month', { valueAsNumber: true, required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.startDate')}</Label>
              <Input type="date" {...register('startDate', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.endDate')}</Label>
              <Input type="date" {...register('endDate', { required: true })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common:cancel')}
            </Button>
            <Button type="submit">{t('common:save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PayPeriodsPage() {
  const { t } = useTranslation(['payroll', 'common'])
  const periods = usePayPeriodStore((s) => s.items)
  const updatePeriod = usePayPeriodStore((s) => s.update)
  const removePeriod = usePayPeriodStore((s) => s.remove)
  const employees = useEmployeeStore((s) => s.items)
  const salaries = useSalaryStore((s) => s.items)
  const allowances = useAllowanceStore((s) => s.items)
  const deductions = useDeductionStore((s) => s.items)
  const payslips = usePayslipStore((s) => s.items)
  const addPayslip = usePayslipStore((s) => s.add)

  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const generatePayslips = useCallback(
    (period: PayPeriod) => {
      const exists = payslips.some((p) => p.payPeriodId === period.id)
      if (exists) {
        toast.error(t('common:saved'))
        return
      }
      employees.forEach((emp) => {
        const sal =
          salaries.find((s) => s.employeeId === emp.id)?.baseSalary ?? emp.salary
        const totalAllowances = allowances
          .filter((a) => a.employeeId === emp.id && a.isRecurring)
          .reduce((sum, a) => sum + a.amount, 0)
        const totalDeductions = deductions
          .filter((d) => d.employeeId === emp.id && d.isRecurring)
          .reduce((sum, d) => sum + d.amount, 0)
        const gross = sal + totalAllowances
        addPayslip({
          employeeId: emp.id,
          payPeriodId: period.id,
          gross,
          totalAllowances,
          totalDeductions,
          netSalary: gross - totalDeductions,
          generatedAt: nowIso(),
        })
      })
      updatePeriod(period.id, { status: 'finalized' })
      toast.success(t('common:saved'))
    },
    [
      payslips,
      employees,
      salaries,
      allowances,
      deductions,
      addPayslip,
      updatePeriod,
      t,
    ]
  )

  const setStatus = useCallback(
    (id: string, status: PayPeriodStatus) => {
      updatePeriod(id, { status })
      toast.success(t('common:saved'))
    },
    [updatePeriod, t]
  )

  const columns = useMemo<ColumnDef<PayPeriod>[]>(() => {
    return [
      { accessorKey: 'year', header: t('fields.year') },
      { accessorKey: 'month', header: t('fields.month') },
      { accessorKey: 'startDate', header: t('fields.startDate') },
      { accessorKey: 'endDate', header: t('fields.endDate') },
      {
        accessorKey: 'status',
        header: t('common:status'),
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {t(`periodStatus.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const p = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {p.status === 'draft' && (
                  <DropdownMenuItem onSelect={() => generatePayslips(p)}>
                    <ReceiptIcon /> {t('generate')}
                  </DropdownMenuItem>
                )}
                {p.status === 'finalized' && (
                  <DropdownMenuItem onSelect={() => setStatus(p.id, 'paid')}>
                    <WalletIcon /> {t('markPaid')}
                  </DropdownMenuItem>
                )}
                {p.status === 'paid' && (
                  <DropdownMenuItem disabled>
                    <CheckCircle2Icon /> {t('periodStatus.paid')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setConfirmId(p.id)}
                >
                  <Trash2Icon /> {t('common:delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
  }, [t, generatePayslips, setStatus])

  return (
    <div>
      <PageHeader
        title={t('periods')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newPeriod')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={periods}
        searchKey={'startDate' as keyof PayPeriod}
      />
      <PeriodDialog open={creating} onOpenChange={setCreating} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            removePeriod(confirmId)
            toast.success(t('common:removed'))
          }
        }}
      />
    </div>
  )
}
