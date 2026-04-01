import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')
const dataDir = path.join(repoRoot, 'data')
const derivedDir = path.join(dataDir, 'derived')
const publicCopyPath = path.join(dataDir, 'public-copy.json')

const errors = []
const warnings = []
const publicCopy = JSON.parse(await readFile(publicCopyPath, 'utf8'))
const bannedPublicTerms = publicCopy.bannedPublicTerms ?? []
const publicUiFiles = [
  'src/App.tsx',
  'src/components/DetailPanel.tsx',
  'src/components/ComparePanel.tsx',
  'src/components/ForceExplorer.tsx',
  'src/components/InsightsLabPage.tsx',
  'src/components/LoomCanvas.tsx',
  'src/components/InMotionRacePanel.tsx',
]

function fail(message) {
  errors.push(message)
}

function warn(message) {
  warnings.push(message)
}

async function readJson(relativePath) {
  const filePath = path.join(repoRoot, relativePath)
  const file = await readFile(filePath, 'utf8')
  return JSON.parse(file)
}

async function fileExists(relativePath) {
  try {
    await access(path.join(repoRoot, relativePath))
    return true
  } catch {
    return false
  }
}

function assertUniqueIds(items, context) {
  const seen = new Set()

  for (const item of items) {
    if (seen.has(item.id)) {
      fail(`${context} contains duplicate id "${item.id}".`)
      continue
    }

    seen.add(item.id)
  }
}

function assertKnownIds(ids, knownIds, context) {
  for (const id of ids ?? []) {
    if (!knownIds.has(id)) {
      fail(`${context} references unknown id "${id}".`)
    }
  }
}

function bannedTermsInText(text) {
  if (!text || typeof text !== 'string') {
    return []
  }

  const normalized = text.toLowerCase()

  return bannedPublicTerms.filter((term) =>
    new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalized),
  )
}

function assertNoBannedPublicTerms(text, context) {
  for (const term of bannedTermsInText(text)) {
    fail(`${context} contains banned public term "${term}".`)
  }
}

function scanPublicFields(value, context) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanPublicFields(item, `${context}[${index}]`))
    return
  }

  if (!value || typeof value !== 'object') {
    return
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedContext = `${context}.${key}`

    if (typeof nestedValue === 'string' && key.toLowerCase().startsWith('public')) {
      assertNoBannedPublicTerms(nestedValue, nestedContext)
      continue
    }

    scanPublicFields(nestedValue, nestedContext)
  }
}

function extractStringLiterals(source) {
  const matches = []
  const regex = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g

  for (const match of source.matchAll(regex)) {
    const value = match[2]

    if (!value) {
      continue
    }

    if (match[1] === '`' && value.includes('${')) {
      continue
    }

    if (/^[\w./:-]+$/.test(value)) {
      continue
    }

    if (!/[A-Za-z]/.test(value)) {
      continue
    }

    matches.push(value)
  }

  return matches
}

async function validatePublicUiLiterals() {
  for (const relativePath of publicUiFiles) {
    const source = await readFile(path.join(repoRoot, relativePath), 'utf8')
    const literals = extractStringLiterals(source)

    for (const literal of literals) {
      assertNoBannedPublicTerms(literal, `${relativePath} string literal "${literal}"`)
    }
  }
}

function validatePublicCopyConfig() {
  scanPublicFields(publicCopy, 'data/public-copy.json')
}

function buildDatasetFilePath(dataPath, fileName) {
  return dataPath === '.'
    ? path.join('data', `${fileName}.json`)
    : path.join('data', dataPath, `${fileName}.json`)
}

async function loadDatasetPack(entry) {
  const fileNames = ['meta', 'periods', 'events', 'pressures', 'echoes', 'snapshots']

  for (const fileName of fileNames) {
    const relativePath = buildDatasetFilePath(entry.dataPath, fileName)

    if (!(await fileExists(relativePath))) {
      fail(`Dataset ${entry.id} is missing file ${relativePath}.`)
      return null
    }
  }

  const [meta, periods, events, pressures, echoes, snapshots] = await Promise.all(
    fileNames.map((fileName) => readJson(buildDatasetFilePath(entry.dataPath, fileName))),
  )

  return { meta, periods, events, pressures, echoes, snapshots }
}

