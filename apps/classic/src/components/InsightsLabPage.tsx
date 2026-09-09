import { useMemo, useState } from 'react'
import type { Period } from '../types/domain'
import type { PressureOverlaySeries } from '../types/view'
import type {
  CrossDatasetInsightPack,
  DatasetInsightPack,
  InsightDestinationSection,
} from '../types/insights'
import type { PatternBandGroup, PatternBandKind, PatternBandRun } from '../lib/insights-lab'
import { buildPatternBandGroups } from '../lib/insights-lab'

interface InsightsLabPageProps {
  datasetLabel: string
  datasetId: string
  periods: Period[]
  selectedPeriodId: string
  insightPack: DatasetInsightPack | null
  pressureSeries: PressureOverlaySeries[]
  crossDatasetPack: CrossDatasetInsightPack | null
  focusSection: InsightDestinationSection | null
  focusTargetId: string | null
  onClose: () => void
  onInspectPeriod: (periodId: string) => void
  onInspectCrossDatasetPeriod: (nextDatasetId: string, periodId: string) => void
  onInspectForce: (periodId: string, pressureId: string) => void
}

type InsightCardTone = 'family' | 'relationship' | 'outlier'

function RelationGlyph({
  relationshipType,
}: {
  relationshipType: 'co-movement' | 'inverse' | 'lead-lag'
}) {
  if (relationshipType === 'co-movement') {
    return (
      <svg viewBox="0 0 56 24" className="h-6 w-14" aria-hidden="true">
        <path d="M4 17 C 14 8, 22 8, 30 13 S 44 18, 52 8" fill="none" stroke="rgba(121,219,194,0.9)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 20 C 14 11, 22 11, 30 16 S 44 21, 52 11" fill="none" stroke="rgba(243,177,91,0.78)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }

  if (relationshipType === 'inverse') {
    return (
      <svg viewBox="0 0 56 24" className="h-6 w-14" aria-hidden="true">
        <path d="M4 7 C 16 7, 22 11, 28 12 S 40 17, 52 17" fill="none" stroke="rgba(121,219,194,0.9)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 17 C 16 17, 22 13, 28 12 S 40 7, 52 7" fill="none" stroke="rgba(243,177,91,0.82)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 56 24" className="h-6 w-14" aria-hidden="true">
      <path d="M4 16 C 14 13, 22 10, 30 8 S 44 6, 52 6" fill="none" stroke="rgba(243,177,91,0.82)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 20 C 14 20, 22 17, 30 15 S 44 11, 52 11" fill="none" stroke="rgba(121,219,194,0.9)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="18" cy="12" r="2.1" fill="rgba(243,177,91,0.9)" />
    </svg>
  )
}

function ConfidenceRail({
  strength,
  tone,
}: {
  strength: number
  tone: InsightCardTone
}) {
  const fill =
    tone === 'family'
      ? 'linear-gradient(90deg, rgba(243,177,91,0.34), rgba(243,177,91,0.88))'
      : tone === 'relationship'
        ? 'linear-gradient(90deg, rgba(121,219,194,0.34), rgba(121,219,194,0.9))'
        : 'linear-gradient(90deg, rgba(251,113,133,0.34), rgba(251,113,133,0.9))'

  return (
    <div className="mt-4">
      <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(18, Math.round(strength * 100))}%`, background: fill }}
        />
      </div>
    </div>
  )
}

function PatternKindBadge({ kind }: { kind: PatternBandKind }) {
  const copy =
    kind === 'long-run'
      ? 'Long run'
      : kind === 'returning'
        ? 'Returns later'
        : 'Short phase'

  return (
    <span className="rounded-full border border-white/7 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-300">
      {copy}
    </span>
  )
}

function PatternRunMeta({
  runCount,
  eraCount,
}: {
  runCount: number
  eraCount: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-500">
      <span>{runCount} run{runCount === 1 ? '' : 's'}</span>
      <span className="h-1 w-1 rounded-full bg-white/20" />
      <span>{eraCount} era{eraCount === 1 ? '' : 's'}</span>
    </div>
  )
}

function runsFromAssignments(
  assignments: Array<{ periodId: string; strength?: number }>,
  periods: Period[],
): PatternBandRun[] {
  const periodIndexById = new Map(periods.map((period, index) => [period.id, index]))
  const ordered = assignments
    .map((assignment) => ({
      periodId: assignment.periodId,
      index: periodIndexById.get(assignment.periodId) ?? Number.MAX_SAFE_INTEGER,
      strength: assignment.strength ?? 0.6,
    }))
    .filter((item) => item.index !== Number.MAX_SAFE_INTEGER)
    .sort((left, right) => left.index - right.index)

  const runs: PatternBandRun[] = []
  for (const item of ordered) {
    const lastRun = runs[runs.length - 1]

    if (!lastRun || item.index > lastRun.endIndex + 1) {
      runs.push({
        startIndex: item.index,
        endIndex: item.index,
        periodIds: [item.periodId],
        strength: item.strength,
      })
      continue
    }

    lastRun.endIndex = item.index
    lastRun.periodIds.push(item.periodId)
    lastRun.strength = Math.max(lastRun.strength, item.strength)
  }

  return runs
}

function PatternTimelineStrip({
  periods,
  runs,
  basePeriodId,
  active,
  compact = false,
}: {
  periods: Period[]
  runs: PatternBandGroup['runs']
  basePeriodId: string
  active: boolean
  compact?: boolean
}) {
  const highlightedSet = new Set(runs.flatMap((run) => run.periodIds))
  const lastIndex = Math.max(periods.length - 1, 1)
  const bandHeight = compact ? 12 : 14
  const baselineTop = compact ? 18 : 24

  if (!periods.length) {
    return null
  }

  return (
    <div className={`${compact ? 'mt-0' : 'mt-4'} space-y-2`}>
      {!compact ? (
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-stone-500">
          <span>Where it appears</span>
          <span>
            {highlightedSet.size} era{highlightedSet.size === 1 ? '' : 's'}
          </span>
        </div>
      ) : null}
      <div
        className={`relative overflow-hidden rounded-[1.15rem] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_0_28px_rgba(243,177,91,0.06)] ${
          compact ? 'px-3 py-3' : 'px-3 pt-3 pb-9'
        }`}
      >
        <div
          className="absolute left-3 right-3 rounded-full bg-white/10"
          style={{ top: baselineTop, height: 2 }}
        />
        {runs.map((run) => {
          const startPercent = (run.startIndex / lastIndex) * 100
          const endPercent = (run.endIndex / lastIndex) * 100

          return (
            <div
              key={`${run.startIndex}-${run.endIndex}`}
              className="absolute rounded-full shadow-[0_0_18px_rgba(243,177,91,0.18)]"
              style={{
                top: baselineTop - bandHeight / 2 + 1,
                left: `calc(${startPercent}% + 0.25rem)`,
                width: `calc(${Math.max(endPercent - startPercent, 0)}% + 0.85rem)`,
                height: bandHeight,
                background: active
                  ? 'linear-gradient(90deg, rgba(233,146,54,0.98), rgba(247,205,136,0.96) 52%, rgba(255,228,170,0.96))'
                  : 'linear-gradient(90deg, rgba(243,177,91,0.74), rgba(243,177,91,0.56))',
                opacity: active ? 1 : 0.78,
              }}
            />
          )
        })}

        {periods.map((period, index) => {
          const isActivePeriod = highlightedSet.has(period.id)
          const isBasePeriod = period.id === basePeriodId
          const left = `calc(${(index / lastIndex) * 100}% + 0.25rem)`

          return (
            <div
              key={period.id}
              className="absolute -translate-x-1/2"
              style={{ left, top: baselineTop - 4 }}
            >
              <div
                className={`rounded-full ${
                  isBasePeriod
                    ? 'animate-[pulse_3.2s_ease-in-out_infinite] shadow-[0_0_18px_rgba(255,232,166,0.3)]'
                    : ''
                }`}
                style={{
                  width: isBasePeriod ? 12 : isActivePeriod ? 7 : 5,
                  height: isBasePeriod ? 12 : isActivePeriod ? 7 : 5,
                  background: isBasePeriod
                    ? 'rgba(255,240,194,0.98)'
                    : isActivePeriod
                      ? 'rgba(247,205,136,0.95)'
                      : 'rgba(255,255,255,0.18)',
                  border: isBasePeriod ? '1px solid rgba(255,244,214,0.85)' : 'none',
                }}
              />
            </div>
          )
        })}

        {!compact ? (
          <>
            <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.14em] text-stone-400">
              {periods[0]?.rangeLabel}
            </span>
            <span className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.14em] text-stone-400">
              {periods[periods.length - 1]?.rangeLabel}
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}

function SupportingPeriodsStrip({
  periods,
  supportingPeriodIds,
  activePeriodId,
}: {
  periods: Period[]
  supportingPeriodIds: string[]
  activePeriodId: string
}) {
  const supportingSet = new Set(supportingPeriodIds)
  const lastIndex = Math.max(periods.length - 1, 1)

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-stone-500">
        <span>Where this shows up</span>
        <span>
          {supportingSet.size} era{supportingSet.size === 1 ? '' : 's'}
        </span>
      </div>
      <div className="relative overflow-hidden rounded-[1.1rem] border border-white/5 bg-white/[0.04] px-3 pt-3 pb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
        <div className="absolute left-3 right-3 top-[1.35rem] h-[2px] rounded-full bg-white/10" />

        {periods.map((period, index) => {
          const isSupporting = supportingSet.has(period.id)
          const isActive = period.id === activePeriodId
          const left = `calc(${(index / lastIndex) * 100}% + 0.25rem)`

          return (
            <div
              key={period.id}
              className="absolute -translate-x-1/2"
              style={{ left, top: '1rem' }}
            >
              <div
                className={`rounded-full ${
                  isActive ? 'animate-[pulse_3.2s_ease-in-out_infinite] shadow-[0_0_18px_rgba(149,248,228,0.26)]' : ''
                }`}
                style={{
                  width: isActive ? 12 : isSupporting ? 8 : 5,
                  height: isActive ? 12 : isSupporting ? 8 : 5,
                  background: isActive
                    ? 'rgba(211,255,247,0.98)'
                    : isSupporting
                      ? 'rgba(121,219,194,0.95)'
                      : 'rgba(255,255,255,0.18)',
                  border: isActive ? '1px solid rgba(227,255,249,0.82)' : 'none',
                }}
              />
            </div>
          )
        })}

        <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.14em] text-stone-400">
          {periods[0]?.rangeLabel}
        </span>
        <span className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.14em] text-stone-400">
          {periods[periods.length - 1]?.rangeLabel}
        </span>
      </div>
    </div>
  )
}

function buildRelationshipLifeMeaning(
  sourceId: string,
  targetId: string,
  relationshipType: 'co-movement' | 'inverse' | 'lead-lag',
) {
  const pair = [sourceId, targetId]

  if (pair.includes('technologicalDisruption') || pair.includes('informationAcceleration')) {
    return 'Daily life tends to feel faster, less settled, and harder to keep up with.'
  }

  if (pair.includes('inequality') || pair.includes('economicPrecarity')) {
    return 'Opportunity narrows, security feels more uneven, and everyday life becomes more exposed.'
  }

  if (pair.includes('institutionalLegitimacy') || pair.includes('socialCohesion')) {
    return relationshipType === 'inverse'
      ? 'People are more likely to feel that common life is slipping out of joint.'
      : 'People are more likely to feel held together by rules, institutions, or shared purpose.'
  }

  if (pair.includes('militarization') || pair.includes('moralCertainty')) {
    return 'Life tends to feel more disciplined, more demanding, and less open to dissent.'
  }

  if (pair.includes('publicHope')) {
    return relationshipType === 'inverse'
      ? 'The future feels harder to trust, even if the present still looks stable.'
      : 'The future feels easier to imagine collectively, not just privately.'
  }

  return 'The relationship changes how secure, open, and shared everyday life feels.'
}

function RelationshipTrace({
  periods,
  sourceSeries,
  targetSeries,
  supportingPeriodIds,
  selectedPeriodId,
}: {
  periods: Period[]
  sourceSeries: PressureOverlaySeries | null
  targetSeries: PressureOverlaySeries | null
  supportingPeriodIds: string[]
  selectedPeriodId: string
}) {
  if (!sourceSeries || !targetSeries || !periods.length) {
    return null
  }

  const lastIndex = Math.max(periods.length - 1, 1)
  const width = 100
  const height = 42
  const supportingSet = new Set(supportingPeriodIds)

  const pointsFor = (series: PressureOverlaySeries) =>
    periods
      .map((period, index) => {
        const point = series.points.find((candidate) => candidate.periodId === period.id)
        return {
          x: (index / lastIndex) * width,
          y: height - (point?.normalized ?? 0) * height,
          periodId: period.id,
        }
      })
      .filter((point) => Number.isFinite(point.y))

  const sourcePoints = pointsFor(sourceSeries)
  const targetPoints = pointsFor(targetSeries)

  const pathFor = (points: typeof sourcePoints) =>
    points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ')

  const selectedIndex = periods.findIndex((period) => period.id === selectedPeriodId)
  const selectedX = (selectedIndex / lastIndex) * width

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-stone-500">
        <span>How the two forces move across time</span>
        <span>{supportingSet.size} supporting eras</span>
      </div>
      <div className="rounded-[1.15rem] border border-white/5 bg-white/[0.04] px-4 pt-4 pb-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
        <svg viewBox={`0 0 ${width} ${height + 2}`} className="h-28 w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1={height} x2={width} y2={height} stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
          <line x1={selectedX} y1="0" x2={selectedX} y2={height + 1} stroke="rgba(255,232,166,0.28)" strokeWidth="0.7" strokeDasharray="1.4 1.4" />

          {periods.map((period, index) => {
            const x = (index / lastIndex) * width
            const highlighted = supportingSet.has(period.id)
            return (
              <line
                key={period.id}
                x1={x}
                y1={height - 3}
                x2={x}
                y2={height + 1.5}
                stroke={highlighted ? 'rgba(121,219,194,0.44)' : 'rgba(255,255,255,0.09)'}
                strokeWidth={highlighted ? '0.9' : '0.5'}
              />
            )
          })}

          <path d={pathFor(sourcePoints)} fill="none" stroke="rgba(121,219,194,0.96)" strokeWidth="1.7" strokeLinecap="round" />
          <path d={pathFor(targetPoints)} fill="none" stroke="rgba(243,177,91,0.92)" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.16em] text-stone-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-[rgba(121,219,194,0.96)]" />
            {sourceSeries.publicLabel ?? sourceSeries.label}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-[rgba(243,177,91,0.92)]" />
            {targetSeries.publicLabel ?? targetSeries.label}
          </span>
        </div>
      </div>
    </div>
  )
}

function PatternProfileComparison({
  activePattern,
  periods,
  pressureSeries,
}: {
  activePattern: PatternBandGroup
  periods: Period[]
  pressureSeries: PressureOverlaySeries[]
}) {
  const patternPeriodIds = new Set(activePattern.assignments.map((assignment) => assignment.periodId))

  const comparisons = pressureSeries
    .map((series) => {
      const historyValues = periods
        .map((period) => period.pressureScores[series.id])
        .filter((value): value is number => typeof value === 'number')
      const patternValues = periods
        .filter((period) => patternPeriodIds.has(period.id))
        .map((period) => period.pressureScores[series.id])
        .filter((value): value is number => typeof value === 'number')

      const historyAverage =
        historyValues.length > 0
          ? historyValues.reduce((sum, value) => sum + value, 0) / historyValues.length
          : 0
      const patternAverage =
        patternValues.length > 0
          ? patternValues.reduce((sum, value) => sum + value, 0) / patternValues.length
          : historyAverage

      return {
        id: series.id,
        label: series.publicLabel ?? series.label,
        historyAverage,
        patternAverage,
        delta: patternAverage - historyAverage,
      }
    })
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, 5)

  const maxValue = Math.max(
    ...comparisons.flatMap((item) => [item.historyAverage, item.patternAverage]),
    1,
  )

  return (
    <div className="mt-4 rounded-[1.15rem] border border-white/6 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/78">
          What holds this pattern together
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.16em] text-stone-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-white/25" />
            History average
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-[rgba(243,177,91,0.9)]" />
            This pattern
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {comparisons.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-stone-200">{item.label}</p>
              <span className="text-[10px] uppercase tracking-[0.16em] text-stone-500">
                {item.delta >= 0 ? 'stronger here' : 'quieter here'}
              </span>
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-white/7">
                <div
                  className="h-full rounded-full bg-white/25"
                  style={{ width: `${(item.historyAverage / maxValue) * 100}%` }}
                />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/7">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(243,177,91,0.72),rgba(255,226,168,0.96))]"
                  style={{ width: `${(item.patternAverage / maxValue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OutlierField({
  periods,
  outliers,
  activeOutlierId,
  selectedPeriodId,
  onSelect,
}: {
  periods: Period[]
  outliers: DatasetInsightPack['outliers']
  activeOutlierId: string | null
  selectedPeriodId: string
  onSelect: (outlierId: string) => void
}) {
  const lastIndex = Math.max(periods.length - 1, 1)
  const lanePositions = [22, 49, 76]
  const laneByType = {
    'high-strain-high-order': 0,
    'cluster-edge': 1,
    'unexpected-profile': 2,
  } as const
  const laneLabels = [
    'Heavy pressure, tight control',
    "Almost fits, but not quite",
    'Unexpected mix',
  ]

  return (
    <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="relative h-[18rem]">
        <div className="absolute left-0 right-0 top-0 bottom-0">
          {lanePositions.map((top, lane) => (
            <div
              key={lane}
              className="absolute right-4 border-t border-white/5"
              style={{ top: `${top}%`, left: '13.5rem' }}
            />
          ))}
        </div>

        <div className="absolute left-4 top-0 bottom-0 w-[12rem] bg-[linear-gradient(90deg,rgba(19,24,27,0.96),rgba(19,24,27,0.8)_72%,rgba(19,24,27,0))]" />

        {laneLabels.map((label, lane) => (
          <div
            key={`${label}-text`}
            className="absolute left-4 -translate-y-1/2 pr-3 text-[10px] uppercase tracking-[0.16em] text-stone-500"
            style={{ top: `${lanePositions[lane]}%` }}
          >
            {label}
          </div>
        ))}

        <div className="absolute inset-x-4 bottom-4 flex justify-between text-[9px] uppercase tracking-[0.14em] text-stone-500">
          <span>{periods[0]?.rangeLabel}</span>
          <span>{periods[periods.length - 1]?.rangeLabel}</span>
        </div>

        {outliers.map((outlier) => {
          const periodIndex = periods.findIndex((period) => period.id === outlier.periodId)
          const left = 4 + (periodIndex / lastIndex) * 92
          const lane = laneByType[outlier.outlierType]
          const top = lanePositions[lane] - outlier.strength * 8
          const isActive = outlier.id === activeOutlierId
          const isSelectedPeriod = outlier.periodId === selectedPeriodId

          return (
            <button
              key={outlier.id}
              type="button"
              onClick={() => onSelect(outlier.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div
                className={`rounded-full transition ${
                  isActive || isSelectedPeriod
                    ? 'animate-[pulse_3.2s_ease-in-out_infinite] shadow-[0_0_22px_rgba(251,113,133,0.24)]'
                    : ''
                }`}
                style={{
                  width: isActive ? 18 : isSelectedPeriod ? 15 : 11 + outlier.strength * 7,
                  height: isActive ? 18 : isSelectedPeriod ? 15 : 11 + outlier.strength * 7,
                  background: isActive
                    ? 'rgba(255,201,212,0.98)'
                    : isSelectedPeriod
                      ? 'rgba(255,160,180,0.96)'
                      : 'rgba(251,113,133,0.86)',
                  border: isActive ? '1px solid rgba(255,229,235,0.85)' : 'none',
                }}
              />
            </button>
          )
        })}

      </div>
    </div>
  )
}

function buildOutlierLifeMeaning(period: Period, outlierType: DatasetInsightPack['outliers'][number]['outlierType']) {
  if (outlierType === 'high-strain-high-order') {
    return `${period.insecurityExposure} At the same time, rules and power feel unusually tight rather than weak.`
  }

  if (outlierType === 'cluster-edge') {
    return `${period.senseOfFuture} Life feels familiar in some ways, but one or two big pressures push it away from the usual pattern.`
  }

  return `${period.opportunityVsPrecarity} The mix is unusual enough that ordinary life does not fit the usual script for this history.`
}

function OutlierDeviationChart({
  activeOutlier,
  periods,
  pressureSeries,
}: {
  activeOutlier: DatasetInsightPack['outliers'][number]
  periods: Period[]
  pressureSeries: PressureOverlaySeries[]
}) {
  const period = periods.find((item) => item.id === activeOutlier.periodId)

  if (!period) {
    return null
  }

  const comparisons = pressureSeries
    .map((series) => {
      const values = periods
        .map((item) => item.pressureScores[series.id])
        .filter((value): value is number => typeof value === 'number')
      const average =
        values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
      const current = period.pressureScores[series.id] ?? average
      return {
        id: series.id,
        label: series.publicLabel ?? series.label,
        average,
        current,
        delta: current - average,
      }
    })
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, 5)

  const maxValue = Math.max(
    ...comparisons.flatMap((item) => [item.average, item.current]),
    1,
  )

  return (
    <div className="mt-4 rounded-[1.15rem] border border-white/6 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-rose-100/78">
          Compared with the usual pattern
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.16em] text-stone-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-white/25" />
            Usual level
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-[rgba(251,113,133,0.9)]" />
            This era
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {comparisons.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-stone-200">{item.label}</p>
              <span className="text-[10px] uppercase tracking-[0.16em] text-stone-500">
                {item.delta >= 0 ? 'higher than usual' : 'lower than usual'}
              </span>
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-white/7">
                <div
                  className="h-full rounded-full bg-white/25"
                  style={{ width: `${(item.average / maxValue) * 100}%` }}
                />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/7">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(251,113,133,0.72),rgba(255,190,205,0.96))]"
                  style={{ width: `${(item.current / maxValue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InsightsLabPage({
  datasetLabel,
  datasetId,
  periods,
  selectedPeriodId,
  insightPack,
  pressureSeries,
  crossDatasetPack,
  focusSection,
  focusTargetId,
  onClose,
  onInspectPeriod,
  onInspectCrossDatasetPeriod,
}: InsightsLabPageProps) {
  const [activePatternKey, setActivePatternKey] = useState<string | null>(null)
  const [activeRelationshipId, setActiveRelationshipId] = useState<string | null>(null)
  const [activeOutlierId, setActiveOutlierId] = useState<string | null>(null)
  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId) ?? periods[0] ?? null
  const prompt = insightPack?.prompts.find((item) => item.periodId === selectedPeriodId) ?? null
  const periodById = Object.fromEntries(periods.map((period) => [period.id, period]))
  const publicPilot = insightPack?.publicStatus === 'public'
  const patternBands = useMemo(
    () => (insightPack ? buildPatternBandGroups(insightPack, periods, selectedPeriodId) : []),
    [insightPack, periods, selectedPeriodId],
  )

  const highlightedPattern =
    focusSection === 'families'
      ? patternBands.find((group) =>
          group.assignments.some((assignment) => assignment.id === focusTargetId),
        ) ?? null
      : null
  const resolvedActivePatternKey =
    activePatternKey && patternBands.some((group) => group.key === activePatternKey)
      ? activePatternKey
      : highlightedPattern?.key ??
        patternBands.find((group) => group.selectedIncluded)?.key ??
        patternBands[0]?.key ??
        null
  const activePattern =
    patternBands.find((group) => group.key === resolvedActivePatternKey) ?? patternBands[0] ?? null
  const highlightedRelationship =
    focusSection === 'relationships'
      ? insightPack?.pressureRelationships.find((relationship) => relationship.id === focusTargetId) ??
        null
      : null
  const resolvedActiveRelationshipId =
    activeRelationshipId &&
    insightPack?.pressureRelationships.some((relationship) => relationship.id === activeRelationshipId)
      ? activeRelationshipId
      : highlightedRelationship?.id ??
        insightPack?.pressureRelationships[0]?.id ??
        null
  const activeRelationship =
    insightPack?.pressureRelationships.find(
      (relationship) => relationship.id === resolvedActiveRelationshipId,
    ) ?? null
  const highlightedOutlier =
    focusSection === 'outliers'
      ? insightPack?.outliers.find((outlier) => outlier.id === focusTargetId) ?? null
      : null
  const resolvedActiveOutlierId =
    activeOutlierId && insightPack?.outliers.some((outlier) => outlier.id === activeOutlierId)
      ? activeOutlierId
      : highlightedOutlier?.id ??
        insightPack?.outliers.find((outlier) => outlier.periodId === selectedPeriodId)?.id ??
        insightPack?.outliers[0]?.id ??
        null
  const activeOutlier =
    insightPack?.outliers.find((outlier) => outlier.id === resolvedActiveOutlierId) ?? null
  const activeSourceSeries =
    activeRelationship
      ? pressureSeries.find((series) => series.id === activeRelationship.sourcePressureId) ?? null
      : null
  const activeTargetSeries =
    activeRelationship
      ? pressureSeries.find((series) => series.id === activeRelationship.targetPressureId) ?? null
      : null
  const relationshipSupportShare =
    activeRelationship && periods.length
      ? activeRelationship.supportingPeriods.length / periods.length
      : 0
  const publicCousins =
    crossDatasetPack?.publicCousins.filter(
      (cousin) =>
        cousin.sourceDatasetId === datasetId || cousin.targetDatasetId === datasetId,
    ) ?? []

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-5 md:px-6 lg:px-8">
      <section className="glass-panel relative overflow-hidden rounded-[2.2rem] border border-[rgba(214,211,209,0.08)] px-6 py-6 shadow-[0_24px_64px_rgba(0,0,0,0.22)] md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(243,177,91,0.08),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(121,219,194,0.08),_transparent_34%)]" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <p className="eyebrow">Insights Lab</p>
              <h1 className="font-display text-4xl leading-tight text-stone-50 md:text-6xl">
                Patterns worth noticing
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300 md:text-lg">
                Some eras hold together in similar ways. Some pressures rise together. Some periods
                break the pattern completely.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-stone-200">
                {datasetLabel}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-200"
              >
                Back to loom
              </button>
            </div>
          </div>

          {selectedPeriod && prompt ? (
            <article className="mt-6 rounded-[1.5rem] border border-amber-300/18 bg-[rgba(243,177,91,0.07)] px-5 py-5 shadow-[0_18px_34px_rgba(0,0,0,0.16)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="eyebrow">Entry clue</p>
                  <h2 className="mt-2 font-display text-2xl text-stone-100">
                    {selectedPeriod.title}
                  </h2>
                  <p className="mt-3 text-lg leading-8 text-stone-50">
                    {prompt.publicText ?? prompt.text}
                  </p>
                </div>
                <span className="rounded-full border border-amber-200/14 bg-amber-200/6 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-amber-100/86">
                  Entry point only
                </span>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.55fr)]">
        <div className="space-y-5">
          {publicPilot && insightPack ? (
            <>
              <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Eras that behave alike</p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      Patterns that show up more than once
                    </h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-amber-100/80">
                    across this history
                  </span>
                </div>

                {activePattern ? (
                  <>
                    <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                      {patternBands.map((group, index) => {
                        const isActive = group.key === activePattern.key

                        return (
                          <button
                            key={group.key}
                            type="button"
                            onClick={() => setActivePatternKey(group.key)}
                            className={`w-full px-5 py-5 text-left transition ${
                              isActive
                                ? 'bg-[linear-gradient(90deg,rgba(243,177,91,0.12),rgba(243,177,91,0.03)_26%,rgba(255,255,255,0.02))]'
                                : 'hover:bg-white/[0.03]'
                            } ${index < patternBands.length - 1 ? 'border-b border-white/6' : ''}`}
                          >
                            <div className="grid gap-4 lg:grid-cols-[minmax(240px,0.38fr)_minmax(0,1fr)] lg:items-center lg:gap-6">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-display text-[1.1rem] text-stone-100">{group.title}</h3>
                                  <PatternKindBadge kind={group.patternKind} />
                                </div>
                                <p className="mt-2 text-sm leading-6 text-stone-300">{group.caption}</p>
                                <div className="mt-3">
                                  <PatternRunMeta
                                    runCount={group.runs.length}
                                    eraCount={group.assignments.length}
                                  />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <PatternTimelineStrip
                                  periods={periods}
                                  runs={group.runs}
                                  basePeriodId={selectedPeriodId}
                                  active={isActive}
                                  compact
                                />
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <article
                      key={activePattern.key}
                      className="mt-5 rounded-[1.45rem] border border-amber-200/10 bg-[rgba(243,177,91,0.04)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-3xl">
                          <p className="text-sm uppercase tracking-[0.18em] text-amber-100">
                            {activePattern.title}
                          </p>
                          <h3 className="mt-2 font-display text-2xl text-stone-100">
                            {activePattern.caption}
                          </h3>
                        </div>
                        <div className="min-w-[10rem]">
                          <ConfidenceRail strength={activePattern.titleStrength} tone="family" />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {activePattern.topSignals.map((signal) => (
                          <span
                            key={`${activePattern.key}-${signal}`}
                            className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                          >
                            {signal}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 rounded-[1.2rem] border border-white/6 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/78">
                          What this means in real life
                        </p>
                        <p className="mt-2 text-sm leading-6 text-stone-300">
                          {activePattern.humanMeaning}
                        </p>
                      </div>

                      <PatternProfileComparison
                        activePattern={activePattern}
                        periods={periods}
                        pressureSeries={pressureSeries}
                      />

                      <PatternTimelineStrip
                        periods={periods}
                        runs={activePattern.runs}
                        basePeriodId={selectedPeriodId}
                        active
                      />

                      <div className="mt-5 rounded-[1.2rem] border border-white/6 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/78">
                          Where it returns
                        </p>
                        <div className="mt-4 space-y-3">
                          {activePattern.runs.map((run, runIndex) => {
                            const firstPeriod = periodById[run.periodIds[0]]
                            const lastPeriod = periodById[run.periodIds[run.periodIds.length - 1]]

                            return (
                              <div
                                key={`${activePattern.key}-run-${runIndex}`}
                                className="rounded-[1.05rem] bg-black/12 px-3 py-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                                      {activePattern.runs.length === 1 ? 'Main run' : `Run ${runIndex + 1}`}
                                    </p>
                                    <p className="mt-1 text-sm text-stone-200">
                                      {firstPeriod?.rangeLabel}
                                      {firstPeriod?.rangeLabel !== lastPeriod?.rangeLabel
                                        ? ` to ${lastPeriod?.rangeLabel}`
                                        : ''}
                                    </p>
                                  </div>
                                  <span className="text-[10px] uppercase tracking-[0.16em] text-stone-400">
                                    {run.periodIds.length} era{run.periodIds.length === 1 ? '' : 's'}
                                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {run.periodIds.map((periodId) => (
                                    <span
                                      key={`${runIndex}-${periodId}`}
                                      className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${
                                        periodId === selectedPeriodId
                                          ? 'bg-amber-200/14 text-amber-100'
                                          : 'bg-white/[0.05] text-stone-300'
                                      }`}
                                    >
                                      {periodById[periodId]?.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="mt-5 space-y-4">
                        {activePattern.variants.map((variant, variantIndex) => {
                          const variantSignals = variant.publicTopSignals ?? variant.topSignals
                          const showSubLabel = activePattern.variants.length > 1
                          const variantLabel =
                            variantIndex === 0
                              ? 'One version'
                              : variantIndex === 1
                                ? 'Another version'
                                : `Pattern ${variantIndex + 1}`
                          const variantRuns = runsFromAssignments(variant.assignments, periods)

                          return (
                            <section
                              key={variant.clusterId}
                              className="rounded-[1.25rem] border border-white/6 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="max-w-3xl">
                                  {showSubLabel ? (
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-100/78">
                                      {variantLabel}
                                    </p>
                                  ) : null}
                                  <p className={`${showSubLabel ? 'mt-2' : ''} text-sm leading-6 text-stone-300`}>
                                    {variant.publicSummary ?? variant.summary}
                                  </p>
                                </div>
                                <div className="min-w-[10rem]">
                                  <ConfidenceRail strength={variant.strength} tone="family" />
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {variantSignals.map((signal) => (
                                  <span
                                    key={`${variant.clusterId}-${signal}`}
                                    className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                                  >
                                    {signal}
                                  </span>
                                ))}
                              </div>

                              <div className="mt-4">
                                <PatternTimelineStrip
                                  periods={periods}
                                  runs={variantRuns}
                                  basePeriodId={selectedPeriodId}
                                  active
                                  compact
                                />
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {variant.assignments.map((assignment) => {
                                  const period = periodById[assignment.periodId]
                                  const highlighted =
                                    focusSection === 'families' && focusTargetId === assignment.id

                                  return (
                                    <span
                                      key={assignment.id}
                                      className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${
                                        highlighted
                                          ? 'bg-amber-200/14 text-amber-100'
                                          : 'bg-white/[0.05] text-stone-300'
                                      }`}
                                    >
                                      {period?.title}
                                    </span>
                                  )
                                })}
                              </div>
                            </section>
                          )
                        })}
                      </div>
                    </article>
                  </>
                ) : null}
              </section>

              {publicCousins.length ? (
                <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">A cousin in another country</p>
                        <h2 className="font-display mt-2 text-2xl text-stone-100">
                          A distant era that feels strangely familiar
                        </h2>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-100/80">
                        across countries
                      </span>
                    </div>

                    {publicCousins.map((cousin) => {
                      const highlighted =
                        focusSection === 'cousins' && focusTargetId === cousin.id
                      const localOnSource = cousin.sourceDatasetId === datasetId
                      const localPeriod = localOnSource
                        ? {
                            datasetId: cousin.sourceDatasetId,
                            datasetLabel: cousin.sourceDatasetLabel,
                            periodId: cousin.sourcePeriodId,
                            periodTitle: cousin.sourcePeriodTitle,
                            periodRangeLabel: cousin.sourcePeriodRangeLabel,
                          }
                        : {
                            datasetId: cousin.targetDatasetId,
                            datasetLabel: cousin.targetDatasetLabel,
                            periodId: cousin.targetPeriodId,
                            periodTitle: cousin.targetPeriodTitle,
                            periodRangeLabel: cousin.targetPeriodRangeLabel,
                          }
                      const cousinPeriod = localOnSource
                        ? {
                            datasetId: cousin.targetDatasetId,
                            datasetLabel: cousin.targetDatasetLabel,
                            periodId: cousin.targetPeriodId,
                            periodTitle: cousin.targetPeriodTitle,
                            periodRangeLabel: cousin.targetPeriodRangeLabel,
                          }
                        : {
                            datasetId: cousin.sourceDatasetId,
                            datasetLabel: cousin.sourceDatasetLabel,
                            periodId: cousin.sourcePeriodId,
                            periodTitle: cousin.sourcePeriodTitle,
                            periodRangeLabel: cousin.sourcePeriodRangeLabel,
                          }

                      return (
                        <article
                          key={cousin.id}
                          className={`rounded-[1.45rem] border border-[rgba(211,157,255,0.18)] bg-[linear-gradient(180deg,rgba(182,122,255,0.07),rgba(121,219,194,0.045))] p-5 ${
                            highlighted ? 'shadow-[0_18px_34px_rgba(0,0,0,0.18)]' : ''
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-3xl">
                              <p className="text-sm uppercase tracking-[0.18em] text-fuchsia-100">
                                {cousin.headline}
                              </p>
                              <p className="mt-3 text-sm leading-6 text-stone-300">
                                {cousin.publicSummary}
                              </p>
                            </div>
                            <div className="min-w-[10rem]">
                              <div className="mt-4">
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
                                  <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(206,153,255,0.34),rgba(206,153,255,0.9))]"
                                    style={{
                                      width: `${Math.max(
                                        18,
                                        Math.round(cousin.similarityScore * 100),
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            <div className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                                {localPeriod.datasetLabel} · {localPeriod.periodRangeLabel}
                              </p>
                              <h3 className="mt-2 text-base text-stone-100">
                                {localPeriod.periodTitle}
                              </h3>
                            </div>

                            <div className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                                {cousinPeriod.datasetLabel} · {cousinPeriod.periodRangeLabel}
                              </p>
                              <h3 className="mt-2 text-base text-stone-100">
                                {cousinPeriod.periodTitle}
                              </h3>
                              <button
                                type="button"
                                onClick={() =>
                                  onInspectCrossDatasetPeriod(
                                    cousinPeriod.datasetId,
                                    cousinPeriod.periodId,
                                  )
                                }
                                className="ui-action mt-4 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-200"
                              >
                                Open cousin era
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {(cousin.publicSharedTopSignals ?? cousin.sharedTopSignals).map((signal) => (
                              <span
                                key={`${cousin.id}-${signal}`}
                                className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                              >
                                {signal}
                              </span>
                            ))}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Forces in motion</p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      Forces that rise together, pull apart, or move first
                    </h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">
                    together / apart / first
                  </span>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                  <div className="grid gap-px bg-white/6 md:grid-cols-2 xl:grid-cols-3">
                    {insightPack.pressureRelationships.map((relationship) => {
                      const isActive = relationship.id === activeRelationship?.id
                      const leftLabel = relationship.publicSourceLabel ?? relationship.sourceLabel
                      const rightLabel = relationship.publicTargetLabel ?? relationship.targetLabel

                      return (
                        <button
                          key={relationship.id}
                          type="button"
                          onClick={() => setActiveRelationshipId(relationship.id)}
                          className={`min-h-[7.25rem] bg-[rgba(19,24,27,0.88)] px-4 py-4 text-left transition ${
                            isActive
                              ? 'shadow-[inset_0_0_0_1px_rgba(121,219,194,0.26)]'
                              : 'hover:bg-[rgba(27,33,37,0.96)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[10px] uppercase tracking-[0.18em] text-cyan-100/84">
                                {leftLabel}
                              </p>
                              <p className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-stone-500">
                                {rightLabel}
                              </p>
                            </div>
                            <RelationGlyph relationshipType={relationship.relationshipType} />
                          </div>
                          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone-400">
                            {relationship.publicRelationshipLine ?? relationship.relationshipType}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/7">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(121,219,194,0.36),rgba(121,219,194,0.92))]"
                                style={{ width: `${Math.max(18, Math.round(relationship.strength * 100))}%` }}
                              />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.16em] text-stone-400">
                              {relationship.confidence}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {activeRelationship ? (
                  <article className="mt-5 rounded-[1.45rem] border border-[rgba(121,219,194,0.14)] bg-[linear-gradient(180deg,rgba(121,219,194,0.06),rgba(121,219,194,0.025))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm uppercase tracking-[0.18em] text-cyan-100">
                            {activeRelationship.publicSourceLabel ?? activeRelationship.sourceLabel}
                          </p>
                          <RelationGlyph relationshipType={activeRelationship.relationshipType} />
                          <p className="text-sm uppercase tracking-[0.18em] text-stone-300">
                            {activeRelationship.publicTargetLabel ?? activeRelationship.targetLabel}
                          </p>
                        </div>
                        <h3 className="mt-3 font-display text-2xl text-stone-100">
                          {activeRelationship.publicRelationshipLine ??
                            activeRelationship.relationshipType}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-stone-300">
                          {activeRelationship.publicSummary ?? activeRelationship.summary}
                        </p>
                        <div className="mt-4 rounded-[1.1rem] border border-white/6 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/78">
                            What this does to daily life
                          </p>
                          <p className="mt-2 text-sm leading-6 text-stone-300">
                            {buildRelationshipLifeMeaning(
                              activeRelationship.sourcePressureId,
                              activeRelationship.targetPressureId,
                              activeRelationship.relationshipType,
                            )}
                          </p>
                          {relationshipSupportShare >= 0.65 ? (
                            <p className="mt-2 text-sm leading-6 text-stone-400">
                              This is not a narrow blip. It shows up across much of the history.
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="min-w-[10rem]">
                        <ConfidenceRail strength={activeRelationship.strength} tone="relationship" />
                      </div>
                    </div>

                    <RelationshipTrace
                      periods={periods}
                      sourceSeries={activeSourceSeries}
                      targetSeries={activeTargetSeries}
                      supportingPeriodIds={activeRelationship.supportingPeriods}
                      selectedPeriodId={selectedPeriodId}
                    />

                    <SupportingPeriodsStrip
                      periods={periods}
                      supportingPeriodIds={activeRelationship.supportingPeriods}
                      activePeriodId={selectedPeriodId}
                    />
                  </article>
                ) : null}
              </section>

              <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Breaks from the usual pattern</p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      The eras that do not fit neatly
                    </h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-rose-100/80">
                    harder to place
                  </span>
                </div>

                <OutlierField
                  periods={periods}
                  outliers={insightPack.outliers}
                  activeOutlierId={activeOutlier?.id ?? null}
                  selectedPeriodId={selectedPeriodId}
                  onSelect={setActiveOutlierId}
                />

                {activeOutlier ? (
                  <article className="mt-5 rounded-[1.45rem] border border-[rgba(251,113,133,0.14)] bg-[linear-gradient(180deg,rgba(251,113,133,0.06),rgba(251,113,133,0.025))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-3xl">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                          {periodById[activeOutlier.periodId]?.rangeLabel ?? activeOutlier.periodId}
                        </p>
                        <h3 className="mt-2 font-display text-2xl text-stone-100">
                          {periodById[activeOutlier.periodId]?.title}
                        </h3>
                        <p className="mt-3 text-sm uppercase tracking-[0.18em] text-rose-100">
                          {activeOutlier.publicLabel ?? activeOutlier.explanationLabel}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-stone-300">
                          {activeOutlier.publicSummary ?? activeOutlier.summary}
                        </p>
                        <div className="mt-4 rounded-[1.1rem] border border-white/6 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-rose-100/78">
                            What this means in real life
                          </p>
                          <p className="mt-2 text-sm leading-6 text-stone-300">
                            {buildOutlierLifeMeaning(
                              periodById[activeOutlier.periodId] ?? selectedPeriod,
                              activeOutlier.outlierType,
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="min-w-[10rem]">
                        <ConfidenceRail strength={activeOutlier.strength} tone="outlier" />
                      </div>
                    </div>

                    <OutlierDeviationChart
                      activeOutlier={activeOutlier}
                      periods={periods}
                      pressureSeries={pressureSeries}
                    />

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(activeOutlier.publicTopSignals ?? activeOutlier.topSignals).map((signal) => (
                        <span
                          key={`${activeOutlier.id}-${signal}`}
                          className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </article>
                ) : null}
              </section>
            </>
          ) : (
            <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
              <p className="eyebrow">Insights</p>
              <h2 className="font-display mt-2 text-2xl text-stone-100">
                Insights are still being prepared here
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300">
                This history is not ready for public insight cards yet, so the Loom stays the main
                way in for now.
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5">
          <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5">
            <p className="eyebrow">Current history</p>
            <h2 className="mt-2 text-xl text-stone-100">{datasetLabel}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              This lab is for exploring patterns across the whole history in one place.
            </p>
          </section>

          <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5">
            <p className="eyebrow">Keep in mind</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
              <p>
                These patterns are clues to inspect, not final answers.
              </p>
              <p>
                {publicCousins.length
                  ? 'One cross-country cousin is visible here. More may appear later.'
                  : 'Cross-country cousins are still sparse here.'}
              </p>
            </div>
          </section>

          {selectedPeriod && prompt ? (
            <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5">
              <p className="eyebrow">Entry clue</p>
              <h2 className="mt-2 text-xl text-stone-100">{selectedPeriod.title}</h2>
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-stone-500">
                {selectedPeriod.rangeLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                {prompt.publicText ?? prompt.text}
              </p>
              <button
                type="button"
                onClick={() => onInspectPeriod(selectedPeriod.id)}
                className="ui-action mt-4 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-200"
              >
                Open entry era in Loom
              </button>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
