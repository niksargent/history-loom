import { useEffect } from 'react'
import { sentenceCase } from '../lib/format'
import type { ComparePanelModel } from '../types/view'

interface ComparePanelProps {
  model: ComparePanelModel
  selectedPressureId: string | null
  selectedPressureLabel: string | null
  onClose: () => void
}

type Tone = 'source' | 'target'

const toneStyles: Record<
  Tone,
  {
    shell: string
    badge: string
    accent: string
    panel: string
    mutedPanel: string
    line: string
  }
> = {
  source: {
    shell: 'border-amber-300/20 bg-amber-300/7',
    badge: 'border-amber-300/25 bg-amber-300/12 text-amber-100',
    accent: 'text-amber-100',
    panel: 'border-amber-300/12 bg-black/18',
    mutedPanel: 'border-amber-200/10 bg-amber-300/4',
    line: 'bg-amber-300/85',
  },
  target: {
    shell: 'border-rose-200/14 bg-rose-300/4',
    badge: 'border-rose-200/18 bg-rose-300/8 text-rose-100',
    accent: 'text-rose-100',
    panel: 'border-rose-200/10 bg-black/18',
    mutedPanel: 'border-rose-200/10 bg-rose-300/4',
    line: 'bg-rose-300/85',
  },
}

function pressureValue(model: ComparePanelModel['source'], pressureId: string | null) {
  if (!pressureId) {
    return null
  }

  return model.period.pressureScores[pressureId] ?? null
}

function intersect(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()))

  return left.filter((item) => rightSet.has(item.toLowerCase()))
}

function difference(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()))

  return left.filter((item) => !rightSet.has(item.toLowerCase()))
}

