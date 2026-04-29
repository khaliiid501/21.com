import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type KpiCardProps = {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  className?: string
}

export function KpiCard({ label, value, hint, icon: Icon, className }: KpiCardProps) {
  return (
    <Card className={cn('gap-3 py-5', className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-md">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}
