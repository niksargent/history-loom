import type { Period } from '../types/domain'
import type {
  CrossDatasetInsightPack,
  DatasetInsightPack,
  InsightDestinationSection,
} from '../types/insights'

interface InsightsLabPageProps {
  datasetLabel: string
  datasetId: string
  periods: Period[]
  selectedPeriodId: string
  insightPack: DatasetInsightPack | null
  crossDatasetPack: CrossDatasetInsightPack | null
  focusSection: InsightDestinationSection | null
  focusTargetId: string | null
  onClose: () => void
  onInspectPeriod: (periodId: string) => void
  onInspectCrossDatasetPeriod: (nextDatasetId: string, periodId: string) => void
  onInspectForce: (periodId: string, pressureId: string) => void
}

type InsightCardTone = 'family' | 'relationship' | 'outlier'

function sectionShell(isHighlighted: boolean, tone: InsightCardTone) {
  const base =
    tone === 'family'
      ? 'border-[rgba(243,177,91,0.16)] bg-[rgba(243,177,91,0.055)]'
      : tone === 'relationship'
        ? 'border-[rgba(121,219,194,0.16)] bg-[rgba(121,219,194,0.05)]'
        : 'border-[rgba(251,113,133,0.16)] bg-[rgba(251,113,133,0.055)]'

  return isHighlighted
    ? `${base} shadow-[0_18px_34px_rgba(0,0,0,0.18)]`
    : base
}