function formatYears(startYear: number, endYear: number) {
  return startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`
}

function findEchoReason(model: ComparePanelModel) {
  return (
    model.source.echoes.find((echo) => echo.counterpart.id === model.target.period.id)?.link ??
    model.target.echoes.find((echo) => echo.counterpart.id === model.source.period.id)?.link ??
    null
  )
}

function CompareColumn({
  title,
  detail,
  tone,
  selectedPressureId,
  selectedPressureLabel,
}: {
  title: string
  detail: ComparePanelModel['source']
  tone: Tone
  selectedPressureId: string | null
  selectedPressureLabel: string | null
}) {
  const styles = toneStyles[tone]
  const activePressureValue = pressureValue(detail, selectedPressureId)

  return (
    <article className={`rounded-[1.65rem] border p-5 ${styles.shell}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${styles.badge}`}
          >
            {title}
          </span>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-stone-500">
            {detail.period.rangeLabel}
          </p>
          <h3 className="font-display mt-2 text-2xl text-stone-100">{detail.period.title}</h3>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.18em] text-stone-500">
          <p>{detail.events.length} events</p>
          <p className="mt-2">{detail.echoes.length} echoes</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-300">{detail.period.summary}</p>

      {selectedPressureId && activePressureValue !== null ? (
        <div className={`mt-5 rounded-[1.25rem] border p-4 ${styles.panel}`}>
          <p className={`text-[10px] uppercase tracking-[0.22em] ${styles.accent}`}>
            Active pressure
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-stone-200">
            <span>{selectedPressureLabel ?? selectedPressureId}</span>
            <span>{activePressureValue}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/7">
            <div
              className={`h-full rounded-full ${styles.line}`}
              style={{ width: `${activePressureValue}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {detail.period.dominantValues.slice(0, 4).map((value) => (
          <span
            key={`${detail.period.id}-${value}`}
            className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${styles.badge}`}
          >
            {sentenceCase(value)}
          </span>
        ))}
      </div>
    </article>
  )
}

export function ComparePanel({
  model,
  selectedPressureId,
  selectedPressureLabel,
  onClose,
}: ComparePanelProps) {
  const sharedValues = intersect(
    model.source.period.dominantValues,
    model.target.period.dominantValues,
  )
  const sharedMood = intersect(model.source.period.socialMood, model.target.period.socialMood)
  const sharedPressures = model.source.pressureSnapshots
    .filter((pressure) =>
      model.target.pressureSnapshots.some((targetPressure) => targetPressure.id === pressure.id),
    )
    .map((pressure) => pressure.label)
  const echoLink = findEchoReason(model)
  const comparisonSections = [
    {
      title: 'Dominant values',
      source: model.source.period.dominantValues,
      target: model.target.period.dominantValues,
      overlap: sharedValues,
    },
    {
      title: 'Social mood',
      source: model.source.period.socialMood,
      target: model.target.period.socialMood,
      overlap: sharedMood,
    },
    {
      title: 'What emerged',
      source: model.source.period.whatEmerged.concat(model.source.period.newPossibilities).slice(0, 6),
      target: model.target.period.whatEmerged.concat(model.target.period.newPossibilities).slice(0, 6),
      overlap: intersect(
        model.source.period.whatEmerged.concat(model.source.period.newPossibilities),
        model.target.period.whatEmerged.concat(model.target.period.newPossibilities),
      ),
    },
    {
      title: 'What frayed',
      source: model.source.period.whatFaded.concat(model.source.period.whatBroke).slice(0, 6),
      target: model.target.period.whatFaded.concat(model.target.period.whatBroke).slice(0, 6),
      overlap: intersect(
        model.source.period.whatFaded.concat(model.source.period.whatBroke),
        model.target.period.whatFaded.concat(model.target.period.whatBroke),
      ),
    },
  ]

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(5,7,8,0.84)] px-4 py-6 backdrop-blur-[18px] md:px-6"
      onClick={onClose}
    >
      <section
        className="glass-panel mx-auto w-full max-w-[1460px] rounded-[2rem] border border-white/8 p-5 md:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="eyebrow">Compare periods</p>
            <h2 className="font-display text-3xl text-stone-100 md:text-4xl">Structural comparison</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Amber marks the source period. Rose marks the comparison period.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-300 transition hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
          >
            Exit compare
          </button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <CompareColumn
            title="Source period"
            detail={model.source}
            tone="source"
            selectedPressureId={selectedPressureId}
            selectedPressureLabel={selectedPressureLabel}
          />
          <CompareColumn
            title="Comparison period"
            detail={model.target}
            tone="target"
            selectedPressureId={selectedPressureId}
            selectedPressureLabel={selectedPressureLabel}
          />
        </div>

        <section className="mt-6 rounded-[1.5rem] border border-white/6 bg-black/18 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Reading cues</p>
              <h3 className="mt-2 text-lg text-stone-100">Look for recurring structure</h3>
            </div>
            <div className="text-sm leading-6 text-stone-400">
              {echoLink
                ? 'This pair already has a curated echo connection.'
                : 'These periods are being compared directly.'}
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <article className="rounded-[1.25rem] border border-white/6 bg-black/24 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Shared values</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sharedValues.length ? (
                  sharedValues.slice(0, 4).map((value) => (
                    <span
                      key={`shared-value-${value}`}
                      className="rounded-full border border-amber-300/18 bg-amber-300/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-100"
                    >
                      {sentenceCase(value)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm leading-6 text-stone-500">Different values lead each period.</span>
                )}
              </div>
            </article>

            <article className="rounded-[1.25rem] border border-white/6 bg-black/24 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Shared mood</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sharedMood.length ? (
                  sharedMood.slice(0, 4).map((mood) => (
                    <span
                      key={`shared-mood-${mood}`}
                      className="rounded-full border border-rose-300/18 bg-rose-300/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-rose-100"
                    >
                      {sentenceCase(mood)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm leading-6 text-stone-500">The mood shifts sharply between the two periods.</span>
                )}
              </div>
            </article>

            <article className="rounded-[1.25rem] border border-white/6 bg-black/24 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Pressure overlap</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sharedPressures.length ? (
                  sharedPressures.slice(0, 4).map((pressure) => (
                    <span
                      key={`shared-pressure-${pressure}`}
                      className="rounded-full border border-cyan-300/18 bg-cyan-300/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-100"
                    >
                      {pressure}
                    </span>
                  ))
                ) : (
                  <span className="text-sm leading-6 text-stone-500">Different forces dominate each period.</span>
                )}
              </div>
            </article>
          </div>

          {echoLink ? (
            <article className="mt-4 rounded-[1.25rem] border border-cyan-300/16 bg-cyan-300/7 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-100">Curated echo</p>
                  <p className="mt-2 text-sm leading-6 text-stone-200">{echoLink.similarityLabel}</p>
                </div>
                <span className="rounded-full border border-cyan-300/18 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                  {Math.round(echoLink.confidence * 100)}% confidence
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {echoLink.similarityReasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-cyan-300/18 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-50"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </article>
          ) : null}
        </section>

        <div className="mt-6 grid gap-4">
          {comparisonSections.map((section) => {
            const sourceOnly = difference(section.source, section.target)
            const targetOnly = difference(section.target, section.source)

            return (
              <section
                key={section.title}
                className="rounded-[1.5rem] border border-white/6 bg-black/18 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">{section.title}</p>
                  </div>
                  <div className="text-sm leading-6 text-stone-400">
                    {section.overlap.length
                      ? `${section.overlap.length} shared elements`
                      : 'These periods pull in different directions here.'}
                  </div>
                </div>

                {section.overlap.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {section.overlap.slice(0, 5).map((item) => (
                      <span
                        key={`${section.title}-overlap-${item}`}
                        className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-200"
                      >
                        {sentenceCase(item)}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <article className={`rounded-[1.25rem] border p-4 ${toneStyles.source.mutedPanel}`}>
                    <div className="flex items-center justify-between gap-3">
                      <h4 className={`text-sm uppercase tracking-[0.18em] ${toneStyles.source.accent}`}>
                        {model.source.period.title}
                      </h4>
                      <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                        {formatYears(model.source.period.startYear, model.source.period.endYear)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sourceOnly.length ? (
                        sourceOnly.slice(0, 6).map((item) => (
                          <span
                            key={`${section.title}-source-${item}`}
                            className="rounded-full border border-amber-300/18 bg-amber-300/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-100"
                          >
                            {sentenceCase(item)}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm leading-6 text-stone-400">Mostly shared with the other period.</span>
                      )}
                    </div>
                  </article>

                  <article className={`rounded-[1.25rem] border p-4 ${toneStyles.target.mutedPanel}`}>
                    <div className="flex items-center justify-between gap-3">
                      <h4 className={`text-sm uppercase tracking-[0.18em] ${toneStyles.target.accent}`}>
                        {model.target.period.title}
                      </h4>
                      <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                        {formatYears(model.target.period.startYear, model.target.period.endYear)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {targetOnly.length ? (
                        targetOnly.slice(0, 6).map((item) => (
                          <span
                            key={`${section.title}-target-${item}`}
                            className="rounded-full border border-rose-300/18 bg-rose-300/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-rose-100"
                          >
                            {sentenceCase(item)}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm leading-6 text-stone-400">Mostly shared with the other period.</span>
                      )}
                    </div>
                  </article>
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {[
            { tone: 'source' as const, title: 'Source events', detail: model.source },
            { tone: 'target' as const, title: 'Comparison events', detail: model.target },
          ].map(({ tone, title, detail }) => {
            const styles = toneStyles[tone]

            return (
              <section key={`${title}-${detail.period.id}`} className={`rounded-[1.5rem] border p-5 ${styles.shell}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">{title}</p>
                    <h3 className={`mt-2 text-lg ${styles.accent}`}>{detail.period.title}</h3>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                    {detail.period.rangeLabel}
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {detail.events.map((event) => {
                    const matchesActivePressure =
                      !selectedPressureId || event.pressureDrivers.includes(selectedPressureId)

                    return (
                      <article
                        key={`${detail.period.id}-${event.id}`}
                        className={`rounded-[1.25rem] border p-4 transition ${
                          matchesActivePressure ? styles.panel : 'border-white/8 bg-black/15 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm uppercase tracking-[0.16em] text-stone-100">
                            {event.title}
                          </h4>
                          <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                            {formatYears(event.startYear, event.endYear)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-stone-300">{event.summary}</p>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </section>
    </div>
  )
}
