import type { Moment, Theme, LifeSeries } from './types'

export const themes: Record<
  Theme,
  { label: string; color: string; symbol: string }
> = {
  connection: {
    label: 'A connected world',
    color: '#e6b978',
    symbol: 'network',
  },
  ideas: { label: 'Ideas that spread', color: '#81bcc7', symbol: 'spark' },
  freedom: { label: 'People & freedom', color: '#b9a0db', symbol: 'sun' },
  survival: { label: 'Crisis & recovery', color: '#95bf9f', symbol: 'leaf' },
  power: { label: 'Power & change', color: '#de967f', symbol: 'arch' },
}

export function yearLabel(year: number) {
  return year < 0 ? `${Math.abs(year).toLocaleString('en-GB')} BCE` : `${year}`
}
export function momentDate(moment: Moment) {
  return `${moment.approximate ? 'c. ' : ''}${yearLabel(moment.year)}${moment.endYear ? `–${yearLabel(moment.endYear)}` : ''}`
}
// Dates use historical numbering: there was no year zero.
export function yearDistance(a: number, b: number) {
  return Math.abs(a - b) - (Math.min(a, b) < 0 && Math.max(a, b) > 0 ? 1 : 0)
}
export const yearToAxis = (year: number) => (year > 0 ? year - 1 : year)
export const axisToYear = (axis: number) => (axis >= 0 ? axis + 1 : axis)
export function relatedMoments(moment: Moment, moments: Moment[]) {
  return moments
    .filter((other) => other.id !== moment.id)
    .map((other) => {
      const shared = other.tags.filter((tag) => moment.tags.includes(tag))
      const union = new Set([...other.tags, ...moment.tags]).size
      return { moment: other, shared, score: union ? shared.length / union : 0 }
    })
    .filter((item) => item.shared.length > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        yearDistance(moment.year, b.moment.year) -
          yearDistance(moment.year, a.moment.year),
    )
}
export function filterMoments(
  moments: Moment[],
  query: string,
  theme: Theme | 'all',
  until: number,
) {
  const searchable = (value: string) =>
    value
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/['’ʻʼ]/g, '')
      .toLocaleLowerCase()
  const terms = searchable(query).trim().split(/\s+/).filter(Boolean)
  return moments.filter(
    (m) =>
      m.year <= until &&
      (theme === 'all' || m.theme === theme) &&
      terms.every((term) =>
        searchable(
          `${m.id} ${m.title} ${m.place} ${m.region} ${m.hook} ${m.story} ${m.tags.join(' ')}`,
        ).includes(term),
      ),
  )
}
export function observationAt(series: LifeSeries, year: number) {
  // Never silently substitute an earlier observation for a missing year.
  return series.values.find((point) => point[0] === year)?.[1] ?? null
}
export function consecutiveGaps(years: number[]) {
  const ordered = [...new Set(years)].sort((a, b) => a - b)
  return ordered.slice(1).map((year, index) => ({
    from: ordered[index],
    to: year,
    gap: yearDistance(ordered[index], year),
  }))
}
export function chartSegments(values: [number, number][], maxGap = 1) {
  const segments: [number, number][][] = []
  values.forEach((point) => {
    const last = segments.at(-1)
    if (!last || point[0] - last[last.length - 1][0] > maxGap)
      segments.push([point])
    else last.push(point)
  })
  return segments
}
