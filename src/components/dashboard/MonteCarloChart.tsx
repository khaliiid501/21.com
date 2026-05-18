import { useMemo } from 'react'
import { Sigma } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { District } from '@/lib/riyadh-data'
import type { Forecast } from '@/lib/forecast'
import { formatPct, formatSAR } from '@/lib/forecast'
import { simulateMonteCarlo } from '@/lib/monte-carlo'
import { cn } from '@/lib/utils'

type MonteCarloChartProps = {
  district: District
  forecast: Forecast
}

export function MonteCarloChart({ district, forecast }: MonteCarloChartProps) {
  const result = useMemo(
    () => simulateMonteCarlo(district, forecast, { simulations: 600 }),
    [district, forecast],
  )

  const { area90, area50, median, sampleLines, gridY, w, h, axisLabels } = useMemo(() => {
    const W = 600
    const H = 220
    const months = result.months
    const stepX = W / months

    const all = [
      ...result.percentiles.p10,
      ...result.percentiles.p90,
    ]
    const min = Math.min(...all) * 0.97
    const max = Math.max(...all) * 1.03

    const scaleY = (value: number) =>
      H - ((value - min) / (max - min)) * H

    const toPath = (series: number[]) =>
      series
        .map((v, i) => `${(i * stepX).toFixed(2)},${scaleY(v).toFixed(2)}`)
        .join(' ')

    const p10 = result.percentiles.p10
    const p25 = result.percentiles.p25
    const p50 = result.percentiles.p50
    const p75 = result.percentiles.p75
    const p90 = result.percentiles.p90

    const area = (lower: number[], upper: number[]) => {
      const upperPath = upper
        .map((v, i) => `${(i * stepX).toFixed(2)},${scaleY(v).toFixed(2)}`)
        .join(' L')
      const lowerPath = lower
        .map((v, i) => `${(i * stepX).toFixed(2)},${scaleY(v).toFixed(2)}`)
        .reverse()
        .join(' L')
      return `M${upperPath} L${lowerPath} Z`
    }

    const sample = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450].map(
      (idx) => result.paths[idx % result.paths.length],
    )

    const grid: number[] = []
    for (let i = 0; i <= 4; i += 1) grid.push(min + ((max - min) / 4) * i)

    return {
      area90: area(p10, p90),
      area50: area(p25, p75),
      median: toPath(p50),
      sampleLines: sample.map(toPath),
      gridY: grid.map((value) => ({ value, y: scaleY(value) })),
      w: W,
      h: H,
      axisLabels: Array.from({ length: months + 1 }, (_, i) => ({
        x: i * stepX,
        label: i === 0 ? 'الآن' : `${i}ش`,
      })),
    }
  }, [result])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sigma className="size-4" />
              محاكاة Monte Carlo — {district.nameAr}
            </CardTitle>
            <CardDescription>
              {result.simulations} مسار محتمل لـ {result.months} شهراً، مولّدة من
              توزيع طبيعي للعوائد الشهرية مع انجراف من درجة الجاذبية.
            </CardDescription>
          </div>
          <Badge
            variant={result.probabilityOfProfit >= 60 ? 'success' : result.probabilityOfProfit >= 40 ? 'warning' : 'destructive'}
          >
            احتمال الربح {result.probabilityOfProfit.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full h-auto">
          {gridY.map((tick) => (
            <g key={tick.value}>
              <line
                x1={0}
                x2={w}
                y1={tick.y}
                y2={tick.y}
                className="stroke-border"
                strokeDasharray="3 4"
                strokeWidth={0.5}
              />
              <text
                x={4}
                y={tick.y - 2}
                className="fill-muted-foreground text-[10px]"
              >
                {formatSAR(tick.value)}
              </text>
            </g>
          ))}

          <path d={area90} className="fill-indigo-500/15" />
          <path d={area50} className="fill-indigo-500/30" />

          {sampleLines.map((points, idx) => (
            <polyline
              key={idx}
              points={points}
              fill="none"
              strokeWidth={0.6}
              className="stroke-indigo-400/40"
            />
          ))}

          <polyline
            points={median}
            fill="none"
            strokeWidth={2.2}
            className="stroke-emerald-500"
            strokeLinecap="round"
          />

          {axisLabels
            .filter((_, i) => i % 3 === 0)
            .map((label) => (
              <text
                key={label.label}
                x={label.x}
                y={h + 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {label.label}
              </text>
            ))}
        </svg>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-indigo-500/30" />
            نطاق 10–90٪
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-indigo-500/60" />
            نطاق 25–75٪
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-emerald-500" />
            الوسيط (P50)
          </span>
        </div>

        <Separator />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">القيمة المتوقعة</p>
            <p className="text-sm font-semibold mt-1">{formatSAR(result.expectedValue)}</p>
            <p
              className={cn(
                'text-[11px] font-medium',
                result.expectedValue >= forecast.currentPrice
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {formatPct(((result.expectedValue - forecast.currentPrice) / forecast.currentPrice) * 100)}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">أفضل سيناريو</p>
            <p className="text-sm font-semibold mt-1 text-emerald-600 dark:text-emerald-400">
              {formatSAR(result.bestCase)}
            </p>
            <p className="text-[11px] text-muted-foreground">قمة المسارات</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">أسوأ سيناريو</p>
            <p className="text-sm font-semibold mt-1 text-rose-600 dark:text-rose-400">
              {formatSAR(result.worstCase)}
            </p>
            <p className="text-[11px] text-muted-foreground">قاع المسارات</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">VaR @ 5%</p>
            <p
              className={cn(
                'text-sm font-semibold mt-1',
                result.valueAtRisk5 >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {formatPct(result.valueAtRisk5)}
            </p>
            <p className="text-[11px] text-muted-foreground">حدّ خسارة محتمل</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
