import type { Period } from '../types/domain'
import type { PressureOverlaySeries } from '../types/view'
import { getReleaseLabel } from '../lib/loom-data'

interface LoomCanvasProps {
  periods: Period[]
  overlaySeries: PressureOverlaySeries[]
  selectedPeriodId: string
  selectedPressureId: string | null
  showPressureOverlay: boolean
  echoCounterpartIds: Set<string>
  showEchoes: boolean
  onPeriodSelect: (periodId: string) => void
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
  showPressureOverlay,
  echoCounterpartIds,
  showEchoes,
  onPeriodSelect,
  onPressureSelect,
}: LoomCanvasProps) {
  const selectedSeries =
    selectedPressureId !== null
      ? overlaySeries.find((series) => series.id === selectedPressureId) ?? null
      : null

  return (
    <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/10">
      <div className="border-b border-white/10 px-6 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">The Loom</p>
            <h2 className="font-display text-2xl text-stone-100 md:text-3xl">
              Equal periods, visible pressure, curated echoes
            </h2>
          </div>
          <div className="max-w-xl text-sm leading-6 text-stone-400">
            {selectedSeries ? (
              <>
                <span className="text-stone-200">{selectedSeries.label}:</span>{' '}
                {selectedSeries.description}
              </>
            ) : (
              <>Select a pressure to trace one force across all 12 periods.</>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPressureSelect(null)}
            className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition ${
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
                className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition ${
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
      </div>

      <div className="relative px-4 pb-6 pt-6 md:px-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(219,181,108,0.16),_transparent_60%)]" />

        <div className="relative h-48 rounded-[1.5rem] border border-white/6 bg-black/20 px-4 py-4 md:h-56">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:8.333%_100%]" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
          <div className="absolute inset-x-0 top-[22%] h-px bg-white/5" />
          <div className="absolute inset-x-0 top-[78%] h-px bg-white/5" />

          <svg
            viewBox="0 0 1100 180"
            className="absolute inset-0 h-full w-full"
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

          <div className="absolute inset-x-4 bottom-4 grid grid-cols-6 gap-2 text-[10px] uppercase tracking-[0.28em] text-stone-500 md:grid-cols-12">
            {periods.map((period) => (
              <span key={period.id} className="truncate text-center">
                {period.rangeLabel}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 max-h-[28rem] overflow-y-auto pr-1">
          <div className="grid gap-3 xl:grid-cols-2">
            {periods.map((period) => {
              const isSelected = period.id === selectedPeriodId
              const isEcho = echoCounterpartIds.has(period.id)
              const showEchoState = showEchoes && isEcho

              return (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => onPeriodSelect(period.id)}
                  className={`group relative flex min-h-[13.5rem] flex-col rounded-[1.5rem] border px-4 py-4 text-left transition duration-300 ${
                    isSelected
                      ? 'border-amber-300/65 bg-stone-950/90 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_24px_80px_rgba(0,0,0,0.35)]'
                      : showEchoState
                        ? 'border-cyan-300/45 bg-cyan-500/5'
                        : 'border-white/8 bg-white/4 hover:border-white/16 hover:bg-white/7'
                  }`}
                >
                  <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)] opacity-60" />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="eyebrow">{period.rangeLabel}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isSelected
                          ? 'bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.65)]'
                          : showEchoState
                            ? 'bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.45)]'
                            : 'bg-white/20'
                      }`}
                    />
                  </div>

                  <div className="relative mt-5 flex flex-1 gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl leading-tight text-stone-100">
                        {period.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-stone-400">
                        {period.summary}
                      </p>
                    </div>

                    <div className="hidden w-40 shrink-0 xl:block">
                      <div className="flex flex-wrap justify-end gap-2">
                        {period.dominantValues.slice(0, 3).map((value) => (
                          <span
                            key={value}
                            className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-auto pt-6">
                    <div className="h-px bg-white/10" />
                    <div className="mt-4 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                      <span>{getReleaseLabel(period.releaseType)}</span>
                      <span>{period.echoIds.length} echoes</span>
                    </div>
                    {showEchoState ? (
                      <div className="mt-3 rounded-2xl border border-cyan-200/15 bg-cyan-300/8 px-3 py-2 text-xs leading-5 text-cyan-100">
                        Echoes active
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
