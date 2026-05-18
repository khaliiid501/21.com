import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type KpiCardProps = {
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  icon: LucideIcon
  tone?: 'default' | 'accent' | 'positive' | 'warning'
}

const TONES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'bg-card',
  accent: 'bg-gradient-to-br from-indigo-500/10 via-card to-card',
  positive: 'bg-gradient-to-br from-emerald-500/10 via-card to-card',
  warning: 'bg-gradient-to-br from-amber-500/10 via-card to-card',
}

export function KpiCard({
  label,
  value,
  delta,
  deltaPositive = true,
  icon: Icon,
  tone = 'default',
}: KpiCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', TONES[tone])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {delta ? (
              <p
                className={cn(
                  'text-xs font-medium',
                  deltaPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400',
                )}
              >
                {delta}
              </p>
            ) : null}
          </div>
          <div className="rounded-lg bg-muted/60 p-2">
            <Icon className="size-4 text-foreground/80" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