function validateDatasetRegistry(datasets, themes, geographies) {
  assertUniqueIds(datasets, 'data/datasets.json')

  const dataPaths = new Set()
  const themeIds = new Set(themes.map((theme) => theme.id))
  const geographyIds = new Set(geographies.map((geography) => geography.id))

  for (const entry of datasets) {
    if (dataPaths.has(entry.dataPath)) {
      fail(`data/datasets.json reuses dataPath "${entry.dataPath}".`)
    }

    dataPaths.add(entry.dataPath)
    assertKnownIds(entry.supportedThemeIds, themeIds, `${entry.id} supportedThemeIds`)
    assertKnownIds(entry.supportedGeographyIds, geographyIds, `${entry.id} supportedGeographyIds`)
  }
}

function validateDatasetPack(entry, pack, themeIds, geographyIds) {
  const { meta, periods, events, pressures, echoes, snapshots } = pack

  assertUniqueIds(periods, `${entry.id} periods`)
  assertUniqueIds(events, `${entry.id} events`)
  assertUniqueIds(pressures, `${entry.id} pressures`)
  assertUniqueIds(echoes, `${entry.id} echoes`)
  assertUniqueIds(snapshots, `${entry.id} snapshots`)

  if (meta.scope !== entry.scope) {
    fail(`${entry.id} meta scope "${meta.scope}" does not match registry scope "${entry.scope}".`)
  }

  if (meta.startYear !== entry.startYear || meta.endYear !== entry.endYear) {
    fail(
      `${entry.id} meta years ${meta.startYear}-${meta.endYear} do not match registry years ${entry.startYear}-${entry.endYear}.`,
    )
  }

  const periodIds = new Set(periods.map((period) => period.id))
  const eventIds = new Set(events.map((event) => event.id))
  const echoIds = new Set(echoes.map((echo) => echo.id))
  const snapshotIds = new Set(snapshots.map((snapshot) => snapshot.id))
  const pressureIds = new Set(pressures.map((pressure) => pressure.id))
  const pressureSignalKeys = new Set(
    pressures.flatMap((pressure) => [pressure.id, pressure.label]),
  )

  const sortedPeriods = [...periods].sort((left, right) => left.startYear - right.startYear)

  if (sortedPeriods.length === 0) {
    fail(`${entry.id} has no periods.`)
    return { periodIds, eventIds, echoIds, snapshotIds, pressureIds }
  }

  if (sortedPeriods[0].startYear !== entry.startYear) {
    fail(`${entry.id} first period does not start at ${entry.startYear}.`)
  }

  if (sortedPeriods[sortedPeriods.length - 1].endYear !== entry.endYear) {
    fail(`${entry.id} last period does not end at ${entry.endYear}.`)
  }

  for (let index = 1; index < sortedPeriods.length; index += 1) {
    const previous = sortedPeriods[index - 1]
    const current = sortedPeriods[index]

    if (
      current.startYear !== previous.endYear &&
      current.startYear !== previous.endYear + 1
    ) {
      fail(
        `${entry.id} periods ${previous.id} and ${current.id} are not contiguous (${previous.endYear} to ${current.startYear}).`,
      )
    }
  }

  for (const period of periods) {
    if (period.startYear > period.endYear) {
      fail(`${entry.id} period ${period.id} has startYear after endYear.`)
    }

    assertKnownIds(period.eventIds, eventIds, `${entry.id} period ${period.id} eventIds`)
    assertKnownIds(period.snapshotIds, snapshotIds, `${entry.id} period ${period.id} snapshotIds`)
    assertKnownIds(period.echoIds, echoIds, `${entry.id} period ${period.id} echoIds`)
    assertKnownIds(period.themeIds, themeIds, `${entry.id} period ${period.id} themeIds`)
    assertKnownIds(period.geographyIds, geographyIds, `${entry.id} period ${period.id} geographyIds`)
    if (entry.insightVisibility === 'public' && entry.status !== 'process-rehearsal') {
      if (!period.publicSummary) {
        fail(`${entry.id} period ${period.id} is missing publicSummary.`)
      }

      if (!period.publicPressureSummary) {
        fail(`${entry.id} period ${period.id} is missing publicPressureSummary.`)
      }
    }

    scanPublicFields(period, `${entry.id} period ${period.id}`)

    const scoredPressureIds = Object.keys(period.pressureScores ?? {})

    if (scoredPressureIds.length !== pressureIds.size) {
      fail(
        `${entry.id} period ${period.id} has ${scoredPressureIds.length} pressure scores but the dataset defines ${pressureIds.size} pressures.`,
      )
    }

    assertKnownIds(scoredPressureIds, pressureIds, `${entry.id} period ${period.id} pressureScores`)
  }

  for (const event of events) {
    if (event.startYear > event.endYear) {
      fail(`${entry.id} event ${event.id} has startYear after endYear.`)
    }

    assertKnownIds(event.periodIds, periodIds, `${entry.id} event ${event.id} periodIds`)
    assertKnownIds(event.pressureDrivers, pressureIds, `${entry.id} event ${event.id} pressureDrivers`)
    assertKnownIds(event.themeIds, themeIds, `${entry.id} event ${event.id} themeIds`)
    assertKnownIds(event.geographyIds, geographyIds, `${entry.id} event ${event.id} geographyIds`)

    const linkedPeriods = event.periodIds
      .map((periodId) => periods.find((period) => period.id === periodId))
      .filter(Boolean)

    if (!linkedPeriods.length) {
      fail(`${entry.id} event ${event.id} has no linked periods.`)
      continue
    }

    const earliestStart = Math.min(...linkedPeriods.map((period) => period.startYear))
    const latestEnd = Math.max(...linkedPeriods.map((period) => period.endYear))

    if (event.startYear < earliestStart || event.endYear > latestEnd) {
      fail(
        `${entry.id} event ${event.id} falls outside linked period span ${earliestStart}-${latestEnd}.`,
      )
    }
  }

  for (const snapshot of snapshots) {
    if (!periodIds.has(snapshot.periodId)) {
      fail(`${entry.id} snapshot ${snapshot.id} references unknown period ${snapshot.periodId}.`)
    }

    scanPublicFields(snapshot, `${entry.id} snapshot ${snapshot.id}`)
  }

  for (const echo of echoes) {
    if (!periodIds.has(echo.sourcePeriodId)) {
      fail(`${entry.id} echo ${echo.id} references unknown source period ${echo.sourcePeriodId}.`)
    }

    if (!periodIds.has(echo.targetPeriodId)) {
      fail(`${entry.id} echo ${echo.id} references unknown target period ${echo.targetPeriodId}.`)
    }

    assertKnownIds(echo.dimensions, pressureIds, `${entry.id} echo ${echo.id} dimensions`)
  }

  for (const pressure of pressures) {
    assertKnownIds(pressure.peakPeriods, periodIds, `${entry.id} pressure ${pressure.id} peakPeriods`)
    assertKnownIds(
      pressure.relatedPressureIds,
      pressureIds,
      `${entry.id} pressure ${pressure.id} relatedPressureIds`,
    )

    const valuePeriodIds = Object.keys(pressure.valuesByPeriod ?? {})

    if (valuePeriodIds.length !== periodIds.size) {
      fail(
        `${entry.id} pressure ${pressure.id} has ${valuePeriodIds.length} values but the dataset has ${periodIds.size} periods.`,
      )
    }

    assertKnownIds(valuePeriodIds, periodIds, `${entry.id} pressure ${pressure.id} valuesByPeriod`)

    if (!publicCopy.pressureCopy[pressure.id]) {
      fail(`${entry.id} pressure ${pressure.id} is missing public copy in data/public-copy.json.`)
    }
  }

  return {
    periodIds,
    eventIds,
    echoIds,
    snapshotIds,
    pressureIds,
    pressureSignalKeys,
  }
}

