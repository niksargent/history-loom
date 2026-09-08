import { mkdir, writeFile, rename } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Reproducible, offline-at-runtime snapshot. Keep every observed year; never interpolate.
const url = 'https://ourworldindata.org/grapher/life-expectancy.csv'
const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
if (!response.ok) throw new Error(`OWID returned ${response.status}`)
const csv = await response.text()
function parseRow(row) {
  return [...row.matchAll(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)].map((match) =>
    match[1].replace(/^"|"$/g, '').replaceAll('""', '"'),
  )
}
const [header, ...rows] = csv.trim().split(/\r?\n/)
if (header !== 'Entity,Code,Year,Life expectancy')
  throw new Error(`Unexpected schema: ${header}`)
const byCode = new Map()
for (const row of rows) {
  const [entity, code, rawYear, rawValue] = parseRow(row)
  if (!code || (!/^[A-Z]{3}$/.test(code) && code !== 'OWID_WRL')) continue
  const year = Number(rawYear),
    value = Number(rawValue)
  if (
    !Number.isInteger(year) ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 120
  )
    throw new Error(`Invalid observation: ${row}`)
  if (year < 1800 || year > 2023) continue
  if (!byCode.has(code)) byCode.set(code, { entity, code, values: [] })
  const series = byCode.get(code)
  if (series.values.some((point) => point[0] === year))
    throw new Error(`Duplicate ${code} ${year}`)
  series.values.push([year, Math.round(value * 100) / 100])
}
const series = [...byCode.values()].sort((a, b) =>
  a.entity.localeCompare(b.entity),
)
series.forEach((s) => s.values.sort((a, b) => a[0] - b[0]))
if (series.length < 200) throw new Error('Unexpected loss of country coverage')
const dataset = {
  retrieved: new Date().toISOString().slice(0, 10),
  url,
  citation:
    'Riley (2005); Zijdeman et al. (2015); HMD (2025); UN WPP (2024), with major processing by Our World in Data.',
  license:
    'OWID-produced data: CC BY 4.0. Original providers retain their respective terms; see the linked data page.',
  sourcePage: 'https://ourworldindata.org/grapher/life-expectancy',
  rawSha256: createHash('sha256').update(csv).digest('hex'),
  transformation:
    'Country/territory ISO3 codes plus World; observations 1800–2023; rounded to 2 decimals; no interpolation. 2023 fixed as end of observed estimates, excluding projections.',
  start: 1800,
  end: 2023,
  series,
}
await mkdir('public/atlas', { recursive: true })
await mkdir('data/atlas', { recursive: true })
await writeFile(
  'data/atlas/life-manifest.json',
  JSON.stringify(
    {
      retrieved: dataset.retrieved,
      countryCount: series.length - 1,
      seriesCount: series.length,
      observationCount: series.reduce((n, s) => n + s.values.length, 0),
      start: dataset.start,
      end: dataset.end,
      citation: dataset.citation,
    },
    null,
    2,
  ) + '\n',
)
await writeFile(
  'public/atlas/life-expectancy.next.json',
  JSON.stringify(dataset),
)
await rename(
  'public/atlas/life-expectancy.next.json',
  'public/atlas/life-expectancy.json',
)
console.log(
  `Imported ${series.length} countries/territories and World; ${series.reduce((n, s) => n + s.values.length, 0)} observations.`,
)
