import test from 'node:test'
import assert from 'node:assert/strict'
import { moments, journeys, momentById } from '../../apps/atlas/src/content.ts'
import {
  yearDistance,
  yearLabel,
  yearToAxis,
  axisToYear,
  filterMoments,
  relatedMoments,
  consecutiveGaps,
  observationAt,
  chartSegments,
} from '../../apps/atlas/src/engine.ts'
import { validateMoment, validateCorpus } from '../../tools/data/atlas-schema.mjs'
import { readFile } from 'node:fs/promises'
import {
  clusterEras,
  nearestEras,
  pressureEras,
  scoreDistance,
} from '../../apps/atlas/src/pressureModel.ts'

test('pressure groups cover each era exactly once and ignore its date and country', () => {
  const groups = clusterEras(pressureEras)
  assert.equal(groups.length, 4)
  const membership = (gs) =>
    gs
      .map((g) => g.members.map((p) => p.key).sort())
      .sort((a, b) => a[0].localeCompare(b[0]))
  const keys = groups.flatMap((g) => g.members.map((p) => p.key))
  assert.equal(keys.length, pressureEras.length)
  assert.equal(new Set(keys).size, pressureEras.length)
  assert.deepEqual(
    membership(groups),
    membership(
      clusterEras(
        [...pressureEras].reverse().map((p, i) => ({
          ...p,
          startYear: 100 + i,
          endYear: 101 + i,
          country: 'Changed',
        })),
      ),
    ),
  )
  for (const group of groups)
    group.center.forEach((v, d) =>
      assert.ok(
        Math.abs(
          v -
            group.members.reduce((s, p) => s + p.scores[d], 0) /
              group.members.length,
        ) < 1e-8,
      ),
    )
})

test('closest pressure comparisons match the fingerprint metric and respect country scope', () => {
  const selected = pressureEras.find((p) => p.country === 'France')
  const matches = nearestEras(selected, pressureEras, true)
  assert.ok(
    matches.every(
      (m) => m.era.country !== selected.country && m.era.key !== selected.key,
    ),
  )
  assert.equal(matches[0].era.key, 'gb-p02')
  matches.forEach((m, i) => {
    assert.equal(m.distance, scoreDistance(selected.scores, m.era.scores))
    if (i) assert.ok(matches[i - 1].distance <= m.distance)
  })
  const same = {
    ...selected,
    key: 'same-scores',
    country: 'Elsewhere',
    startYear: 1100,
  }
  assert.equal(nearestEras(selected, [selected, same], true)[0].distance, 0)
})

test('pressure grouping handles a single shared profile without empty invented groups', () => {
  assert.deepEqual(clusterEras([]), [])
  const same = pressureEras
    .slice(0, 3)
    .map((p) => ({ ...p, scores: [50, 50, 50, 50, 50, 50] }))
  assert.equal(clusterEras(same).length, 1)
})

test('new knowledge, water and civic histories have sources and reachable journey stops', () => {
  for (const id of [
    'kuk',
    'budj-bim',
    'nalanda',
    'quipu',
    'braille',
    'hokulea',
    'green-belt',
    'montreal',
    'liberia-peace',
  ]) {
    assert.ok(momentById[id].sources.length)
    assert.ok(relatedMoments(momentById[id], moments).length >= 3)
  }
  for (const id of [
    'water-worlds',
    'knowledge-keepers',
    'everyday-power',
    'shared-rules',
    'ways-to-record',
  ]) {
    const journey = journeys.find((j) => j.id === id)
    assert.ok(journey)
    assert.ok(journey.stops.every((id) => momentById[id]))
  }
})

test('historical arithmetic has no year zero and works in both directions', () => {
  assert.equal(yearDistance(-1, 1), 1)
  assert.equal(yearDistance(1, -1), 1)
  assert.equal(yearDistance(-130, 1993), 2122)
  assert.equal(yearDistance(1929, 2008), 79)
  assert.equal(yearDistance(-3200, -130), 3070)
})

