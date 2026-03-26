import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const dataRoot = path.join(repoRoot, 'data')
const derivedRoot = path.join(dataRoot, 'derived')

const DATASET_CONFIGS = [
  {
    id: 'britain-1066-2025',
    label: 'Britain',
    visibility: 'internal',
    basePath: dataRoot,
  },
  {
    id: 'united-states-1776-2025',
    label: 'United States',
    visibility: 'public',
    basePath: path.join(dataRoot, 'usa'),
  },
  {
    id: 'france-1789-2025',
    label: 'France',
    visibility: 'internal',
    basePath: path.join(dataRoot, 'france'),
  },
]

const GENERATION_META = {
  version: 'v1',
  method: 'stats-first-derived-insights',
}

function round(value, digits = 3) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function mean(values) {
  if (!values.length) {
    return 0
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function standardDeviation(values) {
  if (values.length <= 1) {
    return 0
  }

  const avg = mean(values)
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function euclideanDistance(left, right) {
  return Math.sqrt(
    left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0),
  )
}

function cosineSimilarity(left, right) {
  const dot = left.reduce((sum, value, index) => sum + value * right[index], 0)
  const leftMagnitude = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0))
  const rightMagnitude = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0))

  if (!leftMagnitude || !rightMagnitude) {
    return 0
  }

  return dot / (leftMagnitude * rightMagnitude)
}

function rank(values) {
  const sorted = [...values]
    .map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value)
  const ranks = new Array(values.length).fill(0)
  let cursor = 0

  while (cursor < sorted.length) {
    let end = cursor

    while (end + 1 < sorted.length && sorted[end + 1].value === sorted[cursor].value) {
      end += 1
    }

    const averageRank = (cursor + end + 2) / 2
    for (let index = cursor; index <= end; index += 1) {
      ranks[sorted[index].index] = averageRank
    }

    cursor = end + 1
  }

  return ranks
}

function spearmanCorrelation(left, right) {
  if (left.length !== right.length || left.length < 2) {
    return 0
  }

  const leftRanks = rank(left)
  const rightRanks = rank(right)
  const leftMean = mean(leftRanks)
  const rightMean = mean(rightRanks)

  let numerator = 0
  let leftVariance = 0
  let rightVariance = 0

  for (let index = 0; index < leftRanks.length; index += 1) {
    const leftDelta = leftRanks[index] - leftMean
    const rightDelta = rightRanks[index] - rightMean
    numerator += leftDelta * rightDelta
    leftVariance += leftDelta ** 2
    rightVariance += rightDelta ** 2
  }

  if (!leftVariance || !rightVariance) {
    return 0
  }

  return numerator / Math.sqrt(leftVariance * rightVariance)
}

function confidenceFromStrength(strength) {
  if (strength >= 0.82) {
    return 'strong'
  }

  if (strength >= 0.66) {
    return 'moderate'
  }

  return 'experimental'
}

function lowerLabel(label) {
  return label.toLowerCase()
}

function readJson(filePath) {
  return readFile(filePath, 'utf8').then((content) => JSON.parse(content))
}

async function loadDataset(config) {
  const [meta, periods, events, echoes, pressures] = await Promise.all([
    readJson(path.join(config.basePath, 'meta.json')),
    readJson(path.join(config.basePath, 'periods.json')),
    readJson(path.join(config.basePath, 'events.json')),
    readJson(path.join(config.basePath, 'echoes.json')),
    readJson(path.join(config.basePath, 'pressures.json')),
  ])

  return { ...config, meta, periods, events, echoes, pressures }
}

