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
import { usePositionStore } from '@/features/positions/store'
import { useDepartmentStore } from '@/features/departments/store'
import { useLocalizedField } from '@/lib/localized'
import { formatMoney } from '@/lib/date'
import { useAppStore } from '@/store/app-store'
import { toast } from '@/components/ui/sonner'
import type { Position, PositionLevel } from '../types'

type FormValues = {
  titleEn: string
  titleAr: string
  departmentId: string
  level: PositionLevel
  description: string
  minSalary: number
  maxSalary: number
}

function PositionDialog({
  position,
  open,
  onOpenChange,
}: {
  position: Position | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation(['positions', 'common'])
  const localized = useLocalizedField()
  const departments = useDepartmentStore((s) => s.items)
  const add = usePositionStore((s) => s.add)
  const update = usePositionStore((s) => s.update)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      titleEn: position?.title.en ?? '',
      titleAr: position?.title.ar ?? '',
      departmentId: position?.departmentId ?? departments[0]?.id ?? '',
      level: position?.level ?? 'mid',
      description: position?.description ?? '',
      minSalary: position?.minSalary ?? 0,
      maxSalary: position?.maxSalary ?? 0,
    },
  })

  const levels: PositionLevel[] = ['junior', 'mid', 'senior', 'lead']

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      title: { en: data.titleEn, ar: data.titleAr },
      departmentId: data.departmentId,
      level: data.level,
      description: data.description,
      minSalary: Number(data.minSalary),
      maxSalary: Number(data.maxSalary),
    }
    if (position) {
      update(position.id, payload)
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
          <DialogTitle>{position ? t('edit') : t('new')}</DialogTitle>
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
              <Label>{t('fields.level')}</Label>
              <Select
                value={watch('level')}
                onValueChange={(v) => setValue('level', v as PositionLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l}>
                      {t(`level.${l}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.minSalary')}</Label>
              <Input
                type="number"
                {...register('minSalary', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.maxSalary')}</Label>
              <Input
                type="number"
                {...register('maxSalary', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('common:description')}</Label>
              <Input {...register('description')} />
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

export function PositionsPage() {
  const { t } = useTranslation(['positions', 'common'])
  const localized = useLocalizedField()
  const locale = useAppStore((s) => s.locale)
  const positions = usePositionStore((s) => s.items)
  const remove = usePositionStore((s) => s.remove)
  const departments = useDepartmentStore((s) => s.items)

  const [editing, setEditing] = useState<Position | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Position>[]>(() => {
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
      {
        accessorKey: 'level',
        header: t('fields.level'),
        cell: ({ row }) => (
          <Badge variant="secondary">{t(`level.${row.original.level}`)}</Badge>
        ),
      },
      {
        id: 'salary',
        header: `${t('fields.minSalary')} – ${t('fields.maxSalary')}`,
        cell: ({ row }) =>
          `${formatMoney(row.original.minSalary, 'SAR', locale)} – ${formatMoney(row.original.maxSalary, 'SAR', locale)}`,
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
  }, [t, localized, departments, locale])

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
        data={positions}
        searchKey={'level' as keyof Position}
      />
      <PositionDialog
        position={editing}
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
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