function RelationGlyph({
  relationshipType,
}: {
  relationshipType: 'co-movement' | 'inverse' | 'lead-lag'
}) {
  if (relationshipType === 'co-movement') {
    return (
      <svg viewBox="0 0 56 24" className="h-6 w-14" aria-hidden="true">
        <path d="M4 17 C 14 8, 22 8, 30 13 S 44 18, 52 8" fill="none" stroke="rgba(121,219,194,0.9)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 20 C 14 11, 22 11, 30 16 S 44 21, 52 11" fill="none" stroke="rgba(243,177,91,0.78)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }

  if (relationshipType === 'inverse') {
    return (
      <svg viewBox="0 0 56 24" className="h-6 w-14" aria-hidden="true">
        <path d="M4 7 C 16 7, 22 11, 28 12 S 40 17, 52 17" fill="none" stroke="rgba(121,219,194,0.9)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 17 C 16 17, 22 13, 28 12 S 40 7, 52 7" fill="none" stroke="rgba(243,177,91,0.82)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 56 24" className="h-6 w-14" aria-hidden="true">
      <path d="M4 16 C 14 13, 22 10, 30 8 S 44 6, 52 6" fill="none" stroke="rgba(243,177,91,0.82)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 20 C 14 20, 22 17, 30 15 S 44 11, 52 11" fill="none" stroke="rgba(121,219,194,0.9)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="18" cy="12" r="2.1" fill="rgba(243,177,91,0.9)" />
    </svg>
  )
}

function ConfidenceRail({
  strength,
  tone,
}: {
  strength: number
  tone: InsightCardTone
}) {
  const fill =
    tone === 'family'
      ? 'linear-gradient(90deg, rgba(243,177,91,0.34), rgba(243,177,91,0.88))'
      : tone === 'relationship'
        ? 'linear-gradient(90deg, rgba(121,219,194,0.34), rgba(121,219,194,0.9))'
        : 'linear-gradient(90deg, rgba(251,113,133,0.34), rgba(251,113,133,0.9))'

  return (
    <div className="mt-4">
      <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(18, Math.round(strength * 100))}%`, background: fill }}
        />
      </div>
    </div>
  )
}

export function InsightsLabPage({
  datasetLabel,
  datasetId,
  periods,
  selectedPeriodId,
  insightPack,
  crossDatasetPack,
  focusSection,
  focusTargetId,
  onClose,
  onInspectPeriod,
  onInspectCrossDatasetPeriod,
  onInspectForce,
}: InsightsLabPageProps) {
  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId) ?? periods[0] ?? null
  const prompt = insightPack?.prompts.find((item) => item.periodId === selectedPeriodId) ?? null
  const periodById = Object.fromEntries(periods.map((period) => [period.id, period]))
  const publicPilot = insightPack?.publicStatus === 'public'
  const familyGroups = insightPack
    ? Object.values(
        insightPack.periodClusters.reduce<
          Record<
            string,
            {
              clusterId: string
              clusterLabel: string
              publicLabel?: string
              topSignals: string[]
              publicTopSignals?: string[]
              strongestStrength: number
              periods: typeof insightPack.periodClusters
            }
          >
        >((groups, assignment) => {
          if (!groups[assignment.clusterId]) {
            groups[assignment.clusterId] = {
              clusterId: assignment.clusterId,
              clusterLabel: assignment.clusterLabel,
              publicLabel: assignment.publicLabel,
              topSignals: assignment.topSignals,
              publicTopSignals: assignment.publicTopSignals,
              strongestStrength: assignment.strength,
              periods: [],
            }
          }

          groups[assignment.clusterId].periods.push(assignment)
          groups[assignment.clusterId].strongestStrength = Math.max(
            groups[assignment.clusterId].strongestStrength,
            assignment.strength,
          )

          return groups
        }, {}),
      ).sort((left, right) => right.strongestStrength - left.strongestStrength)
    : []
  const publicCousins =
    crossDatasetPack?.publicCousins.filter(
      (cousin) =>
        cousin.sourceDatasetId === datasetId || cousin.targetDatasetId === datasetId,
    ) ?? []

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-5 md:px-6 lg:px-8">
      <section className="glass-panel relative overflow-hidden rounded-[2.2rem] border border-[rgba(214,211,209,0.08)] px-6 py-6 shadow-[0_24px_64px_rgba(0,0,0,0.22)] md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(243,177,91,0.08),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(121,219,194,0.08),_transparent_34%)]" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <p className="eyebrow">Insights Lab</p>
              <h1 className="font-display text-4xl leading-tight text-stone-50 md:text-6xl">
                Patterns worth noticing
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300 md:text-lg">
                Some eras hold together in similar ways. Some pressures rise together. Some periods
                break the pattern completely.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-stone-200">
                {datasetLabel}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-200"
              >
                Back to loom
              </button>
            </div>
          </div>

          {selectedPeriod && prompt ? (
            <article className="mt-6 rounded-[1.5rem] border border-amber-300/18 bg-[rgba(243,177,91,0.07)] px-5 py-5 shadow-[0_18px_34px_rgba(0,0,0,0.16)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="eyebrow">Pattern in view</p>
                  <h2 className="mt-2 font-display text-2xl text-stone-100">
                    {selectedPeriod.title}
                  </h2>
                  <p className="mt-3 text-lg leading-8 text-stone-50">
                    {prompt.publicText ?? prompt.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onInspectPeriod(selectedPeriod.id)}
                  className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-amber-100"
                >
                    See in loom
                </button>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.55fr)]">
        <div className="space-y-5">
          {publicPilot && insightPack ? (
            <>
              <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Eras that behave alike</p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      Patterns that show up more than once
                    </h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-amber-100/80">
                    grouped by feel
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {familyGroups.map((group) => (
                    <article
                      key={group.clusterId}
                      className={`rounded-[1.45rem] border p-5 ${sectionShell(false, 'family')}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-3xl">
                          <p className="text-sm uppercase tracking-[0.18em] text-amber-100">
                            {group.publicLabel ?? 'Recurring pattern'}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-stone-300">
                            This pattern shows up in {group.periods.length} era{group.periods.length === 1 ? '' : 's'} here,
                            with {(group.publicTopSignals ?? group.topSignals)
                              .slice(0, 2)
                              .join(' and ')
                              .toLowerCase()} most visible across the group.
                          </p>
                        </div>
                        <div className="min-w-[10rem]">
                          <ConfidenceRail strength={group.strongestStrength} tone="family" />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(group.publicTopSignals ?? group.topSignals).map((signal) => (
                          <span
                            key={`${group.clusterId}-${signal}`}
                            className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                          >
                            {signal}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {group.periods.map((assignment) => {
                          const period = periodById[assignment.periodId]
                          const highlighted =
                            focusSection === 'families' && focusTargetId === assignment.id

                          return (
                            <div
                              key={assignment.id}
                              className={`rounded-[1.2rem] border px-4 py-4 ${sectionShell(highlighted, 'family')}`}
                            >
                              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                                {period?.rangeLabel ?? assignment.periodId}
                              </p>
                              <h3 className="mt-2 text-base text-stone-100">{period?.title}</h3>
                              <button
                                type="button"
                                onClick={() => onInspectPeriod(assignment.periodId)}
                                className="ui-action mt-4 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-200"
                              >
                                See this period
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {publicCousins.length ? (
                <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">A cousin in another country</p>
                        <h2 className="font-display mt-2 text-2xl text-stone-100">
                          A distant era that feels strangely familiar
                        </h2>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-100/80">
                        across countries
                      </span>
                    </div>

                    {publicCousins.map((cousin) => {
                      const highlighted =
                        focusSection === 'cousins' && focusTargetId === cousin.id
                      const localOnSource = cousin.sourceDatasetId === datasetId
                      const localPeriod = localOnSource
                        ? {
                            datasetId: cousin.sourceDatasetId,
                            datasetLabel: cousin.sourceDatasetLabel,
                            periodId: cousin.sourcePeriodId,
                            periodTitle: cousin.sourcePeriodTitle,
                            periodRangeLabel: cousin.sourcePeriodRangeLabel,
                          }
                        : {
                            datasetId: cousin.targetDatasetId,
                            datasetLabel: cousin.targetDatasetLabel,
                            periodId: cousin.targetPeriodId,
                            periodTitle: cousin.targetPeriodTitle,
                            periodRangeLabel: cousin.targetPeriodRangeLabel,
                          }
                      const cousinPeriod = localOnSource
                        ? {
                            datasetId: cousin.targetDatasetId,
                            datasetLabel: cousin.targetDatasetLabel,
                            periodId: cousin.targetPeriodId,
                            periodTitle: cousin.targetPeriodTitle,
                            periodRangeLabel: cousin.targetPeriodRangeLabel,
                          }
                        : {
                            datasetId: cousin.sourceDatasetId,
                            datasetLabel: cousin.sourceDatasetLabel,
                            periodId: cousin.sourcePeriodId,
                            periodTitle: cousin.sourcePeriodTitle,
                            periodRangeLabel: cousin.sourcePeriodRangeLabel,
                          }

                      return (
                        <article
                          key={cousin.id}
                          className={`rounded-[1.45rem] border border-[rgba(211,157,255,0.18)] bg-[linear-gradient(180deg,rgba(182,122,255,0.07),rgba(121,219,194,0.045))] p-5 ${
                            highlighted ? 'shadow-[0_18px_34px_rgba(0,0,0,0.18)]' : ''
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-3xl">
                              <p className="text-sm uppercase tracking-[0.18em] text-fuchsia-100">
                                {cousin.headline}
                              </p>
                              <p className="mt-3 text-sm leading-6 text-stone-300">
                                {cousin.publicSummary}
                              </p>
                            </div>
                            <div className="min-w-[10rem]">
                              <div className="mt-4">
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
                                  <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(206,153,255,0.34),rgba(206,153,255,0.9))]"
                                    style={{
                                      width: `${Math.max(
                                        18,
                                        Math.round(cousin.similarityScore * 100),
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            <div className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                                {localPeriod.datasetLabel} · {localPeriod.periodRangeLabel}
                              </p>
                              <h3 className="mt-2 text-base text-stone-100">
                                {localPeriod.periodTitle}
                              </h3>
                              <button
                                type="button"
                                onClick={() => onInspectPeriod(localPeriod.periodId)}
                                className="ui-action mt-4 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-200"
                              >
                                See this period
                              </button>
                            </div>

                            <div className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                                {cousinPeriod.datasetLabel} · {cousinPeriod.periodRangeLabel}
                              </p>
                              <h3 className="mt-2 text-base text-stone-100">
                                {cousinPeriod.periodTitle}
                              </h3>
                              <button
                                type="button"
                                onClick={() =>
                                  onInspectCrossDatasetPeriod(
                                    cousinPeriod.datasetId,
                                    cousinPeriod.periodId,
                                  )
                                }
                                className="ui-action mt-4 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-200"
                              >
                                Open cousin era
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {(cousin.publicSharedTopSignals ?? cousin.sharedTopSignals).map((signal) => (
                              <span
                                key={`${cousin.id}-${signal}`}
                                className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                              >
                                {signal}
                              </span>
                            ))}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Forces in motion</p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      Forces that rise together, pull apart, or move first
                    </h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">
                    together / apart / first
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {insightPack.pressureRelationships.map((relationship) => {
                    const highlighted =
                      focusSection === 'relationships' && focusTargetId === relationship.id

                    return (
                      <article
                        key={relationship.id}
                        className={`rounded-[1.35rem] border p-4 ${sectionShell(highlighted, 'relationship')}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm uppercase tracking-[0.18em] text-cyan-100">
                              {relationship.publicSourceLabel ?? relationship.sourceLabel}
                            </p>
                            <p className="mt-1 text-sm uppercase tracking-[0.18em] text-stone-400">
                              {relationship.publicRelationshipLine ??
                                relationship.relationshipType}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <RelationGlyph relationshipType={relationship.relationshipType} />
                            <span className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300">
                              {relationship.confidence}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-stone-300">
                          {relationship.publicSummary ?? relationship.summary}
                        </p>
                        <ConfidenceRail strength={relationship.strength} tone="relationship" />
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                            onInspectForce(selectedPeriodId, relationship.sourcePressureId)
                          }
                            className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-200"
                          >
                            See this force
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>

              <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Moments that break the pattern</p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      Periods that behave differently
                    </h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-rose-100/80">
                    harder to place
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {insightPack.outliers.map((outlier) => {
                    const period = periodById[outlier.periodId]
                    const highlighted =
                      focusSection === 'outliers' && focusTargetId === outlier.id

                    return (
                      <article
                        key={outlier.id}
                        className={`rounded-[1.35rem] border p-4 ${sectionShell(highlighted, 'outlier')}`}
                      >
                        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                          {period?.rangeLabel ?? outlier.periodId}
                        </p>
                        <h3 className="mt-2 text-lg text-stone-100">{period?.title}</h3>
                        <p className="mt-2 text-sm uppercase tracking-[0.18em] text-rose-100">
                          {outlier.publicLabel ?? outlier.explanationLabel}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-stone-300">
                          {outlier.publicSummary ?? outlier.summary}
                        </p>
                        <ConfidenceRail strength={outlier.strength} tone="outlier" />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(outlier.publicTopSignals ?? outlier.topSignals).map((signal) => (
                            <span
                              key={`${outlier.id}-${signal}`}
                              className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onInspectPeriod(outlier.periodId)}
                          className="ui-action mt-4 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-200"
                        >
                          See this period
                        </button>
                      </article>
                    )
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-6 md:p-7">
              <p className="eyebrow">Insights</p>
              <h2 className="font-display mt-2 text-2xl text-stone-100">
                Insights are still being prepared here
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300">
                This history is not ready for public insight cards yet, so the Loom stays the main
                way in for now.
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5">
          <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5">
            <p className="eyebrow">Current history</p>
            <h2 className="mt-2 text-xl text-stone-100">{datasetLabel}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              The main page gives you a quick hook. This page opens the fuller story behind it.
            </p>
          </section>

          <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5">
            <p className="eyebrow">Keep in mind</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
              <p>
                These patterns are clues to inspect, not final answers.
              </p>
              <p>
                {publicCousins.length
                  ? 'One cross-country cousin is visible here. More may appear later.'
                  : 'Cross-country cousins are still sparse here.'}
              </p>
            </div>
          </section>

          {selectedPeriod && prompt ? (
            <section className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5">
              <p className="eyebrow">Current clue</p>
              <h2 className="mt-2 text-xl text-stone-100">{selectedPeriod.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                {prompt.publicText ?? prompt.text}
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
