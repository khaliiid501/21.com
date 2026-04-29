import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/page-header'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { useSalaryStore } from '@/features/payroll/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { formatMoney } from '@/lib/date'
import { useAppStore } from '@/store/app-store'
import { toast } from '@/components/ui/sonner'
import type { Salary } from '../types'

type FormValues = {
  employeeId: string
  baseSalary: number
  currency: string
  effectiveFrom: string
}

function SalaryDialog({
  salary,
  open,
  onOpenChange,
}: {
  salary: Salary | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['payroll', 'common'])
  const localized = useLocalizedField()
  const employees = useEmployeeStore((s) => s.items)
  const add = useSalaryStore((s) => s.add)
  const update = useSalaryStore((s) => s.update)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      employeeId: salary?.employeeId ?? employees[0]?.id ?? '',
      baseSalary: salary?.baseSalary ?? 0,
      currency: salary?.currency ?? 'SAR',
      effectiveFrom: salary?.effectiveFrom ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      employeeId: data.employeeId,
      baseSalary: Number(data.baseSalary),
      currency: data.currency,
      effectiveFrom: data.effectiveFrom,
    }
    if (salary) {
      update(salary.id, payload)
    } else {
      add(payload)
    }
    reset()
    onOpenChange(false)
    toast.success(t('common:saved'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{salary ? t('common:edit') : t('newSalary')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('common:nav.employees')}</Label>
            <Select
              value={watch('employeeId')}
              onValueChange={(v) => setValue('employeeId', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {localized(e.firstName)} {localized(e.lastName)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.baseSalary')}</Label>
              <Input
                type="number"
                {...register('baseSalary', { valueAsNumber: true, required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.currency')}</Label>
              <Input {...register('currency', { required: true })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('fields.effectiveFrom')}</Label>
              <Input type="date" {...register('effectiveFrom', { required: true })} />
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

export function SalariesPage() {
  const { t } = useTranslation(['payroll', 'common'])
  const localized = useLocalizedField()
  const locale = useAppStore((s) => s.locale)
  const salaries = useSalaryStore((s) => s.items)
  const remove = useSalaryStore((s) => s.remove)
  const employees = useEmployeeStore((s) => s.items)

  const [editing, setEditing] = useState<Salary | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Salary>[]>(() => {
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
        accessorKey: 'baseSalary',
        header: t('fields.baseSalary'),
        cell: ({ row }) =>
          formatMoney(row.original.baseSalary, row.original.currency, locale),
      },
      { accessorKey: 'currency', header: t('fields.currency') },
      { accessorKey: 'effectiveFrom', header: t('fields.effectiveFrom') },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditing(row.original)}>
                <PencilIcon /> {t('common:edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setConfirmId(row.original.id)}
              >
                <Trash2Icon /> {t('common:delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ]
  }, [t, localized, employees, locale])

  return (
    <div>
      <PageHeader
        title={t('salaries')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newSalary')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={salaries}
        searchKey={'currency' as keyof Salary}
      />
      <SalaryDialog
        salary={editing}
        open={creating || editing !== null}
        onOpenChange={(o) => {
          if (!o) {
            setEditing(null)
            setCreating(false)
          }
        }}
      />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            remove(confirmId)
            toast.success(t('common:removed'))
          }
        }}
      />
    </div>
  )
}
