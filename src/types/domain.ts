export type Scale = 'personal' | 'local' | 'national' | 'global'

export type PressurePolarity = 'stress' | 'stabiliser'

export interface Meta {
  project: string
  dataset: string
  scope: string
  startYear: number
  endYear: number
  initialLensYears: number
  lensCount: number
  note: string
}

export interface Period {
  id: string
  title: string
  startYear: number
  endYear: number
  rangeLabel: string
  scope: string
  geography: string[]
  summary: string
  dominantValues: string[]
  socialMood: string[]
  materialCondition: string
  institutionalCondition: string
  technologicalCondition: string
  religiousPhilosophicalCondition: string
  informationEnvironment: string
  cohesionLevel: number
  legitimacyLevel: number
  inequalityLevel: number
  dailyLife: string
  labour: string
  familyHousehold: string
  insecurityExposure: string
  autonomyVsObligation: string
  opportunityVsPrecarity: string
  senseOfFuture: string
  emotionalClimate: string
  whatEmerged: string[]
  whatExpanded: string[]
  newPossibilities: string[]
  whatFaded: string[]
  whatBroke: string[]
  whatBecameHarder: string[]
  whatWasForgotten: string[]
  pressureSummary: string
  releaseType: string
  pressureScores: Record<string, number>
  eventIds: string[]
  snapshotIds: string[]
  echoIds: string[]
}

export interface Event {
  id: string
  title: string
  startYear: number
  endYear: number
  scope: string
  geography: string
  summary: string
  type: string
  periodIds: string[]
  pressureDrivers: string[]
  consequences: string[]
  scalesAffected: Scale[]
  madePossible: string[]
  destroyedOrDisplaced: string[]
}

export interface PressureSeries {
  id: string
  label: string
  description: string
  category: string
  polarity: PressurePolarity
  valuesByPeriod: Record<string, number>
  peakPeriods: string[]
  releasePatterns: string[]
  relatedPressureIds: string[]
}

export interface EchoLink {
  id: string
  sourcePeriodId: string
  targetPeriodId: string
  similarityLabel: string
  similarityReasons: string[]
  dimensions: string[]
  confidence: number
  notes: string
}

export interface HumanSnapshot {
  id: string
  periodId: string
  title: string
  scale: Scale
  summary: string
  dailyReality: string
  sourcesOrRationale: string
}

