import type { District } from '@/lib/riyadh-data'

export type Forecast = {
  districtId: string
  currentPrice: number
  predicted12mPrice: number
  predicted24mPrice: number
  growthRate12m: number
  growthRate24m: number
  trendSlope: number
  volatility: number
  zScore: number
  confidence: number
  infrastructureScore: number
  capitalScore: number
  projectsScore: number
  attractivenessScore: number
  signal: 'شراء قوي' | 'شراء' | 'محايد' | 'تقليص' | 'بيع'
}

function linearRegression(series: number[]): { slope: number; intercept: number } {
  const n = series.length
  const xMean = (n - 1) / 2
  const yMean = series.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i += 1) {
    num += (i - xMean) * (series[i] - yMean)
    den += (i - xMean) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  return { slope, intercept: yMean - slope * xMean }
}

function weightedMovingAverage(series: number[], window = 4): number {
  const slice = series.slice(-window)
  let weightedSum = 0
  let weightTotal = 0
  slice.forEach((value, index) => {
    const weight = index + 1
    weightedSum += value * weight
    weightTotal += weight
  })
  return weightedSum / weightTotal
}

function stdDev(series: number[]): number {
  const mean = series.reduce((a, b) => a + b, 0) / series.length
  const variance =
    series.reduce((acc, value) => acc + (value - mean) ** 2, 0) / series.length
  return Math.sqrt(variance)
}

function returns(series: number[]): number[] {
  const out: number[] = []
  for (let i = 1; i < series.length; i += 1) {
    out.push((series[i] - series[i - 1]) / series[i - 1])
  }
  return out
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50
  return ((value - min) / (max - min)) * 100
}

function infrastructureCompositeScore(d: District): number {
  const infra = d.infrastructure
  const weights = {
    metroAccess: 0.22,
    roadsQuality: 0.18,
    schools: 0.15,
    hospitals: 0.15,
    malls: 0.15,
    parks: 0.15,
  }
  return (
    infra.metroAccess * weights.metroAccess +
    infra.roadsQuality * weights.roadsQuality +
    infra.schools * weights.schools +
    infra.hospitals * weights.hospitals +
    infra.malls * weights.malls +
    infra.parks * weights.parks
  )
}

function projectsCompositeScore(d: District): number {
  if (d.megaProjects.length === 0) return 0
  const budgetSum = d.megaProjects.reduce((acc, p) => acc + p.budgetBillionSAR, 0)
  const avgCompletion =
    d.megaProjects.reduce((acc, p) => acc + p.completion, 0) / d.megaProjects.length
  const budgetScore = Math.min(100, (budgetSum / 250) * 100)
  const momentum = 100 - Math.abs(50 - avgCompletion) * 1.4
  return budgetScore * 0.65 + Math.max(0, momentum) * 0.35
}

function capitalCompositeScore(d: District): number {
  const inflow = d.capitalInflow
  const { slope } = linearRegression(inflow)
  const latest = inflow[inflow.length - 1]
  const slopeIntensity = (slope / Math.max(latest, 1)) * 100 * 6
  const magnitudeScore = Math.min(100, (latest / 30))
  return Math.max(0, Math.min(100, slopeIntensity * 0.55 + magnitudeScore * 0.45))
}

