import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import {
  clusterEras,
  nearestEras,
  pressureDimensions,
  pressureEras,
} from './pressureModel'
import type { PressureEra } from './pressureModel'
import './echoAtlas.css'

const groups = clusterEras(pressureEras)
const colors = ['#82bdc7', '#deb37e', '#b4a0d5', '#97b99d']
const wideHubs = [
  [225, 185],
  [645, 185],
  [225, 485],
  [645, 485],
]
const makeNodes = (hubs: number[][]) =>
  groups.flatMap((g, index) =>
    g.members.map((era, i) => {
      const angle = (i / g.members.length) * Math.PI * 2 - Math.PI / 2
      return {
        era,
        group: index,
        x: hubs[index][0] + Math.cos(angle) * 126,
        y: hubs[index][1] + Math.sin(angle) * 103,
      }
    }),
  )
const eraLabel = (p: PressureEra) =>
  `${p.country} · ${p.startYear}–${p.endYear}`

export default function CycleLab() {
  const [compact, setCompact] = useState(
    () => window.matchMedia('(max-width: 800px)').matches,
  )
  useEffect(() => {
    const media = window.matchMedia('(max-width: 800px)')
    const update = () => setCompact(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const hubs = compact
    ? [
        [225, 160],
        [225, 440],
        [225, 720],
        [225, 1000],
      ]
    : wideHubs
  const nodes = makeNodes(hubs)
  const [selectedKey, setSelected] = useState(
    pressureEras.find((p) => p.country === 'France')!.key,
  )
  const [view, setView] = useState<'groups' | 'time'>('groups')
  const [cross, setCross] = useState(true)
  const [rhythm, setRhythm] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const selected = pressureEras.find((p) => p.key === selectedKey)!
  const nearest = nearestEras(selected, pressureEras, cross).slice(0, 3)
  const active = new Set([selectedKey, ...nearest.map((p) => p.era.key)])
  const chosenNode = nodes.find((n) => n.era.key === selectedKey)!
  const hoverEra = pressureEras.find((p) => p.key === hover)
  const comparison = [selected, ...nearest.map((p) => p.era)]
  const earliest = Math.min(...comparison.map((p) => p.startYear))
  const latest = Math.max(...comparison.map((p) => p.endYear))
  const x = (year: number) =>
    225 + ((year - earliest) / (latest - earliest)) * 580
  const ticks = Array.from(
    { length: 25 },
    (_, i) => selected.startYear + (i - 12) * 80,
  ).filter((y) => y >= earliest && y <= latest)
  return (
    <div className="echo-lab">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">
            THE ORIGINAL LOOM · {pressureEras.length} ERAS
          </span>
          <h2>Echoes across time.</h2>
          <p>
            Similar pressures bring eras together. Their dates tell a different
            story.
          </p>
        </div>
        <span className="data-badge">EDITORIAL SCORES</span>
      </div>
      <div className="echo-toolbar">
        <div className="echo-view" aria-label="View echoes">
          <button
            aria-pressed={view === 'groups'}
            onClick={() => setView('groups')}
          >
            <Icon name="network" size={16} />
            Group by similarity
          </button>
          <button
            aria-pressed={view === 'time'}
            onClick={() => setView('time')}
          >
            <Icon name="route" size={16} />
            Place in time
          </button>
        </div>
        <label>
          <input
            type="checkbox"
            checked={cross}
            onChange={(e) => setCross(e.target.checked)}
          />{' '}
          Compare across countries
        </label>
      </div>
      <div className="echo-layout">
        <div className="echo-visual">
          {view === 'groups' ? (
            <>
              <div className="echo-canvas-scroll">
                <svg
                  viewBox={compact ? '0 0 450 1160' : '0 0 870 620'}
                  className="echo-constellation"
                  aria-label="Four groups of eras with similar editorial scores. Select any point, or use the era selector alongside."
                  role="group"
                >
                  <defs>
                    {colors.map((c, i) => (
                      <radialGradient id={`echo-halo-${i}`} key={c}>
                        <stop stopColor={c} stopOpacity=".11" />
                        <stop offset="1" stopColor={c} stopOpacity="0" />
                      </radialGradient>
                    ))}
                  </defs>
                  {groups.map((g, i) => (
                    <g key={i} className="echo-hub">
                      <ellipse
                        cx={hubs[i][0]}
                        cy={hubs[i][1]}
                        rx="191"
                        ry="148"
                        fill={`url(#echo-halo-${i})`}
                      />
                      <ellipse
                        cx={hubs[i][0]}
                        cy={hubs[i][1]}
                        rx="126"
                        ry="103"
                        fill="none"
                        stroke={colors[i]}
                        strokeOpacity=".2"
                      />
                      <text
                        x={hubs[i][0]}
                        y={hubs[i][1] - 22}
                        textAnchor="middle"
                        className="echo-group-number"
                      >
                        GROUP {i + 1} · {g.members.length} ERAS
                      </text>
                      {[...pressureDimensions]
                        .map((d, j) => ({ label: d[1], value: g.center[j] }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 2)
                        .map((d, j) => (
                          <text
                            key={d.label}
                            x={hubs[i][0]}
                            y={hubs[i][1] + 3 + j * 21}
                            textAnchor="middle"
                            className="echo-group-label"
                          >
                            {d.label}
                          </text>
                        ))}
                    </g>
                  ))}
                  {nearest.map(({ era }) => {
                    const n = nodes.find((n) => n.era.key === era.key)!
                    return (
                      <path
                        key={era.key}
                        d={`M${chosenNode.x},${chosenNode.y} Q${compact ? 225 : 435},${compact ? (chosenNode.y + n.y) / 2 : 330} ${n.x},${n.y}`}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.8"
                        strokeOpacity=".7"
                        strokeDasharray="4 5"
                      />
                    )
                  })}
                  {nodes.map((n) => (
                    <g
                      key={n.era.key}
                      role="button"
                      tabIndex={0}
                      aria-pressed={n.era.key === selectedKey}
                      aria-label={`${eraLabel(n.era)} · ${n.era.title}`}
                      className="echo-node"
                      onClick={() => setSelected(n.era.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelected(n.era.key)
                        }
                      }}
                      onMouseEnter={() => setHover(n.era.key)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(n.era.key)}
                      onBlur={() => setHover(null)}
                      style={{ color: colors[n.group] }}
                    >
                      <title>
                        {eraLabel(n.era)} · {n.era.title}
                      </title>
                      <circle cx={n.x} cy={n.y} r="21" fill="transparent" />
                      {active.has(n.era.key) && (
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={n.era.key === selectedKey ? 17 : 13}
                          fill="none"
                          stroke="currentColor"
                          strokeOpacity=".7"
                        />
                      )}
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={n.era.key === selectedKey ? 8 : 5.5}
                        fill="currentColor"
                        opacity={active.has(n.era.key) ? 1 : 0.5}
                      />
                      <text
                        className="echo-node-year"
                        x={
                          n.x +
                          (n.x > hubs[n.group][0] + 5
                            ? 18
                            : n.x < hubs[n.group][0] - 5
                              ? -18
                              : 0)
                        }
                        y={
                          n.y +
                          (Math.abs(n.x - hubs[n.group][0]) < 5
                            ? n.y < hubs[n.group][1]
                              ? -23
                              : 30
                            : 4)
                        }
                        textAnchor={
                          n.x > hubs[n.group][0] + 5
                            ? 'start'
                            : n.x < hubs[n.group][0] - 5
                              ? 'end'
                              : 'middle'
                        }
                      >
                        {n.era.startYear}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              <p className="echo-position-note">
                Groups use scores only. Ring positions are arranged for
                readability.
              </p>
              <div className="echo-hover" aria-live="polite">
                {hoverEra ? (
                  <>
                    <strong>{eraLabel(hoverEra)}</strong>
                    <span>{hoverEra.title}</span>
                  </>
                ) : (
                  <>
                    <strong>Select an era to trace its closest echoes.</strong>
                    <span>
                      Ring labels name each group's two highest average scores.
                    </span>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="echo-time-view">
              <div className="echo-time-heading">
                <h3>The same comparisons, in time.</h3>
                <label>
                  <input
                    type="checkbox"
                    checked={rhythm}
                    onChange={(e) => setRhythm(e.target.checked)}
                  />{' '}
                  Show 80-year steps
                </label>
              </div>
              <div className="echo-canvas-scroll">
                <svg
                  viewBox="0 0 870 590"
                  className="echo-timeline"
                  role="img"
                  aria-label={`Era durations and start-date gaps from ${selected.startYear}. ${nearest.map((n) => `${eraLabel(n.era)}: ${Math.abs(n.era.startYear - selected.startYear)} years apart`).join('; ')}`}
                >
                  {rhythm &&
                    ticks.map((y) => (
                      <g key={y}>
                        <line
                          x1={x(y)}
                          x2={x(y)}
                          y1="40"
                          y2="515"
                          stroke="var(--accent)"
                          strokeOpacity=".3"
                          strokeDasharray="4 5"
                        />
                        <text
                          x={x(y)}
                          y="33"
                          textAnchor="middle"
                          className="axis-label"
                        >
                          {y}
                        </text>
                      </g>
                    ))}
                  {comparison.map((era, i) => (
                    <g key={era.key}>
                      <text x="20" y={106 + i * 116} className="echo-era-label">
                        {era.country}
                      </text>
                      <text x="20" y={130 + i * 116} className="axis-label">
                        {era.startYear}–{era.endYear}
                      </text>
                      <line
                        x1="225"
                        x2="805"
                        y1={117 + i * 116}
                        y2={117 + i * 116}
                        className="chart-grid"
                      />
                      <rect
                        x={x(era.startYear)}
                        y={106 + i * 116}
                        width={Math.max(3, x(era.endYear) - x(era.startYear))}
                        height="22"
                        rx="7"
                        fill={
                          i === 0
                            ? 'var(--accent)'
                            : colors[
                                nodes.find((n) => n.era.key === era.key)!.group
                              ]
                        }
                        opacity=".75"
                      />
                      {i > 0 && (
                        <text
                          x={x(era.startYear)}
                          y={96 + i * 116}
                          className="echo-gap-label"
                          textAnchor={x(era.startYear) > 680 ? 'end' : 'start'}
                        >
                          {Math.abs(era.startYear - selected.startYear)} years
                          apart
                        </text>
                      )}
                    </g>
                  ))}
                  <text x="225" y="555" className="axis-label">
                    {earliest}
                  </text>
                  <text x="805" y="555" textAnchor="end" className="axis-label">
                    {latest}
                  </text>
                </svg>
              </div>
              <p>
                Bars show the full eras. Gaps compare their starting years, not
                dates of identical events.
              </p>
            </div>
          )}
        </div>
        <aside className="echo-detail">
          <label htmlFor="echo-era">Choose an era</label>
          <select
            id="echo-era"
            value={selectedKey}
            onChange={(e) => setSelected(e.target.value)}
          >
            {pressureEras.map((p) => (
              <option key={p.key} value={p.key}>
                {eraLabel(p)} · {p.title}
              </option>
            ))}
          </select>
          <span className="eyebrow">
            {selected.country} · {selected.startYear}–{selected.endYear}
          </span>
          <h3>{selected.title}</h3>
          <p>{selected.summary}</p>
          <div className="echo-mini-scores">
            {pressureDimensions.map(([key, label], i) => (
              <div key={key}>
                <span>{label}</span>
                <meter
                  min="0"
                  max="100"
                  value={selected.scores[i]}
                  aria-label={label}
                />
                <b>{selected.scores[i]}</b>
              </div>
            ))}
          </div>
          <span className="eyebrow">
            THREE CLOSEST {cross ? 'CROSS-COUNTRY ' : ''}COMPARISONS
          </span>
          {nearest.map(({ era, distance }) => (
            <button
              className="echo-match"
              key={era.key}
              onClick={() => setSelected(era.key)}
            >
              <span>{eraLabel(era)}</span>
              <strong>{era.title}</strong>
              <small>
                {Math.abs(era.startYear - selected.startYear)} years apart{' '}
                <b>·</b> {distance.toFixed(1)} score points apart
              </small>
              <Icon name="arrow" size={16} />
            </button>
          ))}
        </aside>
      </div>
      <details className="evidence">
        <summary>
          What the groups mean <Icon name="plus" size={16} />
        </summary>
        <p>
          These are the same six editorial scores used in History’s
          fingerprints. Four groups are calculated from all{' '}
          {pressureEras.length} eras using equal-weight k-means, with
          deterministic starting points. Four is a display choice, not a
          discovery that history has four natural types. Dates and country do
          not determine group membership.
        </p>
        <p>
          The three closest comparisons use mean absolute score difference,
          exactly as in the fingerprint view. A smaller difference means more
          similar assigned scores, not a higher probability of a repeat.
          Comparisons may cross group boundaries. The country filter affects
          comparisons, not the groups.
        </p>
        <p>
          Unequal era lengths and editorial judgments limit what this can
          establish. Britain's eras were deliberately placed into 80-year
          blocks. Starting-year gaps can show that similar assigned pressures
          appear at different intervals in this collection; they cannot
          independently prove or disprove a historical cycle. The optional
          80-year lines are a ruler anchored to your selected era, not a
          forecast.
        </p>
      </details>
    </div>
  )
}
