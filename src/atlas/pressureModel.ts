import britain from '../../data/periods.json' with { type: 'json' }
import france from '../../data/france/periods.json' with { type: 'json' }
import germany from '../../data/germany/periods.json' with { type: 'json' }
import usa from '../../data/usa/periods.json' with { type: 'json' }

export const pressureDimensions = [
  ['inequality', 'Unequal wealth'],
  ['economicPrecarity', 'Making ends meet'],
  ['technologicalDisruption', 'New technology'],
  ['institutionalLegitimacy', 'Trust in the rules'],
  ['publicHope', 'Hope for tomorrow'],
  ['militarization', 'Military pressure'],
] as const
export interface PressureEra {
  key: string
  country: string
  title: string
  summary: string
  startYear: number
  endYear: number
  scores: number[]
}
export const pressureEras: PressureEra[] = [
  ...britain.map((p) => ({ ...p, key: `gb-${p.id}`, country: 'Britain' })),
  ...france.map((p) => ({ ...p, key: `fr-${p.id}`, country: 'France' })),
  ...germany.map((p) => ({ ...p, key: `de-${p.id}`, country: 'Germany' })),
  ...usa.map((p) => ({ ...p, key: `us-${p.id}`, country: 'United States' })),
]
  .map((p) => ({
    key: p.key,
    country: p.country,
    title: p.title,
    summary: 'publicSummary' in p ? String(p.publicSummary) : p.summary,
    startYear: p.startYear,
    endYear: p.endYear,
    scores: pressureDimensions.map(
      ([key]) => (p.pressureScores as Record<string, number>)[key],
    ),
  }))
  .filter((p) => p.scores.every(Number.isFinite))
export const scoreDistance = (a: number[], b: number[]) =>
  a.reduce((sum, score, i) => sum + Math.abs(score - b[i]), 0) / a.length
const squaredDistance = (a: number[], b: number[]) =>
  a.reduce((sum, score, i) => sum + (score - b[i]) ** 2, 0)

// Four deterministic k-means groups. Dates and country never enter this calculation.
export function clusterEras(eras: PressureEra[], requested = 4) {
  if (!eras.length) return []
  const ordered = [...eras].sort((a, b) => a.key.localeCompare(b.key))
  const seeds = [ordered[0].scores]
  while (seeds.length < Math.min(requested, eras.length)) {
    const next = [...ordered].sort(
      (a, b) =>
        Math.min(...seeds.map((s) => squaredDistance(b.scores, s))) -
        Math.min(...seeds.map((s) => squaredDistance(a.scores, s))),
    )[0]
    if (seeds.some((s) => squaredDistance(next.scores, s) === 0)) break
    seeds.push(next.scores)
  }
  let centers = seeds.map((s) => [...s])
  let groups: PressureEra[][] = []
  for (let iteration = 0; iteration < 60; iteration++) {
    groups = centers.map(() => [])
    for (const era of ordered) {
      const distances = centers.map((center) =>
        squaredDistance(era.scores, center),
      )
      groups[distances.indexOf(Math.min(...distances))].push(era)
    }
    const next = groups.map((group, i) =>
      group.length
        ? centers[i].map(
            (_, d) =>
              group.reduce((sum, p) => sum + p.scores[d], 0) / group.length,
          )
        : centers[i],
    )
    const converged = next.every(
      (c, i) => squaredDistance(c, centers[i]) < 0.000001,
    )
    centers = next
    if (converged) break
  }
  return groups
    .map((members, i) => ({
      members: members.sort(
        (a, b) => a.startYear - b.startYear || a.key.localeCompare(b.key),
      ),
      center: centers[i],
    }))
    .filter((g) => g.members.length)
}
export function nearestEras(
  era: PressureEra,
  eras: PressureEra[],
  crossCountry = false,
) {
  return eras
    .filter(
      (p) => p.key !== era.key && (!crossCountry || p.country !== era.country),
    )
    .map((p) => ({ era: p, distance: scoreDistance(era.scores, p.scores) }))
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        a.era.startYear - b.era.startYear ||
        a.era.key.localeCompare(b.era.key),
    )
}
