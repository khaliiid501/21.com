import { Activity, Banknote, Briefcase, Gauge, Sparkles, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ForecastChart } from '@/components/dashboard/ForecastChart'
import type { District } from '@/lib/riyadh-data'
import type { Forecast } from '@/lib/forecast'
import { formatPct, formatSAR } from '@/lib/forecast'
import { cn } from '@/lib/utils'

type DistrictDetailProps = {
  district: District
  forecast: Forecast
}

function ScoreRow({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: number
  hint?: string
  icon: typeof Activity
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-foreground/80">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className="font-semibold">{value.toFixed(1)}</span>
      </div>
      <Progress
        value={value}
        indicatorClassName={cn(
          value >= 70
            ? 'bg-emerald-500'
            : value >= 50
              ? 'bg-indigo-500'
              : 'bg-amber-500',
        )}
      />
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function DistrictDetail({ district, forecast }: DistrictDetailProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">تحليل مفصّل</p>
            <CardTitle className="text-2xl mt-1">{district.nameAr}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {district.nameEn} · منطقة {district.zone}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs">
              ثقة النموذج {forecast.confidence.toFixed(0)}%
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Z-score: {forecast.zScore.toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">السعر الحالي</p>
            <p className="text-base font-semibold mt-1">
              {formatSAR(forecast.currentPrice)}
            </p>
            <p className="text-[11px] text-muted-foreground">/ متر مربع</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">تنبؤ 12 شهر</p>
            <p className="text-base font-semibold mt-1">
              {formatSAR(forecast.predicted12mPrice)}
            </p>
            <p
              className={cn(
                'text-[11px] font-medium',
                forecast.growthRate12m >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {formatPct(forecast.growthRate12m)}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">تنبؤ 24 شهر</p>
            <p className="text-base font-semibold mt-1">
              {formatSAR(forecast.predicted24mPrice)}
            </p>
            <p
              className={cn(
                'text-[11px] font-medium',
                forecast.growthRate24m >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {formatPct(forecast.growthRate24m)}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">التقلب الشهري</p>
            <p className="text-base font-semibold mt-1">
              {forecast.volatility.toFixed(2)}%
            </p>
            <p className="text-[11px] text-muted-foreground">
              ميل خطي {forecast.trendSlope.toFixed(1)}
            </p>
          </div>
        </div>

        <ForecastChart district={district} forecast={forecast} />

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <ScoreRow
            label="درجة البنية التحتية"
            value={forecast.infrastructureScore}
            icon={Gauge}
            hint={`مترو ${district.infrastructure.metroAccess} · طرق ${district.infrastructure.roadsQuality} · مرافق متنوعة`}
          />
          <ScoreRow
            label="تدفقات رأس المال"
            value={forecast.capitalScore}
            icon={Banknote}
            hint={`آخر تدفق ${district.capitalInflow.at(-1)} مليون ر.س / شهر`}
          />
          <ScoreRow
            label="زخم المشاريع الكبرى"
            value={forecast.projectsScore}
            icon={Briefcase}
            hint={`${district.megaProjects.length} مشروع · إجمالي ميزانية ${district.megaProjects
              .reduce((acc, p) => acc + p.budgetBillionSAR, 0)
              .toFixed(1)} مليار ر.س`}
          />
          <ScoreRow
            label="درجة الجاذبية الكلية"
            value={forecast.attractivenessScore}
            icon={Sparkles}
            hint={`نمو سكاني ${district.populationGrowth.toFixed(1)}% · شغور ${district.vacancyRate.toFixed(1)}%`}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Briefcase className="size-4" />
            المشاريع الكبرى في النطاق
          </h4>
          <div className="space-y-2">
            {district.megaProjects.map((project) => (
              <div
                key={project.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
              >
                <div className="space-y-1 min-w-[180px]">
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    ميزانية {project.budgetBillionSAR} مليار ر.س
                  </p>
                </div>
                <div className="flex-1 min-w-[180px] max-w-sm space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>الإنجاز</span>
                    <span className="font-medium text-foreground">{project.completion}%</span>
                  </div>
                  <Progress
                    value={project.completion}
                    indicatorClassName="bg-gradient-to-r from-indigo-500 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <Users className="size-4" /> ملخص الخوارزمية
          </p>
          <p className="text-muted-foreground leading-relaxed">
            دمج النموذج: انحدار خطي على 12 شهراً من الأسعار + متوسط متحرك مرجح + Z-score
            للعائد الشهري، مع وزن مركّب لتدفقات رأس المال ({forecast.capitalScore.toFixed(0)}/100)،
            البنية التحتية ({forecast.infrastructureScore.toFixed(0)}/100) وزخم المشاريع
            ({forecast.projectsScore.toFixed(0)}/100). الإشارة الناتجة:{' '}
            <span className="font-semibold text-foreground">{forecast.signal}</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
