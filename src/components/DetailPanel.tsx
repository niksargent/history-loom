import { formatConfidence, sentenceCase, titleCaseLabel } from '../lib/format'
import {
  buildGeographyInsetModel,
  buildPressureCascade,
  getScaleAccent,
} from '../lib/loom-data'
import type { PressureOverlaySeries, SelectedPeriodDetail } from '../types/view'
import { GeographyInset } from './GeographyInset'

interface DetailPanelProps {
  detail: SelectedPeriodDetail
  isOpen: boolean
  showEchoes: boolean
  selectedPressureId: string | null
  selectedPressureSeries: PressureOverlaySeries | null
  comparePicking: boolean
  compareActive: boolean
  onToggleOpen: () => void
  onToggleEchoes: () => void
  onStartComparePick: () => void
  onCompareToPeriod: (periodId: string) => void
}

export function DetailPanel({
  detail,
  isOpen,
  showEchoes,
  selectedPressureId,
  selectedPressureSeries,
  comparePicking,
  compareActive,
  onToggleOpen,
  onToggleEchoes,
  onStartComparePick,
  onCompareToPeriod,
}: DetailPanelProps) {
  const { period, events, snapshot, echoes, scaleSummaries, pressureSnapshots } = detail
  const pressureCascade = buildPressureCascade(detail, selectedPressureId)
  const geographyModel = buildGeographyInsetModel(
    Array.from(
      new Set(
        pressureCascade?.geographyLabels?.length
          ? period.geography.concat(pressureCascade.geographyLabels)
          : period.geography,
      ),
    ),
    pressureCascade
      ? `${pressureCascade.label} through ${period.title}`
      : `${period.title} in place`,
  )

  return (
    <aside
      className={`glass-panel overflow-hidden rounded-[2rem] border border-white/10 transition duration-300 xl:sticky xl:top-5 xl:h-[calc(100vh-2.5rem)] ${
        isOpen ? 'opacity-100' : 'opacity-85'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-6 py-5 md:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Selected period</p>
              <h2 className="font-display text-2xl text-stone-100">{period.title}</h2>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-stone-500">
                {period.rangeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleOpen}
              className="rounded-full border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-300 transition hover:border-white/20 hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
            >
              {isOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-stone-400">{period.summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {period.socialMood.map((mood) => (
              <span
                key={mood}
                className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300"
              >
                {mood}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onStartComparePick}
              className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-300 transition hover:border-white/20 hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
            >
              {compareActive ? 'Exit compare' : comparePicking ? 'Cancel compare' : 'Start compare'}
            </button>
            <button
              type="button"
              onClick={onToggleEchoes}
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 ${
                showEchoes
                  ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                  : 'border-white/10 text-stone-300 hover:border-white/20 hover:text-stone-100'
              }`}
            >
              {showEchoes ? 'Hide echoes' : 'Reveal echoes'}
            </button>
          </div>

          {comparePicking ? (
            <p className="mt-4 text-sm leading-6 text-amber-100/90">
              Compare is waiting for a second period. The selected amber period stays fixed as the source.
            </p>
          ) : null}

          {compareActive ? (
            <p className="mt-4 text-sm leading-6 text-rose-100/85">
              Compare is open. The paired period appears in rose and the side-by-side view floats above the main canvas.
            </p>
          ) : null}
        </div>

        {isOpen ? (
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 md:px-7">
            <GeographyInset model={geographyModel} />

            {pressureCascade && selectedPressureSeries ? (
              <section className="rounded-[1.5rem] border border-amber-300/14 bg-amber-300/7 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Pressure cascade</p>
                    <h3 className="mt-2 text-base text-stone-100">{pressureCascade.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-stone-300">
                      {pressureCascade.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-300/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-100">
                    {pressureCascade.value}
                  </span>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-amber-100">
                    Reading this period through {pressureCascade.label.toLowerCase()}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-stone-200">
                    {period.title} carries this force at {pressureCascade.value}/100.
                    {pressureCascade.matchedEvents.length
                      ? ` In the current seed data it surfaces directly through ${pressureCascade.matchedEvents.length} linked event${pressureCascade.matchedEvents.length === 1 ? '' : 's'} and most clearly touches ${pressureCascade.impactedScales.length ? pressureCascade.impactedScales.map((scale) => titleCaseLabel(scale)).join(', ').toLowerCase() : 'the visible event layer'}.`
                      : ' The period score is present, but the current seed data does not yet tie this force to a specific event chain.'}
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/7">
                  <div
                    className={`h-full rounded-full ${
                      pressureCascade.polarity === 'stress'
                        ? 'bg-amber-300/85'
                        : 'bg-cyan-300/85'
                    }`}
                    style={{ width: `${pressureCascade.value}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {pressureCascade.impactedScales.length ? (
                    pressureCascade.impactedScales.map((scale) => (
                      <span
                        key={scale}
                        className={`rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${getScaleAccent(scale)}`}
                      >
                        {titleCaseLabel(scale)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm leading-6 text-stone-400">
                      No explicit event links for this pressure in the current seed data.
                    </span>
                  )}
                </div>

                {pressureCascade.matchedEvents.length ? (
                  <div className="mt-4 grid gap-3">
                    {pressureCascade.matchedEvents.map((event) => (
                      <article
                        key={event.id}
                        className="rounded-[1.25rem] border border-amber-300/16 bg-black/15 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm uppercase tracking-[0.18em] text-amber-100">
                            {event.title}
                          </h4>
                          <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                            {event.geography}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-stone-300">
                          {event.summary}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            <section>
              <p className="eyebrow">What shifted</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-emerald-200/10 bg-emerald-300/5 p-4">
                  <h3 className="text-sm uppercase tracking-[0.22em] text-emerald-200">
                    What emerged
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
                    {period.whatEmerged.concat(period.newPossibilities).slice(0, 5).map((item) => (
                      <li key={item}>{sentenceCase(item)}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1.5rem] border border-rose-200/10 bg-rose-300/5 p-4">
                  <h3 className="text-sm uppercase tracking-[0.22em] text-rose-200">
                    What frayed
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
                    {period.whatFaded.concat(period.whatBroke).slice(0, 5).map((item) => (
                      <li key={item}>{sentenceCase(item)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <p className="eyebrow">Multi-scale read</p>
              <div className="mt-3 grid gap-3 2xl:grid-cols-2">
                {scaleSummaries.map((summary) => {
                  const scaleIsImpacted = pressureCascade?.impactedScales.includes(summary.scale)

                  return (
                    <div
                      key={summary.scale}
                      className={`rounded-[1.25rem] border p-4 ${
                        scaleIsImpacted
                          ? 'border-amber-300/16 bg-amber-300/6'
                          : 'border-white/8 bg-white/4'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3
                          className={`text-sm uppercase tracking-[0.22em] ${getScaleAccent(summary.scale)}`}
                        >
                          {titleCaseLabel(summary.scale)}
                        </h3>
                        <span className="text-xs text-stone-500">{summary.headline}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-stone-300">{summary.body}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            <section>
              <p className="eyebrow">Pressure summary</p>
              <div className="mt-3 grid gap-3">
                {pressureSnapshots.map((pressure) => {
                  const isSelectedPressure = selectedPressureId === pressure.id

                  return (
                    <div key={pressure.id}>
                      <div className="flex items-center justify-between gap-3 text-sm text-stone-200">
                        <span className={isSelectedPressure ? 'text-amber-100' : ''}>
                          {pressure.label}
                        </span>
                        <span className="text-stone-400">{pressure.value}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                        <div
                          className={`h-full rounded-full ${
                            pressure.polarity === 'stress'
                              ? isSelectedPressure
                                ? 'bg-amber-300'
                                : 'bg-amber-300/85'
                              : isSelectedPressure
                                ? 'bg-cyan-300'
                                : 'bg-cyan-300/85'
                          }`}
                          style={{ width: `${pressure.value}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-400">{period.pressureSummary}</p>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Echoes</p>
                  <h3 className="text-base text-stone-100">Cross-era structural rhymes</h3>
                </div>
              </div>

              <div className="mt-3 grid gap-3">
                {echoes.length ? (
                  echoes.map((echo) => (
                    <article
                      key={echo.link.id}
                      className={`rounded-[1.25rem] border p-4 ${
                        showEchoes
                          ? 'border-cyan-300/18 bg-cyan-300/6'
                          : 'border-white/8 bg-white/4'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm uppercase tracking-[0.22em] text-cyan-100">
                            {echo.counterpart.title}
                          </h4>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                            {echo.counterpart.rangeLabel}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">
                          {formatConfidence(echo.link.confidence)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-stone-200">
                        {echo.link.similarityLabel}
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-400">
                        {echo.link.similarityReasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => onCompareToPeriod(echo.counterpart.id)}
                          className="rounded-full border border-cyan-300/20 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-200/35 hover:bg-cyan-200/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45"
                        >
                          Compare these periods
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4 text-sm leading-6 text-stone-400">
                    This period does not yet have a curated echo pair in the seed data.
                  </div>
                )}
              </div>
            </section>

            <section>
              <p className="eyebrow">Events and lived texture</p>
              <div className="mt-3 grid gap-3">
                {events.map((event) => {
                  const pressureMatch =
                    !selectedPressureId || event.pressureDrivers.includes(selectedPressureId)

                  return (
                    <article
                      key={event.id}
                      className={`rounded-[1.25rem] border p-4 ${
                        selectedPressureId
                          ? pressureMatch
                            ? 'border-amber-300/16 bg-amber-300/6'
                            : 'border-white/8 bg-white/2 opacity-70'
                          : 'border-white/8 bg-white/4'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-sm uppercase tracking-[0.18em] text-stone-100">
                          {event.title}
                        </h4>
                        <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                          {event.startYear === event.endYear
                            ? event.startYear
                            : `${event.startYear}-${event.endYear}`}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-stone-300">{event.summary}</p>
                    </article>
                  )
                })}

                {snapshot ? (
                  <article className="rounded-[1.25rem] border border-amber-200/14 bg-amber-300/6 p-4">
                    <h4 className="text-sm uppercase tracking-[0.2em] text-amber-100">
                      {snapshot.title}
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-stone-200">{snapshot.summary}</p>
                    <p className="mt-3 text-sm leading-6 text-stone-400">{snapshot.dailyReality}</p>
                  </article>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
