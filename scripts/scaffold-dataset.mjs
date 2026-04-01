import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')

function parseArgs(argv) {
  const args = {}
  const positional = []

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (!token.startsWith('--')) {
      positional.push(token)
      continue
    }

    const key = token.slice(2)
    const next = argv[index + 1]

    if (!next || next.startsWith('--')) {
      args[key] = 'true'
      continue
    }

    args[key] = next
    index += 1
  }

  if (!args.id && positional.length >= 8) {
    const [id, label, start, end, lens, lensCount, folder, shortName] = positional
    args.id = id
    args.label = label
    args.scope = label.split(',')[0]?.trim()
    args.start = start
    args.end = end
    args.lens = lens
    args['lens-count'] = lensCount
    args.folder = folder
    args.short = shortName
  }

  return args
}

function assertRequired(args, key) {
  const value = args[key]

  if (!value) {
    throw new Error(`Missing required argument --${key}.`)
  }

  return value
}

function toKebabCase(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function writeText(filePath, value) {
  await writeFile(filePath, `${value.trim()}\n`, 'utf8')
}

async function loadCanonicalPressures() {
  const filePath = path.join(repoRoot, 'data', 'pressures.json')
  const file = await readFile(filePath, 'utf8')
  const pressures = JSON.parse(file)

  return pressures.map((pressure) => ({
    id: pressure.id,
    label: pressure.label,
    description: pressure.description,
    category: pressure.category,
    polarity: pressure.polarity,
    valuesByPeriod: {},
    peakPeriods: [],
    releasePatterns: [],
    relatedPressureIds: pressure.relatedPressureIds,
  }))
}

function buildCharterDoc({ label, scope, startYear, endYear, lensId }) {
  return `
# ${label} Dataset Charter

## Purpose

Define why ${scope} should exist as a History Loom field and what it should teach that the live datasets do not.

## Scope

- public label: \`${label}\`
- field scope: \`${scope}\`
- time span: \`${startYear}–${endYear}\`
- first planned lens id: \`${lensId}\`

## Why this field matters

- [ ] explain why this field adds new structural value
- [ ] explain what comparisons it should later unlock
- [ ] explain why the chosen boundary is historically honest

## First-release maturity target

- [ ] seed
- [ ] usable draft
- [ ] other:

## Rollout scope

This charter is a \`single-dataset pilot\` planning artefact and must later promote into the shared dataset production flow.
`
}

function buildPeriodizationDoc({ label, lensId, startYear, endYear }) {
  return `
# ${label} Periodization Proposal

## Proposed first lens

- lens id: \`${lensId}\`
- start year: \`${startYear}\`
- end year: \`${endYear}\`

## Questions to settle

- [ ] what are the real legitimacy or regime breaks?
- [ ] where should periods lengthen or shorten?
- [ ] how many periods are honest without becoming noisy?

## Decision log

- [ ] record the final periods here before writing runtime JSON
`
}

function buildSeedPlanDoc({ label, folder, shortName }) {
  return `
# ${label} Seeding Plan

## Data pack

- folder: \`data/${folder}\`
- files:
  - \`meta.json\`
  - \`periods.json\`
  - \`events.json\`
  - \`pressures.json\`
  - \`echoes.json\`
  - \`snapshots.json\`

## Minimum seed standard

- [ ] each period has at least 2 anchor events
- [ ] each period has at least 1 snapshot
- [ ] each period has at least 1 echo
- [ ] all canonical pressures have values
- [ ] summaries and lived material are plain-language enough for non-specialists

## Required planning companions

- \`docs/${shortName}-dataset-charter.md\`
- \`docs/${shortName}-periodization-proposal.md\`
- \`docs/${shortName}-initial-seed-candidates.md\`
- \`docs/${shortName}-pressure-grounding-map.md\`
- \`docs/${shortName}-snapshot-strategy.md\`

## Commands

\`\`\`powershell
npm run validate:data
npm run generate:insights
\`\`\`
`
}

function buildCandidateDoc(label) {
  return `
# ${label} Initial Seed Candidates

## Candidate period anchors

- [ ] list likely period boundaries
- [ ] list likely anchor events for each period
- [ ] note any obvious weak periods early
`
}

function buildPressureGroundingDoc(label) {
  return `
# ${label} Pressure Grounding Map

Use this file to decide how each shared pressure will be grounded in this field before runtime scoring is treated as trustworthy.

## Pressures to ground

- inequality
- eliteCompetition
- institutionalLegitimacy
- socialCohesion
- technologicalDisruption
- informationAcceleration
- ecologicalStrain
- militarization
- moralCertainty
- publicHope
- individualAutonomy
- economicPrecarity
`
}

function buildSnapshotStrategyDoc(label) {
  return `
# ${label} Snapshot Strategy

## Goal

Define how this field will feel inhabited, not just structurally described.

## Questions

- [ ] what everyday positions should speak in this field?
- [ ] where do snapshots need stronger material texture?
- [ ] where will lived voice risk sounding too analytic?
`
}

function buildPriorityQueue(label) {
  return {
    phase: 'dataset-seeding',
    next: [
      {
        id: 'seed-01',
        label: `Define the first honest lens for ${label}`,
        priority: 'high',
      },
      {
        id: 'seed-02',
        label: `Collate candidate anchor events for ${label}`,
        priority: 'high',
      },
      {
        id: 'seed-03',
        label: `Ground the shared pressure model for ${label}`,
        priority: 'high',
      },
      {
        id: 'seed-04',
        label: `Write the first runtime seed pack for ${label}`,
        priority: 'high',
      },
      {
        id: 'seed-05',
        label: `Run validation review before wiring ${label} into the live registry`,
        priority: 'high',
      },
    ],
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const id = assertRequired(args, 'id')
  const label = assertRequired(args, 'label')
  const scope = assertRequired(args, 'scope')
  const startYear = Number(assertRequired(args, 'start'))
  const endYear = Number(assertRequired(args, 'end'))
  const lensId = assertRequired(args, 'lens')
  const lensCount = Number(assertRequired(args, 'lens-count'))
  const initialLensYears = Number(args['lens-years'] ?? '0')
  const folder = args.folder ?? toKebabCase(scope)
  const shortName = args.short ?? folder

  if (Number.isNaN(startYear) || Number.isNaN(endYear)) {
    throw new Error('Arguments --start and --end must be numbers.')
  }

  if (Number.isNaN(lensCount) || lensCount <= 0) {
    throw new Error('Argument --lens-count must be a positive number.')
  }

  if (Number.isNaN(initialLensYears) || initialLensYears < 0) {
    throw new Error('Argument --lens-years must be zero or a positive number.')
  }

  const datasetDir = path.join(repoRoot, 'data', folder)
  const docsDir = path.join(repoRoot, 'docs')
  const pressures = await loadCanonicalPressures()

  await mkdir(datasetDir, { recursive: false })

  await writeJson(path.join(datasetDir, 'meta.json'), {
    project: 'The History Loom',
    dataset: `${scope} Seed Dataset`,
    scope,
    startYear,
    endYear,
    initialLensYears,
    lensCount,
    note:
      initialLensYears > 0
        ? `The first ${scope} lens uses ${initialLensYears}-year periods as a design lens, not a claim that the field naturally divides that way.`
        : `The first ${scope} lens uses a curated multi-era civic lens. The zero value is a compatibility placeholder until the lensing layer carries non-equal spans directly.`,
  })
  await writeJson(path.join(datasetDir, 'periods.json'), [])
  await writeJson(path.join(datasetDir, 'events.json'), [])
  await writeJson(path.join(datasetDir, 'pressures.json'), pressures)
  await writeJson(path.join(datasetDir, 'echoes.json'), [])
  await writeJson(path.join(datasetDir, 'snapshots.json'), [])

  await writeText(
    path.join(docsDir, `${shortName}-dataset-charter.md`),
    buildCharterDoc({ label, scope, startYear, endYear, lensId }),
  )
  await writeText(
    path.join(docsDir, `${shortName}-periodization-proposal.md`),
    buildPeriodizationDoc({ label, lensId, startYear, endYear }),
  )
  await writeText(
    path.join(docsDir, `${shortName}-seeding-plan.md`),
    buildSeedPlanDoc({ label, folder, shortName }),
  )
  await writeText(
    path.join(docsDir, `${shortName}-initial-seed-candidates.md`),
    buildCandidateDoc(label),
  )
  await writeText(
    path.join(docsDir, `${shortName}-pressure-grounding-map.md`),
    buildPressureGroundingDoc(label),
  )
  await writeText(
    path.join(docsDir, `${shortName}-snapshot-strategy.md`),
    buildSnapshotStrategyDoc(label),
  )

  await writeJson(
    path.join(repoRoot, 'data', `${shortName}-priority-queue.json`),
    buildPriorityQueue(label),
  )

  console.log(`Scaffolded ${label}.`)
  console.log(`Dataset id: ${id}`)
  console.log(`Data folder: data/${folder}`)
  console.log('Docs created:')
  console.log(`- docs/${shortName}-dataset-charter.md`)
  console.log(`- docs/${shortName}-periodization-proposal.md`)
  console.log(`- docs/${shortName}-seeding-plan.md`)
  console.log(`- docs/${shortName}-initial-seed-candidates.md`)
  console.log(`- docs/${shortName}-pressure-grounding-map.md`)
  console.log(`- docs/${shortName}-snapshot-strategy.md`)
  console.log(`- data/${shortName}-priority-queue.json`)
  console.log('')
  console.log('Next steps:')
  console.log('1. Fill the planning docs before registering the dataset in data/datasets.json.')
  console.log('2. Write the runtime JSON seed files under the new data folder.')
  console.log('3. Run `npm run validate:data` before any registry wiring.')
  console.log('4. Run `npm run generate:insights` only after the seed pack validates.')
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
