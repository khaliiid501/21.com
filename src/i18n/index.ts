import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './en/common.json'
import enDashboard from './en/dashboard.json'
import enEmployees from './en/employees.json'
import enDepartments from './en/departments.json'
import enPositions from './en/positions.json'
import enBranches from './en/branches.json'
import enAttendance from './en/attendance.json'
import enLeaves from './en/leaves.json'
import enShifts from './en/shifts.json'
import enHolidays from './en/holidays.json'
import enPayroll from './en/payroll.json'
import enRecruitment from './en/recruitment.json'
import enPerformance from './en/performance.json'
import enTraining from './en/training.json'
import enSettings from './en/settings.json'

import arCommon from './ar/common.json'
import arDashboard from './ar/dashboard.json'
import arEmployees from './ar/employees.json'
import arDepartments from './ar/departments.json'
import arPositions from './ar/positions.json'
import arBranches from './ar/branches.json'
import arAttendance from './ar/attendance.json'
import arLeaves from './ar/leaves.json'
import arShifts from './ar/shifts.json'
import arHolidays from './ar/holidays.json'
import arPayroll from './ar/payroll.json'
import arRecruitment from './ar/recruitment.json'
import arPerformance from './ar/performance.json'
import arTraining from './ar/training.json'
import arSettings from './ar/settings.json'

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    employees: enEmployees,
    departments: enDepartments,
    positions: enPositions,
    branches: enBranches,
    attendance: enAttendance,
    leaves: enLeaves,
    shifts: enShifts,
    holidays: enHolidays,
    payroll: enPayroll,
    recruitment: enRecruitment,
    performance: enPerformance,
    training: enTraining,
    settings: enSettings,
  },
  ar: {
    common: arCommon,
    dashboard: arDashboard,
    employees: arEmployees,
    departments: arDepartments,
    positions: arPositions,
    branches: arBranches,
    attendance: arAttendance,
    leaves: arLeaves,
    shifts: arShifts,
    holidays: arHolidays,
    payroll: arPayroll,
    recruitment: arRecruitment,
    performance: arPerformance,
    training: arTraining,
    settings: arSettings,
  },
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    defaultNS: 'common',
    ns: Object.keys(resources.en),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'hrms:locale',
    },
  })

export default i18n
