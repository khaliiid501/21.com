import type { Forecast } from '@/lib/forecast'

export type RiskAppetite = 'conservative' | 'balanced' | 'aggressive'

export type Allocation = {
  districtId: string
  weight: number
  amountSAR: number
  expectedReturnSAR: number
  expectedReturnPct: number
}

export type PortfolioResult = {
  allocations: Allocation[]
  totalBudgetSAR: number
  expectedReturnSAR: number
  expectedReturnPct: number
  portfolioVolatility: number
  sharpeLike: number
}

const RISK_FREE_RATE = 4

function scoreForAppetite(forecast: Forecast, appetite: RiskAppetite): number {
  const base = forecast.attractivenessScore
  const growth = forecast.growthRate12m
  const vol = forecast.volatility

  if (appetite === 'conservative') {
    return base * 0.55 + Math.max(0, growth) * 0.45 - vol * 3.5
  }
  if (appetite === 'aggressive') {
    return base * 0.35 + Math.max(0, growth) * 1.35 - vol * 0.6
  }
  return base * 0.5 + Math.max(0, growth) * 0.85 - vol * 1.6
}

export function buildPortfolio(
  budget: number,
  forecasts: Forecast[],
  appetite: RiskAppetite = 'balanced',
  topN = 5,
): PortfolioResult {
  if (budget <= 0 || forecasts.length === 0) {
    return {
      allocations: [],
      totalBudgetSAR: budget,
      expectedReturnSAR: 0,
      expectedReturnPct: 0,
      portfolioVolatility: 0,
      sharpeLike: 0,
    }
  }

  const scored = forecasts
    .map((f) => ({ forecast: f, score: scoreForAppetite(f, appetite) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)

  if (scored.length === 0) {
    return {
      allocations: [],
      totalBudgetSAR: budget,
      expectedReturnSAR: 0,
      expectedReturnPct: 0,
      portfolioVolatility: 0,
      sharpeLike: 0,
    }
  }

  const scoreSum = scored.reduce((acc, item) => acc + item.score, 0)

  const allocations: Allocation[] = scored.map((item) => {
    const weight = item.score / scoreSum
    const amount = budget * weight
    const returnPct = item.forecast.growthRate12m
    return {
      districtId: item.forecast.districtId,
      weight,
      amountSAR: amount,
      expectedReturnSAR: amount * (returnPct / 100),
      expectedReturnPct: returnPct,
    }
  })

  const expectedReturnSAR = allocations.reduce(
    (acc, a) => acc + a.expectedReturnSAR,
    0,
  )
  const expectedReturnPct = (expectedReturnSAR / budget) * 100

  const portfolioVolatility = Math.sqrt(
    allocations.reduce((acc, a) => {
      const f = scored.find((s) => s.forecast.districtId === a.districtId)!.forecast
      return acc + (a.weight ** 2) * (f.volatility ** 2)
    }, 0),
  )

  const sharpeLike =
    portfolioVolatility === 0
      ? 0
      : (expectedReturnPct - RISK_FREE_RATE) / portfolioVolatility

  return {
    allocations,
    totalBudgetSAR: budget,
    expectedReturnSAR,
    expectedReturnPct,
    portfolioVolatility,
    sharpeLike,
  }
}
