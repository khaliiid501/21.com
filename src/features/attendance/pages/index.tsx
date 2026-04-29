import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO, subDays } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'

import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAttendanceStore } from '@/features/attendance/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import { todayIso } from '@/lib/date'
import type { AttendanceRecord, AttendanceStatus } from '../types'

function statusVariant(status: AttendanceStatus) {
  switch (status) {
    case 'present':
      return 'success' as const
    case 'late':
      return 'warning' as const
    case 'absent':
      return 'destructive' as const
    case 'leave':
      return 'info' as const
  }
}

export function AttendancePage() {
  const { t } = useTranslation(['attendance', 'common'])
  const localized = useLocalizedField()
  const records = useAttendanceStore((s) => s.items)
  const employees = useEmployeeStore((s) => s.items)
  const today = todayIso()

  const last30Days = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) =>
        format(subDays(new Date(), i), 'yyyy-MM-dd')
      ),
    []
  )
  const [historyDate, setHistoryDate] = useState<string>(last30Days[1] ?? today)

  const todayRecords = records.filter((r) => r.date === today)
  const historyRecords = records.filter((r) => r.date === historyDate)

  const columns = useMemo<ColumnDef<AttendanceRecord>[]>(() => {
    return [
      {
        id: 'employee',
        header: t('common:name'),
        accessorFn: (row) => {
          const e = employees.find((e) => e.id === row.employeeId)
          return e ? `${localized(e.firstName)} ${localized(e.lastName)}` : ''
        },
      },
      {
        accessorKey: 'date',
        header: t('common:date'),
        cell: ({ row }) => format(parseISO(row.original.date), 'yyyy-MM-dd'),
      },
      {
        accessorKey: 'checkIn',
        header: t('checkIn'),
        cell: ({ row }) => row.original.checkIn ?? '—',
      },
      {
        accessorKey: 'checkOut',
        header: t('checkOut'),
        cell: ({ row }) => row.original.checkOut ?? '—',
      },
      {
        accessorKey: 'workedHours',
        header: t('workedHours'),
      },
      {
        accessorKey: 'overtime',
        header: t('overtime'),
      },
      {
        accessorKey: 'status',
        header: t('common:status'),
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {t(`status.${row.original.status}`)}
          </Badge>
        ),
      },
    ]
  }, [t, localized, employees])

  const summary = (recs: AttendanceRecord[]) => ({
    present: recs.filter((r) => r.status === 'present').length,
    late: recs.filter((r) => r.status === 'late').length,
    absent: recs.filter((r) => r.status === 'absent').length,
    leave: recs.filter((r) => r.status === 'leave').length,
  })

  const todaySummary = summary(todayRecords)

  return (
    <div>
      <PageHeader title={t('title')} description={t('subtitle')} />

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">{t('today')}</TabsTrigger>
          <TabsTrigger value="history">{t('history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {(['present', 'late', 'absent', 'leave'] as AttendanceStatus[]).map(
              (s) => (
                <Card key={s}>
                  <CardHeader>
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      {t(`status.${s}`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">
                      {todaySummary[s]}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          <DataTable columns={columns} data={todayRecords} searchKey={'date' as keyof AttendanceRecord} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t('common:date')}:</span>
            <Select value={historyDate} onValueChange={setHistoryDate}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {last30Days.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable
            columns={columns}
            data={historyRecords}
            searchKey={'date' as keyof AttendanceRecord}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
