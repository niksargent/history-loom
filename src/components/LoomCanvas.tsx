import type { Period } from '../types/domain'
import type { LoomDensityMode, PressureOverlaySeries } from '../types/view'
import { formatPopulationCompact } from '../lib/format'
import { getReleaseLabel } from '../lib/loom-data'
import { getPublicConceptPhrase, getPublicPeriodSummary } from '../lib/public-copy'

interface LoomCanvasProps {
  periods: Period[]
  overlaySeries: PressureOverlaySeries[]
  selectedPeriodTitle: string
  selectedPeriodRangeLabel: string
  selectedPeriodId: string
  selectedPressureId: string | null
  comparePicking: boolean
  compareTargetId: string | null
  compareActive: boolean
  showPressureOverlay: boolean
  showPopulation: boolean
  echoCounterpartIds: Set<string>
  activeEchoCounterpartId: string | null
  showEchoes: boolean
  density: LoomDensityMode
  onPeriodSelect: (periodId: string) => void
  onDensityChange: (density: LoomDensityMode) => void
  onTogglePressureOverlay: () => void
  onTogglePopulation: () => void
  onToggleEchoes: () => void
  onToggleCompare: () => void
  onPressureSelect: (pressureId: string | null) => void
}

function buildPath(points: PressureOverlaySeries['points'], width: number, height: number) {
  if (!points.length) {
    return ''
  }

  const xStep = points.length > 1 ? width / (points.length - 1) : width
  const coordinates = points.map((point, index) => {
    const x = index * xStep
    const y = height - point.normalized * height

    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  })

  return coordinates.join(' ')
}

function buildPopulationPoints(values: number[], width: number, height: number) {
  if (!values.length) {
    return []
  }

  const maxValue = Math.max(...values, 1)
  const columnWidth = width / values.length

  return values.map((value, index) => {
    const x = columnWidth * index + columnWidth / 2
    const normalized = maxValue === 0 ? 0 : value / maxValue
    const y = height - normalized * (height * 0.82) - height * 0.08

    return { x, y }
  })
}

function buildPopulationLinePath(values: number[], width: number, height: number) {
  const points = buildPopulationPoints(values, width, height)

  return points
    .map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    })
    .join(' ')
}

function buildPopulationAreaPath(values: number[], width: number, height: number) {
  const points = buildPopulationPoints(values, width, height)

  if (!points.length) {
    return ''
  }

  const firstX = points[0].x
  const lastX = points[points.length - 1].x
  const baselineY = height - height * 0.04
  const linePath = points
    .map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    })
    .join(' ')

  return `${linePath} L ${lastX.toFixed(2)} ${baselineY.toFixed(2)} L ${firstX.toFixed(2)} ${baselineY.toFixed(2)} Z`
}

function buildEchoRoutePath(fromIndex: number, toIndex: number, count: number) {
  if (count <= 0 || fromIndex === toIndex) {
    return ''
  }

  const columnWidth = 1100 / count
  const startX = fromIndex * columnWidth + columnWidth / 2
  const endX = toIndex * columnWidth + columnWidth / 2
  const distance = Math.abs(toIndex - fromIndex)
  const baseY = 132
  const canopyY = Math.max(18, 58 - distance * 7)

  return `M ${startX.toFixed(2)} ${baseY.toFixed(2)} L ${startX.toFixed(2)} ${canopyY.toFixed(2)} L ${endX.toFixed(2)} ${canopyY.toFixed(2)} L ${endX.toFixed(2)} ${baseY.toFixed(2)}`
}

function getSeriesClass(
  seriesId: string,
  selectedPressureId: string | null,
  showPressureOverlay: boolean,
) {
  if (!showPressureOverlay) {
    return 'opacity-0'
  }

  if (!selectedPressureId) {
    return 'opacity-20'
  }

  return selectedPressureId === seriesId ? 'opacity-100' : 'opacity-10'
}

function sortSeriesForRender(
  series: PressureOverlaySeries[],
  selectedPressureId: string | null,
) {
  return [...series].sort((left, right) => {
    if (left.id === selectedPressureId) {
      return 1
    }

    if (right.id === selectedPressureId) {
      return -1
    }

    return 0
  })
}

