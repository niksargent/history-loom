import datasetsJson from '../../data/datasets.json'
import type {
  DatasetRegistryEntry,
  EchoLink,
  Event,
  HumanSnapshot,
  Meta,
  Period,
  PressureSeries,
  Scale,
} from '../types/domain'
import type {
  GeographyInsetModel,
  EchoRevealModel,
  LensDefinition,
  LoomDataset,
  PressureCascadeModel,
  PressureOverlaySeries,
  PressureSnapshot,
  ScaleSummary,
  SelectedPeriodDetail,
  GeoRegionId,
} from '../types/view'
import { clamp, formatYearRange, sentenceCase, titleCaseLabel } from './format'

interface RawDataset {
  meta: Meta
  periods: Period[]
  events: Event[]
  pressures: PressureSeries[]
  echoes: EchoLink[]
  snapshots: HumanSnapshot[]
}

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

function buildPressureSnapshots(
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
    ? `${period.scope} in wider systems`
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
    const allPressureSnapshots = buildPressureSnapshots(period, pressureById)

    record[period.id] = {
      period,
      events,
      snapshot,
      echoes: buildEchoModels(period, periodsById, echoesById),
      scaleSummaries: deriveScaleSummaries(period, events, snapshot),
      allPressureSnapshots,
      pressureSnapshots: allPressureSnapshots.slice(0, 5),
    }

    return record
  }, {})
}

const cachedDatasets: Record<string, LoomDataset> = {}
const cachedPressureByDatasetId: Record<string, Record<string, PressureSeries>> = {}
const rawDatasetPromises: Partial<Record<string, Promise<RawDataset>>> = {}

const datasetRegistry = datasetsJson as DatasetRegistryEntry[]

const rawDatasetLoaders: Record<string, () => Promise<RawDataset>> = {
  'britain-1066-2025': async () => {
    const [meta, periods, events, pressures, echoes, snapshots] = await Promise.all([
      import('../../data/meta.json'),
      import('../../data/periods.json'),
      import('../../data/events.json'),
      import('../../data/pressures.json'),
      import('../../data/echoes.json'),
      import('../../data/snapshots.json'),
    ])

    return {
      meta: meta.default as Meta,
      periods: periods.default as Period[],
      events: events.default as Event[],
      pressures: pressures.default as PressureSeries[],
      echoes: echoes.default as EchoLink[],
      snapshots: snapshots.default as HumanSnapshot[],
    }
  },
  'united-states-1776-2025': async () => {
    const [meta, periods, events, pressures, echoes, snapshots] = await Promise.all([
      import('../../data/usa/meta.json'),
      import('../../data/usa/periods.json'),
      import('../../data/usa/events.json'),
      import('../../data/usa/pressures.json'),
      import('../../data/usa/echoes.json'),
      import('../../data/usa/snapshots.json'),
    ])

    return {
      meta: meta.default as Meta,
      periods: periods.default as Period[],
      events: events.default as Event[],
      pressures: pressures.default as PressureSeries[],
      echoes: echoes.default as EchoLink[],
      snapshots: snapshots.default as HumanSnapshot[],
    }
  },
  'france-1789-2025': async () => {
    const [meta, periods, events, pressures, echoes, snapshots] = await Promise.all([
      import('../../data/france/meta.json'),
      import('../../data/france/periods.json'),
      import('../../data/france/events.json'),
      import('../../data/france/pressures.json'),
      import('../../data/france/echoes.json'),
      import('../../data/france/snapshots.json'),
    ])

    return {
      meta: meta.default as Meta,
      periods: periods.default as Period[],
      events: events.default as Event[],
      pressures: pressures.default as PressureSeries[],
      echoes: echoes.default as EchoLink[],
      snapshots: snapshots.default as HumanSnapshot[],
    }
  },
}

export function getDatasetRegistry(): DatasetRegistryEntry[] {
  return datasetRegistry
}

async function loadRawDataset(datasetId: string): Promise<RawDataset> {
  if (rawDatasetPromises[datasetId]) {
    return rawDatasetPromises[datasetId]
  }

  const loader = rawDatasetLoaders[datasetId]

  if (!loader) {
    throw new Error(`Unknown dataset "${datasetId}".`)
  }

  rawDatasetPromises[datasetId] = loader()
  return rawDatasetPromises[datasetId]
}

