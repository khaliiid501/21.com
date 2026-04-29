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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/page-header'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { useCandidateStore, useJobOpeningStore } from '@/features/recruitment/store'
import { useLocalizedField } from '@/lib/localized'
import { todayIso } from '@/lib/date'
import { toast } from '@/components/ui/sonner'
import type { Candidate, CandidateStage } from '../types'

const stages: CandidateStage[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]

function stageVariant(stage: CandidateStage) {
  switch (stage) {
    case 'applied':
      return 'secondary' as const
    case 'screening':
      return 'info' as const
    case 'interview':
      return 'warning' as const
    case 'offer':
      return 'default' as const
    case 'hired':
      return 'success' as const
    case 'rejected':
      return 'destructive' as const
  }
}

type FormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  jobOpeningId: string
  stage: CandidateStage
  resumeUrl: string
}

function CandidateDialog({
  candidate,
  open,
  onOpenChange,
}: {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['recruitment', 'common'])
  const localized = useLocalizedField()
  const openings = useJobOpeningStore((s) => s.items)
  const add = useCandidateStore((s) => s.add)
  const update = useCandidateStore((s) => s.update)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      firstName: candidate?.firstName ?? '',
      lastName: candidate?.lastName ?? '',
      email: candidate?.email ?? '',
      phone: candidate?.phone ?? '',
      jobOpeningId: candidate?.jobOpeningId ?? openings[0]?.id ?? '',
      stage: candidate?.stage ?? 'applied',
      resumeUrl: candidate?.resumeUrl ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      jobOpeningId: data.jobOpeningId,
      stage: data.stage,
      resumeUrl: data.resumeUrl || undefined,
      appliedAt: candidate?.appliedAt ?? todayIso(),
    }
    if (candidate) {
      update(candidate.id, payload)
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
            {candidate ? t('common:edit') : t('newCandidate')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('common:name')}</Label>
              <Input {...register('firstName', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('common:name')}</Label>
              <Input {...register('lastName', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register('phone')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('fields.jobOpening')}</Label>
              <Select
                value={watch('jobOpeningId')}
                onValueChange={(v) => setValue('jobOpeningId', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {openings.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {localized(o.title)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.stage')}</Label>
              <Select
                value={watch('stage')}
                onValueChange={(v) => setValue('stage', v as CandidateStage)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((st) => (
                    <SelectItem key={st} value={st}>
                      {t(`stage.${st}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.resumeUrl')}</Label>
              <Input {...register('resumeUrl')} />
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

function CandidatesKanban({
  onEdit,
  onDelete,
}: {
  onEdit: (c: Candidate) => void
  onDelete: (id: string) => void
}) {
  const { t } = useTranslation(['recruitment', 'common'])
  const localized = useLocalizedField()
  const candidates = useCandidateStore((s) => s.items)
  const update = useCandidateStore((s) => s.update)
  const openings = useJobOpeningStore((s) => s.items)

  const moveStage = (candidate: Candidate, stage: CandidateStage) => {
    update(candidate.id, { stage })
    toast.success(t('common:saved'))
  }

  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {stages.map((stage) => {
        const list = candidates.filter((c) => c.stage === stage)
        return (
          <div key={stage} className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <Badge variant={stageVariant(stage)}>{t(`stage.${stage}`)}</Badge>
              <span className="text-muted-foreground text-xs">{list.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {list.map((c) => {
                const opening = openings.find((o) => o.id === c.jobOpeningId)
                return (
                  <Card key={c.id} className="gap-2 py-3">
                    <CardHeader className="px-3">
                      <CardTitle className="text-sm">
                        {c.firstName} {c.lastName}
                      </CardTitle>
                      <p className="text-muted-foreground text-xs">
                        {opening ? localized(opening.title) : '—'}
                      </p>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-2 px-3">
                      <Select
                        value={c.stage}
                        onValueChange={(v) => moveStage(c, v as CandidateStage)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`stage.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <MoreVerticalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onEdit(c)}>
                            <PencilIcon /> {t('common:edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onDelete(c.id)}
                          >
                            <Trash2Icon /> {t('common:delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CandidatesPage() {
  const { t } = useTranslation(['recruitment', 'common'])
  const localized = useLocalizedField()
  const candidates = useCandidateStore((s) => s.items)
  const remove = useCandidateStore((s) => s.remove)
  const openings = useJobOpeningStore((s) => s.items)

  const [editing, setEditing] = useState<Candidate | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Candidate>[]>(() => {
    return [
      {
        id: 'name',
        header: t('common:name'),
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      },
      { accessorKey: 'email', header: 'Email' },
      {
        id: 'opening',
        header: t('fields.jobOpening'),
        accessorFn: (row) => {
          const o = openings.find((o) => o.id === row.jobOpeningId)
          return o ? localized(o.title) : ''
        },
      },
      {
        accessorKey: 'stage',
        header: t('fields.stage'),
        cell: ({ row }) => (
          <Badge variant={stageVariant(row.original.stage)}>
            {t(`stage.${row.original.stage}`)}
          </Badge>
        ),
      },
      { accessorKey: 'appliedAt', header: t('fields.appliedAt') },
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
  }, [t, localized, openings])

  return (
    <div>
      <PageHeader
        title={t('candidates')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newCandidate')}
          </Button>
        }
      />
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="mt-4">
          <CandidatesKanban
            onEdit={setEditing}
            onDelete={(id) => setConfirmId(id)}
          />
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          <DataTable
            columns={columns}
            data={candidates}
            searchKey={'email' as keyof Candidate}
          />
        </TabsContent>
      </Tabs>
      <CandidateDialog
        candidate={editing}
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
