import { moments, journeys } from '../src/atlas/content.ts'
import { validateCorpus } from './atlas-schema.mjs'
import { readFile } from 'node:fs/promises'
const errors = validateCorpus(moments, journeys)
const data = JSON.parse(
  await readFile('public/atlas/life-expectancy.json', 'utf8'),
)
if (data.series.length < 200 || !data.rawSha256 || !data.citation)
  errors.push('Measured dataset is missing coverage or provenance')
const codes = new Set()
for (const series of data.series) {
  if (codes.has(series.code))
    errors.push(`Duplicate country code ${series.code}`)
  codes.add(series.code)
  let previous = -Infinity
  for (const [year, value] of series.values) {
    if (
      year <= previous ||
      year < data.start ||
      year > data.end ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 120
    )
      errors.push(`Invalid observation in ${series.code}: ${year}`)
    previous = year
  }
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else
  console.log(
    `Valid: ${moments.length} sourced moments, ${journeys.length} journeys, ${data.series.length} measured series, ${data.series.reduce((n, s) => n + s.values.length, 0)} observations.`,
  )
