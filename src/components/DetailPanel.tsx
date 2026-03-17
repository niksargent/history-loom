import { formatConfidence, sentenceCase, titleCaseLabel } from '../lib/format'
import { getScaleAccent } from '../lib/loom-data'
import type { SelectedPeriodDetail } from '../types/view'

interface DetailPanelProps {
  detail: SelectedPeriodDetail
  isOpen: boolean
  showEchoes: boolean
  onToggleOpen: () => void
  onToggleEchoes: () => void
}

export function DetailPanel({
  detail,
  isOpen,
  showEchoes,
  onToggleOpen,
  onToggleEchoes,
}: DetailPanelProps) {
  const { period, events, snapshot, echoes, scaleSummaries, pressureSnapshots } = detail

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
            className="rounded-full border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-300 transition hover:border-white/20 hover:text-stone-100"
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
      </div>

      {isOpen ? (
        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 md:px-7">
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
              {scaleSummaries.map((summary) => (
                <div
                  key={summary.scale}
                  className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={`text-sm uppercase tracking-[0.22em] ${getScaleAccent(summary.scale)}`}>
                      {titleCaseLabel(summary.scale)}
                    </h3>
                    <span className="text-xs text-stone-500">{summary.headline}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-300">{summary.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="eyebrow">Pressure summary</p>
            <div className="mt-3 grid gap-3">
              {pressureSnapshots.map((pressure) => (
                <div key={pressure.id}>
                  <div className="flex items-center justify-between gap-3 text-sm text-stone-200">
                    <span>{pressure.label}</span>
                    <span className="text-stone-400">{pressure.value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                    <div
                      className={`h-full rounded-full ${
                        pressure.polarity === 'stress'
                          ? 'bg-amber-300/85'
                          : 'bg-cyan-300/85'
                      }`}
                      style={{ width: `${pressure.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-400">{period.pressureSummary}</p>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Echoes</p>
                <h3 className="text-base text-stone-100">Cross-era structural rhymes</h3>
              </div>
              <button
                type="button"
                onClick={onToggleEchoes}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                  showEchoes
                    ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 text-stone-300 hover:border-white/20 hover:text-stone-100'
                }`}
              >
                {showEchoes ? 'Hide echoes' : 'Reveal echoes'}
              </button>
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
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4"
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
              ))}

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
