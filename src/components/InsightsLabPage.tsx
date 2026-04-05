import { useMemo, useState } from 'react'
import type { Period } from '../types/domain'
import type {
  CrossDatasetInsightPack,
  DatasetInsightPack,
  PeriodClusterAssignment,
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

function EraStrip({
  periods,
  highlightedPeriodIds,
  basePeriodId,
  tone,
}: {
  periods: Period[]
  highlightedPeriodIds: string[]
  basePeriodId: string
  tone: InsightCardTone
}) {
  const highlightedSet = new Set(highlightedPeriodIds)
  const activeIndices = periods
    .map((period, index) => (highlightedSet.has(period.id) ? index : -1))
    .filter((index) => index >= 0)

  const firstActive = activeIndices[0] ?? -1
  const lastActive = activeIndices[activeIndices.length - 1] ?? -1
  const accent =
    tone === 'family'
      ? 'rgba(243,177,91,0.9)'
      : tone === 'relationship'
        ? 'rgba(121,219,194,0.9)'
        : 'rgba(251,113,133,0.9)'

  if (!periods.length) {
    return null
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-stone-500">
        <span>Where it appears</span>
        <span>
          {highlightedSet.size} era{highlightedSet.size === 1 ? '' : 's'}
        </span>
      </div>
      <div className="rounded-[1.1rem] border border-white/5 bg-white/[0.04] px-3 pt-3 pb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_0_24px_rgba(243,177,91,0.05)]">
        <div className="flex items-center gap-2">
          {periods.map((period, index) => {
            const isActive = highlightedSet.has(period.id)
            const isFirstActive = index === firstActive
            const isLastActive = index === lastActive
            const isBasePeriod = period.id === basePeriodId

            return (
              <div key={period.id} className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <div
                      className={`h-3 rounded-full transition ${
                        isBasePeriod
                          ? 'animate-[pulse_3.2s_ease-in-out_infinite] shadow-[0_0_18px_rgba(255,232,166,0.2)]'
                          : isActive
                            ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.05)]'
                            : ''
                      }`}
                      style={{
                        background: isBasePeriod
                          ? 'linear-gradient(90deg, rgba(255,239,184,0.98), rgba(243,177,91,0.92))'
                          : isActive
                            ? accent
                            : 'rgba(255,255,255,0.1)',
                        opacity: isActive || isBasePeriod ? 1 : 0.42,
                      }}
                    />
                    {isFirstActive || isLastActive ? (
                      <span
                        className={`absolute top-5 hidden text-[9px] uppercase tracking-[0.14em] text-stone-400 ${
                          isFirstActive && isLastActive
                            ? 'left-1/2 -translate-x-1/2'
                            : isFirstActive
                              ? 'left-0'
                              : 'right-0'
                        } md:block`}
                      >
                        {period.rangeLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
  const [activeFamilyLabel, setActiveFamilyLabel] = useState<string | null>(null)
  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId) ?? periods[0] ?? null
  const prompt = insightPack?.prompts.find((item) => item.periodId === selectedPeriodId) ?? null
  const periodById = Object.fromEntries(periods.map((period) => [period.id, period]))
  const publicPilot = insightPack?.publicStatus === 'public'
  const familyGroups = useMemo(() => {
    if (!insightPack) {
      return []
    }

    const byCluster = Object.values(
      insightPack.periodClusters.reduce<
        Record<
          string,
          {
            clusterId: string
            clusterLabel: string
            publicLabel?: string
            summary: string
            publicSummary?: string
            topSignals: string[]
            publicTopSignals?: string[]
            strongestStrength: number
            periods: PeriodClusterAssignment[]
          }
        >
      >((groups, assignment) => {
        if (!groups[assignment.clusterId]) {
          groups[assignment.clusterId] = {
            clusterId: assignment.clusterId,
            clusterLabel: assignment.clusterLabel,
            publicLabel: assignment.publicLabel,
            summary: assignment.summary,
            publicSummary: assignment.publicSummary,
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
    )

    return Object.values(
      byCluster.reduce<
        Record<
          string,
          {
            key: string
            title: string
            strongestStrength: number
            clusters: typeof byCluster
            periods: PeriodClusterAssignment[]
            topSignals: string[]
          }
        >
      >((groups, cluster) => {
        const title = cluster.publicLabel ?? 'Recurring pattern'
        const key = title.toLowerCase()

        if (!groups[key]) {
          groups[key] = {
            key,
            title,
            strongestStrength: cluster.strongestStrength,
            clusters: [],
            periods: [],
            topSignals: [],
          }
        }

        groups[key].clusters.push(cluster)
        groups[key].periods.push(...cluster.periods)
        groups[key].strongestStrength = Math.max(
          groups[key].strongestStrength,
          cluster.strongestStrength,
        )

        const mergedSignals = [
          ...groups[key].topSignals,
          ...((cluster.publicTopSignals ?? cluster.topSignals) ?? []),
        ]
        groups[key].topSignals = Array.from(new Set(mergedSignals)).slice(0, 4)

        return groups
      }, {}),
    ).sort((left, right) => right.strongestStrength - left.strongestStrength)
  }, [insightPack])

  const highlightedFamilyGroup =
    focusSection === 'families'
      ? familyGroups.find((group) =>
          group.periods.some((assignment) => assignment.id === focusTargetId),
        ) ?? null
      : null
  const resolvedActiveFamilyLabel =
    activeFamilyLabel && familyGroups.some((group) => group.title === activeFamilyLabel)
      ? activeFamilyLabel
      : highlightedFamilyGroup?.title ?? familyGroups[0]?.title ?? null
  const activeFamilyGroup =
    familyGroups.find((group) => group.title === resolvedActiveFamilyLabel) ?? familyGroups[0] ?? null
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

                {activeFamilyGroup ? (
                  <>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {familyGroups.map((group) => {
                        const isActive = group.title === activeFamilyGroup.title

                        return (
                          <button
                            key={group.key}
                            type="button"
                            onClick={() => setActiveFamilyLabel(group.title)}
                            className={`ui-action rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
                              isActive
                                ? 'border-amber-300/32 bg-amber-300/10 text-amber-100'
                                : 'border-white/10 bg-white/4 text-stone-300 hover:border-white/18 hover:text-stone-100'
                            }`}
                          >
                            {group.title}
                          </button>
                        )
                      })}
                    </div>

                    <article
                      key={activeFamilyGroup.key}
                      className="rounded-[1.45rem] border border-amber-200/10 bg-[rgba(243,177,91,0.04)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-3xl">
                          <p className="text-sm uppercase tracking-[0.18em] text-amber-100">
                            {activeFamilyGroup.title}
                          </p>
                        </div>
                        <div className="min-w-[10rem]">
                          <ConfidenceRail strength={activeFamilyGroup.strongestStrength} tone="family" />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {activeFamilyGroup.topSignals.map((signal) => (
                          <span
                            key={`${activeFamilyGroup.key}-${signal}`}
                            className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                          >
                            {signal}
                          </span>
                        ))}
                      </div>

                      <EraStrip
                        periods={periods}
                        highlightedPeriodIds={activeFamilyGroup.periods.map((assignment) => assignment.periodId)}
                        basePeriodId={selectedPeriodId}
                        tone="family"
                      />

                      <div className="mt-5 space-y-4">
                        {activeFamilyGroup.clusters.map((cluster, clusterIndex) => {
                          const clusterSignals = cluster.publicTopSignals ?? cluster.topSignals
                          const showSubLabel = activeFamilyGroup.clusters.length > 1

                          return (
                            <section
                              key={cluster.clusterId}
                              className="rounded-[1.25rem] border border-white/6 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="max-w-3xl">
                                  {showSubLabel ? (
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-100/78">
                                      Pattern {clusterIndex + 1}
                                    </p>
                                  ) : null}
                                  <p className={`${showSubLabel ? 'mt-2' : ''} text-sm leading-6 text-stone-300`}>
                                    {cluster.publicSummary ?? cluster.summary}
                                  </p>
                                </div>
                                <div className="min-w-[10rem]">
                                  <ConfidenceRail strength={cluster.strongestStrength} tone="family" />
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {clusterSignals.map((signal) => (
                                  <span
                                    key={`${cluster.clusterId}-${signal}`}
                                    className="rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                                  >
                                    {signal}
                                  </span>
                                ))}
                              </div>

                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {cluster.periods.map((assignment) => {
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
                            </section>
                          )
                        })}
                      </div>
                    </article>
                  </>
                ) : null}
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
