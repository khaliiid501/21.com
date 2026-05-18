import { useMemo, useState } from 'react'
import { PieChart, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import type { District } from '@/lib/riyadh-data'
import type { Forecast } from '@/lib/forecast'
import { formatPct, formatSAR } from '@/lib/forecast'
import { buildPortfolio, type RiskAppetite } from '@/lib/portfolio'
import { cn } from '@/lib/utils'

type PortfolioBuilderProps = {
  forecasts: Forecast[]
  districtMap: Map<string, District>
}

const APPETITES: { value: RiskAppetite; label: string; hint: string }[] = [
  { value: 'conservative', label: 'متحفظ', hint: 'وزن أعلى لاستقرار البنية التحتية' },
  { value: 'balanced', label: 'متوازن', hint: 'مزج بين النمو والاستقرار' },
  { value: 'aggressive', label: 'هجومي', hint: 'تركيز على الأحياء عالية النمو' },
]

export function PortfolioBuilder({ forecasts, districtMap }: PortfolioBuilderProps) {
  const [budget, setBudget] = useState(5_000_000)
  const [appetite, setAppetite] = useState<RiskAppetite>('balanced')

  const result = useMemo(
    () => buildPortfolio(budget, forecasts, appetite, 5),
    [budget, forecasts, appetite],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="size-4" />
              محرك توزيع المحفظة
            </CardTitle>
            <CardDescription>
              يوزّع رأس المال على أفضل ٥ أحياء وفق درجة معدّلة للمخاطرة.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Sharpe ≈ {result.sharpeLike.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">الميزانية (ر.س)</label>
            <Input
              type="number"
              min={100_000}
              step={100_000}
              value={budget}
              onChange={(event) => {
                const next = Number(event.target.value)
                setBudget(Number.isFinite(next) && next > 0 ? next : 0)
              }}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs text-muted-foreground">شهية المخاطرة</label>
            <div className="flex flex-wrap gap-2">
              {APPETITES.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={appetite === option.value ? 'default' : 'outline'}
                  onClick={() => setAppetite(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {APPETITES.find((a) => a.value === appetite)?.hint}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">العائد المتوقع</p>
            <p
              className={cn(
                'text-base font-semibold mt-1',
                result.expectedReturnSAR >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {formatSAR(result.expectedReturnSAR)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatPct(result.expectedReturnPct)}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">تقلب المحفظة</p>
            <p className="text-base font-semibold mt-1">
              {result.portfolioVolatility.toFixed(2)}%
            </p>
            <p className="text-[11px] text-muted-foreground">شهرياً</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">القيمة بعد سنة</p>
            <p className="text-base font-semibold mt-1">
              {formatSAR(result.totalBudgetSAR + result.expectedReturnSAR)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              تنبؤ النموذج
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3" />
              التوزيع المقترح
            </span>
            <span>{result.allocations.length} حي</span>
          </div>

          {result.allocations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              لا توجد فرص بدرجة موجبة لهذه الإعدادات.
            </p>
          ) : (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                {result.allocations.map((alloc, idx) => {
                  const tones = [
                    'bg-emerald-500',
                    'bg-indigo-500',
                    'bg-amber-500',
                    'bg-rose-500',
                    'bg-cyan-500',
                  ]
                  return (
                    <div
                      key={alloc.districtId}
                      className={tones[idx % tones.length]}
                      style={{ width: `${alloc.weight * 100}%` }}
                      title={`${districtMap.get(alloc.districtId)?.nameAr}: ${(alloc.weight * 100).toFixed(1)}%`}
                    />
                  )
                })}
              </div>

              <div className="space-y-2">
                {result.allocations.map((alloc, idx) => {
                  const d = districtMap.get(alloc.districtId)
                  if (!d) return null
                  const tones = [
                    'bg-emerald-500',
                    'bg-indigo-500',
                    'bg-amber-500',
                    'bg-rose-500',
                    'bg-cyan-500',
                  ]
                  return (
                    <div
                      key={alloc.districtId}
                      className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3"
                    >
                      <span
                        className={cn(
                          'size-2.5 rounded-full shrink-0',
                          tones[idx % tones.length],
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{d.nameAr}</p>
                          <p className="text-sm font-semibold tabular-nums">
                            {(alloc.weight * 100).toFixed(1)}%
                          </p>
                        </div>
                        <Progress
                          value={alloc.weight * 100}
                          className="h-1.5 mt-1.5"
                          indicatorClassName={tones[idx % tones.length]}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums min-w-[100px] text-end">
                        {formatSAR(alloc.amountSAR)}
                      </div>
                      <div
                        className={cn(
                          'text-xs font-medium tabular-nums min-w-[60px] text-end',
                          alloc.expectedReturnPct >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400',
                        )}
                      >
                        {formatPct(alloc.expectedReturnPct)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
