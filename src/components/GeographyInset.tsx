import { geoMercator, geoPath } from 'd3-geo'
import countriesAtlas from 'world-atlas/countries-110m.json'
import { feature } from 'topojson-client'
import type { GeographyInsetModel, GeoRegionId } from '../types/view'

interface GeographyInsetProps {
  model: GeographyInsetModel
}

const MAP_WIDTH = 320
const MAP_HEIGHT = 230

const atlas = countriesAtlas as {
  objects: {
    countries: object
  }
}

const countryCollection = feature(
  atlas as never,
  atlas.objects.countries as never,
) as unknown as {
  features: Array<{
    id: string
    properties?: {
      name?: string
    }
    geometry: unknown
  }>
}

const visibleCountryNames = new Set([
  'United Kingdom',
  'Ireland',
])

const mapFeatures = countryCollection.features.filter((country) =>
  visibleCountryNames.has(country.properties?.name ?? ''),
)

const projection = geoMercator()
  .center([-4.8, 55.2])
  .scale(1040)
  .translate([MAP_WIDTH * 0.45, MAP_HEIGHT * 0.63])

const path = geoPath(projection)

const regionMarkers: Array<{
  id: GeoRegionId
  label: string
  coordinates: [number, number]
}> = [
  { id: 'scotland', label: 'Scotland', coordinates: [-4.4, 57.4] },
  { id: 'england', label: 'England', coordinates: [-1.7, 52.8] },
  { id: 'wales', label: 'Wales', coordinates: [-3.8, 52.3] },
  { id: 'northern-ireland', label: 'N. Ireland', coordinates: [-6.7, 54.8] },
  { id: 'ireland', label: 'Ireland', coordinates: [-8.1, 53.4] },
]

function countryStyle(name: string, highlighted: Set<GeoRegionId>) {
  const ukActive =
    highlighted.has('britain') ||
    highlighted.has('england') ||
    highlighted.has('scotland') ||
    highlighted.has('wales') ||
    highlighted.has('northern-ireland')
  const irelandActive = highlighted.has('ireland') || highlighted.has('british-isles')
  const franceActive =
    highlighted.has('france') || highlighted.has('europe') || highlighted.has('global')

  if (name === 'United Kingdom') {
    return ukActive
      ? {
          fill: 'rgba(252, 211, 77, 0.28)',
          stroke: 'rgba(255, 251, 235, 0.92)',
        }
      : {
          fill: 'rgba(214, 211, 209, 0.16)',
          stroke: 'rgba(214, 211, 209, 0.34)',
        }
  }

  if (name === 'Ireland') {
    return irelandActive
      ? {
          fill: 'rgba(103, 232, 249, 0.2)',
          stroke: 'rgba(236, 254, 255, 0.82)',
        }
      : {
          fill: 'rgba(214, 211, 209, 0.12)',
          stroke: 'rgba(214, 211, 209, 0.28)',
        }
  }

  if (name === 'France') {
    return franceActive
      ? {
          fill: 'rgba(244, 114, 182, 0.18)',
          stroke: 'rgba(255, 228, 230, 0.76)',
        }
      : {
          fill: 'rgba(214, 211, 209, 0.08)',
          stroke: 'rgba(214, 211, 209, 0.22)',
        }
  }

  return {
    fill: 'rgba(214, 211, 209, 0.06)',
    stroke: 'rgba(214, 211, 209, 0.18)',
  }
}

function markerStyle(markerId: GeoRegionId, highlighted: Set<GeoRegionId>) {
  const active =
    highlighted.has(markerId) ||
    (markerId !== 'ireland' &&
      markerId !== 'northern-ireland' &&
      highlighted.has('britain'))

  return active
    ? {
        fill: 'rgba(252, 211, 77, 0.92)',
        stroke: 'rgba(255, 251, 235, 0.94)',
        text: 'rgba(255, 248, 235, 0.94)',
      }
    : {
        fill: 'rgba(214, 211, 209, 0.36)',
        stroke: 'rgba(231, 229, 228, 0.28)',
        text: 'rgba(168, 162, 158, 0.84)',
      }
}

