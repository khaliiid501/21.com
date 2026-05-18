import { GitCompare, Pin, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Sparkline } from '@/components/dashboard/Sparkline'
import type { District } from '@/lib/riyadh-data'
import type { Forecast } from '@/lib/forecast'
import { formatPct, formatSAR } from '@/lib/forecast'
import { cn } from '@/lib/utils'

type CompareTableProps = {
  pinnedIds: string[]
  forecasts: Forecast[]
  districtMap: Map<string, District>
  onUnpin: (id: string) => void
  onClear: () => void
}

const ROWS: {
  key: string
  label: string
  format: (d: District, f: Forecast) => string | number
  better?: 'higher' | 'lower'
  raw: (d: District, f: Forecast) => number
}[] = [
  {
    key: 'currentPrice',
    label: 'سعر المتر الحالي',
    format: (_d, f) => formatSAR(f.currentPrice),
    raw: (_d, f) => f.currentPrice,
  },
  {
    key: 'predicted12',
    label: 'تنبؤ 12 شهر',
    format: (_d, f) => formatSAR(f.predicted12mPrice),
    raw: (_d, f) => f.predicted12mPrice,
    better: 'higher',
  },
  {
    key: 'growth12',
    label: 'نسبة النمو 12ش',
    format: (_d, f) => formatPct(f.growthRate12m),
    raw: (_d, f) => f.growthRate12m,
    better: 'higher',
  },
  {
    key: 'growth24',
    label: 'نسبة النمو 24ش',
    format: (_d, f) => formatPct(f.growthRate24m),
    raw: (_d, f) => f.growthRate24m,
    better: 'higher',
  },
  {
    key: 'attractiveness',
    label: 'درجة الجاذبية',
    format: (_d, f) => f.attractivenessScore.toFixed(1),
    raw: (_d, f) => f.attractivenessScore,
    better: 'higher',
  },
  {
    key: 'capital',
    label: 'تدفقات رأس المال',
    format: (_d, f) => f.capitalScore.toFixed(0),
    raw: (_d, f) => f.capitalScore,
    better: 'higher',
  },
  {
    key: 'infrastructure',
    label: 'البنية التحتية',
    format: (_d, f) => f.infrastructureScore.toFixed(0),
    raw: (_d, f) => f.infrastructureScore,
    better: 'higher',
  },
  {
    key: 'projects',
    label: 'زخم المشاريع',
    format: (_d, f) => f.projectsScore.toFixed(0),
    raw: (_d, f) => f.projectsScore,
    better: 'higher',
  },
  {
    key: 'volatility',
    label: 'التقلب الشهري',
    format: (_d, f) => `${f.volatility.toFixed(2)}%`,
    raw: (_d, f) => f.volatility,
    better: 'lower',
  },
  {
    key: 'vacancy',
    label: 'نسبة الشغور',
    format: (d, _f) => `${d.vacancyRate.toFixed(1)}%`,
    raw: (d, _f) => d.vacancyRate,
    better: 'lower',
  },
  {
    key: 'population',
    label: 'نمو سكاني سنوي',
    format: (d, _f) => `${d.populationGrowth.toFixed(1)}%`,
    raw: (d, _f) => d.populationGrowth,
    better: 'higher',
  },
  {
    key: 'projectsCount',
    label: 'عدد المشاريع الكبرى',
    format: (d, _f) => d.megaProjects.length,
    raw: (d, _f) => d.megaProjects.length,
    better: 'higher',
  },
]

const SIGNAL_VARIANT: Record<Forecast['signal'], 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  'شراء قوي': 'success',
  'شراء': 'default',
  'محايد': 'secondary',
  'تقليص': 'warning',
  'بيع': 'destructive',
}

export function CompareTable({
  pinnedIds,
  forecasts,
  districtMap,
  onUnpin,
  onClear,
}: CompareTableProps) {
  const pinned = pinnedIds
    .map((id) => {
      const district = districtMap.get(id)
      const forecast = forecasts.find((f) => f.districtId === id)
      if (!district || !forecast) return null
      return { district, forecast }
    })
    .filter((item): item is { district: District; forecast: Forecast } => item !== null)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompare className="size-4" />
              مقارنة الأحياء المثبتة
            </CardTitle>
            <CardDescription>
              ثبّت أي حي من قائمة الترتيب أعلاه لإضافته إلى المقارنة. الأخضر يشير إلى
              الأفضل في الصف، والأحمر إلى الأضعف.
            </CardDescription>
          </div>
          {pinned.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X />
              مسح الكل
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {pinned.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center space-y-2">
            <Pin className="size-5 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              لا توجد أحياء مثبتة. اضغط أيقونة التثبيت على بطاقة أي حي لإضافته للمقارنة.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-start py-3 px-3 text-xs font-medium text-muted-foreground">
                    المؤشر
                  </th>
                  {pinned.map(({ district, forecast }) => (
                    <th key={district.id} className="py-3 px-3 text-start min-w-[180px]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-semibold">{district.nameAr}</p>
                          <Badge variant={SIGNAL_VARIANT[forecast.signal]}>
                            {forecast.signal}
                          </Badge>
                        </div>
                        <button
                          type="button"
                          onClick={() => onUnpin(district.id)}
                          className="rounded-md p-1 hover:bg-muted text-muted-foreground"
                          aria-label={`إزالة ${district.nameAr}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-3 text-xs text-muted-foreground">اتجاه السعر</td>
                  {pinned.map(({ district, forecast }) => (
                    <td key={district.id} className="py-3 px-3">
                      <Sparkline
                        data={district.pricePerSqmHistory}
                        strokeClassName={
                          forecast.growthRate12m >= 0
                            ? 'stroke-emerald-500'
                            : 'stroke-rose-500'
                        }
                        fillClassName={
                          forecast.growthRate12m >= 0
                            ? 'fill-emerald-500/15'
                            : 'fill-rose-500/15'
                        }
                      />
                    </td>
                  ))}
                </tr>
                {ROWS.map((row) => {
                  const raws = pinned.map((item) => row.raw(item.district, item.forecast))
                  const best =
                    row.better === 'higher'
                      ? Math.max(...raws)
                      : row.better === 'lower'
                        ? Math.min(...raws)
                        : null
                  const worst =
                    row.better === 'higher'
                      ? Math.min(...raws)
                      : row.better === 'lower'
                        ? Math.max(...raws)
                        : null
                  return (
                    <tr key={row.key} className="border-b last:border-b-0">
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">
                        {row.label}
                      </td>
                      {pinned.map((item) => {
                        const value = row.raw(item.district, item.forecast)
                        const isBest =
                          best !== null && pinned.length > 1 && value === best && best !== worst
                        const isWorst =
                          worst !== null && pinned.length > 1 && value === worst && best !== worst
                        return (
                          <td
                            key={item.district.id}
                            className={cn(
                              'py-2.5 px-3 text-sm tabular-nums',
                              isBest && 'text-emerald-600 dark:text-emerald-400 font-semibold',
                              isWorst && 'text-rose-600 dark:text-rose-400',
                            )}
                          >
                            {row.format(item.district, item.forecast)}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
