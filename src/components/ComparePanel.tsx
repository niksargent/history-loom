import { useEffect, useId, useRef } from 'react'
import { formatPopulationCompact, sentenceCase } from '../lib/format'
import { getPublicPeriodSummary } from '../lib/public-copy'
import type { ComparePanelModel } from '../types/view'

interface ComparePanelProps {
  model: ComparePanelModel
  selectedPressureId: string | null
  selectedPressureLabel: string | null
  onClose: () => void
}

type Tone = 'source' | 'target'
type BucketTone = Tone | 'shared'

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
    shell: 'border-[rgba(243,177,91,0.28)] bg-[rgba(243,177,91,0.07)]',
    badge: 'border-[rgba(243,177,91,0.24)] bg-[rgba(243,177,91,0.12)] text-amber-100',
    accent: 'text-amber-100',
    panel: 'border-[rgba(243,177,91,0.18)] bg-black/18',
    mutedPanel: 'border-[rgba(243,177,91,0.16)] bg-[rgba(243,177,91,0.05)]',
    line: 'bg-amber-300/85',
  },
  target: {
    shell: 'border-[rgba(251,113,133,0.28)] bg-[rgba(251,113,133,0.08)]',
    badge: 'border-[rgba(251,113,133,0.22)] bg-[rgba(251,113,133,0.12)] text-rose-100',
    accent: 'text-rose-100',
    panel: 'border-[rgba(251,113,133,0.18)] bg-black/18',
    mutedPanel: 'border-[rgba(251,113,133,0.16)] bg-[rgba(251,113,133,0.05)]',
    line: 'bg-[rgba(251,113,133,0.82)]',
  },
}

function bucketShellClass(tone: BucketTone) {
  if (tone === 'shared') {
    return 'border-[rgba(214,211,209,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))]'
  }

  return toneStyles[tone].mutedPanel
}

function bucketPillClass(tone: BucketTone) {
  if (tone === 'shared') {
    return 'border-[rgba(214,211,209,0.08)] bg-white/7 text-stone-200'
  }

  return tone === 'source'
    ? 'border-amber-300/18 bg-amber-300/8 text-amber-100'
    : 'border-rose-300/18 bg-rose-300/8 text-rose-100'
}

