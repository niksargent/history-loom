import type { Period } from '../types/domain'
import { clamp, formatPopulationCompact } from './format'

export interface PopulationChartPoint {
  periodId: string
  rangeLabel: string
  x: number
  y: number
  value: number
}

export interface PopulationChartSeries {
  scope: string
  points: PopulationChartPoint[]
  selectedPoint: PopulationChartPoint
}

export interface PopulationComparisonModel {
  sameHistory: boolean
  source: PopulationChartSeries
  target: PopulationChartSeries
  maxValue: number
  minValue: number
  maxLabel: string
  minLabel: string
  interpretation: string
}

const CHART_WIDTH = 1000
const CHART_HEIGHT = 220
const PADDING_LEFT = 34
const PADDING_RIGHT = 34
const PADDING_TOP = 24
const PADDING_BOTTOM = 30

function hasPopulationCoverage(periods: Period[]) {
  return periods.every((period) => typeof period.populationEstimate === 'number')
}

function describePopulationMoment(periods: Period[], selectedPeriodId: string) {
  const values = periods.map((period) => period.populationEstimate ?? 0)
  const selectedIndex = periods.findIndex((period) => period.id === selectedPeriodId)
  const safeIndex = selectedIndex >= 0 ? selectedIndex : periods.length - 1
  const selectedValue = values[safeIndex] ?? 0
  const firstValue = values[0] ?? selectedValue
  const maxValue = Math.max(...values, selectedValue, 1)
  const previousValue = values[Math.max(safeIndex - 1, 0)] ?? selectedValue
  const nextValue = values[Math.min(safeIndex + 1, values.length - 1)] ?? selectedValue
  const positionRatio = periods.length > 1 ? safeIndex / (periods.length - 1) : 1
  const valueRatio = selectedValue / maxValue
  const localChangeRatio =
    maxValue > 0 ? Math.abs(nextValue - previousValue) / maxValue : 0
  const growthFromStart = firstValue > 0 ? selectedValue / firstValue : 1

  if (positionRatio <= 0.3 && valueRatio <= 0.45) {
    return 'comes early in the rise'
  }

  if (
    positionRatio >= 0.68 &&
    valueRatio >= 0.78 &&
    (localChangeRatio <= 0.1 || growthFromStart <= 2.1)
  ) {
    return 'sits in a slower, mature phase'
  }

  if (valueRatio >= 0.55 && growthFromStart >= 2.8) {
    return 'comes after major growth'
  }

  if (localChangeRatio >= 0.14 || growthFromStart >= 2) {
    return 'sits in a steep growth phase'
  }

  return 'sits in a steadier part of the rise'
}

function buildSeries(periods: Period[], selectedPeriodId: string, maxValue: number): PopulationChartSeries {
  const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT
  const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

  const points = periods.map((period, index) => {
    const x =
      periods.length <= 1
        ? CHART_WIDTH / 2
        : PADDING_LEFT + (index / (periods.length - 1)) * innerWidth
    const normalizedValue = clamp((period.populationEstimate ?? 0) / Math.max(maxValue, 1), 0, 1)
    const y = PADDING_TOP + (1 - normalizedValue) * innerHeight

    return {
      periodId: period.id,
      rangeLabel: period.rangeLabel,
      x,
      y,
      value: period.populationEstimate ?? 0,
    }
  })

  return {
    scope: periods[0]?.scope ?? '',
    points,
    selectedPoint:
      points.find((point) => point.periodId === selectedPeriodId) ?? points[points.length - 1],
  }
}

export function buildPopulationComparisonModel(
  sourcePeriod: Period,
  targetPeriod: Period,
  sourcePeriods: Period[],
  targetPeriods: Period[],
): PopulationComparisonModel | null {
  if (!hasPopulationCoverage(sourcePeriods) || !hasPopulationCoverage(targetPeriods)) {
    return null
  }

  const values = sourcePeriods
    .concat(targetPeriods)
    .map((period) => period.populationEstimate ?? 0)
  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values)
  const source = buildSeries(sourcePeriods, sourcePeriod.id, maxValue)
  const target = buildSeries(targetPeriods, targetPeriod.id, maxValue)
  const sameHistory =
    sourcePeriod.scope === targetPeriod.scope &&
    sourcePeriods.length === targetPeriods.length &&
    sourcePeriods.every((period, index) => period.id === targetPeriods[index]?.id)
  const sourceMoment = describePopulationMoment(sourcePeriods, sourcePeriod.id)
  const targetMoment = describePopulationMoment(targetPeriods, targetPeriod.id)
  const sourceValue = source.selectedPoint.value
  const targetValue = target.selectedPoint.value
  const largerScope = sourceValue >= targetValue ? sourcePeriod.scope : targetPeriod.scope
  const scaleRatio =
    Math.max(sourceValue, targetValue, 1) / Math.max(Math.min(sourceValue, targetValue), 1)

  let interpretation = ''

  if (sameHistory) {
    interpretation =
      sourceMoment === targetMoment
        ? `These moments sit in the same broad growth phase, even though they land at different scale.`
        : `These moments sit in different parts of the same growth story: one ${sourceMoment}, the other ${targetMoment}.`
  } else if (scaleRatio >= 1.8) {
    interpretation = `These periods feel similar in pressure, but not in scale. ${largerScope} is much larger here.`
  } else {
    interpretation = `These periods are closer in scale than their different histories might suggest.`
  }

  return {
    sameHistory,
    source,
    target,
    maxValue,
    minValue,
    maxLabel: `${formatPopulationCompact(maxValue) ?? maxValue} people`,
    minLabel: `${formatPopulationCompact(minValue) ?? minValue} people`,
    interpretation,
  }
}

export function buildPopulationLinePath(points: PopulationChartPoint[]) {
  if (!points.length) {
    return ''
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

export function buildPopulationAreaPath(points: PopulationChartPoint[]) {
  if (!points.length) {
    return ''
  }

  const first = points[0]
  const last = points[points.length - 1]
  const linePath = buildPopulationLinePath(points)

  return `${linePath} L ${last.x} ${CHART_HEIGHT - PADDING_BOTTOM} L ${first.x} ${CHART_HEIGHT - PADDING_BOTTOM} Z`
}
