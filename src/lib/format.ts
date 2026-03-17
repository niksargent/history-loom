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