export function LoomCanvas({
  periods,
  overlaySeries,
  selectedPeriodTitle,
  selectedPeriodRangeLabel,
  selectedPeriodId,
  selectedPressureId,
  comparePicking,
  compareTargetId,
  compareActive,
  showPressureOverlay,
  showPopulation,
  echoCounterpartIds,
  activeEchoCounterpartId,
  showEchoes,
  density,
  onPeriodSelect,
  onDensityChange,
  onTogglePressureOverlay,
  onTogglePopulation,
  onToggleEchoes,
  onToggleCompare,
  onPressureSelect,
}: LoomCanvasProps) {
  const selectedSeries =
    selectedPressureId !== null
      ? overlaySeries.find((series) => series.id === selectedPressureId) ?? null
      : null
  const compactStack = density === 'compact'
  const selectedIndex = periods.findIndex((period) => period.id === selectedPeriodId)
  const echoRouteIndexes = showEchoes
    ? periods
        .map((period, index) =>
          echoCounterpartIds.has(period.id) && index !== selectedIndex
            ? { id: period.id, index, active: period.id === activeEchoCounterpartId }
            : null,
        )
        .filter((value): value is { id: string; index: number; active: boolean } => value !== null)
    : []
  const mutedEchoRoutes = echoRouteIndexes.filter((route) => !route.active)
  const activeEchoRoute = echoRouteIndexes.find((route) => route.active) ?? null
  const renderedSeries = sortSeriesForRender(overlaySeries, selectedPressureId)
  const populationValues = periods.map((period) => period.populationEstimate ?? 0)
  const populationPoints = buildPopulationPoints(populationValues, 1100, 120)
  const selectedPopulation = periods.find((period) => period.id === selectedPeriodId)?.populationEstimate
  const selectedPopulationLabel = formatPopulationCompact(selectedPopulation)
  const firstPopulationLabel = formatPopulationCompact(periods[0]?.populationEstimate)
  const lastPopulationLabel = formatPopulationCompact(periods[periods.length - 1]?.populationEstimate)
  const selectedPopulationMarkerLeft =
    periods.length
      ? `${((selectedIndex + 0.5) / periods.length) * 100}%`
      : '0%'
  const selectedPopulationPoint =
    selectedIndex >= 0 && selectedIndex < populationPoints.length
      ? populationPoints[selectedIndex]
      : null
  const selectedPopulationMarkerTop = selectedPopulationPoint
    ? `${(selectedPopulationPoint.y / 120) * 100}%`
    : '50%'
  const selectedPopulationLabelStyle = selectedPopulationPoint
    ? selectedPopulationPoint.y <= 26
      ? {
          left: selectedPopulationMarkerLeft,
          top: `calc(${selectedPopulationMarkerTop} + 1.1rem)`,
        }
      : {
          left: selectedPopulationMarkerLeft,
          top: `calc(${selectedPopulationMarkerTop} - 1.45rem)`,
        }
    : null

  return (
    <section className="glass-panel reveal-up overflow-hidden rounded-[2rem] border border-[rgba(214,211,209,0.08)]">
      <div className="border-b border-[rgba(214,211,209,0.08)] px-6 py-4 md:px-8">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12.75rem] md:items-start md:gap-x-5">
          <div>
            <p className="eyebrow">The Loom</p>
            <h2 className="font-display text-2xl leading-tight text-stone-100 md:text-3xl">
              {selectedPeriodTitle}
            </h2>
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-stone-500">
              {selectedPeriodRangeLabel}
            </p>
          </div>

          {selectedSeries ? (
            <div className="rounded-[1rem] border border-[rgba(214,211,209,0.08)] bg-white/[0.035] px-3.5 py-3 text-right text-sm leading-6 text-stone-400 md:row-span-2">
              <span className="text-stone-200">{selectedSeries.label}:</span>{' '}
              {selectedSeries.description}
            </div>
          ) : null}

          {comparePicking ? (
            <div
              className={`surface-depth reveal-up reveal-delay-1 rounded-[1.25rem] border border-amber-300/16 bg-amber-300/7 px-4 py-3 text-sm leading-6 text-amber-50 ${
                selectedSeries ? '' : 'md:col-span-2'
              }`}
            >
              Compare is ready. Pick the second period directly on the Loom.
            </div>
          ) : null}

          <div className={selectedSeries ? 'min-w-0 w-full md:pr-2' : 'min-w-0 w-full md:col-span-2'}>
            <div className="mt-1 flex w-full flex-wrap gap-2 md:mt-0">
              <button
                type="button"
                onClick={() => onPressureSelect(null)}
                className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-200/40 ${
                  selectedPressureId === null
                    ? 'border-stone-200/30 bg-white/10 text-stone-100'
                    : 'border-white/10 text-stone-400 hover:border-white/20 hover:text-stone-200'
                }`}
              >
                All threads
              </button>
              {overlaySeries.map((series) => {
                const isSelected = selectedPressureId === series.id

                return (
                  <button
                    key={series.id}
                    type="button"
                    onClick={() => onPressureSelect(series.id)}
                    className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/40 ${
                      isSelected
                        ? series.polarity === 'stress'
                          ? 'border-amber-300/45 bg-amber-300/10 text-amber-100'
                          : 'border-cyan-300/45 bg-cyan-300/10 text-cyan-100'
                        : 'border-white/10 text-stone-400 hover:border-white/20 hover:text-stone-200'
                    }`}
                  >
                    {series.publicLabel ?? series.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onTogglePressureOverlay}
              className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                showPressureOverlay
                  ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              {showPressureOverlay ? 'Hide pressure lines' : 'Show pressure lines'}
            </button>
            <button
              type="button"
              onClick={onTogglePopulation}
              className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                showPopulation
                  ? 'border-[rgba(206,153,255,0.35)] bg-[rgba(206,153,255,0.1)] text-fuchsia-100'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              {showPopulation ? 'Hide population' : 'Show population'}
            </button>
            <button
              type="button"
              onClick={onToggleEchoes}
              className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                showEchoes
                  ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              {showEchoes ? 'Hide echoes' : 'Reveal echoes'}
            </button>
            <button
              type="button"
              onClick={onToggleCompare}
              className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                compareActive
                  ? 'border-rose-300/35 bg-rose-300/10 text-rose-100'
                  : comparePicking
                    ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                    : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              {compareActive ? 'Exit compare' : comparePicking ? 'Cancel compare' : 'Start compare'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onDensityChange('compact')}
              className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                compactStack
                  ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => onDensityChange('expanded')}
              className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                density === 'expanded'
                  ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              Expanded
            </button>
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-6 pt-6 md:px-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(219,181,108,0.16),_transparent_60%)]" />

        <div className="surface-depth relative h-48 rounded-[1.5rem] border border-[rgba(214,211,209,0.07)] bg-black/20 px-4 py-4 md:h-56">
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)]"
            style={{ backgroundSize: `${100 / Math.max(periods.length, 1)}% 100%` }}
          />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
          <div className="absolute inset-x-0 top-[22%] h-px bg-white/5" />
          <div className="absolute inset-x-0 top-[78%] h-px bg-white/5" />
          <div className="pointer-events-none absolute inset-0">
            {periods.map((period, index) => {
              const left = `${(index / periods.length) * 100}%`
              const width = `${100 / periods.length}%`
              const isSelected = period.id === selectedPeriodId
              const isCompareTarget = period.id === compareTargetId
              const isEcho = showEchoes && echoCounterpartIds.has(period.id)
              const isActiveEcho = showEchoes && period.id === activeEchoCounterpartId

              return (
                <div
                  key={period.id}
                  className={`absolute bottom-0 top-0 transition-opacity duration-300 ${
                    isSelected
                      ? 'loom-band-active bg-amber-300/10 opacity-100'
                      : isCompareTarget
                        ? 'loom-band-target bg-rose-300/8 opacity-100'
                      : isActiveEcho
                        ? 'loom-band-echo-active bg-cyan-300/9 opacity-100'
                      : isEcho
                        ? 'loom-band-echo bg-cyan-300/5 opacity-100'
                        : 'opacity-0'
                  }`}
                  style={{ left, width }}
                >
                  {isSelected ? (
                    <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-amber-200/45 shadow-[0_0_18px_rgba(252,211,77,0.22)]" />
                  ) : null}
                  {isCompareTarget ? (
                    <div className="absolute inset-y-5 left-1/2 w-px -translate-x-1/2 bg-rose-200/35 [background-image:linear-gradient(to_bottom,rgba(254,205,211,0.72)_0_45%,transparent_45%_100%)] [background-size:1px_12px] bg-repeat-y" />
                  ) : null}
                  {isEcho ? (
                    <div className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-cyan-200/30 [background-image:linear-gradient(to_bottom,rgba(165,243,252,0.75)_0_40%,transparent_40%_100%)] [background-size:1px_10px] bg-repeat-y" />
                  ) : null}
                  {isActiveEcho ? (
                    <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-cyan-100/55 shadow-[0_0_16px_rgba(103,232,249,0.25)]" />
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="absolute inset-0">
            {periods.map((period, index) => {
              const left = `${(index / periods.length) * 100}%`
              const width = `${100 / periods.length}%`
              const isSelected = period.id === selectedPeriodId
              const isCompareTarget = period.id === compareTargetId
              const isEcho = showEchoes && echoCounterpartIds.has(period.id)
              const isActiveEcho = showEchoes && period.id === activeEchoCounterpartId

              return (
                <button
                  key={`${period.id}-chart-hit`}
                  type="button"
                  onClick={() => onPeriodSelect(period.id)}
                  aria-pressed={isSelected || isCompareTarget}
                  aria-label={`Select ${period.title}`}
                  className={`absolute bottom-0 top-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${
                    isSelected
                      ? 'bg-amber-200/[0.03]'
                      : isCompareTarget
                        ? 'bg-rose-200/[0.025]'
                        : isActiveEcho
                          ? 'bg-cyan-200/[0.05] hover:bg-cyan-200/[0.07]'
                        : isEcho
                          ? 'bg-cyan-200/[0.02] hover:bg-cyan-200/[0.035]'
                          : 'hover:bg-white/[0.035]'
                  }`}
                  style={{ left, width }}
                >
                  <span className="sr-only">{period.rangeLabel}</span>
                </button>
              )
            })}
          </div>

          <svg
            viewBox="0 0 1100 180"
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {renderedSeries.map((series) => (
              <path
                key={series.id}
                d={buildPath(series.points, 1100, 160)}
                className={`transition-opacity duration-500 ${
                  series.id === selectedPressureId && showPressureOverlay ? 'pressure-selected' : ''
                } ${getSeriesClass(
                  series.id,
                  selectedPressureId,
                  showPressureOverlay,
                )}`}
                fill="none"
                stroke={
                  series.id === selectedPressureId
                    ? series.polarity === 'stress'
                      ? '#f3b15b'
                      : '#79dbc2'
                    : 'rgba(231,229,228,0.82)'
                }
                strokeWidth={series.id === selectedPressureId ? 3.2 : 1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {mutedEchoRoutes.map((route) => {
              const path = buildEchoRoutePath(selectedIndex, route.index, periods.length)
              const sourceX = ((selectedIndex + 0.5) * 1100) / periods.length
              const targetX = ((route.index + 0.5) * 1100) / periods.length
              const distance = Math.abs(route.index - selectedIndex)
              const canopyY = Math.max(18, 58 - distance * 7)

              return (
                <g key={`echo-route-${route.id}`}>
                  <path
                    d={path}
                    className="echo-route-muted"
                    pathLength="1"
                    fill="none"
                    stroke="rgba(165,243,252,0.28)"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx={sourceX}
                    cy="132"
                    r="3.2"
                    fill="rgba(250,204,21,0.46)"
                  />
                  <circle
                    cx={sourceX}
                    cy={canopyY}
                    r="2.1"
                    fill="rgba(250,204,21,0.3)"
                  />
                  <circle
                    cx={targetX}
                    cy="132"
                    r="3.2"
                    fill="rgba(165,243,252,0.52)"
                  />
                  <circle
                    cx={targetX}
                    cy={canopyY}
                    r="2.1"
                    fill="rgba(165,243,252,0.32)"
                  />
                </g>
              )
            })}
            {activeEchoRoute ? (() => {
              const path = buildEchoRoutePath(selectedIndex, activeEchoRoute.index, periods.length)
              const sourceX = ((selectedIndex + 0.5) * 1100) / periods.length
              const targetX = ((activeEchoRoute.index + 0.5) * 1100) / periods.length
              const distance = Math.abs(activeEchoRoute.index - selectedIndex)
              const canopyY = Math.max(18, 58 - distance * 7)

              return (
                <g key={`echo-route-active-${activeEchoRoute.id}`}>
                  <path
                    d={path}
                    className="echo-route-trace"
                    pathLength="1"
                    fill="none"
                    stroke="rgba(165,243,252,0.86)"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx={sourceX} cy="132" r="4.8" fill="rgba(250,204,21,0.96)" />
                  <circle cx={sourceX} cy={canopyY} r="3" fill="rgba(250,204,21,0.9)" />
                  <circle cx={targetX} cy={canopyY} r="3" fill="rgba(165,243,252,0.9)" />
                  <circle cx={targetX} cy="132" r="4.8" fill="rgba(165,243,252,0.96)" />
                </g>
              )
            })() : null}
          </svg>

          <div
            className="absolute inset-x-4 bottom-4 grid gap-2 text-[10px] uppercase tracking-[0.28em] text-stone-500"
            style={{ gridTemplateColumns: `repeat(${periods.length}, minmax(0, 1fr))` }}
          >
            {periods.map((period) => {
              const isSelected = period.id === selectedPeriodId
              const isCompareTarget = period.id === compareTargetId
              const isEcho = showEchoes && echoCounterpartIds.has(period.id)
              const isActiveEcho = showEchoes && period.id === activeEchoCounterpartId

              return (
                <span
                  key={period.id}
                  className={`truncate text-center transition ${
                    isSelected
                      ? 'text-amber-100 drop-shadow-[0_0_10px_rgba(252,211,77,0.28)]'
                      : isCompareTarget
                        ? 'text-rose-200'
                        : isActiveEcho
                          ? 'text-cyan-100 drop-shadow-[0_0_10px_rgba(103,232,249,0.22)]'
                        : isEcho
                          ? 'text-cyan-200'
                          : ''
                  }`}
                >
                {period.rangeLabel}
                </span>
              )
            })}
          </div>
        </div>

        {showPopulation ? (
          <div className="surface-depth relative mt-4 overflow-hidden rounded-[1.4rem] border border-[rgba(214,211,209,0.07)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Population</p>
                <p className="mt-1 text-sm leading-6 text-stone-400">
                  The scale of life across this history
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                  {selectedPeriodRangeLabel}
                </p>
                <p className="mt-1 font-display text-xl text-stone-100">
                  {selectedPopulationLabel ?? 'n/a'}
                </p>
              </div>
            </div>

            <div className="relative mt-4 h-24 overflow-hidden rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(206,153,255,0.08),rgba(206,153,255,0.015))]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)]" style={{ backgroundSize: `${100 / Math.max(periods.length, 1)}% 100%` }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/8" />
              <div
                className="pointer-events-none absolute bottom-0 top-0 w-px -translate-x-1/2 bg-fuchsia-200/35"
                style={{ left: selectedPopulationMarkerLeft }}
              />
              {selectedPopulationPoint ? (
                <>
                  <div
                    className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-100/70 bg-[rgba(229,204,255,0.9)] shadow-[0_0_12px_rgba(229,204,255,0.28)]"
                    style={{
                      left: selectedPopulationMarkerLeft,
                      top: selectedPopulationMarkerTop,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -translate-x-1/2 rounded-full border border-[rgba(229,204,255,0.2)] bg-[rgba(36,30,46,0.82)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/90 shadow-[0_12px_22px_rgba(0,0,0,0.18)]"
                    style={selectedPopulationLabelStyle ?? undefined}
                  >
                    {selectedPopulationLabel ?? 'n/a'}
                  </div>
                </>
              ) : null}

              <svg
                viewBox="0 0 1100 120"
                className="pointer-events-none absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="population-tide-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(224, 190, 255, 0.32)" />
                    <stop offset="68%" stopColor="rgba(224, 190, 255, 0.12)" />
                    <stop offset="100%" stopColor="rgba(224, 190, 255, 0)" />
                  </linearGradient>
                </defs>
                <path
                  d={buildPopulationAreaPath(populationValues, 1100, 120)}
                  fill="url(#population-tide-fill)"
                />
                <path
                  d={buildPopulationLinePath(populationValues, 1100, 120)}
                  fill="none"
                  stroke="rgba(229, 204, 255, 0.92)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-stone-500">
              <span>{firstPopulationLabel ?? 'n/a'}</span>
              <span>{lastPopulationLabel ?? 'n/a'}</span>
            </div>
          </div>
        ) : null}

        <div className={`mt-6 overflow-y-auto pr-1 ${compactStack ? 'max-h-[40rem]' : 'max-h-[32rem]'}`}>
          <div className="grid gap-3">
            {periods.map((period) => {
              const isSelected = period.id === selectedPeriodId
              const isEcho = echoCounterpartIds.has(period.id)
              const showEchoState = showEchoes && isEcho
              const isCompareTarget = period.id === compareTargetId
              const isActiveEcho = showEchoes && period.id === activeEchoCounterpartId
              const compactFocus = compactStack && (isSelected || isCompareTarget)
              const compactPreview = compactStack && !compactFocus

              return (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => onPeriodSelect(period.id)}
                  aria-pressed={isSelected || isCompareTarget}
                  className={`group relative flex flex-col overflow-hidden rounded-[1.5rem] border text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${
                    compactStack
                      ? compactFocus
                        ? 'min-h-[10rem] px-4 py-4 md:px-5'
                        : 'min-h-[5.75rem] px-4 py-3 md:px-4'
                      : 'min-h-[13rem] px-4 py-4 md:px-5'
                    } ${
                      isSelected
                      ? 'surface-depth border-amber-300/65 bg-stone-950/90 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_24px_80px_rgba(0,0,0,0.35)]'
                        : isCompareTarget
                          ? 'surface-depth border-[rgba(251,113,133,0.32)] bg-[rgba(251,113,133,0.08)]'
                        : isActiveEcho
                          ? 'surface-depth border-[rgba(103,232,249,0.36)] bg-[rgba(103,232,249,0.08)]'
                        : showEchoState
                          ? 'surface-depth border-[rgba(121,219,194,0.28)] bg-[rgba(121,219,194,0.05)]'
                          : 'border-[rgba(214,211,209,0.08)] bg-white/4 hover:border-[rgba(214,211,209,0.14)] hover:bg-white/6'
                    }`}
                >
                  <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)] opacity-60" />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="eyebrow">{period.rangeLabel}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isSelected
                          ? 'bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.65)]'
                          : isCompareTarget
                            ? 'bg-rose-200 shadow-[0_0_16px_rgba(254,205,211,0.4)]'
                          : isActiveEcho
                            ? 'bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.55)]'
                          : showEchoState
                            ? 'bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.45)]'
                            : 'bg-white/20'
                      }`}
                    />
                  </div>

                  <div
                    className={`relative flex flex-1 ${
                      compactPreview
                        ? 'mt-3 items-center justify-between gap-4'
                        : `flex-col gap-4 md:flex-row md:items-start ${compactStack ? 'mt-4' : 'mt-5'}`
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-display leading-tight text-stone-100 ${
                          compactPreview ? 'text-lg' : 'text-xl'
                        }`}
                      >
                        {period.title}
                      </h3>
                      {!compactPreview ? (
                        <p
                          className={`text-sm leading-6 text-stone-400 ${
                            compactStack ? 'mt-2 max-h-[3.7rem] overflow-hidden' : 'mt-3'
                          }`}
                        >
                          {getPublicPeriodSummary(period)}
                        </p>
                      ) : null}
                    </div>

                    {!compactPreview ? (
                      <div className={`md:shrink-0 ${compactStack ? 'md:w-48' : 'md:w-56'}`}>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          {period.dominantValues
                            .slice(0, compactStack && !compactFocus ? 2 : 3)
                            .map((value) => (
                              <span
                                key={value}
                                className="rounded-full border border-[rgba(214,211,209,0.08)] bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                              >
                                {getPublicConceptPhrase(value)}
                              </span>
                            ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {!compactPreview ? (
                    <div className={`relative mt-auto ${compactStack ? 'pt-4' : 'pt-6'}`}>
                      <div className="h-px bg-white/10" />
                      <div className="mt-4 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                        <span>{getReleaseLabel(period.releaseType)}</span>
                        <span>
                          {isCompareTarget
                            ? compareActive
                              ? 'in comparison'
                              : 'chosen for compare'
                            : `${period.echoIds.length} echoes`}
                        </span>
                      </div>
                      {isCompareTarget ? (
                        <div className="mt-3 rounded-2xl border border-[rgba(251,113,133,0.18)] bg-[rgba(251,113,133,0.08)] px-3 py-2 text-xs leading-5 text-rose-100">
                          Compare
                        </div>
                      ) : null}
                      {isActiveEcho && !isCompareTarget ? (
                        <div className="mt-3 rounded-2xl border border-[rgba(103,232,249,0.22)] bg-[rgba(103,232,249,0.08)] px-3 py-2 text-xs leading-5 text-cyan-50">
                          Echo focus
                        </div>
                      ) : null}
                      {showEchoState && !isCompareTarget && !isActiveEcho ? (
                        <div className="mt-3 rounded-2xl border border-[rgba(121,219,194,0.18)] bg-[rgba(121,219,194,0.08)] px-3 py-2 text-xs leading-5 text-cyan-100">
                          Echo
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
