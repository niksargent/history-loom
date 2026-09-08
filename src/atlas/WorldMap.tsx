import { useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo'
import { feature } from 'topojson-client'
import landTopology from 'world-atlas/land-110m.json'
import type { Topology } from 'topojson-specification'
import type { Moment } from './types'
import { themes, yearLabel } from './engine'
import { Icon } from './Icon'

const land = feature(
  landTopology as unknown as Topology,
  (landTopology as unknown as Topology).objects.land,
)
const projection = geoNaturalEarth1().fitExtent(
  [
    [25, 15],
    [875, 415],
  ],
  { type: 'Sphere' },
)
const path = geoPath(projection)

export function WorldMap({
  moments,
  selected,
  echoes,
  onSelect,
}: {
  moments: Moment[]
  selected: Moment | null
  echoes: Moment[]
  onSelect: (m: Moment) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [hover, setHover] = useState<string | null>(null)
  const marks = useMemo(
    () =>
      moments.map((moment) => ({
        moment,
        point: projection(moment.coordinates)!,
      })),
    [moments],
  )
  const centre = selected ? projection(selected.coordinates)! : [450, 215]
  const tx = zoom === 1 ? 0 : 450 - centre[0] * zoom
  const ty = zoom === 1 ? 0 : 215 - centre[1] * zoom
  return (
    <div className="world-map">
      <div className="map-caption">
        <span className="live-dot" /> A WORLD OF CONNECTIONS{' '}
        <span className="map-caption-secondary">
          Select a point. Follow a thread.
        </span>
      </div>
      <svg
        viewBox="0 0 900 445"
        className="map-svg"
        aria-label="Interactive atlas of historical moments. Use the moment list below as an alternative."
      >
        <defs>
          <radialGradient id="map-light">
            <stop stopColor="#a1b8bb" stopOpacity=".08" />
            <stop offset="1" stopColor="#a1b8bb" stopOpacity="0" />
          </radialGradient>
          <filter id="point-glow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <ellipse cx="460" cy="220" rx="430" ry="225" fill="url(#map-light)" />
        <g
          transform={`translate(${tx},${ty}) scale(${zoom})`}
          className="map-geography"
        >
          <path d={path(geoGraticule10()) ?? ''} className="map-grid" />
          <path d={path(land) ?? ''} className="map-land" />
          {selected &&
            echoes.map((echo) => {
              const a = projection(selected.coordinates)!,
                b = projection(echo.coordinates)!
              const distance = Math.hypot(a[0] - b[0], a[1] - b[1])
              return (
                <path
                  key={echo.id}
                  d={`M${a} Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - Math.max(35, distance * 0.28)} ${b}`}
                  className="echo-thread"
                  style={{ stroke: themes[selected.theme].color }}
                />
              )
            })}
          {[...marks]
            .sort(
              (a, b) =>
                Number(a.moment.id === selected?.id) -
                Number(b.moment.id === selected?.id),
            )
            .map(({ moment, point: [x, y] }) => {
              const active = moment.id === selected?.id
              const echo = echoes.some((e) => e.id === moment.id)
              return (
                <g
                  key={moment.id}
                  transform={`translate(${x} ${y})`}
                  className={`map-mark ${active ? 'selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${moment.title}, ${yearLabel(moment.year)}, ${moment.place}`}
                  aria-pressed={active}
                  onClick={() => onSelect(moment)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect(moment)
                    }
                  }}
                  onMouseEnter={() => setHover(moment.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(moment.id)}
                  onBlur={() => setHover(null)}
                  style={{ color: themes[moment.theme].color }}
                >
                  <circle r={14 / zoom} fill="transparent" stroke="none" />
                  {(active || echo) && (
                    <circle
                      r={11 / zoom}
                      className={active ? 'map-pulse' : ''}
                      stroke="currentColor"
                      strokeWidth={1 / zoom}
                      opacity=".45"
                      fill="none"
                    />
                  )}
                  <circle
                    r={(active ? 6 : echo ? 4.5 : 3) / zoom}
                    fill="currentColor"
                    stroke="var(--map-water)"
                    strokeWidth={1.5 / zoom}
                  />
                  {active && (
                    <circle
                      r={14 / zoom}
                      fill="currentColor"
                      opacity=".2"
                      filter="url(#point-glow)"
                    />
                  )}
                </g>
              )
            })}
        </g>
        {hover &&
          (() => {
            const mark = marks.find((m) => m.moment.id === hover)
            if (!mark) return null
            const x = Math.max(130, Math.min(770, mark.point[0] * zoom + tx)),
              y = Math.max(35, Math.min(400, mark.point[1] * zoom + ty - 25))
            return (
              <g transform={`translate(${x},${y})`} pointerEvents="none">
                <rect
                  x="-125"
                  y="-21"
                  width="250"
                  height="31"
                  rx="5"
                  fill="var(--panel)"
                  stroke="var(--line)"
                />
                <text textAnchor="middle" y="-1" className="map-tooltip">
                  {mark.moment.title}
                </text>
              </g>
            )
          })()}
        <g className="map-ocean-labels">
          <text x="195" y="270">
            PACIFIC OCEAN
          </text>
          <text x="388" y="245">
            ATLANTIC
          </text>
          <text x="635" y="310">
            INDIAN OCEAN
          </text>
        </g>
      </svg>
      <div className="map-footnote">
        Anchor places · coastlines for orientation · threads show shared themes,
        not travel routes
      </div>
      <div className="map-zoom">
        <button
          aria-label="Zoom out of map"
          disabled={zoom === 1}
          onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
        >
          <Icon name="minus" size={16} />
        </button>
        <button aria-label="Reset map zoom" onClick={() => setZoom(1)}>
          {Math.round(zoom * 100)}%
        </button>
        <button
          aria-label="Zoom into selected place"
          disabled={zoom === 2.5}
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.5))}
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  )
}