export function buildForecast(d: District): Forecast {
  const history = d.pricePerSqmHistory
  const { slope, intercept } = linearRegression(history)
  const lastIndex = history.length - 1
  const currentPrice = history[lastIndex]
  const regressionLast = intercept + slope * lastIndex
  const wma = weightedMovingAverage(history, 4)

  const monthlyReturns = returns(history)
  const volatility = stdDev(monthlyReturns) * 100
  const meanReturn =
    monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length
  const lastReturn = monthlyReturns[monthlyReturns.length - 1]
  const zScore = volatility === 0 ? 0 : (lastReturn - meanReturn) / (volatility / 100)

  const infrastructureScore = infrastructureCompositeScore(d)
  const projectsScore = projectsCompositeScore(d)
  const capitalScore = capitalCompositeScore(d)

  const populationBoost = normalize(d.populationGrowth, 1, 15)
  const vacancyDrag = normalize(d.vacancyRate, 0, 15)

  const attractivenessScore =
    infrastructureScore * 0.25 +
    capitalScore * 0.3 +
    projectsScore * 0.25 +
    populationBoost * 0.15 +
    (100 - vacancyDrag) * 0.05

  const trendComponent12 = slope * 12
  const wmaPull12 = (wma - currentPrice) * 0.35
  const attractivenessLift12 =
    currentPrice * ((attractivenessScore - 50) / 100) * 0.18
  const regressionDrift12 = (regressionLast - currentPrice) * 0.25

  const predicted12mPrice = Math.max(
    0,
    currentPrice +
      trendComponent12 +
      wmaPull12 +
      attractivenessLift12 +
      regressionDrift12,
  )

  const trendComponent24 = slope * 24
  const attractivenessLift24 =
    currentPrice * ((attractivenessScore - 50) / 100) * 0.38
  const predicted24mPrice = Math.max(
    0,
    currentPrice + trendComponent24 + attractivenessLift24 + regressionDrift12 * 1.4,
  )

  const growthRate12m = ((predicted12mPrice - currentPrice) / currentPrice) * 100
  const growthRate24m = ((predicted24mPrice - currentPrice) / currentPrice) * 100

  const confidence = Math.max(
    35,
    Math.min(96, 92 - volatility * 5 + (capitalScore - 50) * 0.2),
  )

  let signal: Forecast['signal']
  if (growthRate12m >= 18 && attractivenessScore >= 65) signal = 'شراء قوي'
  else if (growthRate12m >= 8) signal = 'شراء'
  else if (growthRate12m >= 0) signal = 'محايد'
  else if (growthRate12m >= -8) signal = 'تقليص'
  else signal = 'بيع'

  return {
    districtId: d.id,
    currentPrice,
    predicted12mPrice,
    predicted24mPrice,
    growthRate12m,
    growthRate24m,
    trendSlope: slope,
    volatility,
    zScore,
    confidence,
    infrastructureScore,
    capitalScore,
    projectsScore,
    attractivenessScore,
    signal,
  }
}

export function rankDistricts(districts: District[]): Forecast[] {
  return districts
    .map(buildForecast)
    .sort((a, b) => b.attractivenessScore - a.attractivenessScore)
}

export function simulateNextMonth(districts: District[]): District[] {
  return districts.map((d) => {
    const history = d.pricePerSqmHistory
    const lastPrice = history[history.length - 1]
    const prevPrice = history[history.length - 2] ?? lastPrice
    const priceMomentum = (lastPrice - prevPrice) / prevPrice
    const priceJitter = (Math.random() - 0.45) * 0.04
    const nextPrice = Math.max(
      1,
      Math.round(lastPrice * (1 + priceMomentum + priceJitter)),
    )

    const inflow = d.capitalInflow
    const lastInflow = inflow[inflow.length - 1]
    const prevInflow = inflow[inflow.length - 2] ?? lastInflow
    const inflowMomentum = (lastInflow - prevInflow) / prevInflow
    const inflowJitter = (Math.random() - 0.45) * 0.08
    const nextInflow = Math.max(
      1,
      Math.round(lastInflow * (1 + inflowMomentum + inflowJitter)),
    )

    return {
      ...d,
      pricePerSqmHistory: [...history, nextPrice],
      capitalInflow: [...inflow, nextInflow],
      megaProjects: d.megaProjects.map((p) => ({
        ...p,
        completion: Math.min(100, Math.round((p.completion + Math.random() * 1.5) * 10) / 10),
      })),
    }
  })
}

export function formatSAR(value: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPct(value: number, digits = 1): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}
