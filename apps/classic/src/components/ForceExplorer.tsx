import { buildPressureCascade } from '../lib/loom-data'
import { getPublicEventSummary } from '../lib/public-copy'
import type { Period, PressurePolarity } from '../types/domain'
import type { PressureOverlaySeries, SelectedPeriodDetail } from '../types/view'

interface ForceExplorerProps {
  detail: SelectedPeriodDetail
  periods: Period[]
  pressureSeries: PressureOverlaySeries[]
  selectedPressureId: string | null
  currentPeriodId: string
  currentPeriodScores: Record<string, number>
  onPressureSelect: (pressureId: string | null) => void
  onPeriodSelect: (periodId: string) => void
}

const NAV_ROW_HEIGHT = 58
const NAV_ROW_GAP = 10
const NODE_MIN_X = 10
const NODE_MAX_X = 90
const PATH_MIN_X = 6
const PATH_MAX_X = 94
const TRACE_MIN_Y = 32
const TRACE_MAX_Y = 88

function getTraceX(index: number, total: number, mode: 'node' | 'path') {
  const min = mode === 'node' ? NODE_MIN_X : PATH_MIN_X
  const max = mode === 'node' ? NODE_MAX_X : PATH_MAX_X

  if (total <= 1) {
    return 50
  }

  return min + (index / (total - 1)) * (max - min)
}

function getTraceY(normalized: number) {
  return TRACE_MAX_Y - normalized * (TRACE_MAX_Y - TRACE_MIN_Y)
}