export function GeographyInset({ model }: GeographyInsetProps) {
  const highlighted = new Set(model.highlightedRegions)
  const europeActive =
    highlighted.has('france') || highlighted.has('europe') || highlighted.has('global')

  return (
    <section className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.9fr)] lg:items-start">
        <div className="min-w-0">
          <p className="eyebrow">Geographic orientation</p>
          <h3 className="mt-2 text-base text-stone-100">{model.contextLabel}</h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {model.labels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-300"
              >
                {label}
              </span>
            ))}
            {!model.labels.length ? (
              <span className="text-sm leading-6 text-stone-500">
                Geography is inferred from the active period scope.
              </span>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.25rem] border border-white/8 bg-black/20 p-3">
          <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="h-52 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="geo-sea" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(18, 24, 30, 0.98)" />
                <stop offset="100%" stopColor="rgba(7, 10, 12, 1)" />
              </linearGradient>
              <radialGradient id="geo-shelf" cx="46%" cy="46%" r="62%">
                <stop offset="0%" stopColor="rgba(125, 211, 252, 0.1)" />
                <stop offset="100%" stopColor="rgba(125, 211, 252, 0)" />
              </radialGradient>
            </defs>

            <rect width={MAP_WIDTH} height={MAP_HEIGHT} rx="20" fill="url(#geo-sea)" />
            <rect width={MAP_WIDTH} height={MAP_HEIGHT} rx="20" fill="url(#geo-shelf)" />

            <path
              d="M234 140 C251 131 272 130 295 135 C307 138 315 144 320 154 L320 221 L226 221 C224 206 225 190 228 175 C230 163 232 150 234 140 Z"
              fill={
                europeActive
                  ? 'rgba(244, 114, 182, 0.14)'
                  : 'rgba(214, 211, 209, 0.05)'
              }
              stroke={
                europeActive
                  ? 'rgba(255, 228, 230, 0.48)'
                  : 'rgba(214, 211, 209, 0.14)'
              }
              strokeWidth="1.1"
              strokeLinejoin="round"
            />

            {mapFeatures.map((country) => {
              const name = country.properties?.name ?? ''
              const d = path(country as never)

              if (!d) {
                return null
              }

              const style = countryStyle(name, highlighted)

              return (
                <path
                  key={country.id}
                  d={d}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />
              )
            })}

            {highlighted.has('britain') ? (
              <ellipse
                cx="148"
                cy="103"
                rx="46"
                ry="82"
                fill="transparent"
                stroke="rgba(254, 243, 199, 0.42)"
                strokeDasharray="5 6"
                strokeWidth="1.4"
              />
            ) : null}

            {highlighted.has('british-isles') ? (
              <ellipse
                cx="134"
                cy="111"
                rx="78"
                ry="88"
                fill="transparent"
                stroke="rgba(207, 250, 254, 0.34)"
                strokeDasharray="4 7"
                strokeWidth="1.3"
              />
            ) : null}

            {highlighted.has('global') ? (
              <ellipse
                cx="160"
                cy="113"
                rx="132"
                ry="96"
                fill="transparent"
                stroke="rgba(207, 250, 254, 0.28)"
                strokeDasharray="3 8"
                strokeWidth="1.2"
              />
            ) : null}

            {regionMarkers.map((marker) => {
              const point = projection(marker.coordinates)

              if (!point) {
                return null
              }

              const [x, y] = point
              const style = markerStyle(marker.id, highlighted)

              return (
                <g key={marker.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4.2"
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth="1.4"
                  />
                  <text
                    x={x + 8}
                    y={y - 7}
                    fill={style.text}
                    fontSize="9.5"
                    letterSpacing="0.08em"
                  >
                    {marker.label}
                  </text>
                </g>
              )
            })}

            {europeActive ? (
              <text
                x="255"
                y="178"
                fill="rgba(251, 207, 232, 0.72)"
                fontSize="10"
                letterSpacing="0.18em"
              >
                CONTINENT
              </text>
            ) : null}
          </svg>
        </div>
      </div>
    </section>
  )
}