export async function getLoomDataset(datasetId = 'britain-1066-2025'): Promise<LoomDataset> {
  if (cachedDatasets[datasetId]) {
    return cachedDatasets[datasetId]
  }

  const rawDataset = await loadRawDataset(datasetId)
  const { meta, periods, events, pressures, echoes, snapshots } = rawDataset

  validateDataset(periods, events, pressures, echoes, snapshots)

  const eventsById = toRecord(events)
  const pressuresById = toRecord(pressures)
  const echoesById = toRecord(echoes)
  const snapshotsById = toRecord(snapshots)

  const lens: LensDefinition = {
    id:
      meta.initialLensYears > 0
        ? `${meta.scope.toLowerCase()}-${meta.initialLensYears}-year-lens`
        : `${meta.scope.toLowerCase()}-${meta.lensCount}-era-lens`,
    label:
      meta.initialLensYears > 0
        ? `${meta.initialLensYears}-year civic lens`
        : `${meta.lensCount}-era civic lens`,
    years: meta.initialLensYears,
    periodCount: meta.lensCount,
    spanLabel: formatYearRange(meta.startYear, meta.endYear),
    note: meta.note,
  }

  cachedPressureByDatasetId[datasetId] = pressuresById
  cachedDatasets[datasetId] = {
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

  return cachedDatasets[datasetId]
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

export function getPressureLabel(
  pressureId: string,
  datasetId = 'britain-1066-2025',
): string {
  const pressureById = cachedPressureByDatasetId[datasetId]
  const pressure = pressureById?.[pressureId]

  return pressure?.label ?? titleCaseLabel(pressureId)
}

export function inferGeographyRegions(labels: string[]): GeoRegionId[] {
  const normalized = labels.join(' | ').toLowerCase()
  const regions = new Set<GeoRegionId>()

  if (normalized.includes('united states')) {
    regions.add('united-states')
  }

  if (normalized.includes('north america')) {
    regions.add('north-america')
  }

  if (
    normalized.includes('british isles') ||
    normalized.includes('england, scotland, ireland')
  ) {
    regions.add('british-isles')
  }

  if (
    normalized.includes('britain') ||
    normalized.includes('united kingdom') ||
    normalized.includes('england and scotland')
  ) {
    regions.add('britain')
  }

  if (normalized.includes('england')) {
    regions.add('england')
  }

  if (normalized.includes('scotland')) {
    regions.add('scotland')
  }

  if (normalized.includes('wales')) {
    regions.add('wales')
  }

  if (normalized.includes('northern ireland')) {
    regions.add('northern-ireland')
  }

  if (normalized.includes('ireland')) {
    regions.add('ireland')
  }

  if (normalized.includes('france')) {
    regions.add('france')
  }

  if (normalized.includes('eu') || normalized.includes('europe')) {
    regions.add('europe')
  }

  if (normalized.includes('global') || normalized.includes('empire')) {
    regions.add('global')
  }

  return Array.from(regions)
}

export function buildGeographyInsetModel(
  labels: string[],
  contextLabel: string,
): GeographyInsetModel {
  return {
    labels,
    highlightedRegions: inferGeographyRegions(labels),
    contextLabel,
  }
}

export function buildPressureCascade(
  detail: SelectedPeriodDetail,
  pressureId: string | null,
): PressureCascadeModel | null {
  if (!pressureId) {
    return null
  }

  const overlaySeries = detail.allPressureSnapshots.find((pressure) => pressure.id === pressureId)

  if (!overlaySeries) {
    return null
  }

  const matchedEvents = detail.events.filter((event) =>
    event.pressureDrivers.includes(pressureId),
  )
  const impactedScales = Array.from(
    new Set(matchedEvents.flatMap((event) => event.scalesAffected)),
  )
  const geographyLabels = Array.from(
    new Set(matchedEvents.map((event) => event.geography).filter(Boolean)),
  )

  return {
    pressureId,
    label: overlaySeries.label,
    description: overlaySeries.description,
    value: detail.period.pressureScores[pressureId] ?? 0,
    polarity: overlaySeries.polarity,
    matchedEvents,
    impactedScales,
    geographyLabels,
  }
}
