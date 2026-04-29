import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon, StarIcon } from 'lucide-react'
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
import { usePerformanceStore } from '@/features/performance/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import type { PerformanceReview, ReviewStatus } from '../types'

type FormValues = {
  employeeId: string
  reviewerId: string
  period: string
  rating: number
  strengths: string
  improvements: string
  goals: string
  status: ReviewStatus
}

function ReviewDialog({
  review,
  open,
  onOpenChange,
}: {
  review: PerformanceReview | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['performance', 'common'])
  const localized = useLocalizedField()
  const employees = useEmployeeStore((s) => s.items)
  const add = usePerformanceStore((s) => s.add)
  const update = usePerformanceStore((s) => s.update)

  const statuses: ReviewStatus[] = ['draft', 'submitted', 'finalized']

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      employeeId: review?.employeeId ?? employees[0]?.id ?? '',
      reviewerId: review?.reviewerId ?? employees[0]?.id ?? '',
      period: review?.period ?? '',
      rating: review?.rating ?? 3,
      strengths: review?.strengths ?? '',
      improvements: review?.improvements ?? '',
      goals: review?.goals ?? '',
      status: review?.status ?? 'draft',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      employeeId: data.employeeId,
      reviewerId: data.reviewerId,
      period: data.period,
      rating: Number(data.rating),
      strengths: data.strengths,
      improvements: data.improvements,
      goals: data.goals,
      status: data.status,
    }
    if (review) {
      update(review.id, payload)
    } else {
      add(payload)
    }
    reset()
    onOpenChange(false)
    toast.success(t('common:saved'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{review ? t('edit') : t('new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Label>{t('fields.reviewer')}</Label>
              <Select
                value={watch('reviewerId')}
                onValueChange={(v) => setValue('reviewerId', v)}
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
              <Label>{t('fields.period')}</Label>
              <Input
                placeholder="2026-H1"
                {...register('period', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.rating')}</Label>
              <Input
                type="number"
                min="1"
                max="5"
                {...register('rating', { valueAsNumber: true, required: true })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('fields.strengths')}</Label>
              <Textarea {...register('strengths')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('fields.improvements')}</Label>
              <Textarea {...register('improvements')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('fields.goals')}</Label>
              <Textarea {...register('goals')} />
            </div>
            <div className="space-y-2">
              <Label>{t('common:status')}</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as ReviewStatus)}
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

function statusVariant(s: ReviewStatus) {
  switch (s) {
    case 'draft':
      return 'secondary' as const
    case 'submitted':
      return 'warning' as const
    case 'finalized':
      return 'success' as const
  }
}

export function PerformancePage() {
  const { t } = useTranslation(['performance', 'common'])
  const localized = useLocalizedField()
  const reviews = usePerformanceStore((s) => s.items)
  const remove = usePerformanceStore((s) => s.remove)
  const employees = useEmployeeStore((s) => s.items)

  const [editing, setEditing] = useState<PerformanceReview | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<PerformanceReview>[]>(() => {
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
        id: 'reviewer',
        header: t('fields.reviewer'),
        accessorFn: (row) => {
          const e = employees.find((e) => e.id === row.reviewerId)
          return e ? `${localized(e.firstName)} ${localized(e.lastName)}` : ''
        },
      },
      { accessorKey: 'period', header: t('fields.period') },
      {
        accessorKey: 'rating',
        header: t('fields.rating'),
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={
                  i < row.original.rating
                    ? 'size-4 fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/40 size-4'
                }
              />
            ))}
          </div>
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
  }, [t, localized, employees])

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('new')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={reviews}
        searchKey={'period' as keyof PerformanceReview}
      />
      <ReviewDialog
        review={editing}
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
