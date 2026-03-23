import type { Period } from '../types/domain'
import type { LoomDensityMode, PressureOverlaySeries } from '../types/view'
import { getReleaseLabel } from '../lib/loom-data'

interface LoomCanvasProps {
  periods: Period[]
  overlaySeries: PressureOverlaySeries[]
  selectedPeriodId: string
  selectedPressureId: string | null
  comparePicking: boolean
  compareTargetId: string | null
  compareActive: boolean
  showPressureOverlay: boolean
  echoCounterpartIds: Set<string>
  activeEchoCounterpartId: string | null
  showEchoes: boolean
  density: LoomDensityMode
  onPeriodSelect: (periodId: string) => void
  onDensityChange: (density: LoomDensityMode) => void
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

export function LoomCanvas({
  periods,
  overlaySeries,
  selectedPeriodId,
  selectedPressureId,
  comparePicking,
  compareTargetId,
  compareActive,
  showPressureOverlay,
  echoCounterpartIds,
  activeEchoCounterpartId,
  showEchoes,
  density,
  onPeriodSelect,
  onDensityChange,
  onPressureSelect,
}: LoomCanvasProps) {
  const selectedSeries =
    selectedPressureId !== null
      ? overlaySeries.find((series) => series.id === selectedPressureId) ?? null
      : null
  const compactStack = density === 'compact'

  return (
    <section className="glass-panel reveal-up overflow-hidden rounded-[2rem] border border-[rgba(214,211,209,0.08)]">
      <div className="border-b border-[rgba(214,211,209,0.08)] px-6 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">The Loom</p>
            <h2 className="font-display text-2xl text-stone-100 md:text-3xl">
              Periods, visible pressure, curated echoes
            </h2>
          </div>
          <div className="max-w-xl text-sm leading-6 text-stone-400">
            {selectedSeries ? (
              <>
                <span className="text-stone-200">{selectedSeries.label}:</span>{' '}
                {selectedSeries.description}
              </>
            ) : (
              <>Select a pressure to trace one force across the whole field.</>
            )}
          </div>
        </div>

        {comparePicking ? (
          <div className="surface-depth reveal-up reveal-delay-1 mt-4 rounded-[1.25rem] border border-amber-300/16 bg-amber-300/7 px-4 py-3 text-sm leading-6 text-amber-50">
            Compare is ready. Amber marks the period you started from. Choose the second period directly on the Loom.
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
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
                {series.label}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <p className="text-xs leading-6 text-stone-500">
            {compactStack
              ? 'Compact period stack reduces unselected cards to date and title while the active card opens wider.'
              : 'Expanded period stack gives each period more room for reading.'}
          </p>
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
              Overview stack
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
              Expanded cards
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
            {overlaySeries.map((series) => (
              <path
                key={series.id}
                d={buildPath(series.points, 1100, 160)}
                className={`transition-opacity duration-500 ${getSeriesClass(
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
                          {period.summary}
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
                                {value}
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
                          Comparison period
                        </div>
                      ) : null}
                      {isActiveEcho && !isCompareTarget ? (
                        <div className="mt-3 rounded-2xl border border-[rgba(103,232,249,0.22)] bg-[rgba(103,232,249,0.08)] px-3 py-2 text-xs leading-5 text-cyan-50">
                          Echo in focus
                        </div>
                      ) : null}
                      {showEchoState && !isCompareTarget && !isActiveEcho ? (
                        <div className="mt-3 rounded-2xl border border-[rgba(121,219,194,0.18)] bg-[rgba(121,219,194,0.08)] px-3 py-2 text-xs leading-5 text-cyan-100">
                          Echoes active
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
