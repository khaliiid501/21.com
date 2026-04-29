import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { useAllowanceStore } from '@/features/payroll/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { formatMoney } from '@/lib/date'
import { useAppStore } from '@/store/app-store'
import { toast } from '@/components/ui/sonner'
import type { Allowance, AllowanceType } from '../types'

type FormValues = {
  employeeId: string
  type: AllowanceType
  amount: number
  isRecurring: boolean
}

function AllowanceDialog({
  allowance,
  open,
  onOpenChange,
}: {
  allowance: Allowance | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['payroll', 'common'])
  const localized = useLocalizedField()
  const employees = useEmployeeStore((s) => s.items)
  const add = useAllowanceStore((s) => s.add)
  const update = useAllowanceStore((s) => s.update)

  const types: AllowanceType[] = ['housing', 'transport', 'other']

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      employeeId: allowance?.employeeId ?? employees[0]?.id ?? '',
      type: allowance?.type ?? 'housing',
      amount: allowance?.amount ?? 0,
      isRecurring: allowance?.isRecurring ?? true,
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      employeeId: data.employeeId,
      type: data.type,
      amount: Number(data.amount),
      isRecurring: data.isRecurring,
    }
    if (allowance) {
      update(allowance.id, payload)
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
          <DialogTitle>
            {allowance ? t('common:edit') : t('newAllowance')}
          </DialogTitle>
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
              <Label>{t('fields.type')}</Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v as AllowanceType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((tp) => (
                    <SelectItem key={tp} value={tp}>
                      {t(`allowanceType.${tp}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common:amount')}</Label>
              <Input
                type="number"
                {...register('amount', { valueAsNumber: true, required: true })}
              />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={watch('isRecurring')}
                onCheckedChange={(v) => setValue('isRecurring', v)}
              />
              <Label>{t('fields.isRecurring')}</Label>
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

export function AllowancesPage() {
  const { t } = useTranslation(['payroll', 'common'])
  const localized = useLocalizedField()
  const locale = useAppStore((s) => s.locale)
  const allowances = useAllowanceStore((s) => s.items)
  const remove = useAllowanceStore((s) => s.remove)
  const employees = useEmployeeStore((s) => s.items)

  const [editing, setEditing] = useState<Allowance | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Allowance>[]>(() => {
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
        accessorKey: 'type',
        header: t('fields.type'),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {t(`allowanceType.${row.original.type}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'amount',
        header: t('common:amount'),
        cell: ({ row }) => formatMoney(row.original.amount, 'SAR', locale),
      },
      {
        accessorKey: 'isRecurring',
        header: t('fields.isRecurring'),
        cell: ({ row }) => (
          <Badge variant={row.original.isRecurring ? 'success' : 'secondary'}>
            {row.original.isRecurring ? t('common:yes') : t('common:no')}
          </Badge>
        ),
      },
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
        title={t('allowances')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newAllowance')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={allowances}
        searchKey={'type' as keyof Allowance}
      />
      <AllowanceDialog
        allowance={editing}
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