function buildPressureVectors(dataset) {
  const pressureIds = Object.keys(dataset.periods[0]?.pressureScores ?? {})
  const labelsById = Object.fromEntries(dataset.pressures.map((pressure) => [pressure.id, pressure.label]))
  const rawVectors = dataset.periods.map((period) =>
    pressureIds.map((pressureId) => period.pressureScores[pressureId] ?? 0),
  )

  const means = pressureIds.map((_, index) => mean(rawVectors.map((vector) => vector[index])))
  const deviations = pressureIds.map((_, index) =>
    standardDeviation(rawVectors.map((vector) => vector[index])),
  )

  const zVectors = rawVectors.map((vector) =>
    vector.map((value, index) => {
      const deviation = deviations[index]
      if (!deviation) {
        return 0
      }
      return (value - means[index]) / deviation
    }),
  )

  return { pressureIds, labelsById, rawVectors, zVectors, means }
}

function computeCentroid(indexes, vectors) {
  if (!indexes.length) {
    return []
  }

  const dimension = vectors[0].length
  return Array.from({ length: dimension }, (_, dimensionIndex) =>
    mean(indexes.map((index) => vectors[index][dimensionIndex])),
  )
}

function clusterPeriods(vectors, targetClusterCount) {
  let clusters = vectors.map((vector, index) => ({
    indexes: [index],
    centroid: vector,
  }))

  while (clusters.length > targetClusterCount) {
    let bestPair = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (let leftIndex = 0; leftIndex < clusters.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < clusters.length; rightIndex += 1) {
        const left = clusters[leftIndex]
        const right = clusters[rightIndex]
        const distance =
          (left.indexes.length * right.indexes.length) /
          (left.indexes.length + right.indexes.length) *
          euclideanDistance(left.centroid, right.centroid) ** 2

        if (distance < bestDistance) {
          bestDistance = distance
          bestPair = [leftIndex, rightIndex]
        }
      }
    }

    if (!bestPair) {
      break
    }

    const [leftIndex, rightIndex] = bestPair
    const mergedIndexes = [
      ...clusters[leftIndex].indexes,
      ...clusters[rightIndex].indexes,
    ].sort((left, right) => left - right)
    const mergedCluster = {
      indexes: mergedIndexes,
      centroid: computeCentroid(mergedIndexes, vectors),
    }

    clusters = clusters.filter((_, index) => index !== leftIndex && index !== rightIndex)
    clusters.push(mergedCluster)
  }

  return clusters
}

function clusterLabelFromSignals(topSignals, periodTitles) {
  const joinedSignals = topSignals.join(' ').toLowerCase()

  if (joinedSignals.includes('institutional legitimacy') && joinedSignals.includes('public hope')) {
    return 'high-hope settlement'
  }

  if (joinedSignals.includes('militarization') && joinedSignals.includes('public hope')) {
    return 'mobilised settlement'
  }

  if (
    joinedSignals.includes('inequality') &&
    joinedSignals.includes('information acceleration')
  ) {
    return 'fragmenting acceleration'
  }

  if (
    joinedSignals.includes('economic precarity') &&
    joinedSignals.includes('institutional legitimacy')
  ) {
    return 'brittle order'
  }

  if (
    joinedSignals.includes('militarization') &&
    joinedSignals.includes('moral certainty')
  ) {
    return 'militarised conviction'
  }

  if (
    joinedSignals.includes('technological disruption') &&
    joinedSignals.includes('information acceleration')
  ) {
    return 'accelerated transition'
  }

  if (periodTitles.some((title) => title.toLowerCase().includes('reconstruction'))) {
    return 'reconstruction settlement'
  }

  return `${topSignals[0] ?? 'mixed'} family`
}

