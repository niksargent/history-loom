export type InsightConfidenceTier = 'strong' | 'moderate' | 'experimental'

export type InsightRelationshipType = 'co-movement' | 'inverse' | 'lead-lag'

export type OutlierType =
  | 'high-strain-high-order'
  | 'cluster-edge'
  | 'unexpected-profile'

export type EchoSupportStatus = 'reinforced' | 'mixed' | 'weak'

export type InsightDestinationSection =
  | 'families'
  | 'relationships'
  | 'outliers'
  | 'echoes'
  | 'cousins'

export interface InsightGenerationMeta {
  version: string
  method: string
  generatedAt: string
}

export interface PeriodClusterAssignment {
  id: string
  periodId: string
  clusterId: string
  clusterLabel: string
  strength: number
  confidence: InsightConfidenceTier
  summary: string
  topSignals: string[]
}

export interface PressureRelationship {
  id: string
  sourcePressureId: string
  sourceLabel: string
  targetPressureId: string
  targetLabel: string
  relationshipType: InsightRelationshipType
  lag: 0 | 1
  strength: number
  confidence: InsightConfidenceTier
  supportingPeriods: string[]
  summary: string
}

export interface OutlierSignal {
  id: string
  periodId: string
  outlierType: OutlierType
  strength: number
  confidence: InsightConfidenceTier
  explanationLabel: string
  summary: string
  topSignals: string[]
}

export interface CrossDatasetAffinity {
  id: string
  sourceDatasetId: string
  sourceDatasetLabel: string
  sourcePeriodId: string
  sourcePeriodTitle: string
  sourcePeriodRangeLabel: string
  targetDatasetId: string
  targetDatasetLabel: string
  targetPeriodId: string
  targetPeriodTitle: string
  targetPeriodRangeLabel: string
  similarityScore: number
  sharedTopSignals: string[]
  confidence: InsightConfidenceTier
  summary: string
}

export interface PublicCrossDatasetCousin extends CrossDatasetAffinity {
  headline: string
  publicSummary: string
}

export interface EchoSupportSignal {
  id: string
  echoId: string
  sourcePeriodId: string
  targetPeriodId: string
  supportStatus: EchoSupportStatus
  similarityScore: number
  confidence: InsightConfidenceTier
  notes: string
}

export interface InsightPrompt {
  id: string
  periodId: string
  text: string
  insightKind: 'family' | 'relationship' | 'outlier' | 'echo'
  confidence: InsightConfidenceTier
  destinationSection: InsightDestinationSection
  destinationTargetId: string
}

export interface DatasetInsightPack {
  datasetId: string
  datasetLabel: string
  publicStatus: 'public' | 'internal'
  generation: InsightGenerationMeta
  periodClusters: PeriodClusterAssignment[]
  pressureRelationships: PressureRelationship[]
  outliers: OutlierSignal[]
  echoSupport: EchoSupportSignal[]
  prompts: InsightPrompt[]
}

export interface CrossDatasetInsightPack {
  scope: 'internal'
  generation: InsightGenerationMeta
  affinities: CrossDatasetAffinity[]
  publicCousins: PublicCrossDatasetCousin[]
}