async function validateValidationRegistry(registry, datasetContexts, allEventIds, allEchoIds) {
  for (const candidate of registry.draftCandidates?.events ?? []) {
    if (!allEventIds.has(candidate.id)) {
      fail(`validation-registry event draft candidate ${candidate.id} does not exist.`)
    }
  }

  for (const candidate of registry.draftCandidates?.echoes ?? []) {
    if (!allEchoIds.has(candidate.id)) {
      fail(`validation-registry echo draft candidate ${candidate.id} does not exist.`)
    }
  }

  for (const [datasetId, seeding] of Object.entries(registry.datasetSeeding ?? {})) {
    if (!datasetContexts[datasetId]) {
      fail(`validation-registry datasetSeeding references unknown dataset ${datasetId}.`)
      continue
    }

    for (const planningArtifact of seeding.planningArtifacts ?? []) {
      if (!(await fileExists(planningArtifact))) {
        fail(`validation-registry planning artifact missing: ${planningArtifact}.`)
      }
    }

    for (const seedFile of seeding.seedFiles ?? []) {
      if (!(await fileExists(seedFile))) {
        fail(`validation-registry seed file missing: ${seedFile}.`)
      }
    }
  }

  for (const datasetId of Object.keys(registry.solidReadiness ?? {})) {
    if (!datasetContexts[datasetId]) {
      fail(`validation-registry solidReadiness references unknown dataset ${datasetId}.`)
    }
  }
}

