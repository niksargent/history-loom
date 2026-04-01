import type {
  CrossDatasetInsightPack,
  DatasetInsightPack,
} from '../types/insights'

const datasetInsightPromises: Partial<Record<string, Promise<DatasetInsightPack>>> = {}
let crossDatasetInsightPromise: Promise<CrossDatasetInsightPack> | null = null

type InsightModuleLoader<T> = Record<string, () => Promise<{ default: T }>>

const datasetInsightLoaders = import.meta.glob('../../data/derived/*.json') as InsightModuleLoader<DatasetInsightPack>
const crossDatasetInsightLoaders = import.meta.glob('../../data/derived/cross-dataset.json') as InsightModuleLoader<CrossDatasetInsightPack>

export async function getDatasetInsightPack(
  datasetId: string,
): Promise<DatasetInsightPack | null> {
  const loader = datasetInsightLoaders[`../../data/derived/${datasetId}.json`]

  if (!loader) {
    return null
  }

  if (!datasetInsightPromises[datasetId]) {
    datasetInsightPromises[datasetId] = loader().then((module) => module.default)
  }

  return datasetInsightPromises[datasetId] ?? null
}

export async function getCrossDatasetInsightPack(): Promise<CrossDatasetInsightPack> {
  if (!crossDatasetInsightPromise) {
    const loader = crossDatasetInsightLoaders['../../data/derived/cross-dataset.json']

    if (!loader) {
      throw new Error('Missing cross-dataset insight pack.')
    }

    crossDatasetInsightPromise = loader().then((module) => module.default)
  }

  return crossDatasetInsightPromise
}
