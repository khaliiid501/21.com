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
import { useLeaveTypeStore } from '@/features/leaves/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import type { LeaveType } from '../types'

type FormValues = {
  nameEn: string
  nameAr: string
  defaultDays: number
  isPaid: boolean
  color: string
}

function LeaveTypeDialog({
  type,
  open,
  onOpenChange,
}: {
  type: LeaveType | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['leaves', 'common'])
  const add = useLeaveTypeStore((s) => s.add)
  const update = useLeaveTypeStore((s) => s.update)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      nameEn: type?.name.en ?? '',
      nameAr: type?.name.ar ?? '',
      defaultDays: type?.defaultDays ?? 14,
      isPaid: type?.isPaid ?? true,
      color: type?.color ?? '#10b981',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      name: { en: data.nameEn, ar: data.nameAr },
      defaultDays: Number(data.defaultDays),
      isPaid: data.isPaid,
      color: data.color,
    }
    if (type) {
      update(type.id, payload)
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
          <DialogTitle>{type ? t('common:edit') : t('newType')}</DialogTitle>
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
              <Label>{t('fields.defaultDays')}</Label>
              <Input
                type="number"
                {...register('defaultDays', { valueAsNumber: true, required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.color')}</Label>
              <Input type="color" {...register('color')} />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={watch('isPaid')}
                onCheckedChange={(checked) => setValue('isPaid', checked)}
              />
              <Label>{t('fields.isPaid')}</Label>
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

export function LeaveTypesPage() {
  const { t } = useTranslation(['leaves', 'common'])
  const localized = useLocalizedField()
  const types = useLeaveTypeStore((s) => s.items)
  const remove = useLeaveTypeStore((s) => s.remove)

  const [editing, setEditing] = useState<LeaveType | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<LeaveType>[]>(() => {
    return [
      {
        id: 'name',
        header: t('common:name'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: row.original.color }}
            />
            <span>{localized(row.original.name)}</span>
          </div>
        ),
      },
      { accessorKey: 'defaultDays', header: t('fields.defaultDays') },
      {
        accessorKey: 'isPaid',
        header: t('fields.isPaid'),
        cell: ({ row }) => (
          <Badge variant={row.original.isPaid ? 'success' : 'secondary'}>
            {row.original.isPaid ? t('common:yes') : t('common:no')}
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

  return (
    <div>
      <PageHeader
        title={t('types')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newType')}
          </Button>
        }
      />
      <DataTable columns={columns} data={types} searchKey={'defaultDays' as keyof LeaveType} />
      <LeaveTypeDialog
        type={editing}
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
