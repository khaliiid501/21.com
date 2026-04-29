import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
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
import { PageHeader } from '@/components/page-header'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { useTrainingCourseStore } from '@/features/training/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import type { TrainingCourse } from '../types'

type FormValues = {
  titleEn: string
  titleAr: string
  description: string
  durationHours: number
  instructor: string
  category: string
}

function CourseDialog({
  course,
  open,
  onOpenChange,
}: {
  course: TrainingCourse | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['training', 'common'])
  const add = useTrainingCourseStore((s) => s.add)
  const update = useTrainingCourseStore((s) => s.update)

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      titleEn: course?.title.en ?? '',
      titleAr: course?.title.ar ?? '',
      description: course?.description ?? '',
      durationHours: course?.durationHours ?? 8,
      instructor: course?.instructor ?? '',
      category: course?.category ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      title: { en: data.titleEn, ar: data.titleAr },
      description: data.description,
      durationHours: Number(data.durationHours),
      instructor: data.instructor,
      category: data.category,
    }
    if (course) {
      update(course.id, payload)
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
          <DialogTitle>{course ? t('common:edit') : t('newCourse')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{`${t('common:title')} (EN)`}</Label>
              <Input {...register('titleEn', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{`${t('common:title')} (AR)`}</Label>
              <Input dir="rtl" {...register('titleAr', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.instructor')}</Label>
              <Input {...register('instructor', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.category')}</Label>
              <Input {...register('category')} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.durationHours')}</Label>
              <Input
                type="number"
                {...register('durationHours', { valueAsNumber: true, required: true })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('common:description')}</Label>
              <Textarea {...register('description')} />
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

export function TrainingCoursesPage() {
  const { t } = useTranslation(['training', 'common'])
  const localized = useLocalizedField()
  const courses = useTrainingCourseStore((s) => s.items)
  const remove = useTrainingCourseStore((s) => s.remove)

  const [editing, setEditing] = useState<TrainingCourse | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<TrainingCourse>[]>(() => {
    return [
      {
        id: 'title',
        header: t('common:title'),
        accessorFn: (row) => localized(row.title),
      },
      { accessorKey: 'instructor', header: t('fields.instructor') },
      {
        accessorKey: 'category',
        header: t('fields.category'),
        cell: ({ row }) =>
          row.original.category ? (
            <Badge variant="secondary">{row.original.category}</Badge>
          ) : (
            '—'
          ),
      },
      { accessorKey: 'durationHours', header: t('fields.durationHours') },
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
    <div>
      <PageHeader
        title={t('courses')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newCourse')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={courses}
        searchKey={'category' as keyof TrainingCourse}
      />
      <CourseDialog
        course={editing}
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