function buildClusterAssignments(dataset, vectorInfo) {
  const clusterTargetCount = dataset.periods.length >= 9 ? 3 : 2
  const clusters = clusterPeriods(vectorInfo.zVectors, clusterTargetCount)
  const assignments = []

  clusters.forEach((cluster, clusterIndex) => {
    const rawCentroid = computeCentroid(cluster.indexes, vectorInfo.rawVectors)
    const clusterDistances = cluster.indexes.map((periodIndex) =>
      euclideanDistance(vectorInfo.zVectors[periodIndex], cluster.centroid),
    )
    const maxClusterDistance = Math.max(...clusterDistances, 0)
    const topSignals = rawCentroid
      .map((value, index) => ({
        pressureId: vectorInfo.pressureIds[index],
        label: vectorInfo.labelsById[vectorInfo.pressureIds[index]],
        value,
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 3)
      .map((item) => item.label)
    const label = clusterLabelFromSignals(
      topSignals,
      cluster.indexes.map((index) => dataset.periods[index].title),
    )

    cluster.indexes.forEach((periodIndex) => {
      const distance = euclideanDistance(vectorInfo.zVectors[periodIndex], cluster.centroid)
      const strength = round(
        maxClusterDistance === 0
          ? 1
          : 0.55 + 0.45 * (1 - distance / maxClusterDistance),
      )
      assignments.push({
        id: `${dataset.id}-cluster-${clusterIndex + 1}-${dataset.periods[periodIndex].id}`,
        periodId: dataset.periods[periodIndex].id,
        clusterId: `${dataset.id}-cluster-${clusterIndex + 1}`,
        clusterLabel: label,
        strength,
        confidence: confidenceFromStrength(strength),
        summary: `${dataset.periods[periodIndex].title} sits inside the ${label} family, with ${topSignals.slice(0, 2).map(lowerLabel).join(' and ')} most visible in the profile.`,
        topSignals,
      })
    })
  })

  return assignments
}

function arePressuresEditoriallyRelated(dataset, leftPressureId, rightPressureId) {
  const pressureById = Object.fromEntries(dataset.pressures.map((pressure) => [pressure.id, pressure]))
  const left = pressureById[leftPressureId]
  const right = pressureById[rightPressureId]

  return Boolean(
    left?.relatedPressureIds.includes(rightPressureId) ||
      right?.relatedPressureIds.includes(leftPressureId),
  )
}

function buildPressureRelationships(dataset, vectorInfo) {
  const zeroLag = []
  const lagged = []

  for (let leftIndex = 0; leftIndex < vectorInfo.pressureIds.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < vectorInfo.pressureIds.length; rightIndex += 1) {
      const leftSeries = dataset.periods.map(
        (period) => period.pressureScores[vectorInfo.pressureIds[leftIndex]] ?? 0,
      )
      const rightSeries = dataset.periods.map(
        (period) => period.pressureScores[vectorInfo.pressureIds[rightIndex]] ?? 0,
      )
      const zeroLagStrength = spearmanCorrelation(leftSeries, rightSeries)
      const pressurePairIsRelated = arePressuresEditoriallyRelated(
        dataset,
        vectorInfo.pressureIds[leftIndex],
        vectorInfo.pressureIds[rightIndex],
      )

      if (pressurePairIsRelated && Math.abs(zeroLagStrength) >= 0.65) {
        zeroLag.push({
          id: `${dataset.id}-${vectorInfo.pressureIds[leftIndex]}-${vectorInfo.pressureIds[rightIndex]}-lag0`,
          sourcePressureId: vectorInfo.pressureIds[leftIndex],
          sourceLabel: vectorInfo.labelsById[vectorInfo.pressureIds[leftIndex]],
          targetPressureId: vectorInfo.pressureIds[rightIndex],
          targetLabel: vectorInfo.labelsById[vectorInfo.pressureIds[rightIndex]],
          relationshipType: zeroLagStrength >= 0 ? 'co-movement' : 'inverse',
          lag: 0,
          strength: round(Math.abs(zeroLagStrength)),
          confidence: confidenceFromStrength(Math.abs(zeroLagStrength)),
          supportingPeriods: dataset.periods.map((period) => period.id),
          summary:
            zeroLagStrength >= 0
              ? `${vectorInfo.labelsById[vectorInfo.pressureIds[leftIndex]]} and ${lowerLabel(vectorInfo.labelsById[vectorInfo.pressureIds[rightIndex]])} repeatedly rise together here.`
              : `${vectorInfo.labelsById[vectorInfo.pressureIds[leftIndex]]} and ${lowerLabel(vectorInfo.labelsById[vectorInfo.pressureIds[rightIndex]])} repeatedly pull apart here.`,
        })
      }

      const lagStrength = spearmanCorrelation(
        leftSeries.slice(0, -1),
        rightSeries.slice(1),
      )

      if (pressurePairIsRelated && Math.abs(lagStrength) >= 0.7) {
        lagged.push({
          id: `${dataset.id}-${vectorInfo.pressureIds[leftIndex]}-${vectorInfo.pressureIds[rightIndex]}-lag1`,
          sourcePressureId: vectorInfo.pressureIds[leftIndex],
          sourceLabel: vectorInfo.labelsById[vectorInfo.pressureIds[leftIndex]],
          targetPressureId: vectorInfo.pressureIds[rightIndex],
          targetLabel: vectorInfo.labelsById[vectorInfo.pressureIds[rightIndex]],
          relationshipType: 'lead-lag',
          lag: 1,
          strength: round(Math.abs(lagStrength)),
          confidence: confidenceFromStrength(Math.abs(lagStrength)),
          supportingPeriods: dataset.periods.slice(1).map((period) => period.id),
          summary: `${vectorInfo.labelsById[vectorInfo.pressureIds[leftIndex]]} often intensifies before ${lowerLabel(vectorInfo.labelsById[vectorInfo.pressureIds[rightIndex]])} does here.`,
        })
      }
    }
  }

  return [...zeroLag, ...lagged]
    .sort((left, right) => right.strength - left.strength)
    .slice(0, 8)
}

function buildOutlierSignals(dataset, vectorInfo, clusterAssignments) {
  const clusterById = Object.fromEntries(
    clusterAssignments.map((assignment) => [assignment.periodId, assignment]),
  )
  const datasetMean = computeCentroid(
    dataset.periods.map((_, index) => index),
    vectorInfo.zVectors,
  )
  const signals = dataset.periods.map((period, periodIndex) => {
    const distanceFromMean = euclideanDistance(vectorInfo.zVectors[periodIndex], datasetMean)
    const deviations = vectorInfo.zVectors[periodIndex]
      .map((value, index) => ({
        pressureId: vectorInfo.pressureIds[index],
        label: vectorInfo.labelsById[vectorInfo.pressureIds[index]],
        value,
      }))
      .sort((left, right) => Math.abs(right.value) - Math.abs(left.value))
      .slice(0, 3)
    const hasHighStrainAndOrder =
      (period.pressureScores.institutionalLegitimacy ?? 0) >= 60 &&
      Object.entries(period.pressureScores)
        .filter(([pressureId]) =>
          ![
            'institutionalLegitimacy',
            'publicHope',
            'individualAutonomy',
          ].includes(pressureId),
        )
        .some(([, value]) => value >= 70)

    const outlierType = hasHighStrainAndOrder
      ? 'high-strain-high-order'
      : distanceFromMean >= 3
        ? 'unexpected-profile'
        : 'cluster-edge'
    const strength = round(Math.min(0.99, distanceFromMean / 4.5))

    return {
      id: `${dataset.id}-outlier-${period.id}`,
      periodId: period.id,
      outlierType,
      strength,
      confidence: confidenceFromStrength(strength),
      explanationLabel:
        outlierType === 'high-strain-high-order'
          ? 'High strain and strong order coexist'
          : outlierType === 'unexpected-profile'
            ? 'Unexpected structural profile'
            : 'Cluster-edge period',
      summary:
        outlierType === 'high-strain-high-order'
          ? `${period.title} is unusual because heavy strain coexists with unusually resilient stabilisers.`
          : `${period.title} sits outside the field’s usual pattern, shaped unusually strongly by ${deviations
              .slice(0, 2)
              .map((item) => lowerLabel(item.label))
              .join(' and ')}.`,
      topSignals: deviations.map((item) => item.label),
      clusterLabel: clusterById[period.id]?.clusterLabel,
    }
  })

  return signals
    .sort((left, right) => right.strength - left.strength)
    .slice(0, 3)
    .map(({ clusterLabel, ...signal }) => signal)
}

function buildEchoSupportSignals(dataset, vectorInfo) {
  const periodIndexById = Object.fromEntries(dataset.periods.map((period, index) => [period.id, index]))

  return dataset.echoes.map((echo) => {
    const sourceIndex = periodIndexById[echo.sourcePeriodId]
    const targetIndex = periodIndexById[echo.targetPeriodId]
    const similarityScore = round(
      cosineSimilarity(vectorInfo.zVectors[sourceIndex], vectorInfo.zVectors[targetIndex]),
    )
    const supportStatus =
      similarityScore >= 0.82 ? 'reinforced' : similarityScore >= 0.62 ? 'mixed' : 'weak'

    return {
      id: `${dataset.id}-echo-support-${echo.id}`,
      echoId: echo.id,
      sourcePeriodId: echo.sourcePeriodId,
      targetPeriodId: echo.targetPeriodId,
      supportStatus,
      similarityScore,
      confidence: confidenceFromStrength(similarityScore),
      notes:
        supportStatus === 'reinforced'
          ? 'The pressure profile strongly supports this authored echo.'
          : supportStatus === 'mixed'
            ? 'The echo is narratively plausible, but the structural similarity is mixed.'
            : 'The authored echo is weaker structurally than it appears narratively.',
    }
  })
}

function buildPromptForPeriod(period, clusterAssignments, relationships, outliers, echoSupport) {
  const outlier = outliers.find((signal) => signal.periodId === period.id)
  if (outlier && outlier.confidence !== 'experimental') {
    return {
      id: `${period.id}-prompt-outlier`,
      periodId: period.id,
      text:
        outlier.outlierType === 'high-strain-high-order'
          ? 'This era is unusual: heavy strain coexists with unexpectedly strong order.'
          : `This era is an outlier: ${outlier.explanationLabel.toLowerCase()}.`,
      insightKind: 'outlier',
      confidence: outlier.confidence,
      destinationSection: 'outliers',
      destinationTargetId: outlier.id,
    }
  }

  const cluster = clusterAssignments.find((assignment) => assignment.periodId === period.id)
  if (cluster && cluster.confidence !== 'experimental') {
    return {
      id: `${period.id}-prompt-family`,
      periodId: period.id,
      text: `This era belongs to a recurring ${cluster.clusterLabel} family.`,
      insightKind: 'family',
      confidence: cluster.confidence,
      destinationSection: 'families',
      destinationTargetId: cluster.id,
    }
  }

  const topRelationship = relationships.find(
    (relationship) =>
      period.pressureScores[relationship.sourcePressureId] >= 55 &&
      period.pressureScores[relationship.targetPressureId] >= 55 &&
      relationship.confidence !== 'experimental',
  )
  if (topRelationship) {
    return {
      id: `${period.id}-prompt-relationship`,
      periodId: period.id,
      text:
        topRelationship.relationshipType === 'lead-lag'
          ? `${topRelationship.sourceLabel} often intensifies before ${lowerLabel(topRelationship.targetLabel)} does here.`
          : topRelationship.relationshipType === 'inverse'
            ? `${topRelationship.sourceLabel} and ${lowerLabel(topRelationship.targetLabel)} repeatedly pull apart here.`
            : `${topRelationship.sourceLabel} and ${lowerLabel(topRelationship.targetLabel)} repeatedly rise together here.`,
      insightKind: 'relationship',
      confidence: topRelationship.confidence,
      destinationSection: 'relationships',
      destinationTargetId: topRelationship.id,
    }
  }

  const supportedEcho = echoSupport.find(
    (signal) => signal.sourcePeriodId === period.id && signal.supportStatus === 'reinforced',
  )
  if (supportedEcho) {
    return {
      id: `${period.id}-prompt-echo`,
      periodId: period.id,
      text: 'One of this era’s echoes is strongly reinforced by its pressure profile.',
      insightKind: 'echo',
      confidence: supportedEcho.confidence,
      destinationSection: 'echoes',
      destinationTargetId: supportedEcho.id,
    }
  }

  return null
}

function buildDatasetInsightPack(dataset) {
  const vectorInfo = buildPressureVectors(dataset)
  const clusterAssignments = buildClusterAssignments(dataset, vectorInfo)
  const pressureRelationships = buildPressureRelationships(dataset, vectorInfo)
  const outliers = buildOutlierSignals(dataset, vectorInfo, clusterAssignments)
  const echoSupport = buildEchoSupportSignals(dataset, vectorInfo)
  const prompts = dataset.visibility === 'public'
    ? dataset.periods
        .map((period) =>
          buildPromptForPeriod(period, clusterAssignments, pressureRelationships, outliers, echoSupport),
        )
        .filter(Boolean)
    : []

  return {
    datasetId: dataset.id,
    datasetLabel: dataset.label,
    publicStatus: dataset.visibility,
    generation: {
      ...GENERATION_META,
      generatedAt: new Date().toISOString(),
    },
    periodClusters: clusterAssignments,
    pressureRelationships,
    outliers,
    echoSupport,
    prompts,
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function validateDatasetInsightPack(dataset, pack) {
  const periodIds = new Set(dataset.periods.map((period) => period.id))
  const pressureIds = new Set(dataset.pressures.map((pressure) => pressure.id))
  const echoIds = new Set(dataset.echoes.map((echo) => echo.id))

  assert(
    pack.periodClusters.length === dataset.periods.length,
    `Insight pack ${pack.datasetId} does not assign every period to a cluster.`,
  )

  for (const assignment of pack.periodClusters) {
    assert(
      periodIds.has(assignment.periodId),
      `Insight pack ${pack.datasetId} references unknown period ${assignment.periodId} in periodClusters.`,
    )
  }

  for (const relationship of pack.pressureRelationships) {
    assert(
      pressureIds.has(relationship.sourcePressureId),
      `Insight pack ${pack.datasetId} references unknown source pressure ${relationship.sourcePressureId}.`,
    )
    assert(
      pressureIds.has(relationship.targetPressureId),
      `Insight pack ${pack.datasetId} references unknown target pressure ${relationship.targetPressureId}.`,
    )
    assert(
      relationship.lag === 0 || relationship.lag === 1,
      `Insight pack ${pack.datasetId} contains unsupported lag ${relationship.lag}.`,
    )
    for (const periodId of relationship.supportingPeriods) {
      assert(
        periodIds.has(periodId),
        `Insight pack ${pack.datasetId} references unknown supporting period ${periodId}.`,
      )
    }
  }

  for (const outlier of pack.outliers) {
    assert(
      periodIds.has(outlier.periodId),
      `Insight pack ${pack.datasetId} references unknown outlier period ${outlier.periodId}.`,
    )
  }

  for (const echoSignal of pack.echoSupport) {
    assert(
      echoIds.has(echoSignal.echoId),
      `Insight pack ${pack.datasetId} references unknown echo ${echoSignal.echoId}.`,
    )
    assert(
      periodIds.has(echoSignal.sourcePeriodId),
      `Insight pack ${pack.datasetId} references unknown echo source period ${echoSignal.sourcePeriodId}.`,
    )
    assert(
      periodIds.has(echoSignal.targetPeriodId),
      `Insight pack ${pack.datasetId} references unknown echo target period ${echoSignal.targetPeriodId}.`,
    )
  }

  for (const prompt of pack.prompts) {
    assert(
      periodIds.has(prompt.periodId),
      `Insight pack ${pack.datasetId} references unknown prompt period ${prompt.periodId}.`,
    )
  }
}

function buildCrossDatasetAffinities(datasetPacks) {
  const affinities = []

  for (let leftDatasetIndex = 0; leftDatasetIndex < datasetPacks.length; leftDatasetIndex += 1) {
    for (let rightDatasetIndex = leftDatasetIndex + 1; rightDatasetIndex < datasetPacks.length; rightDatasetIndex += 1) {
      const leftDataset = datasetPacks[leftDatasetIndex]
      const rightDataset = datasetPacks[rightDatasetIndex]
      const leftVectorInfo = buildPressureVectors(leftDataset)
      const rightVectorInfo = buildPressureVectors(rightDataset)

      leftDataset.periods.forEach((leftPeriod, leftPeriodIndex) => {
        rightDataset.periods.forEach((rightPeriod, rightPeriodIndex) => {
          const similarityScore = round(
            cosineSimilarity(
              leftVectorInfo.zVectors[leftPeriodIndex],
              rightVectorInfo.zVectors[rightPeriodIndex],
            ),
          )

          if (similarityScore < 0.82) {
            return
          }

          const sharedTopSignals = leftVectorInfo.zVectors[leftPeriodIndex]
            .map((value, index) => ({
              label: leftVectorInfo.labelsById[leftVectorInfo.pressureIds[index]],
              combined:
                Math.abs(value) + Math.abs(rightVectorInfo.zVectors[rightPeriodIndex][index]),
            }))
            .sort((left, right) => right.combined - left.combined)
            .slice(0, 3)
            .map((item) => item.label)

          affinities.push({
            id: `${leftDataset.id}-${leftPeriod.id}-${rightDataset.id}-${rightPeriod.id}`,
            sourceDatasetId: leftDataset.id,
            sourcePeriodId: leftPeriod.id,
            targetDatasetId: rightDataset.id,
            targetPeriodId: rightPeriod.id,
            similarityScore,
            sharedTopSignals,
            confidence: confidenceFromStrength(similarityScore),
            summary: `${leftPeriod.title} in ${leftDataset.label} forms a structural cousin pair with ${rightPeriod.title} in ${rightDataset.label}.`,
          })
        })
      })
    }
  }

  return affinities.sort((left, right) => right.similarityScore - left.similarityScore).slice(0, 18)
}

function validateCrossDatasetPack(datasets, pack) {
  const periodIdsByDatasetId = Object.fromEntries(
    datasets.map((dataset) => [dataset.id, new Set(dataset.periods.map((period) => period.id))]),
  )

  for (const affinity of pack.affinities) {
    assert(
      periodIdsByDatasetId[affinity.sourceDatasetId]?.has(affinity.sourcePeriodId),
      `Cross-dataset pack references unknown source period ${affinity.sourcePeriodId} for ${affinity.sourceDatasetId}.`,
    )
    assert(
      periodIdsByDatasetId[affinity.targetDatasetId]?.has(affinity.targetPeriodId),
      `Cross-dataset pack references unknown target period ${affinity.targetPeriodId} for ${affinity.targetDatasetId}.`,
    )
  }
}

async function main() {
  await mkdir(derivedRoot, { recursive: true })
  const datasets = await Promise.all(DATASET_CONFIGS.map(loadDataset))
  const insightPacks = datasets.map(buildDatasetInsightPack)

  insightPacks.forEach((pack, index) => {
    validateDatasetInsightPack(datasets[index], pack)
  })

  for (const pack of insightPacks) {
    await writeFile(
      path.join(derivedRoot, `${pack.datasetId}.json`),
      `${JSON.stringify(pack, null, 2)}\n`,
      'utf8',
    )
  }

  const crossDatasetPack = {
    scope: 'internal',
    generation: {
      ...GENERATION_META,
      generatedAt: new Date().toISOString(),
    },
    affinities: buildCrossDatasetAffinities(datasets),
  }

  validateCrossDatasetPack(datasets, crossDatasetPack)

  await writeFile(
    path.join(derivedRoot, 'cross-dataset.json'),
    `${JSON.stringify(crossDatasetPack, null, 2)}\n`,
    'utf8',
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
