import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import {
  PlusIcon,
  MoreVerticalIcon,
  CheckIcon,
  XIcon,
  Trash2Icon,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  useLeaveRequestStore,
  useLeaveTypeStore,
} from '@/features/leaves/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { daysBetween } from '@/lib/date'
import { nowIso } from '@/lib/id'
import { toast } from '@/components/ui/sonner'
import type { LeaveRequest, LeaveStatus } from '../types'
import { useAppStore } from '@/store/app-store'

function statusVariant(status: LeaveStatus) {
  switch (status) {
    case 'pending':
      return 'warning' as const
    case 'approved':
      return 'success' as const
    case 'rejected':
      return 'destructive' as const
    case 'cancelled':
      return 'secondary' as const
  }
}

type FormValues = {
  employeeId: string
  leaveTypeId: string
  fromDate: string
  toDate: string
  reason: string
}

function NewRequestDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['leaves', 'common'])
  const localized = useLocalizedField()
  const employees = useEmployeeStore((s) => s.items)
  const leaveTypes = useLeaveTypeStore((s) => s.items)
  const add = useLeaveRequestStore((s) => s.add)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      employeeId: employees[0]?.id ?? '',
      leaveTypeId: leaveTypes[0]?.id ?? '',
      fromDate: '',
      toDate: '',
      reason: '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (!data.fromDate || !data.toDate) return
    add({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      fromDate: data.fromDate,
      toDate: data.toDate,
      days: daysBetween(data.fromDate, data.toDate),
      reason: data.reason,
      status: 'pending',
    })
    reset()
    onOpenChange(false)
    toast.success(t('common:saved'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('newRequest')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('fields.employee')}</Label>
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
          <div className="space-y-2">
            <Label>{t('fields.leaveType')}</Label>
            <Select
              value={watch('leaveTypeId')}
              onValueChange={(v) => setValue('leaveTypeId', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((lt) => (
                  <SelectItem key={lt.id} value={lt.id}>
                    {localized(lt.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.fromDate')}</Label>
              <Input type="date" {...register('fromDate', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.toDate')}</Label>
              <Input type="date" {...register('toDate', { required: true })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('fields.reason')}</Label>
            <Textarea {...register('reason')} />
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

export function LeaveRequestsPage() {
  const { t } = useTranslation(['leaves', 'common'])
  const localized = useLocalizedField()
  const requests = useLeaveRequestStore((s) => s.items)
  const update = useLeaveRequestStore((s) => s.update)
  const remove = useLeaveRequestStore((s) => s.remove)
  const employees = useEmployeeStore((s) => s.items)
  const leaveTypes = useLeaveTypeStore((s) => s.items)
  const mockUserName = useAppStore((s) => s.mockUserName)

  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const setStatus = useCallback(
    (id: string, status: LeaveStatus) => {
      update(id, {
        status,
        approvedBy: mockUserName,
        approvedAt: nowIso(),
      })
      toast.success(t('common:saved'))
    },
    [update, mockUserName, t]
  )

  const columns = useMemo<ColumnDef<LeaveRequest>[]>(() => {
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
          const lt = leaveTypes.find((l) => l.id === row.leaveTypeId)
          return lt ? localized(lt.name) : ''
        },
      },
      { accessorKey: 'fromDate', header: t('fields.fromDate') },
      { accessorKey: 'toDate', header: t('fields.toDate') },
      { accessorKey: 'days', header: t('fields.days') },
      {
        accessorKey: 'reason',
        header: t('fields.reason'),
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-1 max-w-xs">
            {row.original.reason}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('common:status'),
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {t(`status.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const r = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {r.status === 'pending' && (
                  <>
                    <DropdownMenuItem onSelect={() => setStatus(r.id, 'approved')}>
                      <CheckIcon /> {t('approve')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setStatus(r.id, 'rejected')}
                    >
                      <XIcon /> {t('reject')}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setConfirmId(r.id)}
                >
                  <Trash2Icon /> {t('common:delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
  }, [t, localized, employees, leaveTypes, setStatus])

  return (
    <div>
      <PageHeader
        title={t('requests')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newRequest')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={requests}
        searchKey={'reason' as keyof LeaveRequest}
      />
      <NewRequestDialog open={creating} onOpenChange={setCreating} />
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
