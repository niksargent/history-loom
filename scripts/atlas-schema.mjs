export const regionNames = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
]
export const themeNames = [
  'ideas',
  'connection',
  'power',
  'freedom',
  'survival',
]

export function validateMoment(moment) {
  const errors = []
  if (!moment || typeof moment !== 'object' || Array.isArray(moment))
    return ['Moment must be an object']
  for (const key of [
    'id',
    'title',
    'place',
    'region',
    'theme',
    'hook',
    'story',
    'consequence',
    'caution',
  ]) {
    if (typeof moment[key] !== 'string' || !moment[key].trim())
      errors.push(`${key} must be a non-empty string`)
  }
  if (
    typeof moment.id === 'string' &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(moment.id)
  )
    errors.push('id must use lowercase words joined by hyphens')
  const validYear = (year) =>
    Number.isInteger(year) &&
    year !== 0 &&
    year >= -10000 &&
    year <= new Date().getFullYear()
  if (!validYear(moment.year))
    errors.push(
      'year must be an integer from 10000 BCE to the present, excluding zero',
    )
  if (
    moment.endYear !== undefined &&
    (!validYear(moment.endYear) || moment.endYear < moment.year)
  )
    errors.push('endYear must be a valid year at or after year')
  if (
    moment.approximate !== undefined &&
    typeof moment.approximate !== 'boolean'
  )
    errors.push('approximate must be boolean')
  if (!regionNames.includes(moment.region))
    errors.push('region must be a supported continent')
  if (!themeNames.includes(moment.theme))
    errors.push('theme must be a supported theme')
  if (
    !Array.isArray(moment.coordinates) ||
    moment.coordinates.length !== 2 ||
    !moment.coordinates.every(Number.isFinite) ||
    Math.abs(moment.coordinates[0]) > 180 ||
    Math.abs(moment.coordinates[1]) > 90
  )
    errors.push(
      'coordinates must be [longitude, latitude] within geographic bounds',
    )
  if (
    !Array.isArray(moment.tags) ||
    moment.tags.length < 2 ||
    moment.tags.some(
      (tag) => typeof tag !== 'string' || !/^[a-z][a-z-]*$/.test(tag),
    ) ||
    new Set(moment.tags).size !== moment.tags.length
  )
    errors.push('tags must contain at least two unique lowercase terms')
  if (!Array.isArray(moment.sources) || moment.sources.length < 1)
    errors.push('At least one source is required')
  else
    for (const source of moment.sources) {
      if (!source || typeof source.title !== 'string' || !source.title.trim())
        errors.push('Each source needs a title')
      try {
        const url = new URL(source?.url)
        if (url.protocol !== 'https:' || url.username || url.password)
          errors.push('Sources must use public HTTPS URLs without credentials')
      } catch {
        errors.push('Each source needs a valid URL')
      }
    }
  for (const [key, max] of [
    ['title', 85],
    ['hook', 180],
    ['story', 650],
    ['consequence', 250],
    ['caution', 650],
  ]) {
    if (typeof moment[key] === 'string' && moment[key].length > max)
      errors.push(
        `${key} exceeds ${max} characters; keep the public story concise`,
      )
  }
  return errors
}

export function validateCorpus(moments, journeys) {
  const errors = moments.flatMap((moment) =>
    validateMoment(moment).map((error) => `${moment.id ?? '?'}: ${error}`),
  )
  const ids = new Set()
  for (const moment of moments) {
    if (ids.has(moment.id)) errors.push(`Duplicate moment: ${moment.id}`)
    ids.add(moment.id)
  }
  const journeyIds = new Set()
  for (const journey of journeys) {
    if (journeyIds.has(journey.id))
      errors.push(`Duplicate journey: ${journey.id}`)
    journeyIds.add(journey.id)
    if (journey.stops.length !== 3 || new Set(journey.stops).size !== 3)
      errors.push(`${journey.id}: journeys require three distinct stops`)
    for (const id of journey.stops)
      if (!ids.has(id)) errors.push(`${journey.id}: missing stop ${id}`)
    if (!Number.isInteger(journey.answer) || !journey.options[journey.answer])
      errors.push(`${journey.id}: invalid answer`)
    if (!journey.rhyme || !journey.difference || !journey.explanation)
      errors.push(`${journey.id}: explain both the comparison and its limits`)
  }
  return errors
}
