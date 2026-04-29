import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
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
import { useEmployeeStore } from '@/features/employees/store'
import { useDepartmentStore } from '@/features/departments/store'
import { usePositionStore } from '@/features/positions/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import { EmployeeForm } from '../components/employee-form'
import type { Employee, EmployeeStatus } from '../types'

function statusVariant(status: EmployeeStatus) {
  switch (status) {
    case 'active':
      return 'success' as const
    case 'on-leave':
      return 'warning' as const
    case 'terminated':
      return 'destructive' as const
  }
}

export function EmployeesPage() {
  const { t } = useTranslation(['employees', 'common'])
  const localized = useLocalizedField()

  const employees = useEmployeeStore((s) => s.items)
  const removeEmployee = useEmployeeStore((s) => s.remove)
  const departments = useDepartmentStore((s) => s.items)
  const positions = usePositionStore((s) => s.items)

  const [editing, setEditing] = useState<Employee | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Employee>[]>(() => {
    return [
      {
        id: 'name',
        header: t('common:name'),
        accessorFn: (row) =>
          `${localized(row.firstName)} ${localized(row.lastName)} ${row.employeeNumber} ${row.email}`,
        cell: ({ row }) => {
          const e = row.original
          const initials = `${localized(e.firstName)[0] ?? ''}${localized(e.lastName)[0] ?? ''}`
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">
                  {localized(e.firstName)} {localized(e.lastName)}
                </span>
                <span className="text-muted-foreground text-xs">
                  {e.employeeNumber}
                </span>
              </div>
            </div>
          )
        },
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
        id: 'position',
        header: t('fields.position'),
        accessorFn: (row) => {
          const pos = positions.find((p) => p.id === row.positionId)
          return pos ? localized(pos.title) : ''
        },
      },
      {
        accessorKey: 'email',
        header: t('fields.email'),
      },
      {
        accessorKey: 'employmentType',
        header: t('fields.employmentType'),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {t(`employmentType.${row.original.employmentType}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: t('fields.status'),
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
  }, [t, localized, departments, positions])

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
        data={employees}
        searchKey={'employeeNumber' as keyof Employee}
        searchPlaceholder={t('common:search')}
      />

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false)
            setEditing(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t('edit') : t('new')}</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={editing ?? undefined}
            onSuccess={() => {
              const wasEdit = editing !== null
              setCreating(false)
              setEditing(null)
              toast.success(t(wasEdit ? 'common:saved' : 'common:saved'))
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            removeEmployee(confirmId)
            toast.success(t('common:removed'))
          }
        }}
      />
    </div>
  )
}