function bucketLabelClass(tone: BucketTone) {
  if (tone === 'shared') {
    return 'text-stone-300'
  }

  return toneStyles[tone].accent
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

function buildReadingLine(
  sharedValues: string[],
  sharedMood: string[],
  sharedPressures: string[],
  hasCuratedEcho: boolean,
) {
  const signals: string[] = []

  if (sharedValues.length) {
    signals.push(`${sharedValues.length} shared value${sharedValues.length === 1 ? '' : 's'}`)
  }

  if (sharedMood.length) {
    signals.push(`${sharedMood.length} shared mood cue${sharedMood.length === 1 ? '' : 's'}`)
  }

  if (sharedPressures.length) {
    signals.push(`${sharedPressures.length} shared pressure${sharedPressures.length === 1 ? '' : 's'}`)
  }

  if (!signals.length) {
    return hasCuratedEcho
      ? 'The rhyme sits more in the overall structure than in repeated labels.'
      : 'This pairing is useful because the differences are strong and visible.'
  }

  return `${signals.join(', ')} hold the strongest overlap here.`
}

function strongestOverlapSection(
  sections: Array<{ title: string; overlap: string[] }>,
) {
  return [...sections].sort((left, right) => right.overlap.length - left.overlap.length)[0] ?? null
}

function strongestDifferenceSection(
  sections: Array<{ title: string; sourceOnly: string[]; targetOnly: string[] }>,
) {
  return (
    [...sections].sort(
      (left, right) =>
        right.sourceOnly.length +
        right.targetOnly.length -
        (left.sourceOnly.length + left.targetOnly.length),
    )[0] ?? null
  )
}

function InsightCard({
  label,
  body,
  tone = 'shared',
}: {
  label: string
  body: string
  tone?: BucketTone
}) {
  return (
    <article className={`surface-depth rounded-[1.25rem] border p-4 ${bucketShellClass(tone)}`}>
      <p className={`text-[10px] uppercase tracking-[0.22em] ${bucketLabelClass(tone)}`}>
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-stone-200">{body}</p>
    </article>
  )
}

function CompareSummaryCard({
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
  const populationCompact =
    detail.period.populationLabel ?? formatPopulationCompact(detail.period.populationEstimate)

  return (
    <article className={`surface-depth reveal-up reveal-delay-1 rounded-[1.65rem] border p-5 ${styles.shell}`}>
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
        <div className="grid gap-2 text-right text-xs uppercase tracking-[0.18em] text-stone-500">
          <p>{detail.events.length} events</p>
          <p>{detail.echoes.length} echoes</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-300">
        {getPublicPeriodSummary(detail.period)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {populationCompact ? (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${styles.badge}`}
          >
            Population {populationCompact}
          </span>
        ) : null}
        {detail.period.dominantValues.slice(0, 2).map((value) => (
          <span
            key={`${detail.period.id}-${value}`}
            className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${styles.badge}`}
          >
            {sentenceCase(value)}
          </span>
        ))}
        {detail.period.socialMood.slice(0, 1).map((mood) => (
          <span
            key={`${detail.period.id}-${mood}`}
            className="rounded-full border border-[rgba(214,211,209,0.08)] bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-200"
          >
            {sentenceCase(mood)}
          </span>
        ))}
      </div>

      {selectedPressureId && activePressureValue !== null ? (
        <div className={`surface-depth mt-5 rounded-[1.25rem] border p-4 ${styles.panel}`}>
          <p className={`text-[10px] uppercase tracking-[0.22em] ${styles.accent}`}>
            Selected force
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

    </article>
  )
}

function CompareBucket({
  label,
  tone,
  items,
  emptyLabel,
}: {
  label: string
  tone: BucketTone
  items: string[]
  emptyLabel: string
}) {
  return (
    <article className={`surface-depth rounded-[1.25rem] border p-4 ${bucketShellClass(tone)}`}>
      <p className={`text-[10px] uppercase tracking-[0.22em] ${bucketLabelClass(tone)}`}>
        {label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? (
          items.slice(0, 7).map((item) => (
            <span
              key={`${label}-${item}`}
              className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${bucketPillClass(tone)}`}
            >
              {sentenceCase(item)}
            </span>
          ))
        ) : (
          <span className="text-sm leading-6 text-stone-500">{emptyLabel}</span>
        )}
      </div>
    </article>
  )
}

function CompareMatrixSection({
  title,
  overlap,
  sourceOnly,
  targetOnly,
}: {
  title: string
  overlap: string[]
  sourceOnly: string[]
  targetOnly: string[]
}) {
  return (
    <section className="surface-depth reveal-up reveal-delay-3 relative overflow-hidden rounded-[1.5rem] border border-[rgba(214,211,209,0.07)] bg-black/18 p-5">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,191,36,0.05),transparent_34%,transparent_66%,rgba(251,113,133,0.05))]" />
      <div className="absolute inset-y-5 left-1/2 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.18),rgba(255,255,255,0))] xl:block" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow">{title}</p>
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
            {overlap.length
              ? `${overlap.length} shared motif${overlap.length === 1 ? '' : 's'}`
              : 'More distinct than shared'}
          </span>
      </div>

      <div className="relative mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
        <CompareBucket
          label="Source period"
          tone="source"
          items={sourceOnly}
          emptyLabel="Distinct elsewhere."
        />
        <CompareBucket
          label="Shared"
          tone="shared"
          items={overlap}
          emptyLabel="No shared motif."
        />
        <CompareBucket
          label="Comparison period"
          tone="target"
          items={targetOnly}
          emptyLabel="Distinct elsewhere."
        />
      </div>
    </section>
  )
}

function EventColumn({
  title,
  detail,
  tone,
  selectedPressureId,
}: {
  title: string
  detail: ComparePanelModel['source']
  tone: Tone
  selectedPressureId: string | null
}) {
  const styles = toneStyles[tone]

  return (
    <section className={`surface-depth reveal-up reveal-delay-4 rounded-[1.5rem] border p-5 ${styles.shell}`}>
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
                matchesActivePressure
                  ? styles.panel
                  : 'border-[rgba(214,211,209,0.08)] bg-black/15 opacity-70'
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
}

export function ComparePanel({
  model,
  selectedPressureId,
  selectedPressureLabel,
  onClose,
}: ComparePanelProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const sharedValues = intersect(
    model.source.period.dominantValues,
    model.target.period.dominantValues,
  )
  const sharedMood = intersect(model.source.period.socialMood, model.target.period.socialMood)
  const sharedPressures = model.source.allPressureSnapshots
    .filter((pressure) =>
      model.target.allPressureSnapshots.some((targetPressure) => targetPressure.id === pressure.id),
    )
    .map((pressure) => pressure.publicLabel ?? pressure.label)
  const echoLink = findEchoReason(model)
  const readingLine = buildReadingLine(
    sharedValues,
    sharedMood,
    sharedPressures,
    Boolean(echoLink),
  )
  const comparisonSections = [
    {
      title: 'Values',
      sourceOnly: difference(
        model.source.period.dominantValues,
        model.target.period.dominantValues,
      ),
      targetOnly: difference(
        model.target.period.dominantValues,
        model.source.period.dominantValues,
      ),
      overlap: sharedValues,
    },
    {
      title: 'Mood',
      sourceOnly: difference(model.source.period.socialMood, model.target.period.socialMood),
      targetOnly: difference(model.target.period.socialMood, model.source.period.socialMood),
      overlap: sharedMood,
    },
    {
      title: 'Emergence',
      sourceOnly: difference(
        model.source.period.whatEmerged.concat(model.source.period.newPossibilities).slice(0, 6),
        model.target.period.whatEmerged.concat(model.target.period.newPossibilities).slice(0, 6),
      ),
      targetOnly: difference(
        model.target.period.whatEmerged.concat(model.target.period.newPossibilities).slice(0, 6),
        model.source.period.whatEmerged.concat(model.source.period.newPossibilities).slice(0, 6),
      ),
      overlap: intersect(
        model.source.period.whatEmerged.concat(model.source.period.newPossibilities),
        model.target.period.whatEmerged.concat(model.target.period.newPossibilities),
      ),
    },
    {
      title: 'Fraying',
      sourceOnly: difference(
        model.source.period.whatFaded.concat(model.source.period.whatBroke).slice(0, 6),
        model.target.period.whatFaded.concat(model.target.period.whatBroke).slice(0, 6),
      ),
      targetOnly: difference(
        model.target.period.whatFaded.concat(model.target.period.whatBroke).slice(0, 6),
        model.source.period.whatFaded.concat(model.source.period.whatBroke).slice(0, 6),
      ),
      overlap: intersect(
        model.source.period.whatFaded.concat(model.source.period.whatBroke),
        model.target.period.whatFaded.concat(model.target.period.whatBroke),
      ),
    },
  ]
  const leadingOverlap = strongestOverlapSection(comparisonSections)
  const leadingDifference = strongestDifferenceSection(comparisonSections)
  const sourcePressureValue = pressureValue(model.source, selectedPressureId)
  const targetPressureValue = pressureValue(model.target, selectedPressureId)
  const pressureInsight =
    selectedPressureId && sourcePressureValue !== null && targetPressureValue !== null
      ? sourcePressureValue === targetPressureValue
        ? `${selectedPressureLabel ?? selectedPressureId} sits at the same intensity in both periods.`
        : `${selectedPressureLabel ?? selectedPressureId} runs ${Math.abs(
            sourcePressureValue - targetPressureValue,
          )} points higher in ${
            sourcePressureValue > targetPressureValue
              ? model.source.period.title
              : model.target.period.title
          }.`
      : echoLink
        ? 'This pairing already has a curated echo link, so the comparison is tracing an existing rhyme.'
        : 'No force is pinned, so this read stays broad rather than force-by-force.'

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [onClose])

  return (
    <div
      className="compare-backdrop fixed inset-0 z-50 overflow-y-auto px-4 py-6 md:px-6"
      onClick={onClose}
    >
      <section
        className="glass-panel surface-depth reveal-up relative mx-auto w-full max-w-[1460px] overflow-hidden rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5 md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(219,181,108,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(251,113,133,0.06),_transparent_32%)]" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="eyebrow">Compare periods</p>
              <h2
                id={titleId}
                className="font-display text-3xl text-stone-100 md:text-4xl"
              >
                How these periods compare
              </h2>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-300 transition hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
            >
              Exit compare
            </button>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <CompareSummaryCard
              title="Source period"
              detail={model.source}
              tone="source"
              selectedPressureId={selectedPressureId}
              selectedPressureLabel={selectedPressureLabel}
            />
            <CompareSummaryCard
              title="Comparison period"
              detail={model.target}
              tone="target"
              selectedPressureId={selectedPressureId}
              selectedPressureLabel={selectedPressureLabel}
            />
          </div>

          <div className="mt-6 grid gap-3 xl:grid-cols-3">
            <InsightCard
              label="Shared pull"
              tone="shared"
              body={
                leadingOverlap && leadingOverlap.overlap.length
                  ? `${leadingOverlap.title} carries the clearest overlap between the two periods.`
                  : 'The strongest rhyme here sits in the overall shape more than in repeated labels.'
              }
            />
            <InsightCard
              label="Biggest difference"
              tone="target"
              body={
                leadingDifference
                  ? `${leadingDifference.title} carries the sharpest difference between the two periods.`
                  : 'The differences are distributed rather than concentrated in one category.'
              }
            />
            <InsightCard label="Force in view" tone="source" body={pressureInsight} />
          </div>

        <section className="surface-depth reveal-up reveal-delay-2 mt-6 rounded-[1.5rem] border border-[rgba(214,211,209,0.07)] bg-black/18 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="font-display text-2xl text-stone-100">Where they feel alike</h3>
            {echoLink ? (
              <span className="rounded-full border border-[rgba(121,219,194,0.18)] bg-[rgba(121,219,194,0.08)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                Curated echo
              </span>
            ) : null}
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-[rgba(214,211,209,0.08)] bg-white/5 px-4 py-3 text-sm leading-6 text-stone-300">
            {readingLine}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <CompareBucket
              label="Shared values"
              tone="shared"
              items={sharedValues}
              emptyLabel="Different values lead."
            />
            <CompareBucket
              label="Shared mood"
              tone="shared"
              items={sharedMood}
              emptyLabel="The mood shifts sharply between them."
            />
            <CompareBucket
              label="Shared pressures"
              tone="shared"
              items={sharedPressures}
              emptyLabel="Different forces dominate."
            />
          </div>

          {echoLink ? (
            <article className="surface-depth mt-4 rounded-[1.25rem] border border-cyan-300/16 bg-cyan-300/7 p-4">
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
          {comparisonSections.map((section) => (
            <CompareMatrixSection
              key={section.title}
              title={section.title}
              overlap={section.overlap}
              sourceOnly={section.sourceOnly}
              targetOnly={section.targetOnly}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <EventColumn
            title="Named events"
            detail={model.source}
            tone="source"
            selectedPressureId={selectedPressureId}
          />
          <EventColumn
            title="Named events"
            detail={model.target}
            tone="target"
            selectedPressureId={selectedPressureId}
          />
        </div>
        </div>
      </section>
    </div>
  )
}
