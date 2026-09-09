export type Theme = 'ideas' | 'connection' | 'power' | 'freedom' | 'survival'
export interface Source {
  title: string
  url: string
}
export interface Moment {
  id: string
  title: string
  year: number
  endYear?: number
  approximate?: boolean
  place: string
  region: string
  coordinates: [number, number]
  theme: Theme
  tags: string[]
  hook: string
  story: string
  consequence: string
  caution: string
  sources: Source[]
}
export interface Journey {
  id: string
  title: string
  subtitle: string
  theme: Theme
  stops: string[]
  question: string
  options: string[]
  answer: number
  explanation: string
  rhyme: string
  difference: string
  art: 'networks' | 'voices' | 'sparks' | 'survival' | 'cities' | 'cycle'
}
export interface LifeSeries {
  entity: string
  code: string
  values: [number, number][]
}
export interface LifeData {
  retrieved: string
  url: string
  citation: string
  license: string
  start: number
  end: number
  series: LifeSeries[]
}
