import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useBranchStore } from '@/features/branches/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import type { Branch } from '../types'

type FormValues = {
  nameEn: string
  nameAr: string
  address: string
  city: string
  country: string
  phone: string
}

function BranchDialog({
  branch,
  open,
  onOpenChange,
}: {
  branch: Branch | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation(['branches', 'common'])
  const add = useBranchStore((s) => s.add)
  const update = useBranchStore((s) => s.update)

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      nameEn: branch?.name.en ?? '',
      nameAr: branch?.name.ar ?? '',
      address: branch?.address ?? '',
      city: branch?.city ?? '',
      country: branch?.country ?? '',
      phone: branch?.phone ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      name: { en: data.nameEn, ar: data.nameAr },
      address: data.address,
      city: data.city,
      country: data.country,
      phone: data.phone || undefined,
    }
    if (branch) {
      update(branch.id, payload)
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
          <DialogTitle>{branch ? t('edit') : t('new')}</DialogTitle>
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
              <Label>{t('fields.address')}</Label>
              <Input {...register('address', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.city')}</Label>
              <Input {...register('city', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.country')}</Label>
              <Input {...register('country', { required: true })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('fields.phone')}</Label>
              <Input {...register('phone')} />
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

export function BranchesPage() {
  const { t } = useTranslation(['branches', 'common'])
  const localized = useLocalizedField()
  const branches = useBranchStore((s) => s.items)
  const remove = useBranchStore((s) => s.remove)

  const [editing, setEditing] = useState<Branch | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Branch>[]>(() => {
    return [
      {
        id: 'name',
        header: t('common:name'),
        accessorFn: (row) => localized(row.name),
      },
      { accessorKey: 'city', header: t('fields.city') },
      { accessorKey: 'country', header: t('fields.country') },
      { accessorKey: 'address', header: t('fields.address') },
      {
        accessorKey: 'phone',
        header: t('fields.phone'),
        cell: ({ row }) => row.original.phone ?? '—',
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
        data={branches}
        searchKey={'city' as keyof Branch}
      />
      <BranchDialog
        branch={editing}
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
