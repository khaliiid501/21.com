import { ArrowUpRight, Building2, MapPin, Pin, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkline } from '@/components/dashboard/Sparkline'
import type { District } from '@/lib/riyadh-data'
import type { Forecast } from '@/lib/forecast'
import { formatPct, formatSAR } from '@/lib/forecast'
import { cn } from '@/lib/utils'

type DistrictCardProps = {
  district: District
  forecast: Forecast
  selected?: boolean
  pinned?: boolean
  onSelect: (id: string) => void
  onTogglePin?: (id: string) => void
}

const SIGNAL_VARIANT: Record<Forecast['signal'], 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  'شراء قوي': 'success',
  'شراء': 'default',
  'محايد': 'secondary',
  'تقليص': 'warning',
  'بيع': 'destructive',
}

export function DistrictCard({
  district,
  forecast,
  selected,
  pinned,
  onSelect,
  onTogglePin,
}: DistrictCardProps) {
  const growthPositive = forecast.growthRate12m >= 0
  return (
    <Card
      onClick={() => onSelect(district.id)}
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5',
        selected && 'ring-2 ring-primary shadow-md',
      )}
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">حي · منطقة {district.zone}</span>
            </div>
            <h3 className="text-lg font-semibold mt-1">{district.nameAr}</h3>
            <p className="text-xs text-muted-foreground">{district.nameEn}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {onTogglePin ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onTogglePin(district.id)
                }}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  pinned
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                    : 'text-muted-foreground hover:bg-muted',
                )}
                aria-label={pinned ? 'إلغاء التثبيت' : 'تثبيت للمقارنة'}
                aria-pressed={pinned}
              >
                <Pin className="size-3.5" />
              </button>
            ) : null}
            <Badge variant={SIGNAL_VARIANT[forecast.signal]}>{forecast.signal}</Badge>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">سعر المتر الحالي</p>
            <p className="text-xl font-semibold">{formatSAR(forecast.currentPrice)}</p>
            <p
              className={cn(
                'text-xs font-medium flex items-center gap-1 mt-0.5',
                growthPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              <ArrowUpRight className={cn('size-3', !growthPositive && 'rotate-90')} />
              تنبؤ 12 شهر: {formatPct(forecast.growthRate12m)}
            </p>
          </div>
          <Sparkline
            data={district.pricePerSqmHistory}
            strokeClassName={growthPositive ? 'stroke-emerald-500' : 'stroke-rose-500'}
            fillClassName={growthPositive ? 'fill-emerald-500/15' : 'fill-rose-500/15'}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3" />
              درجة الجاذبية
            </span>
            <span className="font-medium">{forecast.attractivenessScore.toFixed(1)} / 100</span>
          </div>
          <Progress
            value={forecast.attractivenessScore}
            indicatorClassName={cn(
              'bg-gradient-to-r',
              forecast.attractivenessScore >= 70
                ? 'from-emerald-500 to-emerald-400'
                : forecast.attractivenessScore >= 50
                  ? 'from-indigo-500 to-blue-400'
                  : 'from-amber-500 to-rose-400',
            )}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Building2 className="size-3" />
            {district.megaProjects.length} مشروع كبرى
          </span>
          <span>ثقة النموذج {forecast.confidence.toFixed(0)}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
