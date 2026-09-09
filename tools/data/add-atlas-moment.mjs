import { readFile, writeFile, rename } from 'node:fs/promises'
import { moments } from '../../apps/atlas/src/content.ts'
import { validateMoment } from './atlas-schema.mjs'

const input = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
if (!input)
  throw new Error(
    'Usage: node tools/data/add-atlas-moment.mjs candidate.json [--write --reviewed]',
  )
const parsed = JSON.parse(await readFile(input, 'utf8'))
const candidates = Array.isArray(parsed) ? parsed : [parsed]
const ids = new Set(moments.map((moment) => moment.id))
const errors = []
for (const candidate of candidates) {
  errors.push(
    ...validateMoment(candidate).map(
      (error) => `${candidate?.id ?? '?'}: ${error}`,
    ),
  )
  if (ids.has(candidate?.id)) errors.push(`Duplicate id: ${candidate?.id}`)
  ids.add(candidate?.id)
}
if (errors.length) throw new Error(errors.join('\n'))
if (!process.argv.includes('--write'))
  console.log(
    `Valid draft: ${candidates.length} moment(s). No files changed. Review source content, dates, coordinates, and comparison limits before importing.`,
  )
else {
  if (!process.argv.includes('--reviewed'))
    throw new Error(
      'Import requires --reviewed to record that a human or editorial agent checked the source content, not merely the URL.',
    )
  const existing = JSON.parse(
    await readFile('data/atlas/extensions.json', 'utf8'),
  )
  const next = [...existing, ...candidates].sort((a, b) => a.year - b.year)
  await writeFile(
    'data/atlas/extensions.next.json',
    JSON.stringify(next, null, 2) + '\n',
    { flag: 'wx' },
  )
  await rename('data/atlas/extensions.next.json', 'data/atlas/extensions.json')
  console.log(
    `Imported ${candidates.length} moment(s). Run validate:atlas and test:atlas, then preview the updated atlas.`,
  )
}
