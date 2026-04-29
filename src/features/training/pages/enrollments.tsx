import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
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
  useTrainingEnrollmentStore,
  useTrainingCourseStore,
} from '@/features/training/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { todayIso } from '@/lib/date'
import { toast } from '@/components/ui/sonner'
import type { TrainingEnrollment, EnrollmentStatus } from '../types'

type FormValues = {
  employeeId: string
  courseId: string
  enrolledAt: string
  status: EnrollmentStatus
  score: number
  completedAt: string
}

function statusVariant(s: EnrollmentStatus) {
  switch (s) {
    case 'enrolled':
      return 'secondary' as const
    case 'in-progress':
      return 'warning' as const
    case 'completed':
      return 'success' as const
  }
}

function EnrollmentDialog({
  enrollment,
  open,
  onOpenChange,
}: {
  enrollment: TrainingEnrollment | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['training', 'common'])
  const localized = useLocalizedField()
  const employees = useEmployeeStore((s) => s.items)
  const courses = useTrainingCourseStore((s) => s.items)
  const add = useTrainingEnrollmentStore((s) => s.add)
  const update = useTrainingEnrollmentStore((s) => s.update)

  const statuses: EnrollmentStatus[] = ['enrolled', 'in-progress', 'completed']

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      employeeId: enrollment?.employeeId ?? employees[0]?.id ?? '',
      courseId: enrollment?.courseId ?? courses[0]?.id ?? '',
      enrolledAt: enrollment?.enrolledAt ?? todayIso(),
      status: enrollment?.status ?? 'enrolled',
      score: enrollment?.score ?? 0,
      completedAt: enrollment?.completedAt ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      employeeId: data.employeeId,
      courseId: data.courseId,
      enrolledAt: data.enrolledAt,
      status: data.status,
      score: data.status === 'completed' ? Number(data.score) : undefined,
      completedAt: data.status === 'completed' ? data.completedAt || todayIso() : undefined,
    }
    if (enrollment) {
      update(enrollment.id, payload)
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
            {enrollment ? t('common:edit') : t('newEnrollment')}
          </DialogTitle>
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
            <Label>{t('fields.course')}</Label>
            <Select
              value={watch('courseId')}
              onValueChange={(v) => setValue('courseId', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {localized(c.title)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.enrolledAt')}</Label>
              <Input type="date" {...register('enrolledAt', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('common:status')}</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as EnrollmentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {watch('status') === 'completed' && (
              <>
                <div className="space-y-2">
                  <Label>{t('fields.score')}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...register('score', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.completedAt')}</Label>
                  <Input type="date" {...register('completedAt')} />
                </div>
              </>
            )}
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

export function TrainingEnrollmentsPage() {
  const { t } = useTranslation(['training', 'common'])
  const localized = useLocalizedField()
  const enrollments = useTrainingEnrollmentStore((s) => s.items)
  const remove = useTrainingEnrollmentStore((s) => s.remove)
  const employees = useEmployeeStore((s) => s.items)
  const courses = useTrainingCourseStore((s) => s.items)

  const [editing, setEditing] = useState<TrainingEnrollment | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<TrainingEnrollment>[]>(() => {
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
        id: 'course',
        header: t('fields.course'),
        accessorFn: (row) => {
          const c = courses.find((c) => c.id === row.courseId)
          return c ? localized(c.title) : ''
        },
      },
      { accessorKey: 'enrolledAt', header: t('fields.enrolledAt') },
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
        accessorKey: 'score',
        header: t('fields.score'),
        cell: ({ row }) => row.original.score ?? '—',
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
  }, [t, localized, employees, courses])

  return (
    <div>
      <PageHeader
        title={t('enrollments')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newEnrollment')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={enrollments}
        searchKey={'enrolledAt' as keyof TrainingEnrollment}
      />
      <EnrollmentDialog
        enrollment={editing}
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
