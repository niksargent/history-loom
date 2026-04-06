import type { Period } from '../types/domain'
import type { DatasetInsightPack, PeriodClusterAssignment } from '../types/insights'

export type PatternBandKind = 'long-run' | 'returning' | 'short-phase'

export interface PatternBandRun {
  startIndex: number
  endIndex: number
  periodIds: string[]
  strength: number
}

export interface PatternBandVariant {
  clusterId: string
  summary: string
  publicSummary?: string
  topSignals: string[]
  publicTopSignals?: string[]
  strength: number
  assignments: PeriodClusterAssignment[]
}

export interface PatternBandGroup {
  key: string
  title: string
  titleStrength: number
  assignments: PeriodClusterAssignment[]
  variants: PatternBandVariant[]
  runs: PatternBandRun[]
  selectedIncluded: boolean
  patternKind: PatternBandKind
  caption: string
  humanMeaning: string
  topSignals: string[]
}

function classifyPatternKind(runs: PatternBandRun[]): PatternBandKind {
  if (runs.length > 1) {
    return 'returning'
  }

  const runLength = runs[0]?.periodIds.length ?? 0
  return runLength >= 4 ? 'long-run' : 'short-phase'
}

function getPatternCaption(kind: PatternBandKind, runs: PatternBandRun[]): string {
  if (kind === 'returning') {
    return 'Returns after a break'
  }

  if (kind === 'long-run') {
    return 'A long-running pattern'
  }

  if ((runs[0]?.periodIds.length ?? 0) <= 1) {
    return 'Shows up in a single flash'
  }

  return 'Appears in a short burst'
}

function getPatternHumanMeaning(kind: PatternBandKind, topSignals: string[]): string {
  const leadSignals = topSignals.slice(0, 2).map((signal) => signal.toLowerCase())

  if (kind === 'long-run') {
    return `This is a settled way of life for a long stretch of the history, with ${leadSignals.join(
      ' and ',
    )} shaping the mood most strongly.`
  }

  if (kind === 'returning') {
    return `This way of life does not stay gone. It returns when ${leadSignals.join(
      ' and ',
    )} come back into the foreground.`
  }

  return `This is a shorter phase when ${leadSignals.join(
    ' and ',
  )} briefly shape how the period holds together.`
}

function getGroupKey(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function buildPatternBandGroups(
  insightPack: DatasetInsightPack,
  periods: Period[],
  selectedPeriodId: string,
): PatternBandGroup[] {
  const periodIndexById = new Map(periods.map((period, index) => [period.id, index]))

  const clusterMap = new Map<
    string,
    {
      clusterId: string
      title: string
      summary: string
      publicSummary?: string
      topSignals: string[]
      publicTopSignals?: string[]
      strength: number
      assignments: PeriodClusterAssignment[]
    }
  >()

  for (const assignment of insightPack.periodClusters) {
    const existing = clusterMap.get(assignment.clusterId)

    if (existing) {
      existing.assignments.push(assignment)
      existing.strength = Math.max(existing.strength, assignment.strength)
      continue
    }

    clusterMap.set(assignment.clusterId, {
      clusterId: assignment.clusterId,
      title: assignment.publicLabel ?? assignment.clusterLabel ?? 'Recurring pattern',
      summary: assignment.summary,
      publicSummary: assignment.publicSummary,
      topSignals: assignment.topSignals,
      publicTopSignals: assignment.publicTopSignals,
      strength: assignment.strength,
      assignments: [assignment],
    })
  }

  const groupMap = new Map<string, PatternBandGroup>()

  for (const cluster of clusterMap.values()) {
    const key = getGroupKey(cluster.title)
    const existing = groupMap.get(key)

    const variant: PatternBandVariant = {
      clusterId: cluster.clusterId,
      summary: cluster.summary,
      publicSummary: cluster.publicSummary,
      topSignals: cluster.topSignals,
      publicTopSignals: cluster.publicTopSignals,
      strength: cluster.strength,
      assignments: [...cluster.assignments].sort(
        (left, right) =>
          (periodIndexById.get(left.periodId) ?? Number.MAX_SAFE_INTEGER) -
          (periodIndexById.get(right.periodId) ?? Number.MAX_SAFE_INTEGER),
      ),
    }

    if (existing) {
      existing.variants.push(variant)
      existing.assignments.push(...variant.assignments)
      existing.titleStrength = Math.max(existing.titleStrength, variant.strength)
      existing.selectedIncluded =
        existing.selectedIncluded ||
        variant.assignments.some((assignment) => assignment.periodId === selectedPeriodId)
      existing.topSignals = Array.from(
        new Set([...existing.topSignals, ...(variant.publicTopSignals ?? variant.topSignals)]),
      ).slice(0, 4)
      continue
    }

    groupMap.set(key, {
      key,
      title: cluster.title,
      titleStrength: cluster.strength,
      assignments: [...variant.assignments],
      variants: [variant],
      runs: [],
      selectedIncluded: variant.assignments.some(
        (assignment) => assignment.periodId === selectedPeriodId,
      ),
      patternKind: 'short-phase',
      caption: '',
      humanMeaning: '',
      topSignals: [...(variant.publicTopSignals ?? variant.topSignals)].slice(0, 4),
    })
  }

  for (const group of groupMap.values()) {
    const periodStrengthById = new Map<string, number>()
    for (const assignment of group.assignments) {
      periodStrengthById.set(
        assignment.periodId,
        Math.max(periodStrengthById.get(assignment.periodId) ?? 0, assignment.strength),
      )
    }

    const orderedPeriods = [...periodStrengthById.entries()]
      .map(([periodId, strength]) => ({
        periodId,
        strength,
        index: periodIndexById.get(periodId) ?? Number.MAX_SAFE_INTEGER,
      }))
      .filter((item) => item.index !== Number.MAX_SAFE_INTEGER)
      .sort((left, right) => left.index - right.index)

    const runs: PatternBandRun[] = []
    for (const item of orderedPeriods) {
      const lastRun = runs[runs.length - 1]

      if (!lastRun || item.index > lastRun.endIndex + 1) {
        runs.push({
          startIndex: item.index,
          endIndex: item.index,
          periodIds: [item.periodId],
          strength: item.strength,
        })
        continue
      }

      lastRun.endIndex = item.index
      lastRun.periodIds.push(item.periodId)
      lastRun.strength = Math.max(lastRun.strength, item.strength)
    }

    group.runs = runs
    group.patternKind = classifyPatternKind(runs)
    group.caption = getPatternCaption(group.patternKind, runs)
    group.humanMeaning = getPatternHumanMeaning(group.patternKind, group.topSignals)
    group.variants.sort((left, right) => right.strength - left.strength)
  }

  return [...groupMap.values()].sort((left, right) => {
    if (left.selectedIncluded !== right.selectedIncluded) {
      return left.selectedIncluded ? -1 : 1
    }

    if (left.patternKind !== right.patternKind) {
      const rank: Record<PatternBandKind, number> = {
        'long-run': 0,
        returning: 1,
        'short-phase': 2,
      }
      return rank[left.patternKind] - rank[right.patternKind]
    }

    return right.titleStrength - left.titleStrength
  })
}
