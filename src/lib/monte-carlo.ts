import type { District } from '@/lib/riyadh-data'
import type { Forecast } from '@/lib/forecast'

export type MonteCarloResult = {
  months: number
  simulations: number
  paths: number[][]
  percentiles: {
    p10: number[]
    p25: number[]
    p50: number[]
    p75: number[]
    p90: number[]
  }
  finalDistribution: number[]
  probabilityOfProfit: number
  expectedValue: number
  valueAtRisk5: number
  bestCase: number
  worstCase: number
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function boxMuller(rng: () => number): number {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function returns(series: number[]): number[] {
  const out: number[] = []
  for (let i = 1; i < series.length; i += 1) {
    out.push((series[i] - series[i - 1]) / series[i - 1])
  }
  return out
}

function percentile(sortedValues: number[], q: number): number {
  if (sortedValues.length === 0) return 0
  const pos = (sortedValues.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return sortedValues[lo]
  return sortedValues[lo] + (sortedValues[hi] - sortedValues[lo]) * (pos - lo)
}

export function simulateMonteCarlo(
  district: District,
  forecast: Forecast,
  options: { months?: number; simulations?: number; seed?: number } = {},
): MonteCarloResult {
  const months = options.months ?? 12
  const simulations = options.simulations ?? 500
  const seed = options.seed ?? 1729

  const history = district.pricePerSqmHistory
  const rets = returns(history)
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length
  const variance =
    rets.reduce((acc, r) => acc + (r - mean) ** 2, 0) / rets.length
  const sd = Math.sqrt(variance)

  const attractivenessDrift =
    ((forecast.attractivenessScore - 50) / 100) * 0.004

  const rng = mulberry32(seed)
  const startPrice = forecast.currentPrice
  const paths: number[][] = []
  const finals: number[] = []

  for (let s = 0; s < simulations; s += 1) {
    const path = new Array<number>(months + 1)
    path[0] = startPrice
    let price = startPrice
    for (let m = 1; m <= months; m += 1) {
      const shock = boxMuller(rng) * sd + mean + attractivenessDrift
      price = price * (1 + shock)
      path[m] = price
    }
    paths.push(path)
    finals.push(price)
  }

  const buckets: number[][] = []
  for (let m = 0; m <= months; m += 1) {
    const slice = paths.map((p) => p[m]).sort((a, b) => a - b)
    buckets.push(slice)
  }

  const percentiles = {
    p10: buckets.map((b) => percentile(b, 0.1)),
    p25: buckets.map((b) => percentile(b, 0.25)),
    p50: buckets.map((b) => percentile(b, 0.5)),
    p75: buckets.map((b) => percentile(b, 0.75)),
    p90: buckets.map((b) => percentile(b, 0.9)),
  }

  finals.sort((a, b) => a - b)
  const expectedValue = finals.reduce((a, b) => a + b, 0) / finals.length
  const profitable = finals.filter((v) => v > startPrice).length
  const probabilityOfProfit = (profitable / finals.length) * 100
  const valueAtRisk5 = ((percentile(finals, 0.05) - startPrice) / startPrice) * 100

  return {
    months,
    simulations,
    paths,
    percentiles,
    finalDistribution: finals,
    probabilityOfProfit,
    expectedValue,
    valueAtRisk5,
    bestCase: finals[finals.length - 1],
    worstCase: finals[0],
  }
}
