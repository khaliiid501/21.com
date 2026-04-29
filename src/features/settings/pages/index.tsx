import { useTranslation } from 'react-i18next'
import { MoonIcon, SunIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { useEmployeeStore } from '@/features/employees/store'
import { useDepartmentStore } from '@/features/departments/store'
import { usePositionStore } from '@/features/positions/store'
import { useBranchStore } from '@/features/branches/store'
import { useAttendanceStore } from '@/features/attendance/store'
import {
  useLeaveTypeStore,
  useLeaveRequestStore,
  useLeaveBalanceStore,
} from '@/features/leaves/store'
import {
  useShiftStore,
  useShiftAssignmentStore,
} from '@/features/shifts/store'
import { useHolidayStore } from '@/features/holidays/store'
import {
  useSalaryStore,
  useAllowanceStore,
  useDeductionStore,
  usePayPeriodStore,
  usePayslipStore,
} from '@/features/payroll/store'
import {
  useJobOpeningStore,
  useCandidateStore,
  useInterviewStore,
} from '@/features/recruitment/store'
import { usePerformanceStore } from '@/features/performance/store'
import {
  useTrainingCourseStore,
  useTrainingEnrollmentStore,
} from '@/features/training/store'
import { toast } from '@/components/ui/sonner'

export function SettingsPage() {
  const { t, i18n } = useTranslation(['settings', 'common'])
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const setLocale = useAppStore((s) => s.setLocale)
  const locale = useAppStore((s) => s.locale)

  const resetAll = () => {
    useEmployeeStore.getState().reset()
    useDepartmentStore.getState().reset()
    usePositionStore.getState().reset()
    useBranchStore.getState().reset()
    useAttendanceStore.getState().reset()
    useLeaveTypeStore.getState().reset()
    useLeaveRequestStore.getState().reset()
    useLeaveBalanceStore.getState().reset()
    useShiftStore.getState().reset()
    useShiftAssignmentStore.getState().reset()
    useHolidayStore.getState().reset()
    useSalaryStore.getState().reset()
    useAllowanceStore.getState().reset()
    useDeductionStore.getState().reset()
    usePayPeriodStore.getState().reset()
    usePayslipStore.getState().reset()
    useJobOpeningStore.getState().reset()
    useCandidateStore.getState().reset()
    useInterviewStore.getState().reset()
    usePerformanceStore.getState().reset()
    useTrainingCourseStore.getState().reset()
    useTrainingEnrollmentStore.getState().reset()
    toast.success(t('dataReset'))
  }

  const clearAll = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('hrms:')) localStorage.removeItem(key)
    })
    toast.success(t('dataCleared'))
    setTimeout(() => location.reload(), 700)
  }

  const setLang = (lng: 'en' | 'ar') => {
    void i18n.changeLanguage(lng)
    setLocale(lng)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title={t('title')} description={t('subtitle')} />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('appearance')}</CardTitle>
            <CardDescription>{t('appearanceDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={toggleTheme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              {theme === 'dark' ? t('common:light') : t('common:dark')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('language')}</CardTitle>
            <CardDescription>{t('languageDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant={locale === 'en' ? 'default' : 'outline'}
              onClick={() => setLang('en')}
            >
              English
            </Button>
            <Button
              variant={locale === 'ar' ? 'default' : 'outline'}
              onClick={() => setLang('ar')}
            >
              العربية
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('data')}</CardTitle>
            <CardDescription>{t('dataDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll}>
              <RotateCcwIcon /> {t('resetData')}
            </Button>
            <Button variant="destructive" onClick={clearAll}>
              <Trash2Icon /> {t('clearData')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
