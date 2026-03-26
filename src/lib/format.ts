export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatYearRange(startYear: number, endYear: number): string {
  return startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`
}

export function titleCaseLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export function sentenceCase(value: string): string {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

export function formatPopulationEstimate(value?: number | null): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null
  }

  if (value >= 1000000000) {
    return `About ${(value / 1000000000).toFixed(1).replace(/\.0$/, '')} billion people`
  }

  if (value >= 1000000) {
    return `About ${(value / 1000000).toFixed(1).replace(/\.0$/, '')} million people`
  }

  if (value >= 1000) {
    return `About ${(value / 1000).toFixed(1).replace(/\.0$/, '')} thousand people`
  }

  return `About ${Math.round(value)} people`
}

export function formatPopulationCompact(value?: number | null): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null
  }

  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1).replace(/\.0$/, '')}bn`
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}m`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }

  return `${Math.round(value)}`
}
