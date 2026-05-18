import { useMemo, useState } from 'react'
import {
  Activity,
  Banknote,
  Building2,
  Filter,
  LineChart,
  MapPin,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DistrictCard } from '@/components/dashboard/DistrictCard'
import { DistrictDetail } from '@/components/dashboard/DistrictDetail'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { RIYADH_DISTRICTS } from '@/lib/riyadh-data'
import { formatPct, formatSAR, rankDistricts } from '@/lib/forecast'

type ZoneFilter = 'الكل' | 'شمال' | 'جنوب' | 'شرق' | 'غرب' | 'وسط'

const ZONE_FILTERS: ZoneFilter[] = ['الكل', 'شمال', 'جنوب', 'شرق', 'غرب', 'وسط']

function App() {
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('الكل')
  const [selectedId, setSelectedId] = useState<string>('aqiq')

  const forecasts = useMemo(() => rankDistricts(RIYADH_DISTRICTS), [])
  const forecastMap = useMemo(
    () => new Map(forecasts.map((f) => [f.districtId, f])),
    [forecasts],
  )
  const districtMap = useMemo(
    () => new Map(RIYADH_DISTRICTS.map((d) => [d.id, d])),
    [],
  )

  const filteredDistricts = useMemo(() => {
    return forecasts.filter((f) => {
      if (zoneFilter === 'الكل') return true
      const d = districtMap.get(f.districtId)
      return d?.zone === zoneFilter
    })
  }, [forecasts, districtMap, zoneFilter])

  const selectedDistrict = districtMap.get(selectedId) ?? RIYADH_DISTRICTS[0]
  const selectedForecast = forecastMap.get(selectedDistrict.id) ?? forecasts[0]

  const aggregate = useMemo(() => {
    const totalCapital = RIYADH_DISTRICTS.reduce(
      (acc, d) => acc + (d.capitalInflow.at(-1) ?? 0),
      0,
    )
    const totalProjects = RIYADH_DISTRICTS.reduce(
      (acc, d) => acc + d.megaProjects.length,
      0,
    )
    const totalBudget = RIYADH_DISTRICTS.reduce(
      (acc, d) =>
        acc + d.megaProjects.reduce((s, p) => s + p.budgetBillionSAR, 0),
      0,
    )
    const avgGrowth =
      forecasts.reduce((acc, f) => acc + f.growthRate12m, 0) / forecasts.length
    const topGrowth = [...forecasts].sort(
      (a, b) => b.growthRate12m - a.growthRate12m,
    )[0]
    return {
      totalCapital,
      totalProjects,
      totalBudget,
      avgGrowth,
      topGrowth,
    }
  }, [forecasts])

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-b from-indigo-500/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-3 py-1 text-xs">
                <Activity className="size-3 text-indigo-500" />
                <span>محرك تنبؤ إحصائي · رؤية ٢٠٣٠</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                لوحة الاستثمار العقاري — الرياض
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                خوارزمية تحلّل البنية التحتية، تدفقات رأس المال، والمشاريع الكبرى عبر
                أحياء الرياض، وتُنتج تنبؤات إحصائية لأسعار المتر المربع.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCcw />
                تحديث البيانات
              </Button>
              <Button size="sm">
                <LineChart />
                تشغيل النموذج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="إجمالي ميزانيات المشاريع"
            value={`${aggregate.totalBudget.toFixed(1)} مليار ر.س`}
            delta={`${aggregate.totalProjects} مشروع كبير`}
            icon={Building2}
            tone="accent"
          />
          <KpiCard
            label="تدفق رأس المال الشهري"
            value={`${aggregate.totalCapital.toFixed(0)} م ر.س`}
            delta="موزّع على الأحياء"
            icon={Banknote}
            tone="positive"
          />
          <KpiCard
            label="متوسط النمو المتوقع (12ش)"
            value={formatPct(aggregate.avgGrowth, 1)}
            delta="مرجح بدرجة الجاذبية"
            deltaPositive={aggregate.avgGrowth >= 0}
            icon={LineChart}
            tone={aggregate.avgGrowth >= 0 ? 'positive' : 'warning'}
          />
          <KpiCard
            label="أعلى نمو متوقع"
            value={
              districtMap.get(aggregate.topGrowth.districtId)?.nameAr ?? '—'
            }
            delta={formatPct(aggregate.topGrowth.growthRate12m)}
            icon={Sparkles}
            tone="accent"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>ترتيب الأحياء حسب درجة الجاذبية</CardTitle>
                    <CardDescription>
                      مرجّح بـ: تدفقات رأس المال 30% · بنية تحتية 25% · مشاريع كبرى 25%
                      · نمو سكاني 15% · شغور 5%.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter className="size-3.5 text-muted-foreground" />
                    {ZONE_FILTERS.map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setZoneFilter(zone)}
                        className={
                          'rounded-md px-2.5 py-1 transition-colors ' +
                          (zoneFilter === zone
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80')
                        }
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDistricts.map((forecast) => {
                    const district = districtMap.get(forecast.districtId)
                    if (!district) return null
                    return (
                      <DistrictCard
                        key={district.id}
                        district={district}
                        forecast={forecast}
                        selected={district.id === selectedId}
                        onSelect={setSelectedId}
                      />
                    )
                  })}
                  {filteredDistricts.length === 0 ? (
                    <div className="md:col-span-2 text-center text-sm text-muted-foreground py-10">
                      لا توجد بيانات للمنطقة المحددة.
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">إشارات النموذج</CardTitle>
                <CardDescription>
                  توزّع الإشارات الناتجة عن خوارزمية التنبؤ.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['شراء قوي', 'شراء', 'محايد', 'تقليص', 'بيع'] as const).map((signal) => {
                  const items = forecasts.filter((f) => f.signal === signal)
                  const pct = (items.length / forecasts.length) * 100
                  return (
                    <div key={signal} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Badge
                            variant={
                              signal === 'شراء قوي'
                                ? 'success'
                                : signal === 'شراء'
                                  ? 'default'
                                  : signal === 'محايد'
                                    ? 'secondary'
                                    : signal === 'تقليص'
                                      ? 'warning'
                                      : 'destructive'
                            }
                          >
                            {signal}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {items.length} حي
                          </span>
                        </span>
                        <span className="text-xs font-medium">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={
                            'h-full rounded-full ' +
                            (signal === 'شراء قوي'
                              ? 'bg-emerald-500'
                              : signal === 'شراء'
                                ? 'bg-indigo-500'
                                : signal === 'محايد'
                                  ? 'bg-slate-400'
                                  : signal === 'تقليص'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500')
                          }
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="size-4" />
                  أفضل ٣ فرص استثمارية
                </CardTitle>
                <CardDescription>وفق درجة الجاذبية المركّبة.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {forecasts.slice(0, 3).map((f, idx) => {
                  const d = districtMap.get(f.districtId)
                  if (!d) return null
                  return (
                    <button
                      key={f.districtId}
                      type="button"
                      onClick={() => setSelectedId(d.id)}
                      className="w-full flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors text-right"
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{d.nameAr}</p>
                        <p className="text-[11px] text-muted-foreground">
                          سعر المتر {formatSAR(f.currentPrice)} ·{' '}
                          نمو {formatPct(f.growthRate12m)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {f.attractivenessScore.toFixed(1)}
                      </span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section>
          <DistrictDetail district={selectedDistrict} forecast={selectedForecast} />
        </section>

        <footer className="text-center text-xs text-muted-foreground pt-4 pb-2">
          البيانات نموذجية للأغراض التحليلية. الخوارزمية: انحدار خطي + متوسط متحرك مرجح + Z-score
          + مؤشر مركّب للجاذبية.
        </footer>
      </main>
    </div>
  )
}

export default App
