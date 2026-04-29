import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { useDepartmentStore } from '@/features/departments/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import type { Department } from '../types'

type FormValues = {
  code: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  parentDepartmentId: string
  managerId: string
}

function DepartmentDialog({
  department,
  open,
  onOpenChange,
}: {
  department: Department | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation(['departments', 'common'])
  const localized = useLocalizedField()
  const departments = useDepartmentStore((s) => s.items)
  const add = useDepartmentStore((s) => s.add)
  const update = useDepartmentStore((s) => s.update)
  const employees = useEmployeeStore((s) => s.items)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      code: department?.code ?? '',
      nameEn: department?.name.en ?? '',
      nameAr: department?.name.ar ?? '',
      descriptionEn: department?.description.en ?? '',
      descriptionAr: department?.description.ar ?? '',
      parentDepartmentId: department?.parentDepartmentId ?? '',
      managerId: department?.managerId ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      code: data.code,
      name: { en: data.nameEn, ar: data.nameAr },
      description: { en: data.descriptionEn, ar: data.descriptionAr },
      parentDepartmentId: data.parentDepartmentId || undefined,
      managerId: data.managerId || undefined,
    }
    if (department) {
      update(department.id, payload)
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
          <DialogTitle>{department ? t('edit') : t('new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.code')}</Label>
              <Input {...register('code', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.parent')}</Label>
              <Select
                value={watch('parentDepartmentId') || '__none__'}
                onValueChange={(v) =>
                  setValue('parentDepartmentId', v === '__none__' ? '' : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('noParent')}</SelectItem>
                  {departments
                    .filter((d) => d.id !== department?.id)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {localized(d.name)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common:nameEn')}</Label>
              <Input {...register('nameEn', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('common:nameAr')}</Label>
              <Input dir="rtl" {...register('nameAr', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.manager')}</Label>
              <Select
                value={watch('managerId') || '__none__'}
                onValueChange={(v) =>
                  setValue('managerId', v === '__none__' ? '' : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('common:no')}</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {localized(e.firstName)} {localized(e.lastName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{`${t('common:description')} (EN)`}</Label>
              <Textarea {...register('descriptionEn')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{`${t('common:description')} (AR)`}</Label>
              <Textarea dir="rtl" {...register('descriptionAr')} />
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

export function DepartmentsPage() {
  const { t } = useTranslation(['departments', 'common'])
  const localized = useLocalizedField()
  const departments = useDepartmentStore((s) => s.items)
  const remove = useDepartmentStore((s) => s.remove)
  const employees = useEmployeeStore((s) => s.items)

  const [editing, setEditing] = useState<Department | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Department>[]>(() => {
    return [
      {
        id: 'code',
        header: t('fields.code'),
        accessorKey: 'code',
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span>,
      },
      {
        id: 'name',
        header: t('common:name'),
        accessorFn: (row) => localized(row.name),
      },
      {
        id: 'parent',
        header: t('fields.parent'),
        accessorFn: (row) => {
          const parent = departments.find((d) => d.id === row.parentDepartmentId)
          return parent ? localized(parent.name) : t('noParent')
        },
      },
      {
        id: 'headcount',
        header: t('fields.headcount'),
        accessorFn: (row) =>
          employees.filter((e) => e.departmentId === row.id).length,
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
  }, [t, localized, departments, employees])

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
        data={departments}
        searchKey={'code' as keyof Department}
      />
      <DepartmentDialog
        department={editing}
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
