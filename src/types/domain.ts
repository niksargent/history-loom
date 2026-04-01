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
  populationEstimate?: number
  populationLabel?: string
  urbanisationEstimate?: number
  scope: string
  geography: string[]
  summary: string
  publicSummary?: string
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
  themeIds?: string[]
  geographyIds?: string[]
  pressureSummary: string
  publicPressureSummary?: string
  publicReading?: string
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
  publicSummary?: string
  type: string
  periodIds: string[]
  pressureDrivers: string[]
  consequences: string[]
  scalesAffected: Scale[]
  madePossible: string[]
  destroyedOrDisplaced: string[]
  themeIds?: string[]
  geographyIds?: string[]
  sourcesOrRationale?: string
}

export interface PressureSeries {
  id: string
  label: string
  publicLabel?: string
  description: string
  publicDescription?: string
  category: string
  polarity: PressurePolarity
  valuesByPeriod: Record<string, number>
  peakPeriods: string[]
  releasePatterns: string[]
  relatedPressureIds: string[]
}

export interface PopulationSeries {
  id: string
  label: string
  scope: string
  unit: string
  valuesByPeriod: Record<string, number>
  anchors?: Array<{
    year: number
    value: number
  }>
  notes?: string
  sourceNotes?: string
}

export interface EchoLink {
  id: string
  sourcePeriodId: string
  targetPeriodId: string
  similarityLabel: string
  publicSimilarityLabel?: string
  similarityReasons: string[]
  publicSimilarityReasons?: string[]
  dimensions: string[]
  confidence: number
  notes: string
  publicNotes?: string
}

export interface LivedVoice {
  id: string
  label: string
  voiceMode?: 'personal' | 'street-level' | 'household' | 'worker' | 'civic'
  speakerFrame?: string
  publicSpeakerFrame?: string
  prompt?: string
  publicPrompt?: string
  response: string
  publicResponse?: string
}

export interface HumanSnapshot {
  id: string
  periodId: string
  title: string
  publicTitle?: string
  scale: Scale
  summary: string
  publicSummary?: string
  dailyReality: string
  publicDailyReality?: string
  voiceMode?: 'personal' | 'street-level' | 'household' | 'worker' | 'civic'
  speakerFrame?: string
  publicSpeakerFrame?: string
  prompt?: string
  publicPrompt?: string
  response?: string
  publicResponse?: string
  voices?: LivedVoice[]
  sourcesOrRationale: string
}

export interface Theme {
  id: string
  label: string
  description: string
}

export interface Geography {
  id: string
  label: string
  kind: string
}

export interface DatasetVisualTheme {
  light: string
  cool: string
  warm: string
  contrast: string
  glow: string
  baseTop: string
  baseMid: string
  baseBottom: string
}

export interface DatasetRegistryEntry {
  id: string
  dataPath: string
  label: string
  scope: string
  startYear: number
  endYear: number
  status: string
  currentPriority: string
  defaultLensId: string
  availableLensIds: string[]
  supportedThemeIds: string[]
  supportedGeographyIds: string[]
  notes: string
  insightVisibility?: 'public' | 'internal'
  hasPopulationCoverage?: boolean
  populationConfidence?: 'strong' | 'moderate' | 'exploratory'
  visualTheme?: DatasetVisualTheme
}
