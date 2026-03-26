import type {
  EchoLink,
  Event,
  HumanSnapshot,
  Meta,
  Period,
  PressurePolarity,
  PressureSeries,
  Scale,
} from './domain'

export interface LensDefinition {
  id: string
  label: string
  years: number
  periodCount: number
  spanLabel: string
  note: string
}

export type LoomDensityMode = 'compact' | 'expanded'

export type DetailViewMode = 'guided' | 'full'

export interface ScaleSummary {
  scale: Scale
  headline: string
  body: string
}

export type GeoRegionId =
  | 'united-states'
  | 'north-america'
  | 'england'
  | 'scotland'
  | 'wales'
  | 'northern-ireland'
  | 'ireland'
  | 'britain'
  | 'british-isles'
  | 'france'
  | 'europe'
  | 'global'

export interface PressurePoint {
  periodId: string
  label: string
  value: number
  normalized: number
}

export interface PressureOverlaySeries {
  id: string
  label: string
  description: string
  polarity: PressurePolarity
  category: string
  points: PressurePoint[]
  peaks: string[]
}

export interface EchoRevealModel {
  link: EchoLink
  counterpart: Period
  direction: 'source' | 'target'
}

export interface PressureSnapshot {
  id: string
  label: string
  value: number
  polarity: PressurePolarity
  description: string
}

export interface GeographyInsetModel {
  labels: string[]
  highlightedRegions: GeoRegionId[]
  contextLabel: string
}

export interface PressureCascadeModel {
  pressureId: string
  label: string
  description: string
  value: number
  polarity: PressurePolarity
  matchedEvents: Event[]
  impactedScales: Scale[]
  geographyLabels: string[]
}

export interface ComparePanelModel {
  source: SelectedPeriodDetail
  target: SelectedPeriodDetail
}

export interface SelectedPeriodDetail {
  period: Period
  events: Event[]
  snapshot: HumanSnapshot | null
  echoes: EchoRevealModel[]
  scaleSummaries: ScaleSummary[]
  allPressureSnapshots: PressureSnapshot[]
  pressureSnapshots: PressureSnapshot[]
}

export interface LoomDataset {
  meta: Meta
  lens: LensDefinition
  periods: Period[]
  pressures: PressureSeries[]
  selectedDetailsById: Record<string, SelectedPeriodDetail>
  pressureOverlaySeries: PressureOverlaySeries[]
}
