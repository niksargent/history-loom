import type {
  CrossDatasetInsightPack,
  DatasetInsightPack,
} from '../types/insights'

const datasetInsightPromises: Partial<Record<string, Promise<DatasetInsightPack>>> = {}
let crossDatasetInsightPromise: Promise<CrossDatasetInsightPack> | null = null

const datasetInsightLoaders: Record<string, () => Promise<DatasetInsightPack>> = {
  'britain-1066-2025': async () =>
    (await import('../../data/derived/britain-1066-2025.json')).default as DatasetInsightPack,
  'united-states-1776-2025': async () =>
    (await import('../../data/derived/united-states-1776-2025.json')).default as DatasetInsightPack,
  'france-1789-2025': async () =>
    (await import('../../data/derived/france-1789-2025.json')).default as DatasetInsightPack,
}

export async function getDatasetInsightPack(
  datasetId: string,
): Promise<DatasetInsightPack | null> {
  const loader = datasetInsightLoaders[datasetId]

  if (!loader) {
    return null
  }

  if (!datasetInsightPromises[datasetId]) {
    datasetInsightPromises[datasetId] = loader()
  }

  return datasetInsightPromises[datasetId] ?? null
}

export async function getCrossDatasetInsightPack(): Promise<CrossDatasetInsightPack> {
  if (!crossDatasetInsightPromise) {
    crossDatasetInsightPromise = import('../../data/derived/cross-dataset.json').then(
      (module) => module.default as CrossDatasetInsightPack,
    )
  }

  return crossDatasetInsightPromise
}
