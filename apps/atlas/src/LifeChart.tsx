import { useEffect, useMemo, useState } from 'react'
import type { LifeData } from './types'
import { chartSegments, observationAt } from './engine'
import { Icon } from './Icon'

const colors = ['#ddb17b', '#80b9c7', '#b6a1d4', '#a2bc8c']
export default function LifeChart() {
  const [data, setData] = useState<LifeData | null>(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [selected, setSelected] = useState(['OWID_WRL', 'IND', 'JPN'])
  const [year, setYear] = useState(2023)
  const [start, setStart] = useState(1800)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}atlas/life-expectancy.json`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw Error('fetch')
        return r.json()
      })
      .then((d: LifeData) => {
        setData(d)
        setError(false)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(true)
      })
    return () => controller.abort()
  }, [retry])
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(
      () => setYear((y) => Math.min(y + 1, 2023)),
      100,
    )
    return () => clearInterval(timer)
  }, [playing])
  useEffect(() => {
    if (year === 2023 && playing) {
      const timer = window.setTimeout(() => setPlaying(false), 0)
      return () => clearTimeout(timer)
    }
  }, [year, playing])
  const series = useMemo(
    () =>
      selected
        .map((code) => data?.series.find((s) => s.code === code))
        .filter((s) => s !== undefined),
    [selected, data],
  )
  if (error)
    return (
      <div className="empty-state">
        <Icon name="globe" size={32} />
        <h3>The data could not load.</h3>
        <p>
          Your historical journeys still work. Try loading the local data
          snapshot again.
        </p>
        <button
          className="primary-button"
          onClick={() => {
            setError(false)
            setRetry((r) => r + 1)
          }}
        >
          Try again
        </button>
      </div>
    )
  if (!data)
    return (
      <div className="empty-state" role="status">
        <span className="loading-orbit" />
        <p>Opening a window onto longer lives…</p>
      </div>
    )
  const x = (y: number) => 65 + ((y - start) / (2023 - start)) * 870
  const y = (v: number) => 330 - (v / 90) * 280
  const ticks =
    start === 1800
      ? [1800, 1850, 1900, 1950, 2000, 2023]
      : [1950, 1970, 1990, 2010, 2023]
  const preset = (codes: string[], from: number) => {
    setSelected(codes)
    setStart(from)
    setYear(2023)
    setPlaying(false)
  }
  return (
    <div className="life-lab">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">THE PATTERNS WE CAN MEASURE</span>
          <h2>More years to be human.</h2>
          <p>
            History has shocks. It also has transformations that don’t repeat.
          </p>
        </div>
        <span className="data-badge">
          <span className="live-dot" /> OBSERVED ESTIMATES
        </span>
      </div>
      <div className="lab-presets">
        <span>Look through a lens</span>
        <button onClick={() => preset(['OWID_WRL', 'IND', 'JPN'], 1800)}>
          The long view
        </button>
        <button onClick={() => preset(['ZAF', 'RWA', 'CHN'], 1950)}>
          Progress has setbacks
        </button>
        <button onClick={() => preset(['GBR', 'USA', 'BRA'], 1950)}>
          Different journeys
        </button>
      </div>
      <div className="life-chart-layout">
        <div className="life-chart-main">
          <div className="chart-topline">
            <span>Life expectancy at birth · years</span>
            <strong>{year}</strong>
          </div>
          <svg
            viewBox="0 0 1000 375"
            role="img"
            aria-label={`Life expectancy chart, ${start} to ${year}. Exact values for selected places are listed beside the chart.`}
            className="life-chart"
            onPointerMove={(event) => {
              if (playing || event.pointerType === 'touch') return
              const r = event.currentTarget.getBoundingClientRect()
              const relative = ((event.clientX - r.left) / r.width) * 1000
              setYear(
                Math.max(
                  start,
                  Math.min(
                    2023,
                    Math.round(
                      start + ((relative - 65) / 870) * (2023 - start),
                    ),
                  ),
                ),
              )
            }}
          >
            {[0, 20, 40, 60, 80].map((v) => (
              <g key={v}>
                <line
                  x1="65"
                  x2="935"
                  y1={y(v)}
                  y2={y(v)}
                  className="chart-grid"
                />
                <text
                  x="44"
                  y={y(v) + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {v}
                </text>
              </g>
            ))}
            {ticks.map((t) => (
              <text
                key={t}
                x={x(t)}
                y="361"
                textAnchor="middle"
                className="axis-label"
              >
                {t}
              </text>
            ))}
            {series.map((s, i) => {
              const values = s.values.filter((p) => p[0] >= start)
              return (
                <g key={s.code} style={{ color: colors[i] }}>
                  {chartSegments(values).map((segment, index) => (
                    <path
                      key={index}
                      d={segment
                        .map((p, j) => `${j ? 'L' : 'M'}${x(p[0])},${y(p[1])}`)
                        .join(' ')}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      opacity=".27"
                    />
                  ))}
                  {chartSegments(values.filter((p) => p[0] <= year)).map(
                    (segment, index) => (
                      <path
                        key={`a${index}`}
                        d={segment
                          .map(
                            (p, j) => `${j ? 'L' : 'M'}${x(p[0])},${y(p[1])}`,
                          )
                          .join(' ')}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.8"
                      />
                    ),
                  )}
                  {values
                    .filter(
                      (p, j) =>
                        p[0] <= year &&
                        (j === 0 || p[0] - values[j - 1][0] > 1),
                    )
                    .map((p) => (
                      <circle
                        key={p[0]}
                        cx={x(p[0])}
                        cy={y(p[1])}
                        r="2.5"
                        fill="currentColor"
                      />
                    ))}
                  {(() => {
                    const value = observationAt(s, year)
                    return value !== null ? (
                      <>
                        <circle
                          cx={x(year)}
                          cy={y(value)}
                          r="9"
                          fill="currentColor"
                          opacity=".12"
                        />
                        <circle
                          cx={x(year)}
                          cy={y(value)}
                          r="4.5"
                          fill="currentColor"
                        />
                      </>
                    ) : null
                  })()}
                </g>
              )
            })}
            <line
              x1={x(year)}
              x2={x(year)}
              y1="35"
              y2="331"
              className="chart-cursor"
            />
          </svg>
          <div className="chart-playback">
            <button
              className="round-play"
              aria-label={
                playing ? 'Pause history animation' : 'Play history animation'
              }
              onClick={() => {
                if (year >= 2023) setYear(start)
                setPlaying((p) => !p)
              }}
            >
              <Icon name={playing ? 'pause' : 'play'} size={16} />
            </button>
            <label htmlFor="life-year" className="sr-only">
              Year for life expectancy
            </label>
            <input
              id="life-year"
              type="range"
              min={start}
              max="2023"
              value={year}
              onChange={(e) => {
                setPlaying(false)
                setYear(Number(e.target.value))
              }}
            />
            <output>{year}</output>
            <button
              className="text-button"
              onClick={() => {
                setPlaying(false)
                setYear(2023)
              }}
            >
              Latest
            </button>
          </div>
        </div>
        <aside className="chart-countries">
          <span className="eyebrow">YOUR WINDOW ON {year}</span>
          {series.map((s, i) => {
            const value = observationAt(s, year)
            return (
              <div
                key={s.code}
                className="country-value"
                style={{ '--series': colors[i] } as React.CSSProperties}
              >
                <span className="country-dot" />
                <div>
                  <span>{s.entity}</span>
                  <strong>
                    {value !== null ? value.toFixed(1) : '—'}
                    <small>
                      {value !== null ? ' years' : ' no observation'}
                    </small>
                  </strong>
                </div>
                <button
                  aria-label={`Remove ${s.entity}`}
                  disabled={selected.length === 1}
                  onClick={() =>
                    setSelected((v) => v.filter((c) => c !== s.code))
                  }
                >
                  <Icon name="close" size={13} />
                </button>
              </div>
            )
          })}
          <label className="country-select">
            {selected.length < 4 ? 'Add a place' : 'Up to four places at once'}
            <select
              aria-label="Add a country or territory"
              value=""
              disabled={selected.length >= 4}
              onChange={(e) => {
                if (e.target.value) setSelected((s) => [...s, e.target.value])
              }}
            >
              <option value="">
                Choose from {data.series.length - 1} countries & territories
              </option>
              {data.series
                .filter((s) => !selected.includes(s.code))
                .map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.entity}
                  </option>
                ))}
            </select>
          </label>
          <p className="small-note">
            A blank means no observation that year. We don’t fill the gaps with
            guesses.
          </p>
        </aside>
      </div>
      <details className="evidence">
        <summary>
          What does this actually measure? <Icon name="plus" size={16} />
        </summary>
        <p>
          Life expectancy summarises a particular year’s death rates across all
          ages. It is not the age everyone died, or a prediction for a child
          born that year. Reduced child mortality matters, but survival at older
          ages matters too.
        </p>
        <p>
          Lines connect consecutive observed years only. Earlier estimates are
          sparse, geographic definitions can change, and uncertainty is not
          shown as a band because this source does not supply comparable
          intervals. Dips alone do not establish their cause.
        </p>
        <p>
          {data.citation} Snapshot retrieved {data.retrieved}. Values rounded to
          two decimals in the bundled dataset and one decimal in the display.
          Observed estimates end in 2023; no projections are shown.
        </p>
        <a
          href="https://ourworldindata.org/grapher/life-expectancy"
          target="_blank"
          rel="noreferrer"
        >
          Read the data & source methodology
          <Icon name="external" size={14} />
        </a>
        <a
          href={`${import.meta.env.BASE_URL}atlas/life-expectancy.json`}
          download
        >
          Download this data snapshot
          <Icon name="arrow" size={14} />
        </a>
        <p className="small-note">{data.license}</p>
      </details>
    </div>
  )
}
