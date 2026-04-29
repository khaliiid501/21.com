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
import { useJobOpeningStore } from '@/features/recruitment/store'
import { useDepartmentStore } from '@/features/departments/store'
import { usePositionStore } from '@/features/positions/store'
import { useLocalizedField } from '@/lib/localized'
import { todayIso } from '@/lib/date'
import { toast } from '@/components/ui/sonner'
import type { JobOpening, OpeningStatus } from '../types'

type FormValues = {
  titleEn: string
  titleAr: string
  departmentId: string
  positionId: string
  description: string
  requirements: string
  status: OpeningStatus
}

function OpeningDialog({
  opening,
  open,
  onOpenChange,
}: {
  opening: JobOpening | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['recruitment', 'common'])
  const localized = useLocalizedField()
  const departments = useDepartmentStore((s) => s.items)
  const positions = usePositionStore((s) => s.items)
  const add = useJobOpeningStore((s) => s.add)
  const update = useJobOpeningStore((s) => s.update)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      titleEn: opening?.title.en ?? '',
      titleAr: opening?.title.ar ?? '',
      departmentId: opening?.departmentId ?? departments[0]?.id ?? '',
      positionId: opening?.positionId ?? positions[0]?.id ?? '',
      description: opening?.description ?? '',
      requirements: opening?.requirements ?? '',
      status: opening?.status ?? 'open',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      title: { en: data.titleEn, ar: data.titleAr },
      departmentId: data.departmentId,
      positionId: data.positionId,
      description: data.description,
      requirements: data.requirements,
      status: data.status,
      postedAt: opening?.postedAt ?? todayIso(),
      closedAt: data.status === 'closed' ? todayIso() : undefined,
    }
    if (opening) {
      update(opening.id, payload)
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
          <DialogTitle>{opening ? t('common:edit') : t('newOpening')}</DialogTitle>
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
              <Label>{t('fields.department')}</Label>
              <Select
                value={watch('departmentId')}
                onValueChange={(v) => setValue('departmentId', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {localized(d.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.position')}</Label>
              <Select
                value={watch('positionId')}
                onValueChange={(v) => setValue('positionId', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {localized(p.title)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('common:description')}</Label>
              <Textarea {...register('description')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('fields.requirements')}</Label>
              <Textarea {...register('requirements')} />
            </div>
            <div className="space-y-2">
              <Label>{t('common:status')}</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as OpeningStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">{t('openingStatus.open')}</SelectItem>
                  <SelectItem value="closed">{t('openingStatus.closed')}</SelectItem>
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

export function OpeningsPage() {
  const { t } = useTranslation(['recruitment', 'common'])
  const localized = useLocalizedField()
  const openings = useJobOpeningStore((s) => s.items)
  const remove = useJobOpeningStore((s) => s.remove)
  const departments = useDepartmentStore((s) => s.items)

  const [editing, setEditing] = useState<JobOpening | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<JobOpening>[]>(() => {
    return [
      {
        id: 'title',
        header: t('common:title'),
        accessorFn: (row) => localized(row.title),
      },
      {
        id: 'department',
        header: t('fields.department'),
        accessorFn: (row) => {
          const dept = departments.find((d) => d.id === row.departmentId)
          return dept ? localized(dept.name) : ''
        },
      },
      { accessorKey: 'postedAt', header: t('fields.postedAt') },
      {
        accessorKey: 'status',
        header: t('common:status'),
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'open' ? 'success' : 'secondary'}>
            {t(`openingStatus.${row.original.status}`)}
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
  }, [t, localized, departments])

  return (
    <div>
      <PageHeader
        title={t('openings')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newOpening')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={openings}
        searchKey={'requirements' as keyof JobOpening}
      />
      <OpeningDialog
        opening={editing}
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
