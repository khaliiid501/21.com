import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { format, parseISO } from 'date-fns'
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
import { useInterviewStore, useCandidateStore } from '@/features/recruitment/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { toast } from '@/components/ui/sonner'
import type { Interview, InterviewType, InterviewResult } from '../types'

type FormValues = {
  candidateId: string
  interviewerId: string
  scheduledAt: string
  type: InterviewType
  result: InterviewResult
  notes: string
}

function InterviewDialog({
  interview,
  open,
  onOpenChange,
}: {
  interview: Interview | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation(['recruitment', 'common'])
  const localized = useLocalizedField()
  const candidates = useCandidateStore((s) => s.items)
  const employees = useEmployeeStore((s) => s.items)
  const add = useInterviewStore((s) => s.add)
  const update = useInterviewStore((s) => s.update)

  const types: InterviewType[] = ['phone', 'video', 'onsite']
  const results: InterviewResult[] = ['pending', 'pass', 'fail']

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      candidateId: interview?.candidateId ?? candidates[0]?.id ?? '',
      interviewerId: interview?.interviewerId ?? employees[0]?.id ?? '',
      scheduledAt: interview?.scheduledAt
        ? interview.scheduledAt.slice(0, 16)
        : '',
      type: interview?.type ?? 'video',
      result: interview?.result ?? 'pending',
      notes: interview?.notes ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      candidateId: data.candidateId,
      interviewerId: data.interviewerId,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      type: data.type,
      result: data.result,
      notes: data.notes,
    }
    if (interview) {
      update(interview.id, payload)
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
            {interview ? t('common:edit') : t('newInterview')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('candidates')}</Label>
            <Select
              value={watch('candidateId')}
              onValueChange={(v) => setValue('candidateId', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('fields.interviewer')}</Label>
            <Select
              value={watch('interviewerId')}
              onValueChange={(v) => setValue('interviewerId', v)}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.scheduledAt')}</Label>
              <Input
                type="datetime-local"
                {...register('scheduledAt', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.type', { ns: 'common' })}</Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v as InterviewType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((tp) => (
                    <SelectItem key={tp} value={tp}>
                      {t(`interviewType.${tp}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.result')}</Label>
              <Select
                value={watch('result')}
                onValueChange={(v) => setValue('result', v as InterviewResult)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {results.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`result.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('fields.notes')}</Label>
            <Textarea {...register('notes')} />
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

export function InterviewsPage() {
  const { t } = useTranslation(['recruitment', 'common'])
  const localized = useLocalizedField()
  const interviews = useInterviewStore((s) => s.items)
  const remove = useInterviewStore((s) => s.remove)
  const candidates = useCandidateStore((s) => s.items)
  const employees = useEmployeeStore((s) => s.items)

  const [editing, setEditing] = useState<Interview | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Interview>[]>(() => {
    return [
      {
        id: 'candidate',
        header: t('candidates'),
        accessorFn: (row) => {
          const c = candidates.find((c) => c.id === row.candidateId)
          return c ? `${c.firstName} ${c.lastName}` : ''
        },
      },
      {
        id: 'interviewer',
        header: t('fields.interviewer'),
        accessorFn: (row) => {
          const e = employees.find((e) => e.id === row.interviewerId)
          return e ? `${localized(e.firstName)} ${localized(e.lastName)}` : ''
        },
      },
      {
        accessorKey: 'scheduledAt',
        header: t('fields.scheduledAt'),
        cell: ({ row }) =>
          format(parseISO(row.original.scheduledAt), 'yyyy-MM-dd HH:mm'),
      },
      {
        accessorKey: 'type',
        header: t('common:type'),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {t(`interviewType.${row.original.type}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'result',
        header: t('fields.result'),
        cell: ({ row }) => {
          const r = row.original.result ?? 'pending'
          return (
            <Badge
              variant={
                r === 'pass' ? 'success' : r === 'fail' ? 'destructive' : 'warning'
              }
            >
              {t(`result.${r}`)}
            </Badge>
          )
        },
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
  }, [t, localized, candidates, employees])

  return (
    <div>
      <PageHeader
        title={t('interviews')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon /> {t('newInterview')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={interviews}
        searchKey={'notes' as keyof Interview}
      />
      <InterviewDialog
        interview={editing}
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
