import { useState } from 'react'
import { moments, momentById } from './content'
import { consecutiveGaps, yearLabel } from './engine'
import { Icon } from './Icon'

const candidates = [
  'america',
  'france',
  'haiti',
  'civil-war',
  'flu',
  'crash',
  'un',
  'berlin',
  'finance',
  'covid',
]
export default function CycleLab() {
  const [ids, setIds] = useState(['america', 'civil-war', 'crash', 'finance'])
  const [target, setTarget] = useState(80)
  const gaps = consecutiveGaps(ids.map((id) => momentById[id].year))
  const selected = moments.filter((m) => ids.includes(m.id))
  const hits = gaps.filter((g) => Math.abs(g.gap - target) <= 5).length
  const ceiling = Math.max(
    160,
    Math.ceil(Math.max(0, ...gaps.map((g) => g.gap)) / 40) * 40,
  )
  const height = (value: number) => (value / ceiling) * 175
  return (
    <div className="cycle-lab">
      <div className="lab-heading">
        <div>
          <span className="eyebrow">AN IDEA YOU CAN QUESTION</span>
          <h2>Does history keep a beat?</h2>
          <p>Change the events. Watch the rhythm change.</p>
        </div>
        <span className="data-badge">A SELECTION EXPERIMENT</span>
      </div>
      <div className="cycle-layout">
        <div>
          <div className="cycle-control">
            <span>Suppose the rhythm is</span>
            <strong>
              {target} <small>years</small>
            </strong>
            <input
              type="range"
              aria-label="Proposed cycle length"
              min="20"
              max="120"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            />
          </div>
          <svg
            viewBox="0 0 820 275"
            className="cycle-chart"
            role="img"
            aria-label={
              gaps.length
                ? `Gaps between selected events: ${gaps.map((g) => `${g.gap} years`).join(', ')}. ${hits} of ${gaps.length} within five years of ${target}.`
                : 'Select at least two moments to compare their dates.'
            }
          >
            {[0, ceiling / 4, ceiling / 2, (ceiling * 3) / 4, ceiling].map(
              (v) => (
                <g key={v}>
                  <line
                    x1="45"
                    x2="790"
                    y1={220 - height(v)}
                    y2={220 - height(v)}
                    className="chart-grid"
                  />
                  <text
                    x="30"
                    y={225 - height(v)}
                    className="axis-label"
                    textAnchor="end"
                  >
                    {v}
                  </text>
                </g>
              ),
            )}
            <line
              x1="45"
              x2="790"
              y1={220 - height(target)}
              y2={220 - height(target)}
              stroke="var(--accent)"
              strokeDasharray="6 6"
            />
            <text
              x="785"
              y={211 - height(target)}
              textAnchor="end"
              className="axis-label"
            >
              Proposed {target}-year rhythm
            </text>
            {gaps.map((gap, i) => {
              const w = 700 / Math.max(gaps.length, 1),
                x = 60 + i * w
              return (
                <g key={gap.from}>
                  <rect
                    x={x + w * 0.18}
                    y={220 - height(gap.gap)}
                    width={w * 0.64}
                    height={height(gap.gap)}
                    rx="4"
                    fill={
                      Math.abs(gap.gap - target) <= 5
                        ? 'var(--accent)'
                        : 'var(--chart-muted)'
                    }
                  />
                  <text
                    x={x + w * 0.5}
                    y={210 - height(gap.gap)}
                    textAnchor="middle"
                    className="bar-value"
                  >
                    {gap.gap}
                  </text>
                  <text
                    x={x + w * 0.5}
                    y="245"
                    textAnchor="middle"
                    className="axis-label"
                  >
                    {gap.from}–{gap.to}
                  </text>
                </g>
              )
            })}
            {gaps.length === 0 && (
              <text x="410" y="160" textAnchor="middle" className="bar-value">
                Pick at least two moments to see a gap.
              </text>
            )}
          </svg>
          <div className="cycle-result">
            <Icon name="spark" />
            {gaps.length ? (
              <p>
                <strong>
                  {hits} of {gaps.length} gaps
                </strong>{' '}
                fall within five years of your proposed rhythm.{' '}
                <span>The events you choose change the result.</span>
              </p>
            ) : (
              <p>
                Choose two or more moments. Their dates will reveal the gaps
                between them.
              </p>
            )}
          </div>
        </div>
        <aside className="cycle-events">
          <span className="eyebrow">WHICH MOMENTS COUNT?</span>
          {candidates.map((id) => {
            const m = momentById[id]
            return (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={ids.includes(id)}
                  onChange={() =>
                    setIds((v) =>
                      v.includes(id) ? v.filter((s) => s !== id) : [...v, id],
                    )
                  }
                />
                <span>{m.year}</span>
                {m.title}
              </label>
            )
          })}
          <button
            className="text-button"
            onClick={() => {
              setIds(['america', 'civil-war', 'crash', 'finance'])
              setTarget(80)
            }}
          >
            <Icon name="reset" size={14} />
            Reset experiment
          </button>
        </aside>
      </div>
      <div className="cycle-takeaway">
        <h3>
          Echoes are real comparisons.
          <br />A clockwork history is a bigger claim.
        </h3>
        <p>
          Strauss and Howe’s “Fourth Turning” proposes roughly 80–100-year
          cycles, mainly through an Anglo-American lens. These selected dates
          neither prove nor disprove that full theory. A proper test would
          define crises independently, include other societies, and compare the
          results with chance.
        </p>
      </div>
      <details className="evidence">
        <summary>
          How this experiment works <Icon name="plus" size={16} />
        </summary>
        <p>
          Bars show elapsed years between consecutive selected event start
          dates, not durations or severity. The ±5-year tolerance is an
          adjustable-cycle illustration, not a statistical significance test.
          These events are editorially selected and not an exhaustive crisis
          registry.
        </p>
        <p>
          V1’s British periods were deliberately divided into 80-year bins.
          Those bins cannot independently validate an 80-year cycle. This
          experiment uses event dates instead. It makes selection bias visible
          without claiming a predictive model.
        </p>
        <a
          href="https://en.wikipedia.org/wiki/Strauss%E2%80%93Howe_generational_theory"
          target="_blank"
          rel="noreferrer"
        >
          Read about the theory and its criticism
          <Icon name="external" size={14} />
        </a>
        {selected.map((m) => (
          <a
            key={m.id}
            href={m.sources[0].url}
            target="_blank"
            rel="noreferrer"
          >
            {yearLabel(m.year)} · {m.sources[0].title}
            <Icon name="external" size={14} />
          </a>
        ))}
      </details>
    </div>
  )
}
