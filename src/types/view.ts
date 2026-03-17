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

export interface ScaleSummary {
  scale: Scale
  headline: string
  body: string
}

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

export interface SelectedPeriodDetail {
  period: Period
  events: Event[]
  snapshot: HumanSnapshot | null
  echoes: EchoRevealModel[]
  scaleSummaries: ScaleSummary[]
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

