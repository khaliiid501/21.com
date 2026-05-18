import { useMemo } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { District } from '@/lib/riyadh-data'
import type { Forecast } from '@/lib/forecast'

type RiskReturnScatterProps = {
  forecasts: Forecast[]
  districtMap: Map<string, District>
  selectedId: string
  onSelect: (id: string) => void
}

export function RiskReturnScatter({
  forecasts,
  districtMap,
  selectedId,
  onSelect,
}: RiskReturnScatterProps) {
  const { points, xTicks, yTicks, w, h, pad } = useMemo(() => {
    const W = 640
    const H = 320
    const P = { top: 16, right: 16, bottom: 32, left: 44 }

    const xs = forecasts.map((f) => f.volatility)
    const ys = forecasts.map((f) => f.growthRate12m)
    const xMin = Math.min(0, ...xs)
    const xMax = Math.max(...xs) * 1.1 || 1
    const yMin = Math.min(0, ...ys) * 1.1
    const yMax = Math.max(...ys) * 1.1 || 1

    const innerW = W - P.left - P.right
    const innerH = H - P.top - P.bottom

    const scaleX = (v: number) =>
      P.left + ((v - xMin) / (xMax - xMin)) * innerW
    const scaleY = (v: number) =>
      P.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH

    const mapped = forecasts.map((f) => {
      const district = districtMap.get(f.districtId)
      return {
        id: f.districtId,
        name: district?.nameAr ?? '',
        x: scaleX(f.volatility),
        y: scaleY(f.growthRate12m),
        radius: 6 + (f.attractivenessScore / 100) * 12,
        attractiveness: f.attractivenessScore,
        signal: f.signal,
      }
    })

    const x: number[] = []
    for (let i = 0; i <= 4; i += 1) x.push(xMin + ((xMax - xMin) / 4) * i)
    const y: number[] = []
    for (let i = 0; i <= 4; i += 1) y.push(yMin + ((yMax - yMin) / 4) * i)

    return {
      points: mapped,
      xTicks: x.map((value) => ({ value, x: scaleX(value) })),
      yTicks: y.map((value) => ({ value, y: scaleY(value) })),
      w: W,
      h: H,
      pad: P,
    }
  }, [forecasts, districtMap])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">خريطة المخاطرة مقابل العائد</CardTitle>
        <CardDescription>
          المحور الأفقي: التقلب الشهري للسعر · العمودي: النمو المتوقع 12 شهراً ·
          حجم الفقاعة: درجة الجاذبية.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <line
            x1={pad.left}
            x2={w - pad.right}
            y1={h - pad.bottom}
            y2={h - pad.bottom}
            className="stroke-border"
          />
          <line
            x1={pad.left}
            x2={pad.left}
            y1={pad.top}
            y2={h - pad.bottom}
            className="stroke-border"
          />

          {xTicks.map((tick) => (
            <g key={`x-${tick.value}`}>
              <line
                x1={tick.x}
                x2={tick.x}
                y1={pad.top}
                y2={h - pad.bottom}
                className="stroke-border"
                strokeDasharray="2 4"
                strokeWidth={0.5}
              />
              <text
                x={tick.x}
                y={h - pad.bottom + 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {tick.value.toFixed(1)}%
              </text>
            </g>
          ))}
          {yTicks.map((tick) => (
            <g key={`y-${tick.value}`}>
              <line
                x1={pad.left}
                x2={w - pad.right}
                y1={tick.y}
                y2={tick.y}
                className="stroke-border"
                strokeDasharray="2 4"
                strokeWidth={0.5}
              />
              <text
                x={pad.left - 6}
                y={tick.y + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {tick.value.toFixed(1)}%
              </text>
            </g>
          ))}

          {points.map((point) => {
            const isSelected = point.id === selectedId
            return (
              <g
                key={point.id}
                className="cursor-pointer"
                onClick={() => onSelect(point.id)}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.radius}
                  className={
                    point.signal === 'شراء قوي'
                      ? 'fill-emerald-500/30 stroke-emerald-500'
                      : point.signal === 'شراء'
                        ? 'fill-indigo-500/30 stroke-indigo-500'
                        : point.signal === 'محايد'
                          ? 'fill-slate-400/30 stroke-slate-400'
                          : point.signal === 'تقليص'
                            ? 'fill-amber-500/30 stroke-amber-500'
                            : 'fill-rose-500/30 stroke-rose-500'
                  }
                  strokeWidth={isSelected ? 2.5 : 1.2}
                />
                <text
                  x={point.x}
                  y={point.y - point.radius - 4}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium pointer-events-none"
                >
                  {point.name}
                </text>
              </g>
            )
          })}
        </svg>
      </CardContent>
    </Card>
  )
}
