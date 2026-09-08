import { useMemo, useState } from 'react'
import britain from '../../data/periods.json'
import france from '../../data/france/periods.json'
import germany from '../../data/germany/periods.json'
import usa from '../../data/usa/periods.json'
import { Icon } from './Icon'

const dimensions = [
  ['inequality', 'Unequal wealth'],
  ['economicPrecarity', 'Making ends meet'],
  ['technologicalDisruption', 'New technology'],
  ['institutionalLegitimacy', 'Trust in the rules'],
  ['publicHope', 'Hope for tomorrow'],
  ['militarization', 'Military pressure'],
] as const
const periods = [
  ...britain.map((p) => ({ ...p, key: `gb-${p.id}`, country: 'Britain' })),
  ...france.map((p) => ({ ...p, key: `fr-${p.id}`, country: 'France' })),
  ...germany.map((p) => ({ ...p, key: `de-${p.id}`, country: 'Germany' })),
  ...usa.map((p) => ({ ...p, key: `us-${p.id}`, country: 'United States' })),
]
type Period = (typeof periods)[number]
const score = (p: Period, k: string) =>
  (p.pressureScores as Record<string, number>)[k]
const complete = (p: Period) =>
  dimensions.every(([key]) => Number.isFinite(score(p, key)))
const summary = (p: Period) =>
  'publicSummary' in p ? String(p.publicSummary) : p.summary
const eligible = periods.filter(complete)

export default function FingerprintLab() {
  const [key, setKey] = useState(
    eligible.find((p) => p.country === 'France')?.key ?? eligible[0].key,
  )
  const [cross, setCross] = useState(true)
  const selected = eligible.find((p) => p.key === key) ?? eligible[0]
  const match = useMemo(
    () =>
      eligible
        .filter(
          (p) =>
            p.key !== selected.key &&
            (!cross || p.country !== selected.country),
        )
        .map((p) => ({
          period: p,
          distance:
            dimensions.reduce(
              (sum, [k]) => sum + Math.abs(score(p, k) - score(selected, k)),
              0,
            ) / dimensions.length,
        }))
        .sort(
          (a, b) =>
            a.distance - b.distance || a.period.startYear - b.period.startYear,
        )[0],
    [selected, cross],
  )
  const other = match.period
  const point = (value: number, i: number): [number, number] => [
    260 + Math.sin((i * Math.PI) / 3) * value * 1.65,
    218 - Math.cos((i * Math.PI) / 3) * value * 1.65,
  ]
  const shape = (p: Period) =>
    dimensions.map(([k], i) => point(score(p, k), i).join(',')).join(' ')
  const closest = [...dimensions]
    .sort(
      ([a], [b]) =>
        Math.abs(score(selected, a) - score(other, a)) -
        Math.abs(score(selected, b) - score(other, b)),
    )
    .slice(0, 2)
  return (
    <div className="fingerprint-lab">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">A NEW WINDOW INTO THE ORIGINAL LOOM</span>
          <h2>Different years. Familiar pressures.</h2>
          <p>
            Choose an era. We’ll find the closest shape in v1’s editorial
            scores.
          </p>
        </div>
        <span className="data-badge">INTERPRETATION, NOT MEASUREMENT</span>
      </div>
      <div className="fingerprint-controls">
        <label>
          Start somewhere
          <select
            aria-label="Choose an era to compare"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          >
            {eligible.map((p) => (
              <option key={p.key} value={p.key}>
                {p.country} · {p.startYear}–{p.endYear} · {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={cross}
            onChange={(e) => setCross(e.target.checked)}
          />
          Find an echo in another country
        </label>
      </div>
      <div className="fingerprint-layout">
        <div className="fingerprint-period source-period">
          <span className="eyebrow">YOUR STARTING POINT</span>
          <span className="fingerprint-date">
            {selected.startYear}
            <small>–{selected.endYear}</small>
          </span>
          <span className="country-name">{selected.country}</span>
          <h3>{selected.title}</h3>
          <p>{summary(selected)}</p>
        </div>
        <svg
          viewBox="0 0 520 445"
          role="img"
          aria-label="Six-axis comparison of editorial scores. Exact scores are available in the evidence section."
          className="fingerprint-chart"
        >
          {[20, 40, 60, 80, 100].map((v) => (
            <polygon
              key={v}
              points={dimensions.map((_, i) => point(v, i).join(',')).join(' ')}
              className="radar-grid"
            />
          ))}
          {dimensions.map(([, label], i) => {
            const p = point(100, i),
              t = point(119, i)
            return (
              <g key={label}>
                <line
                  x1="260"
                  y1="218"
                  x2={p[0]}
                  y2={p[1]}
                  className="radar-grid"
                />
                <text
                  x={t[0]}
                  y={t[1] + 4}
                  textAnchor="middle"
                  className="radar-label"
                >
                  {label}
                </text>
              </g>
            )
          })}
          <polygon
            points={shape(selected)}
            fill="#ddb17b"
            fillOpacity=".16"
            stroke="#ddb17b"
            strokeWidth="2"
          />
          <polygon
            points={shape(other)}
            fill="#81bcc7"
            fillOpacity=".15"
            stroke="#81bcc7"
            strokeWidth="2"
          />
          {dimensions.map(([k], i) => {
            const a = point(score(selected, k), i),
              b = point(score(other, k), i)
            return (
              <g key={k}>
                <circle cx={a[0]} cy={a[1]} r="3" fill="#ddb17b" />
                <circle cx={b[0]} cy={b[1]} r="3" fill="#81bcc7" />
              </g>
            )
          })}
        </svg>
        <div className="fingerprint-period match-period">
          <span className="eyebrow">CLOSEST EDITORIAL SHAPE</span>
          <span className="fingerprint-date">
            {other.startYear}
            <small>–{other.endYear}</small>
          </span>
          <span className="country-name">{other.country}</span>
          <h3>{other.title}</h3>
          <p>{summary(other)}</p>
          <button className="text-button" onClick={() => setKey(other.key)}>
            Follow this era
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
      <div className="fingerprint-insight">
        <Icon name="network" />
        <p>
          The closest scores are for{' '}
          <strong>
            {closest.map(([, label]) => label.toLowerCase()).join(' and ')}
          </strong>
          . Does that similarity help explain these eras—or hide what makes them
          different?
        </p>
      </div>
      <details className="evidence">
        <summary>
          See the scores and how we match them <Icon name="plus" size={16} />
        </summary>
        <p>
          These 0–100 scores were assigned in v1, not measured by a statistical
          agency. We reuse them without changing them. The closest shape
          minimises mean absolute difference across the six displayed
          dimensions, with equal weights. Only periods with all six scores are
          eligible. This does not establish equivalent lived experience or
          predict future events.
        </p>
        <table>
          <thead>
            <tr>
              <th>Editorial dimension</th>
              <th>
                {selected.country} {selected.startYear}
              </th>
              <th>
                {other.country} {other.startYear}
              </th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map(([k, label]) => (
              <tr key={k}>
                <td>{label}</td>
                <td>{score(selected, k)}</td>
                <td>{score(other, k)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          The original British periods use fixed 80-year bins. Period duration,
          geographic coverage, and editorial judgement affect this comparison.{' '}
          {eligible.length} periods are available across four regional datasets.
        </p>
        <a
          href={`${import.meta.env.BASE_URL}index.html`}
          target="_blank"
          rel="noreferrer"
        >
          Explore the original History Loom
          <Icon name="external" size={14} />
        </a>
      </details>
    </div>
  )
}
