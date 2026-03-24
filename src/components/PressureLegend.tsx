import { useState } from 'react'
import type { PressurePolarity } from '../types/domain'
import type { PressureOverlaySeries } from '../types/view'

type LegendDensityMode = 'compact' | 'expanded'
type LegendOrderMode = 'intensity' | 'polarity' | 'label'

interface PressureLegendProps {
  pressureSeries: PressureOverlaySeries[]
  selectedPressureId: string | null
  currentPeriodId: string
  currentPeriodScores: Record<string, number>
  onPressureSelect: (pressureId: string | null) => void
}

function buildSparklinePath(points: PressureOverlaySeries['points'], width: number, height: number) {
  if (!points.length) {
    return ''
  }

  const xStep = points.length > 1 ? width / (points.length - 1) : width

  return points
    .map((point, index) => {
      const x = index * xStep
      const y = height - point.normalized * height

      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function getIntensityLabel(value: number) {
  if (value >= 80) {
    return 'High'
  }

  if (value >= 60) {
    return 'Elevated'
  }

  if (value >= 40) {
    return 'Present'
  }

  if (value >= 20) {
    return 'Low'
  }

  return 'Quiet'
}

function getIntensitySegments(value: number) {
  return Math.max(1, Math.ceil(value / 20))
}

function getPolarityChipClass(polarity: PressurePolarity) {
  return polarity === 'stress'
    ? 'border border-[rgba(243,177,91,0.16)] bg-[rgba(243,177,91,0.08)] text-amber-100'
    : 'border border-[rgba(121,219,194,0.16)] bg-[rgba(121,219,194,0.08)] text-cyan-100'
}

function getPolarityTone(polarity: PressurePolarity) {
  return polarity === 'stress'
    ? {
        stroke: '#f3b15b',
        dot: '#fcd34d',
        fill: 'bg-amber-300/85',
        shell: 'border-[rgba(243,177,91,0.16)] bg-[rgba(243,177,91,0.06)]',
        text: 'text-amber-100',
        card: 'border-[rgba(243,177,91,0.16)] bg-[rgba(243,177,91,0.035)] hover:border-[rgba(243,177,91,0.26)] hover:bg-[rgba(243,177,91,0.055)]',
        selectedCard:
          'border-[rgba(243,177,91,0.36)] bg-[rgba(243,177,91,0.08)] shadow-[0_18px_60px_rgba(0,0,0,0.25)]',
      }
    : {
        stroke: '#79dbc2',
        dot: '#79dbc2',
        fill: 'bg-cyan-300/85',
        shell: 'border-[rgba(121,219,194,0.16)] bg-[rgba(121,219,194,0.06)]',
        text: 'text-cyan-100',
        card: 'border-[rgba(121,219,194,0.16)] bg-[rgba(121,219,194,0.035)] hover:border-[rgba(121,219,194,0.26)] hover:bg-[rgba(121,219,194,0.055)]',
        selectedCard:
          'border-[rgba(121,219,194,0.34)] bg-[rgba(121,219,194,0.08)] shadow-[0_18px_60px_rgba(0,0,0,0.25)]',
      }
}

function sortPressureSeries(
  series: PressureOverlaySeries[],
  currentPeriodScores: Record<string, number>,
  orderMode: LegendOrderMode,
) {
  return [...series].sort((left, right) => {
    if (orderMode === 'label') {
      return left.label.localeCompare(right.label)
    }

    if (orderMode === 'polarity') {
      const leftRank = left.polarity === 'stress' ? 0 : 1
      const rightRank = right.polarity === 'stress' ? 0 : 1

      if (leftRank !== rightRank) {
        return leftRank - rightRank
      }
    }

    const scoreDelta = (currentPeriodScores[right.id] ?? 0) - (currentPeriodScores[left.id] ?? 0)

    if (scoreDelta !== 0) {
      return scoreDelta
    }

    return left.label.localeCompare(right.label)
  })
}

export function PressureLegend({
  pressureSeries,
  selectedPressureId,
  currentPeriodId,
  currentPeriodScores,
  onPressureSelect,
}: PressureLegendProps) {
  const [densityMode, setDensityMode] = useState<LegendDensityMode>('expanded')
  const [orderMode, setOrderMode] = useState<LegendOrderMode>('intensity')
  const compactMode = densityMode === 'compact'
  const sortedSeries = sortPressureSeries(pressureSeries, currentPeriodScores, orderMode)

  return (
    <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-stone-100">Structural forces</h2>
        </div>
        <button
          type="button"
          onClick={() => onPressureSelect(null)}
          className="ui-action rounded-full px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-300 transition hover:text-stone-100"
        >
          Clear focus
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-400">
          Order
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDensityMode('compact')}
            className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
              compactMode
                ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            Compact
          </button>
          <button
            type="button"
            onClick={() => setDensityMode('expanded')}
            className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
              densityMode === 'expanded'
                ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            Expanded
          </button>
          <button
            type="button"
            onClick={() => setOrderMode('intensity')}
            className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
              orderMode === 'intensity'
                ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            By intensity
          </button>
          <button
            type="button"
            onClick={() => setOrderMode('polarity')}
            className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
              orderMode === 'polarity'
                ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            By role
          </button>
          <button
            type="button"
            onClick={() => setOrderMode('label')}
            className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
              orderMode === 'label'
                ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      <div
        className={`mt-5 grid gap-3 ${
          compactMode ? 'md:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-2 xl:grid-cols-3'
        }`}
      >
        {sortedSeries.map((series) => {
          const isSelected = selectedPressureId === series.id
          const currentValue = currentPeriodScores[series.id] ?? 0
          const tone = getPolarityTone(series.polarity)
          const showTrace = !compactMode
          const selectedPointIndex = series.points.findIndex(
            (point) => point.periodId === currentPeriodId,
          )
          const selectedPoint =
            selectedPointIndex >= 0 ? series.points[selectedPointIndex] : null
          const sparklineWidth = compactMode ? 220 : 260
          const sparklineHeight = compactMode ? 28 : 34
          const xStep =
            series.points.length > 1 ? sparklineWidth / (series.points.length - 1) : sparklineWidth

          return (
            <button
              key={series.id}
              type="button"
              onClick={() => onPressureSelect(series.id)}
              className={`rounded-[1.25rem] border text-left transition duration-300 ${
                compactMode ? 'px-3.5 py-3' : 'px-4 py-4'
              } ${
                isSelected ? tone.selectedCard : tone.card
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className={`font-medium tracking-[0.02em] text-stone-100 ${compactMode ? 'text-[13px]' : 'text-sm'}`}>
                    {series.label}
                  </h3>
                  {compactMode ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                      {series.category}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                      {series.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] ${getPolarityChipClass(
                      series.polarity,
                    )}`}
                  >
                    {series.polarity}
                  </span>
                  <span className="text-sm text-stone-300">{currentValue}</span>
                </div>
              </div>

              <div className={`mt-4 rounded-[1.1rem] border px-3 py-3 ${tone.shell}`}>
                <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  <span>Now</span>
                  <span className={tone.text}>{getIntensityLabel(currentValue)}</span>
                </div>

                <div className="mt-3 flex gap-1.5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={`${series.id}-band-${index}`}
                      className={`h-2 flex-1 rounded-full ${
                        index < getIntensitySegments(currentValue) ? tone.fill : 'bg-white/6'
                      }`}
                    />
                  ))}
                </div>

                {showTrace ? (
                  <div className="mt-3 overflow-hidden rounded-full border border-[rgba(214,211,209,0.08)] bg-black/20 px-2 py-2">
                    <svg
                      viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}
                      className="h-8 w-full"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d={buildSparklinePath(series.points, sparklineWidth, sparklineHeight - 2)}
                        fill="none"
                        stroke={tone.stroke}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {selectedPoint ? (
                        <circle
                          cx={selectedPointIndex * xStep}
                          cy={(sparklineHeight - 2) - selectedPoint.normalized * (sparklineHeight - 2)}
                          r="3.4"
                          fill={tone.dot}
                          stroke="rgba(12, 14, 16, 0.95)"
                          strokeWidth="1.4"
                        />
                      ) : null}
                    </svg>
                  </div>
                ) : null}
              </div>

              <div
                className={`flex flex-wrap items-center justify-between gap-2 ${
                  compactMode ? 'mt-3' : 'mt-4'
                }`}
              >
                {!compactMode ? (
                  <span className="rounded-full border border-[rgba(214,211,209,0.08)] bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-300">
                    {series.category}
                  </span>
                ) : null}
                <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Peaks in {series.peaks.length} period{series.peaks.length === 1 ? '' : 's'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
