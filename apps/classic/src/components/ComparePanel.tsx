import { useEffect, useId, useRef } from 'react'
import { formatPopulationCompact, sentenceCase } from '../lib/format'
import { buildCompareStory } from '../lib/compare-story'
import {
  getPublicConceptPhrase,
  getPublicEventSummary,
  getPublicPeriodSummary,
} from '../lib/public-copy'
import type { ComparePanelModel } from '../types/view'
import { CompareEchoHero } from './CompareEchoHero'
import { CompareSharedPressureMix } from './CompareSharedPressureMix'
import { PopulationComparisonBand } from './PopulationComparisonBand'

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

function formatYears(startYear: number, endYear: number) {
  return startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`
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
          <p>{detail.period.scope}</p>
          <p>{detail.events.length} events</p>
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
            {sentenceCase(getPublicConceptPhrase(value))}
          </span>
        ))}
        {detail.period.socialMood.slice(0, 1).map((mood) => (
          <span
            key={`${detail.period.id}-${mood}`}
            className="rounded-full border border-[rgba(214,211,209,0.08)] bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-200"
          >
            {sentenceCase(getPublicConceptPhrase(mood))}
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

function CompareEvidenceSectionView({
  title,
  overlap,
  sourceOnly,
  targetOnly,
  emptySharedLabel,
}: {
  title: string
  overlap: string[]
  sourceOnly: string[]
  targetOnly: string[]
  emptySharedLabel: string
}) {
  return (
    <section className="surface-depth reveal-up reveal-delay-4 relative overflow-hidden rounded-[1.5rem] border border-[rgba(214,211,209,0.07)] bg-black/18 p-5">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,191,36,0.05),transparent_34%,transparent_66%,rgba(251,113,133,0.05))]" />
      <div className="absolute inset-y-5 left-1/2 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.18),rgba(255,255,255,0))] xl:block" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow">{title}</p>
        <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
          {overlap.length
            ? `${overlap.length} shared thread${overlap.length === 1 ? '' : 's'}`
            : 'The contrast is sharper here'}
        </span>
      </div>

      <div className="relative mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
        <CompareBucket
          label="More visible in the first period"
          tone="source"
          items={sourceOnly}
          emptyLabel="Quieter here."
        />
        <CompareBucket
          label="Shared thread"
          tone="shared"
          items={overlap}
          emptyLabel={emptySharedLabel}
        />
        <CompareBucket
          label="More visible in the second period"
          tone="target"
          items={targetOnly}
          emptyLabel="Quieter here."
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
              <p className="mt-3 text-sm leading-6 text-stone-300">
                {getPublicEventSummary(event)}
              </p>
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
  const story = buildCompareStory(model)

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
              <h2 id={titleId} className="font-display text-3xl text-stone-100 md:text-4xl">
                How these periods connect
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
              title="First period"
              detail={model.source}
              tone="source"
              selectedPressureId={selectedPressureId}
              selectedPressureLabel={selectedPressureLabel}
            />
            <CompareSummaryCard
              title="Second period"
              detail={model.target}
              tone="target"
              selectedPressureId={selectedPressureId}
              selectedPressureLabel={selectedPressureLabel}
            />
          </div>

          <CompareEchoHero model={model} story={story} />
          <PopulationComparisonBand model={model} />
          <CompareSharedPressureMix entries={story.sharedPressures} selectedPressureId={selectedPressureId} />

          <div className="mt-6 grid gap-4">
            {story.evidenceSections.map((section) => (
              <CompareEvidenceSectionView
                key={section.id}
                title={section.title}
                overlap={section.overlap}
                sourceOnly={section.sourceOnly}
                targetOnly={section.targetOnly}
                emptySharedLabel={section.emptySharedLabel}
              />
            ))}
          </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <EventColumn
            title="Historical grounding"
            detail={model.source}
            tone="source"
            selectedPressureId={selectedPressureId}
          />
          <EventColumn
            title="Historical grounding"
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
