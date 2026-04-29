import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { useDepartmentStore } from '@/features/departments/store'
import { usePositionStore } from '@/features/positions/store'
import { useBranchStore } from '@/features/branches/store'
import { useEmployeeStore } from '@/features/employees/store'
import { useLocalizedField } from '@/lib/localized'
import type {
  Employee,
  EmploymentType,
  EmployeeStatus,
  Gender,
  MaritalStatus,
} from '@/features/employees/types'

type FormValues = {
  employeeNumber: string
  firstNameEn: string
  firstNameAr: string
  lastNameEn: string
  lastNameAr: string
  email: string
  phone: string
  departmentId: string
  positionId: string
  managerId: string
  branchId: string
  hireDate: string
  employmentType: EmploymentType
  status: EmployeeStatus
  nationalId: string
  dateOfBirth: string
  gender: Gender
  maritalStatus: MaritalStatus
  address: string
  salary: number
}

type EmployeeFormProps = {
  employee?: Employee
  onSuccess: () => void
}

export function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  const { t } = useTranslation(['employees', 'common'])
  const localized = useLocalizedField()

  const departments = useDepartmentStore((s) => s.items)
  const positions = usePositionStore((s) => s.items)
  const branches = useBranchStore((s) => s.items)
  const employees = useEmployeeStore((s) => s.items)
  const addEmployee = useEmployeeStore((s) => s.add)
  const updateEmployee = useEmployeeStore((s) => s.update)

  const defaults: FormValues = {
    employeeNumber: employee?.employeeNumber ?? '',
    firstNameEn: employee?.firstName.en ?? '',
    firstNameAr: employee?.firstName.ar ?? '',
    lastNameEn: employee?.lastName.en ?? '',
    lastNameAr: employee?.lastName.ar ?? '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    departmentId: employee?.departmentId ?? departments[0]?.id ?? '',
    positionId: employee?.positionId ?? positions[0]?.id ?? '',
    managerId: employee?.managerId ?? '',
    branchId: employee?.branchId ?? branches[0]?.id ?? '',
    hireDate: employee?.hireDate ?? '',
    employmentType: employee?.employmentType ?? 'full-time',
    status: employee?.status ?? 'active',
    nationalId: employee?.nationalId ?? '',
    dateOfBirth: employee?.dateOfBirth ?? '',
    gender: employee?.gender ?? 'male',
    maritalStatus: employee?.maritalStatus ?? 'single',
    address: employee?.address ?? '',
    salary: employee?.salary ?? 0,
  }

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: defaults,
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload = {
      employeeNumber: data.employeeNumber,
      firstName: { en: data.firstNameEn, ar: data.firstNameAr },
      lastName: { en: data.lastNameEn, ar: data.lastNameAr },
      email: data.email,
      phone: data.phone,
      departmentId: data.departmentId,
      positionId: data.positionId,
      managerId: data.managerId || undefined,
      branchId: data.branchId,
      hireDate: data.hireDate,
      employmentType: data.employmentType,
      status: data.status,
      nationalId: data.nationalId,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      maritalStatus: data.maritalStatus,
      address: data.address,
      salary: Number(data.salary),
    }
    if (employee) {
      updateEmployee(employee.id, payload)
    } else {
      addEmployee(payload)
    }
    onSuccess()
  }

  const selectField = (name: keyof FormValues): string => {
    const v = watch(name)
    return v == null ? '' : String(v)
  }

  const employmentTypes: EmploymentType[] = [
    'full-time',
    'part-time',
    'contract',
    'intern',
  ]
  const statuses: EmployeeStatus[] = ['active', 'on-leave', 'terminated']
  const genders: Gender[] = ['male', 'female']
  const maritals: MaritalStatus[] = ['single', 'married', 'divorced', 'widowed']

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('fields.employeeNumber')}</Label>
          <Input {...register('employeeNumber', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>{t('fields.email')}</Label>
          <Input type="email" {...register('email', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>{`${t('fields.firstName')} (EN)`}</Label>
          <Input {...register('firstNameEn', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>{`${t('fields.firstName')} (AR)`}</Label>
          <Input dir="rtl" {...register('firstNameAr', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>{`${t('fields.lastName')} (EN)`}</Label>
          <Input {...register('lastNameEn', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>{`${t('fields.lastName')} (AR)`}</Label>
          <Input dir="rtl" {...register('lastNameAr', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>{t('fields.phone')}</Label>
          <Input {...register('phone')} />
        </div>
        <div className="space-y-2">
          <Label>{t('fields.nationalId')}</Label>
          <Input {...register('nationalId')} />
        </div>
        <div className="space-y-2">
          <Label>{t('fields.department')}</Label>
          <Select
            value={selectField('departmentId')}
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
          <Label>{t('fields.position')}</Label>
          <Select
            value={selectField('positionId')}
            onValueChange={(v) => setValue('positionId', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {localized(p.title)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('fields.manager')}</Label>
          <Select
            value={selectField('managerId') || '__none__'}
            onValueChange={(v) => setValue('managerId', v === '__none__' ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t('noManager')}</SelectItem>
              {employees
                .filter((e) => e.id !== employee?.id)
                .map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {localized(e.firstName)} {localized(e.lastName)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('fields.branch')}</Label>
          <Select
            value={selectField('branchId')}
            onValueChange={(v) => setValue('branchId', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {localized(b.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('fields.hireDate')}</Label>
          <Input type="date" {...register('hireDate', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>{t('fields.dateOfBirth')}</Label>
          <Input type="date" {...register('dateOfBirth')} />
        </div>
        <div className="space-y-2">
          <Label>{t('fields.employmentType')}</Label>
          <Select
            value={selectField('employmentType')}
            onValueChange={(v) => setValue('employmentType', v as EmploymentType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((et) => (
                <SelectItem key={et} value={et}>
                  {t(`employmentType.${et}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('fields.status')}</Label>
          <Select
            value={selectField('status')}
            onValueChange={(v) => setValue('status', v as EmployeeStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((st) => (
                <SelectItem key={st} value={st}>
                  {t(`status.${st}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('fields.gender')}</Label>
          <Select
            value={selectField('gender')}
            onValueChange={(v) => setValue('gender', v as Gender)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {genders.map((g) => (
                <SelectItem key={g} value={g}>
                  {t(`gender.${g}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('fields.maritalStatus')}</Label>
          <Select
            value={selectField('maritalStatus')}
            onValueChange={(v) => setValue('maritalStatus', v as MaritalStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {maritals.map((m) => (
                <SelectItem key={m} value={m}>
                  {t(`marital.${m}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('fields.salary')}</Label>
          <Input
            type="number"
            min="0"
            step="100"
            {...register('salary', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>{t('fields.address')}</Label>
          <Input {...register('address')} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>
          {t('common:cancel')}
        </Button>
        <Button type="submit">{t('common:save')}</Button>
      </DialogFooter>
    </form>
  )
}
