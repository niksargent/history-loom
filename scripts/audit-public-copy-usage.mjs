import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()

const checks = [
  {
    file: 'src/components/DetailPanel.tsx',
    mustInclude: [
      'getPublicPeriodSummary(',
      'getPublicEventSummary(',
      'getPublicSnapshotTitle(',
      'getPublicSnapshotSummary(',
      'getPublicSnapshotDailyReality(',
      'getPublicVoiceSpeakerFrame(',
      'getPublicVoicePrompt(',
      'getPublicVoiceResponse(',
      'getPublicEchoSimilarityLabel(',
      'getPublicEchoSimilarityReasons(',
      'getPublicEchoNotes(',
    ],
    mustNotInclude: ['title={snapshot?.title ?? period.title}'],
  },
  {
    file: 'src/components/ComparePanel.tsx',
    mustInclude: [
      'getPublicPeriodSummary(',
      'getPublicEventSummary(',
      'buildCompareStory(',
      'CompareEchoHero',
      'CompareSharedPressureMix',
    ],
    mustNotInclude: [],
  },
  {
    file: 'src/lib/compare-story.ts',
    mustInclude: [
      'getPublicEchoSimilarityLabel(',
      'getPublicEchoSimilarityReasons(',
      'getPublicEchoNotes(',
    ],
    mustNotInclude: [],
  },
  {
    file: 'src/components/ForceExplorer.tsx',
    mustInclude: ['getPublicEventSummary('],
    mustNotInclude: [],
  },
  {
    file: 'src/components/LoomCanvas.tsx',
    mustInclude: ['getPublicPeriodSummary('],
    mustNotInclude: [],
  },
  {
    file: 'src/lib/loom-data.ts',
    mustInclude: [
      'snapshot?.publicTitle ?? snapshot?.title',
      'snapshot?.publicSummary ?? snapshot?.summary',
      'getPublicPeriodPressureSummary(period)',
    ],
    mustNotInclude: [],
  },
]

const failures = []

for (const check of checks) {
  const absolutePath = path.join(root, check.file)
  const content = readFileSync(absolutePath, 'utf8')

  for (const required of check.mustInclude) {
    if (!content.includes(required)) {
      failures.push(`${check.file}: missing required public-copy usage \`${required}\``)
    }
  }

  for (const forbidden of check.mustNotInclude) {
    if (content.includes(forbidden)) {
      failures.push(`${check.file}: found forbidden leak pattern \`${forbidden}\``)
    }
  }
}

if (failures.length) {
  console.error('Public copy usage audit failed:\n')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`Public copy usage audit passed for ${checks.length} files.`)
