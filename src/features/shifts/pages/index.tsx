import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/page-header'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import {
  useShiftStore,
  useShiftAssignmentStore,
} from '@/features/shifts/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import type { Shift, ShiftAssignment } from '../types'

type ShiftFormValues = {
  nameEn: string
  nameAr: string
  startTime: string
  endTime: string
  breakMinutes: number
  daysOfWeek: number[]
}

function ShiftDialog({
  shift,
  open,
  onOpenChange,
}: {
  shift: Shift | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['shifts', 'common'])
  const add = useShiftStore((s) => s.add)
  const update = useShiftStore((s) => s.update)

  const { register, handleSubmit, watch, setValue, reset } = useForm<ShiftFormValues>({
    defaultValues: {
      nameEn: shift?.name.en ?? '',
      nameAr: shift?.name.ar ?? '',
      startTime: shift?.startTime ?? '08:00',
      endTime: shift?.endTime ?? '17:00',
      breakMinutes: shift?.breakMinutes ?? 60,
      daysOfWeek: shift?.daysOfWeek ?? [0, 1, 2, 3, 4],
    },
  })

  const days = watch('daysOfWeek')

  const toggleDay = (d: number) => {
    setValue(
      'daysOfWeek',
      days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort()
    )
  }

  const onSubmit: SubmitHandler<ShiftFormValues> = (data) => {
    const payload = {
      name: { en: data.nameEn, ar: data.nameAr },
      startTime: data.startTime,
      endTime: data.endTime,
      breakMinutes: Number(data.breakMinutes),
      daysOfWeek: data.daysOfWeek,
    }
    if (shift) {
      update(shift.id, payload)
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
          <DialogTitle>{shift ? t('edit') : t('new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('common:nameEn')}</Label>
              <Input {...register('nameEn', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('common:nameAr')}</Label>
              <Input dir="rtl" {...register('nameAr', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.startTime')}</Label>
              <Input type="time" {...register('startTime', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.endTime')}</Label>
              <Input type="time" {...register('endTime', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.breakMinutes')}</Label>
              <Input type="number" {...register('breakMinutes', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('fields.daysOfWeek')}</Label>
            <div className="flex flex-wrap gap-3">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <label key={d} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={days.includes(d)}
                    onCheckedChange={() => toggleDay(d)}
                  />
                  {t(`days.${d}`)}
                </label>
              ))}
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

function ShiftsTab() {
  const { t } = useTranslation(['shifts', 'common'])
  const localized = useLocalizedField()
  const shifts = useShiftStore((s) => s.items)
  const remove = useShiftStore((s) => s.remove)

  const [editing, setEditing] = useState<Shift | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Shift>[]>(() => {
    return [
      {
        id: 'name',
        header: t('common:name'),
        accessorFn: (row) => localized(row.name),
      },
      { accessorKey: 'startTime', header: t('fields.startTime') },
      { accessorKey: 'endTime', header: t('fields.endTime') },
      { accessorKey: 'breakMinutes', header: t('fields.breakMinutes') },
      {
        id: 'days',
        header: t('fields.daysOfWeek'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.daysOfWeek.map((d) => (
              <Badge key={d} variant="outline" className="text-xs">
                {t(`days.${d}`)}
              </Badge>
            ))}
          </div>
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
  }, [t, localized])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <PlusIcon /> {t('new')}
        </Button>
      </div>
      <DataTable columns={columns} data={shifts} searchKey={'startTime' as keyof Shift} />
      <ShiftDialog
        shift={editing}
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

type AssignmentFormValues = {
  employeeId: string
  shiftId: string
  fromDate: string
  toDate: string
}

function AssignmentDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['shifts', 'common'])
  const localized = useLocalizedField()
  const add = useShiftAssignmentStore((s) => s.add)
  const employees = useEmployeeStore((s) => s.items)
  const shifts = useShiftStore((s) => s.items)

  const { register, handleSubmit, watch, setValue, reset } = useForm<AssignmentFormValues>({
    defaultValues: {
      employeeId: employees[0]?.id ?? '',
      shiftId: shifts[0]?.id ?? '',
      fromDate: '',
      toDate: '',
    },
  })

  const onSubmit: SubmitHandler<AssignmentFormValues> = (data) => {
    add({
      employeeId: data.employeeId,
      shiftId: data.shiftId,
      fromDate: data.fromDate,
      toDate: data.toDate || undefined,
    })
    reset()
    onOpenChange(false)
    toast.success(t('common:saved'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('newAssignment')}</DialogTitle>
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
          <div className="space-y-2">
            <Label>{t('title')}</Label>
            <Select
              value={watch('shiftId')}
              onValueChange={(v) => setValue('shiftId', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {localized(s.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('common:from')}</Label>
              <Input type="date" {...register('fromDate', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('common:to')}</Label>
              <Input type="date" {...register('toDate')} />
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

function AssignmentsTab() {
  const { t } = useTranslation(['shifts', 'common'])
  const localized = useLocalizedField()
  const assignments = useShiftAssignmentStore((s) => s.items)
  const remove = useShiftAssignmentStore((s) => s.remove)
  const employees = useEmployeeStore((s) => s.items)
  const shifts = useShiftStore((s) => s.items)

  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<ShiftAssignment>[]>(() => {
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
        id: 'shift',
        header: t('title'),
        accessorFn: (row) => {
          const sh = shifts.find((s) => s.id === row.shiftId)
          return sh ? localized(sh.name) : ''
        },
      },
      { accessorKey: 'fromDate', header: t('common:from') },
      {
        accessorKey: 'toDate',
        header: t('common:to'),
        cell: ({ row }) => row.original.toDate ?? '—',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setConfirmId(row.original.id)}
          >
            <Trash2Icon />
          </Button>
        ),
      },
    ]
  }, [t, localized, employees, shifts])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <PlusIcon /> {t('newAssignment')}
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={assignments}
        searchKey={'fromDate' as keyof ShiftAssignment}
      />
      <AssignmentDialog open={creating} onOpenChange={setCreating} />
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

export function ShiftsPage() {
  const { t } = useTranslation(['shifts', 'common'])

  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />
      <Tabs defaultValue="shifts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shifts">{t('title')}</TabsTrigger>
          <TabsTrigger value="assignments">{t('assignments')}</TabsTrigger>
        </TabsList>
        <TabsContent value="shifts">
          <ShiftsTab />
        </TabsContent>
        <TabsContent value="assignments">
          <AssignmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