function validateDatasetInsightPack(fileName, pack, datasetContexts) {
  const datasetContext = datasetContexts[pack.datasetId]

  if (!datasetContext) {
    fail(`Derived pack ${fileName} references unknown dataset ${pack.datasetId}.`)
    return
  }

  if (fileName !== `${pack.datasetId}.json`) {
    fail(`Derived pack ${fileName} should match dataset id ${pack.datasetId}.`)
  }

  const clusterIds = new Set(pack.periodClusters.map((cluster) => cluster.id))
  const relationshipIds = new Set(pack.pressureRelationships.map((relationship) => relationship.id))
  const outlierIds = new Set(pack.outliers.map((outlier) => outlier.id))
  const echoSupportIds = new Set(pack.echoSupport.map((echoSupport) => echoSupport.id))

  for (const cluster of pack.periodClusters) {
    if (!datasetContext.periodIds.has(cluster.periodId)) {
      fail(`Derived pack ${fileName} cluster ${cluster.id} references unknown period ${cluster.periodId}.`)
    }

    assertKnownIds(
      cluster.topSignals,
      datasetContext.pressureSignalKeys,
      `Derived pack ${fileName} cluster ${cluster.id} topSignals`,
    )

    scanPublicFields(cluster, `Derived pack ${fileName} cluster ${cluster.id}`)
  }

  for (const relationship of pack.pressureRelationships) {
    assertKnownIds(
      [relationship.sourcePressureId, relationship.targetPressureId],
      datasetContext.pressureIds,
      `Derived pack ${fileName} relationship ${relationship.id}`,
    )
    assertKnownIds(
      relationship.supportingPeriods,
      datasetContext.periodIds,
      `Derived pack ${fileName} relationship ${relationship.id} supportingPeriods`,
    )

    if (relationship.lag > 1) {
      fail(`Derived pack ${fileName} relationship ${relationship.id} uses lag ${relationship.lag}.`)
    }

    scanPublicFields(relationship, `Derived pack ${fileName} relationship ${relationship.id}`)
  }

  for (const outlier of pack.outliers) {
    if (!datasetContext.periodIds.has(outlier.periodId)) {
      fail(`Derived pack ${fileName} outlier ${outlier.id} references unknown period ${outlier.periodId}.`)
    }

    assertKnownIds(
      outlier.topSignals,
      datasetContext.pressureSignalKeys,
      `Derived pack ${fileName} outlier ${outlier.id} topSignals`,
    )

    scanPublicFields(outlier, `Derived pack ${fileName} outlier ${outlier.id}`)
  }

  for (const echoSupport of pack.echoSupport) {
    if (!datasetContext.echoIds.has(echoSupport.echoId)) {
      fail(`Derived pack ${fileName} echo support ${echoSupport.id} references unknown echo ${echoSupport.echoId}.`)
    }

    assertKnownIds(
      [echoSupport.sourcePeriodId, echoSupport.targetPeriodId],
      datasetContext.periodIds,
      `Derived pack ${fileName} echo support ${echoSupport.id} periods`,
    )

    scanPublicFields(echoSupport, `Derived pack ${fileName} echo support ${echoSupport.id}`)
  }

  for (const prompt of pack.prompts) {
    if (!datasetContext.periodIds.has(prompt.periodId)) {
      fail(`Derived pack ${fileName} prompt ${prompt.id} references unknown period ${prompt.periodId}.`)
    }

    if (prompt.destinationSection === 'families' && !clusterIds.has(prompt.destinationTargetId)) {
      fail(`Derived pack ${fileName} prompt ${prompt.id} targets missing family ${prompt.destinationTargetId}.`)
    }

    if (
      prompt.destinationSection === 'relationships' &&
      !relationshipIds.has(prompt.destinationTargetId)
    ) {
      fail(
        `Derived pack ${fileName} prompt ${prompt.id} targets missing relationship ${prompt.destinationTargetId}.`,
      )
    }

    if (prompt.destinationSection === 'outliers' && !outlierIds.has(prompt.destinationTargetId)) {
      fail(`Derived pack ${fileName} prompt ${prompt.id} targets missing outlier ${prompt.destinationTargetId}.`)
    }

    if (prompt.destinationSection === 'echoes' && !echoSupportIds.has(prompt.destinationTargetId)) {
      fail(`Derived pack ${fileName} prompt ${prompt.id} targets missing echo support ${prompt.destinationTargetId}.`)
    }

    scanPublicFields(prompt, `Derived pack ${fileName} prompt ${prompt.id}`)
  }
}