test('new stories can be found by personal names and unaccented spellings', () => {
  assert.ok(
    filterMoments(moments, 'Louis Braille', 'ideas', 2020).some(
      (m) => m.id === 'braille',
    ),
  )
  assert.ok(
    filterMoments(moments, 'Hokulea', 'connection', 2020).some(
      (m) => m.id === 'hokulea',
    ),
  )
  assert.ok(
    filterMoments(moments, 'Wangari Maathai', 'freedom', 2020).some(
      (m) => m.id === 'green-belt',
    ),
  )
  assert.equal(filterMoments(moments, 'Louis Braille', 'ideas', 1800).length, 0)
})
test('timeline moves continuously across BCE/CE in either direction', () => {
  assert.equal(axisToYear(yearToAxis(-1) + 1), 1)
  assert.equal(axisToYear(yearToAxis(1) - 1), -1)
  for (const year of [-3200, -130, -1, 1, 868, 2020])
    assert.equal(axisToYear(yearToAxis(year)), year)
  assert.equal(yearLabel(-3200), '3,200 BCE')
})
test('search combines terms, theme, and time rather than ignoring active filters', () => {
  assert.deepEqual(
    filterMoments(moments, '  tang   china ', 'ideas', 1000).map((m) => m.id),
    ['diamond'],
  )
  assert.equal(filterMoments(moments, 'china', 'freedom', 1000).length, 0)
  assert.equal(
    filterMoments(moments, 'a word that is absent', 'all', 2020).length,
    0,
  )
  assert.deepEqual(
    filterMoments(moments, '', 'all', -3200).map((m) => m.id),
    ['kuk', 'budj-bim', 'writing'],
  )
  assert.ok(
    filterMoments(moments, 'Africa', 'all', 2020).every(
      (m) => m.region === 'Africa',
    ),
  )
})
test('echo ranking excludes self, requires actual shared tags, and is deterministic', () => {
  const related = relatedMoments(momentById.diamond, moments)
  assert.ok(related.length > 0)
  assert.ok(
    related.every(
      (r) =>
        r.moment.id !== 'diamond' &&
        r.shared.length > 0 &&
        r.score > 0 &&
        r.score <= 1,
    ),
  )
  assert.ok(related.slice(1).every((r, i) => r.score <= related[i].score))
  assert.deepEqual(related, relatedMoments(momentById.diamond, moments))
  assert.ok(related.find((r) => r.moment.id === 'jikji')?.score === 1)
})
test('historical intervals are calculated from dates, without rounding to cycles', () => {
  assert.deepEqual(
    consecutiveGaps([2008, 1776, 1929, 1861, 1776]).map((g) => g.gap),
    [85, 68, 79],
  )
  assert.deepEqual(consecutiveGaps([]), [])
  assert.deepEqual(consecutiveGaps([1776]), [])
  assert.equal(consecutiveGaps([1776, 2020])[0].gap, 244)
})
test('no observation is silently carried forward into a missing year', () => {
  const series = {
    entity: 'Example',
    code: 'TST',
    values: [
      [1900, 30],
      [1950, 50],
    ],
  }
  assert.equal(observationAt(series, 1920), null)
  assert.equal(observationAt(series, 1950), 50)
  assert.equal(observationAt(series, 1800), null)
})
test('charts break lines at gaps and preserve isolated measured points', () => {
  assert.deepEqual(
    chartSegments([
      [1900, 30],
      [1901, 31],
      [1950, 50],
      [1951, 51],
      [1960, 60],
    ]),
    [
      [
        [1900, 30],
        [1901, 31],
      ],
      [
        [1950, 50],
        [1951, 51],
      ],
      [[1960, 60]],
    ],
  )
  assert.deepEqual(chartSegments([]), [])
})
test('all public moments and journeys have valid evidence and references', () => {
  assert.deepEqual(validateCorpus(moments, journeys), [])
  assert.equal(new Set(moments.map((m) => m.region)).size, 6)
  assert.ok(moments.length >= 49)
  assert.ok(journeys.every((j) => j.stops.every((id) => momentById[id])))
})
test('extension validation rejects corrupt coordinates, unsafe source URLs, and missing context', () => {
  const invalid = {
    ...momentById.diamond,
    year: 0,
    coordinates: [300, 100],
    sources: [{ title: 'Unsafe', url: 'javascript:alert(1)' }],
    caution: '',
  }
  const errors = validateMoment(invalid)
  assert.ok(errors.some((e) => e.startsWith('year')))
  assert.ok(errors.some((e) => e.startsWith('coordinates')))
  assert.ok(errors.some((e) => e.includes('HTTPS')))
  assert.ok(errors.some((e) => e.startsWith('caution')))
  assert.deepEqual(validateMoment(null), ['Moment must be an object'])
})
test('dataset rejects duplicate IDs and broken journey stops', () => {
  const errors = validateCorpus(
    [momentById.diamond, momentById.diamond],
    [{ ...journeys[0], stops: ['missing', 'diamond', 'diamond'] }],
  )
  assert.ok(errors.some((e) => e.includes('Duplicate moment')))
  assert.ok(errors.some((e) => e.includes('missing stop')))
  assert.ok(errors.some((e) => e.includes('distinct stops')))
})
test('bundled life data preserves real observations, provenance, and a fixed non-projected endpoint', async () => {
  const data = JSON.parse(
    await readFile('public/atlas/life-expectancy.json', 'utf8'),
  )
  assert.equal(data.end, 2023)
  assert.match(data.rawSha256, /^[a-f0-9]{64}$/)
  assert.ok(data.series.length >= 230)
  const codes = new Set()
  for (const series of data.series) {
    assert.ok(!codes.has(series.code))
    codes.add(series.code)
    let previous = 1799
    for (const [year, value] of series.values) {
      assert.ok(year > previous && year <= 2023)
      assert.ok(value > 0 && value < 120)
      previous = year
    }
  }
  const world = data.series.find((s) => s.code === 'OWID_WRL')
  assert.ok(observationAt(world, 2023) > 70)
  assert.ok(observationAt(world, 1900) < 40)
  const japan = data.series.find((s) => s.code === 'JPN')
  assert.ok(observationAt(japan, 2023) > 80)
})
