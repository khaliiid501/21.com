import { useMemo } from 'react'

import type { District } from '@/lib/riyadh-data'
import type { Forecast } from '@/lib/forecast'
import { formatSAR } from '@/lib/forecast'

type ForecastChartProps = {
  district: District
  forecast: Forecast
}

export function ForecastChart({ district, forecast }: ForecastChartProps) {
  const { points, predicted, gridY, minPrice, maxPrice, historyEndX } = useMemo(() => {
    const history = district.pricePerSqmHistory
    const futureMonths = 12
    const totalMonths = history.length + futureMonths

    const slopePerMonth =
      (forecast.predicted12mPrice - forecast.currentPrice) / futureMonths
    const future: number[] = []
    for (let i = 1; i <= futureMonths; i += 1) {
      future.push(forecast.currentPrice + slopePerMonth * i)
    }
    const all = [...history, ...future]
    const min = Math.min(...all) * 0.95
    const max = Math.max(...all) * 1.05
    const w = 600
    const h = 220
    const stepX = w / (totalMonths - 1)

    const toPoint = (value: number, idx: number) => {
      const x = idx * stepX
      const y = h - ((value - min) / (max - min)) * h
      return `${x.toFixed(2)},${y.toFixed(2)}`
    }

    const historyPoints = history.map((v, i) => toPoint(v, i)).join(' ')
    const futurePoints = [
      toPoint(forecast.currentPrice, history.length - 1),
      ...future.map((v, i) => toPoint(v, history.length + i)),
    ].join(' ')

    const grid: number[] = []
    for (let i = 0; i <= 4; i += 1) {
      grid.push(min + ((max - min) / 4) * i)
    }

    return {
      points: historyPoints,
      predicted: futurePoints,
      gridY: grid,
      minPrice: min,
      maxPrice: max,
      historyEndX: (history.length - 1) * stepX,
    }
  }, [district, forecast])

  return (
    <div className="w-full">
      <svg viewBox="0 0 600 240" className="w-full h-auto" aria-label="مخطط التنبؤ السعري">
        <defs>
          <linearGradient id="historyGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" className="text-indigo-500" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-indigo-500" />
          </linearGradient>
          <linearGradient id="predictedGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className="text-emerald-500" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-emerald-500" />
          </linearGradient>
        </defs>

        {gridY.map((value, i) => {
          const y = 220 - ((value - minPrice) / (maxPrice - minPrice)) * 220
          return (
            <g key={i}>
              <line
                x1={0}
                x2={600}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeDasharray="3 4"
                strokeWidth={0.5}
              />
              <text
                x={4}
                y={y - 3}
                className="fill-muted-foreground text-[10px]"
              >
                {formatSAR(value)}
              </text>
            </g>
          )
        })}

        <line
          x1={historyEndX}
          x2={historyEndX}
          y1={0}
          y2={220}
          className="stroke-muted-foreground"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        <text
          x={historyEndX + 4}
          y={14}
          className="fill-muted-foreground text-[10px]"
        >
          الآن
        </text>

        <polygon
          points={`0,220 ${points} ${historyEndX},220`}
          fill="url(#historyGradient)"
        />
        <polyline
          points={points}
          fill="none"
          strokeWidth={2}
          className="stroke-indigo-500"
          strokeLinejoin="round"
        />

        <polygon
          points={`${historyEndX},220 ${predicted} 600,220`}
          fill="url(#predictedGradient)"
        />
        <polyline
          points={predicted}
          fill="none"
          strokeWidth={2}
          strokeDasharray="5 4"
          className="stroke-emerald-500"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-indigo-500" /> تاريخي (12 شهر)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" /> تنبؤ النموذج (12 شهر)
        </span>
      </div>
    </div>
  )
}