function buildSparklinePath(points: PressureOverlaySeries['points']) {
  if (!points.length) {
    return ''
  }

  return points
    .map((point, index) => {
      const x = getTraceX(index, points.length, 'path')
      const y = getTraceY(point.normalized)

      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function getIntensityLabel(value: number) {
  if (value >= 80) {
    return 'Peak'
  }

  if (value >= 60) {
    return 'High'
  }

  if (value >= 40) {
    return 'Present'
  }

  if (value >= 20) {
    return 'Low'
  }

  return 'Quiet'
}

function getPolarityTone(polarity: PressurePolarity) {
  return polarity === 'stress'
    ? {
        band: 'bg-[linear-gradient(180deg,rgba(243,177,91,0.18),rgba(243,177,91,0.03))]',
        glow: 'bg-[radial-gradient(circle_at_left,rgba(243,177,91,0.16),transparent_52%)]',
        label: 'text-amber-100',
        muted: 'text-amber-50/80',
        line: 'rgba(243,177,91,0.96)',
        lineSoft: 'rgba(243,177,91,0.34)',
        chip: 'bg-amber-300/12 text-amber-100',
        activeChip: 'bg-amber-300/18 text-amber-50',
        dot: 'rgba(252,211,77,0.98)',
        rail: 'rgba(243,177,91,0.74)',
      }
    : {
        band: 'bg-[linear-gradient(180deg,rgba(121,219,194,0.18),rgba(121,219,194,0.03))]',
        glow: 'bg-[radial-gradient(circle_at_left,rgba(121,219,194,0.16),transparent_52%)]',
        label: 'text-cyan-100',
        muted: 'text-cyan-50/80',
        line: 'rgba(121,219,194,0.98)',
        lineSoft: 'rgba(121,219,194,0.34)',
        chip: 'bg-cyan-300/12 text-cyan-100',
        activeChip: 'bg-cyan-300/18 text-cyan-50',
        dot: 'rgba(165,243,252,0.99)',
        rail: 'rgba(121,219,194,0.72)',
      }
}

function sortPressureSeries(
  series: PressureOverlaySeries[],
  currentPeriodScores: Record<string, number>,
) {
  return [...series].sort((left, right) => {
    const scoreDelta = (currentPeriodScores[right.id] ?? 0) - (currentPeriodScores[left.id] ?? 0)

    if (scoreDelta !== 0) {
      return scoreDelta
    }

    return left.label.localeCompare(right.label)
  })
}

function ForceLane({
  title,
  items,
  activePressureId,
  currentPeriodScores,
  onPressureSelect,
}: {
  title: string
  items: PressureOverlaySeries[]
  activePressureId: string | null
  currentPeriodScores: Record<string, number>
  onPressureSelect: (pressureId: string) => void
}) {
  const laneHeight =
    items.length > 0 ? items.length * NAV_ROW_HEIGHT + (items.length - 1) * NAV_ROW_GAP : 0

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{title}</p>
        <span className="text-[11px] uppercase tracking-[0.18em] text-stone-600">
          {items.length}
        </span>
      </div>

      <div className="relative" style={{ height: laneHeight || undefined }}>
        {items.map((series, index) => {
          const tone = getPolarityTone(series.polarity)
          const isActive = series.id === activePressureId
          const currentValue = currentPeriodScores[series.id] ?? 0

          return (
            <button
              key={series.id}
              type="button"
              onClick={() => onPressureSelect(series.id)}
              className={`absolute left-0 right-0 overflow-hidden rounded-[1.1rem] text-left transition-all duration-500 ${
                isActive
                  ? 'bg-white/[0.08] shadow-[0_14px_28px_rgba(0,0,0,0.18)]'
                  : 'bg-white/[0.025] hover:bg-white/[0.045]'
              }`}
              style={{ top: index * (NAV_ROW_HEIGHT + NAV_ROW_GAP), height: NAV_ROW_HEIGHT }}
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${tone.band}`} />
              <span
                className={`absolute inset-0 ${isActive ? tone.glow : 'opacity-0'} transition-opacity duration-300`}
              />
              <span
                className="absolute bottom-0 left-0 h-[2px] transition-all duration-500"
                style={{
                  width: `${currentValue}%`,
                  background: tone.rail,
                }}
              />
              <span className="relative flex h-full items-center justify-between gap-3 px-4">
                <span className="min-w-0">
                  <span className="block truncate text-sm text-stone-100">
                    {series.publicLabel ?? series.label}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${
                    isActive ? tone.activeChip : tone.chip
                  }`}
                >
                  {currentValue}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function ForceExplorer({
  detail,
  periods,
  pressureSeries,
  selectedPressureId,
  currentPeriodId,
  currentPeriodScores,
  onPressureSelect,
  onPeriodSelect,
}: ForceExplorerProps) {
  const sortedSeries = sortPressureSeries(pressureSeries, currentPeriodScores)
  const activePressureId = selectedPressureId ?? sortedSeries[0]?.id ?? null
  const activeSeries =
    pressureSeries.find((series) => series.id === activePressureId) ?? sortedSeries[0] ?? null
  const activeCascade =
    activePressureId !== null ? buildPressureCascade(detail, activePressureId) : null
  const activeValue = activeSeries ? currentPeriodScores[activeSeries.id] ?? 0 : 0
  const activeTone = activeSeries ? getPolarityTone(activeSeries.polarity) : null
  const stressSeries = sortedSeries.filter((series) => series.polarity === 'stress')
  const stabiliserSeries = sortedSeries.filter((series) => series.polarity === 'stabiliser')
  const periodById = Object.fromEntries(periods.map((period) => [period.id, period]))

  return (
    <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Force Explorer</p>
          <h2 className="font-display text-2xl text-stone-100">
            Watch one force move across time
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onPressureSelect(null)}
          className="ui-action rounded-full px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-300 transition hover:text-stone-100"
        >
          Clear focus
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-[1.4rem] bg-white/[0.025] px-4 py-4">
            <p className="text-sm leading-6 text-stone-400">
              Pick a force, then step across time to switch periods and watch the story realign.
            </p>
          </div>

          <ForceLane
            title="Pressure"
            items={stressSeries}
            activePressureId={activePressureId}
            currentPeriodScores={currentPeriodScores}
            onPressureSelect={onPressureSelect}
          />

          <ForceLane
            title="Support"
            items={stabiliserSeries}
            activePressureId={activePressureId}
            currentPeriodScores={currentPeriodScores}
            onPressureSelect={onPressureSelect}
          />
        </aside>

        {activeSeries && activeTone ? (
          <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="max-w-2xl pr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${activeTone.activeChip}`}>
                    {activeSeries.polarity === 'stress' ? 'pressure' : 'support'}
                  </span>
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-400">
                    {getIntensityLabel(activeValue)}
                  </span>
                </div>
                <h3 className="mt-2 text-xl text-stone-100">
                  {activeSeries.publicLabel ?? activeSeries.label}
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  {activeSeries.publicDescription ?? activeSeries.description}
                </p>
              </div>

              <div className="shrink-0 text-right md:justify-self-end">
                <p className={`text-4xl ${activeTone.muted}`}>{activeValue}</p>
                <span
                  className="mt-2 inline-flex min-h-[2.2rem] items-center rounded-full px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-100"
                  style={{ background: `linear-gradient(180deg, rgba(15,18,20,0.96), rgba(26,30,33,0.9))`, border: `1px solid ${activeTone.lineSoft}` }}
                >
                  {detail.period.rangeLabel}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Field trace</p>
                  <p className="mt-2 text-base text-stone-100">{detail.period.title}</p>
                </div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
                  Click a node to change period
                </p>
              </div>

              <div className="relative mt-5 h-56 overflow-hidden rounded-[1.5rem] bg-black/14 px-5 py-5">
                <div className="absolute inset-x-5 bottom-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${activeTone.lineSoft}, transparent)` }} />
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full px-5 py-5" preserveAspectRatio="none" aria-hidden="true">
                  <path d={buildSparklinePath(activeSeries.points)} fill="none" stroke={activeTone.lineSoft} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={buildSparklinePath(activeSeries.points)} fill="none" stroke={activeTone.line} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {activeSeries.points.map((point, index) => {
                  const period = periodById[point.periodId]
                  const left = getTraceX(index, activeSeries.points.length, 'node')
                  const top = getTraceY(point.normalized)
                  const isSelected = point.periodId === currentPeriodId
                  const isPeak = activeSeries.peaks.includes(point.periodId)

                  return (
                    <button
                      key={point.periodId}
                      type="button"
                      onClick={() => onPeriodSelect(point.periodId)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-[1.04]"
                      style={{ left: `${left}%`, top: `${top}%` }}
                      aria-label={`Select ${period?.rangeLabel ?? point.periodId}`}
                    >
                      {isSelected ? (
                        <span
                          className="absolute left-1/2 top-[-2.45rem] -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-stone-100 shadow-[0_10px_24px_rgba(0,0,0,0.24)]"
                          style={{ background: 'linear-gradient(180deg, rgba(15,18,20,0.98), rgba(26,30,33,0.92))', border: `1px solid ${activeTone.lineSoft}` }}
                        >
                          {period?.rangeLabel ?? detail.period.rangeLabel}
                        </span>
                      ) : null}
                      <span
                        className="block h-4 w-4 rounded-full border-2 shadow-[0_0_16px_rgba(0,0,0,0.12)]"
                        style={{
                          background: isSelected ? activeTone.dot : isPeak ? activeTone.line : 'rgba(245,245,244,0.85)',
                          borderColor: isSelected ? 'rgba(12,14,16,0.95)' : 'rgba(12,14,16,0.45)',
                          transform: isSelected ? 'scale(1.15)' : undefined,
                        }}
                      />
                    </button>
                  )
                })}

                <div className="absolute inset-x-5 bottom-0 flex items-end justify-between gap-2 pb-3">
                  {activeSeries.points.map((point) => {
                    const period = periodById[point.periodId]
                    const isSelected = point.periodId === currentPeriodId

                    return (
                      <button
                        key={`${point.periodId}-label`}
                        type="button"
                        onClick={() => onPeriodSelect(point.periodId)}
                        className={`min-w-0 flex-1 truncate px-1 text-center text-[10px] uppercase tracking-[0.16em] transition ${isSelected ? activeTone.label : 'text-stone-500 hover:text-stone-300'}`}
                      >
                        {period?.startYear ?? point.periodId}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Flashpoints</p>
                  <p className="mt-2 text-base text-stone-100">{detail.period.title}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${activeTone.chip}`}>
                  {activeCascade?.matchedEvents.length ?? 0} event{(activeCascade?.matchedEvents.length ?? 0) === 1 ? '' : 's'}
                </span>
              </div>

              {activeCascade?.matchedEvents.length ? (
                <div className="mt-4 space-y-3">
                  {activeCascade.matchedEvents.map((event) => (
                    <article key={event.id} className="rounded-[1.25rem] bg-white/[0.03] px-4 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
                      <div className="flex items-start gap-2">
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: activeTone.dot }} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm uppercase tracking-[0.14em] text-stone-100">{event.title}</h4>
                            <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone-400">
                              {event.startYear === event.endYear ? event.startYear : `${event.startYear}-${event.endYear}`}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-stone-300">
                            {getPublicEventSummary(event)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone-400">{event.geography}</span>
                            {event.scalesAffected.map((scale) => (
                              <span key={`${event.id}-${scale}`} className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone-400">
                                {scale}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.15rem] bg-white/[0.03] px-4 py-4 text-sm leading-6 text-stone-400">
                  No named flashpoints for this force in this period.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
