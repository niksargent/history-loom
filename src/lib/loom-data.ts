import echoesJson from '../../data/echoes.json'
import eventsJson from '../../data/events.json'
import metaJson from '../../data/meta.json'
import periodsJson from '../../data/periods.json'
import pressuresJson from '../../data/pressures.json'
import snapshotsJson from '../../data/snapshots.json'
import type {
  EchoLink,
  Event,
  HumanSnapshot,
  Meta,
  Period,
  PressureSeries,
  Scale,
} from '../types/domain'
import type {
  EchoRevealModel,
  LensDefinition,
  LoomDataset,
  PressureOverlaySeries,
  PressureSnapshot,
  ScaleSummary,
  SelectedPeriodDetail,
} from '../types/view'
import { clamp, formatYearRange, sentenceCase, titleCaseLabel } from './format'

function toRecord<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce<Record<string, T>>((record, item) => {
    record[item.id] = item
    return record
  }, {})
}

function assertReference<T>(
  record: Record<string, T>,
  id: string,
  context: string,
): T {
  const item = record[id]

  if (!item) {
    throw new Error(`Missing reference "${id}" while resolving ${context}.`)
  }

  return item
}

function pickTopPressures(
  period: Period,
  pressureById: Record<string, PressureSeries>,
): PressureSnapshot[] {
  return Object.entries(period.pressureScores)
    .map(([id, value]) => {
      const pressure = assertReference(pressureById, id, `pressure score for ${period.id}`)

      return {
        id,
        label: pressure.label,
        value,
        polarity: pressure.polarity,
        description: pressure.description,
      }
    })
    .sort((left, right) => right.value - left.value)
    .slice(0, 5)
}

function deriveScaleSummaries(
  period: Period,
  events: Event[],
  snapshot: HumanSnapshot | null,
): ScaleSummary[] {
  const hasGlobalEvent = events.some((event) => event.scalesAffected.includes('global'))

  const personalHeadline = snapshot?.title ?? 'Lived experience'
  const localHeadline = `Local worlds in ${period.rangeLabel}`
  const nationalHeadline = `${period.title} as a political order`
  const globalHeadline = hasGlobalEvent
    ? 'Britain in wider systems'
    : 'Outer horizons of the period'

  return [
    {
      scale: 'personal',
      headline: personalHeadline,
      body: snapshot?.summary ?? period.dailyLife,
    },
    {
      scale: 'local',
      headline: localHeadline,
      body: `${period.labour} ${period.familyHousehold}`,
    },
    {
      scale: 'national',
      headline: nationalHeadline,
      body: `${period.institutionalCondition} ${period.pressureSummary}`,
    },
    {
      scale: 'global',
      headline: globalHeadline,
      body: hasGlobalEvent
        ? `${period.technologicalCondition} ${period.informationEnvironment}`
        : `${period.scope} is the main lens here, but the era still reflects broader shifts in ideas, communication, and external entanglement.`,
    },
  ]
}

function buildEchoModels(
  period: Period,
  periodsById: Record<string, Period>,
  echoesById: Record<string, EchoLink>,
): EchoRevealModel[] {
  return period.echoIds.map((echoId) => {
    const link = assertReference(echoesById, echoId, `echo list for ${period.id}`)
    const direction = link.sourcePeriodId === period.id ? 'source' : 'target'
    const counterpartId =
      direction === 'source' ? link.targetPeriodId : link.sourcePeriodId

    return {
      link,
      counterpart: assertReference(
        periodsById,
        counterpartId,
        `echo counterpart for ${period.id}`,
      ),
      direction,
    }
  })
}

function validateDataset(
  periods: Period[],
  events: Event[],
  pressures: PressureSeries[],
  echoes: EchoLink[],
  snapshots: HumanSnapshot[],
): void {
  const periodsById = toRecord(periods)
  const eventsById = toRecord(events)
  const pressuresById = toRecord(pressures)
  const echoesById = toRecord(echoes)
  const snapshotsById = toRecord(snapshots)

  for (const period of periods) {
    for (const eventId of period.eventIds) {
      assertReference(eventsById, eventId, `events for ${period.id}`)
    }

    for (const snapshotId of period.snapshotIds) {
      assertReference(snapshotsById, snapshotId, `snapshots for ${period.id}`)
    }

    for (const echoId of period.echoIds) {
      assertReference(echoesById, echoId, `echoes for ${period.id}`)
    }

    for (const pressureId of Object.keys(period.pressureScores)) {
      assertReference(pressuresById, pressureId, `pressure scores for ${period.id}`)
    }
  }

  for (const event of events) {
    for (const periodId of event.periodIds) {
      assertReference(periodsById, periodId, `period ids for ${event.id}`)
    }

    const linkedPeriods = event.periodIds
      .map((periodId) => assertReference(periodsById, periodId, `period span for ${event.id}`))
      .sort((left, right) => left.startYear - right.startYear)

    if (linkedPeriods.length) {
      const earliestStart = linkedPeriods[0].startYear
      const latestEnd = linkedPeriods[linkedPeriods.length - 1].endYear

      if (event.startYear < earliestStart || event.endYear > latestEnd) {
        throw new Error(
          `Event ${event.id} falls outside its linked period span ${earliestStart}-${latestEnd}.`,
        )
      }
    }
  }

  for (const pressure of pressures) {
    for (const period of periods) {
      if (typeof pressure.valuesByPeriod[period.id] !== 'number') {
        throw new Error(
          `Pressure ${pressure.id} is missing a value for period ${period.id}.`,
        )
      }
    }
  }

  for (const echo of echoes) {
    assertReference(periodsById, echo.sourcePeriodId, `source period for ${echo.id}`)
    assertReference(periodsById, echo.targetPeriodId, `target period for ${echo.id}`)
  }

  for (const snapshot of snapshots) {
    assertReference(periodsById, snapshot.periodId, `period for snapshot ${snapshot.id}`)
  }
}