function validateCrossDatasetInsightPack(pack, datasetContexts) {
  const validateAffinity = (affinity, context) => {
    const sourceDataset = datasetContexts[affinity.sourceDatasetId]
    const targetDataset = datasetContexts[affinity.targetDatasetId]

    if (!sourceDataset) {
      fail(`${context} references unknown source dataset ${affinity.sourceDatasetId}.`)
      return
    }

    if (!targetDataset) {
      fail(`${context} references unknown target dataset ${affinity.targetDatasetId}.`)
      return
    }

    if (!sourceDataset.periodIds.has(affinity.sourcePeriodId)) {
      fail(`${context} references unknown source period ${affinity.sourcePeriodId}.`)
    }

    if (!targetDataset.periodIds.has(affinity.targetPeriodId)) {
      fail(`${context} references unknown target period ${affinity.targetPeriodId}.`)
    }
  }

  for (const affinity of pack.affinities ?? []) {
    validateAffinity(affinity, `cross-dataset affinity ${affinity.id}`)
  }

  for (const cousin of pack.publicCousins ?? []) {
    validateAffinity(cousin, `cross-dataset public cousin ${cousin.id}`)
    scanPublicFields(cousin, `cross-dataset public cousin ${cousin.id}`)
  }
}

async function main() {
  validatePublicCopyConfig()
  await validatePublicUiLiterals()
  const datasets = await readJson('data/datasets.json')
  const themes = await readJson('data/themes.json')
  const geographies = await readJson('data/geographies.json')
  const validationRegistry = await readJson('data/validation-registry.json')

  validateDatasetRegistry(datasets, themes, geographies)

  const themeIds = new Set(themes.map((theme) => theme.id))
  const geographyIds = new Set(geographies.map((geography) => geography.id))
  const datasetContexts = {}
  const allEventIds = new Set()
  const allEchoIds = new Set()

  for (const entry of datasets) {
    const pack = await loadDatasetPack(entry)

    if (!pack) {
      continue
    }

    const context = validateDatasetPack(entry, pack, themeIds, geographyIds)
    datasetContexts[entry.id] = context

    for (const eventId of context.eventIds) {
      allEventIds.add(eventId)
    }

    for (const echoId of context.echoIds) {
      allEchoIds.add(echoId)
    }
  }

  await validateValidationRegistry(
    validationRegistry,
    datasetContexts,
    allEventIds,
    allEchoIds,
  )

  const derivedFiles = await readdir(derivedDir)
  const datasetDerivedFiles = derivedFiles.filter(
    (fileName) => fileName.endsWith('.json') && fileName !== 'cross-dataset.json',
  )

  for (const fileName of datasetDerivedFiles) {
    const pack = await readJson(path.join('data', 'derived', fileName))
    validateDatasetInsightPack(fileName, pack, datasetContexts)
  }

  for (const entry of datasets) {
    if (!datasetDerivedFiles.includes(`${entry.id}.json`)) {
      warn(`Dataset ${entry.id} has no derived pack in data/derived yet.`)
    }
  }

  const crossDatasetPack = await readJson(path.join('data', 'derived', 'cross-dataset.json'))
  validateCrossDatasetInsightPack(crossDatasetPack, datasetContexts)

  if (warnings.length) {
    console.warn('Warnings:')
    for (const message of warnings) {
      console.warn(`- ${message}`)
    }
    console.warn('')
  }

  if (errors.length) {
    console.error('Dataset validation failed:')
    for (const message of errors) {
      console.error(`- ${message}`)
    }
    process.exitCode = 1
    return
  }

  console.log(
    `Validated ${datasets.length} registered datasets, ${datasetDerivedFiles.length} dataset insight packs, and cross-dataset insights.`,
  )
}

main().catch((error) => {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
})
