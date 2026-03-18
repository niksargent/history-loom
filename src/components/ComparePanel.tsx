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

function bucketShellClass(tone: BucketTone) {
  if (tone === 'shared') {
    return 'border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]'
  }

  return toneStyles[tone].mutedPanel
}

function bucketPillClass(tone: BucketTone) {
  if (tone === 'shared') {
    return 'border-white/10 bg-white/8 text-stone-200'
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
        <div className="grid gap-2 text-right text-xs uppercase tracking-[0.18em] text-stone-500">
          <p>{detail.events.length} events</p>
          <p>{detail.echoes.length} echoes</p>
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
    <article className={`rounded-[1.25rem] border p-4 ${bucketShellClass(tone)}`}>
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
    <section className="relative overflow-hidden rounded-[1.5rem] border border-white/6 bg-black/18 p-5">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,191,36,0.05),transparent_34%,transparent_66%,rgba(251,113,133,0.05))]" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow">{title}</p>
        <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
          {overlap.length ? `${overlap.length} shared motifs` : 'Contrast stands out here'}
        </span>
      </div>

      <div className="relative mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
        <CompareBucket
          label="Source"
          tone="source"
          items={sourceOnly}
          emptyLabel="Most of the pattern is shared here."
        />
        <CompareBucket
          label="Shared"
          tone="shared"
          items={overlap}
          emptyLabel="No direct rhyme is called out here."
        />
        <CompareBucket
          label="Comparison"
          tone="target"
          items={targetOnly}
          emptyLabel="Most of the pattern is shared here."
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
    <section className={`rounded-[1.5rem] border p-5 ${styles.shell}`}>
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
      title: 'Social mood',
      sourceOnly: difference(model.source.period.socialMood, model.target.period.socialMood),
      targetOnly: difference(model.target.period.socialMood, model.source.period.socialMood),
      overlap: sharedMood,
    },
    {
      title: 'What emerged',
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
      title: 'What frayed',
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
        className="glass-panel relative mx-auto w-full max-w-[1460px] overflow-hidden rounded-[2rem] border border-white/8 p-5 md:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(219,181,108,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(251,113,133,0.06),_transparent_32%)]" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="eyebrow">Compare periods</p>
              <h2 className="font-display text-3xl text-stone-100 md:text-4xl">
                Structural comparison
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                Amber is the period you started from. Rose is the period opened against it.
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

        <section className="mt-6 rounded-[1.5rem] border border-white/6 bg-black/18 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Shared structure</p>
              <h3 className="mt-2 text-lg text-stone-100">Where the two periods rhyme</h3>
            </div>
            <div className="text-sm leading-6 text-stone-400">
              {echoLink
                ? 'This pair already has a curated echo connection.'
                : 'This is a direct comparison between two selected periods.'}
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <CompareBucket
              label="Shared values"
              tone="shared"
              items={sharedValues}
              emptyLabel="Different values lead each period."
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
              emptyLabel="Different forces dominate each period."
            />
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
            title="Source events"
            detail={model.source}
            tone="source"
            selectedPressureId={selectedPressureId}
          />
          <EventColumn
            title="Comparison events"
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