function buildPressureOverlaySeries(
  periods: Period[],
  pressures: PressureSeries[],
): PressureOverlaySeries[] {
  return pressures.map((pressure) => ({
    id: pressure.id,
    label: pressure.label,
    description: pressure.description,
    polarity: pressure.polarity,
    category: pressure.category,
    peaks: pressure.peakPeriods,
    points: periods.map((period) => {
      const value = pressure.valuesByPeriod[period.id]

      return {
        periodId: period.id,
        label: period.rangeLabel,
        value,
        normalized: clamp(value / 100, 0, 1),
      }
    }),
  }))
}

function buildSelectedDetails(
  periods: Period[],
  eventsById: Record<string, Event>,
  pressureById: Record<string, PressureSeries>,
  echoesById: Record<string, EchoLink>,
  snapshotsById: Record<string, HumanSnapshot>,
): Record<string, SelectedPeriodDetail> {
  const periodsById = toRecord(periods)

  return periods.reduce<Record<string, SelectedPeriodDetail>>((record, period) => {
    const events = period.eventIds.map((eventId) =>
      assertReference(eventsById, eventId, `selected detail events for ${period.id}`),
    )
    const snapshot =
      period.snapshotIds[0] !== undefined
        ? assertReference(
            snapshotsById,
            period.snapshotIds[0],
            `selected detail snapshot for ${period.id}`,
          )
        : null

    record[period.id] = {
      period,
      events,
      snapshot,
      echoes: buildEchoModels(period, periodsById, echoesById),
      scaleSummaries: deriveScaleSummaries(period, events, snapshot),
      pressureSnapshots: pickTopPressures(period, pressureById),
    }

    return record
  }, {})
}

let cachedDataset: LoomDataset | null = null
let cachedPressureById: Record<string, PressureSeries> | null = null

export function getLoomDataset(): LoomDataset {
  if (cachedDataset) {
    return cachedDataset
  }

  const meta = metaJson as Meta
  const periods = periodsJson as Period[]
  const events = eventsJson as Event[]
  const pressures = pressuresJson as PressureSeries[]
  const echoes = echoesJson as EchoLink[]
  const snapshots = snapshotsJson as HumanSnapshot[]

  validateDataset(periods, events, pressures, echoes, snapshots)

  const eventsById = toRecord(events)
  const pressuresById = toRecord(pressures)
  const echoesById = toRecord(echoes)
  const snapshotsById = toRecord(snapshots)

  const lens: LensDefinition = {
    id: `${meta.scope.toLowerCase()}-${meta.initialLensYears}-year-lens`,
    label: `${meta.initialLensYears}-year civic lens`,
    years: meta.initialLensYears,
    periodCount: meta.lensCount,
    spanLabel: formatYearRange(meta.startYear, meta.endYear),
    note: meta.note,
  }

  cachedPressureById = pressuresById
  cachedDataset = {
    meta,
    lens,
    periods,
    pressures,
    pressureOverlaySeries: buildPressureOverlaySeries(periods, pressures),
    selectedDetailsById: buildSelectedDetails(
      periods,
      eventsById,
      pressuresById,
      echoesById,
      snapshotsById,
    ),
  }

  return cachedDataset
}

export function getCounterpartIds(detail: SelectedPeriodDetail): Set<string> {
  return new Set(detail.echoes.map((echo) => echo.counterpart.id))
}

export function getScaleAccent(scale: Scale): string {
  switch (scale) {
    case 'personal':
      return 'text-amber-200'
    case 'local':
      return 'text-cyan-200'
    case 'national':
      return 'text-rose-200'
    case 'global':
      return 'text-lime-200'
    default:
      return 'text-stone-200'
  }
}

export function getReleaseLabel(releaseType: string): string {
  return sentenceCase(releaseType.replace(/-/g, ' '))
}

export function getPressureLabel(pressureId: string): string {
  const pressureById = cachedPressureById ?? toRecord(getLoomDataset().pressures)
  const pressure = pressureById[pressureId]

  return pressure?.label ?? titleCaseLabel(pressureId)
}
