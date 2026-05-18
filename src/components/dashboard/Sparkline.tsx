import { cn } from '@/lib/utils'

type SparklineProps = {
  data: number[]
  width?: number
  height?: number
  className?: string
  strokeClassName?: string
  fillClassName?: string
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  className,
  strokeClassName = 'stroke-primary',
  fillClassName = 'fill-primary/15',
}: SparklineProps) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const points = data
    .map((value, index) => {
      const x = index * stepX
      const y = height - ((value - min) / range) * height
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  const areaPath = `M0,${height} L${points.replaceAll(' ', ' L')} L${width},${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      <path d={areaPath} className={fillClassName} />
      <polyline
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className={strokeClassName}
      />
    </svg>
  )
}
