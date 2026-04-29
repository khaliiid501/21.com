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
import { PageHeader } from '@/components/page-header'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { useHolidayStore } from '@/features/holidays/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import type { Holiday } from '../types'

type FormValues = {
  nameEn: string
  nameAr: string
  date: string
  isRecurring: boolean
}

function HolidayDialog({
  holiday,
  open,
  onOpenChange,
}: {
  holiday: Holiday | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['holidays', 'common'])
  const add = useHolidayStore((s) => s.add)
  const update = useHolidayStore((s) => s.update)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      nameEn: holiday?.name.en ?? '',
      nameAr: holiday?.name.ar ?? '',
      date: holiday?.date ?? '',
      isRecurring: holiday?.isRecurring ?? false,
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      name: { en: data.nameEn, ar: data.nameAr },
      date: data.date,
      isRecurring: data.isRecurring,
    }
    if (holiday) {
      update(holiday.id, payload)
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
          <DialogTitle>{holiday ? t('edit') : t('new')}</DialogTitle>
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
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('common:date')}</Label>
              <Input type="date" {...register('date', { required: true })} />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={watch('isRecurring')}
                onCheckedChange={(checked) => setValue('isRecurring', checked)}
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

export function HolidaysPage() {
  const { t } = useTranslation(['holidays', 'common'])
  const localized = useLocalizedField()
  const holidays = useHolidayStore((s) => s.items)
  const remove = useHolidayStore((s) => s.remove)

  const [editing, setEditing] = useState<Holiday | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Holiday>[]>(() => {
    return [
      {
        id: 'name',
        header: t('common:name'),
        accessorFn: (row) => localized(row.name),
      },
      { accessorKey: 'date', header: t('common:date') },
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
  }, [t, localized])

  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays]
  )

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
        data={sortedHolidays}
        searchKey={'date' as keyof Holiday}
      />
      <HolidayDialog
        holiday={editing}
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
