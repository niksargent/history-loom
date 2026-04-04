import { formatPopulationCompact } from '../lib/format'
import {
  buildPopulationAreaPath,
  buildPopulationComparisonModel,
  buildPopulationLinePath,
} from '../lib/compare-population'
import type { ComparePanelModel } from '../types/view'

interface PopulationComparisonBandProps {
  model: ComparePanelModel
}

const SOURCE_LINE = 'rgba(243,177,91,0.95)'
const SOURCE_FILL = 'rgba(243,177,91,0.18)'
const TARGET_LINE = 'rgba(251,113,133,0.92)'
const TARGET_FILL = 'rgba(251,113,133,0.16)'
const SHARED_LINE = 'rgba(214,211,209,0.5)'

export function PopulationComparisonBand({ model }: PopulationComparisonBandProps) {
  const comparison = buildPopulationComparisonModel(
    model.source.period,
    model.target.period,
    model.sourcePeriods,
    model.targetPeriods,
  )

  if (!comparison) {
    return null
  }

  const sourceLabel =
    model.source.period.populationLabel ??
    formatPopulationCompact(comparison.source.selectedPoint.value) ??
    `${comparison.source.selectedPoint.value}`
  const targetLabel =
    model.target.period.populationLabel ??
    formatPopulationCompact(comparison.target.selectedPoint.value) ??
    `${comparison.target.selectedPoint.value}`
  const sharedPoints = comparison.source.points

  return (
    <section className="surface-depth reveal-up reveal-delay-2 mt-6 rounded-[1.5rem] border border-[rgba(214,211,209,0.07)] bg-black/18 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Scale through time</p>
          <h3 className="mt-2 font-display text-2xl text-stone-100">How large these histories feel</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em]">
          <span className="rounded-full border border-amber-300/18 bg-amber-300/8 px-3 py-1 text-amber-100">
            {model.source.period.scope}
          </span>
          {comparison.sameHistory ? null : (
            <span className="rounded-full border border-rose-300/18 bg-rose-300/8 px-3 py-1 text-rose-100">
              {model.target.period.scope}
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 max-w-4xl text-sm leading-6 text-stone-300">{comparison.interpretation}</p>

      <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-[rgba(214,211,209,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-stone-500">
          <span>Raw population scale</span>
          <span>{comparison.minLabel} to {comparison.maxLabel}</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-stone-500">
          Each line runs across its own history from earliest period to latest period.
        </p>

        <svg
          viewBox="0 0 1000 220"
          className="mt-4 h-[220px] w-full"
          aria-label="Population growth through time"
          role="img"
        >
          <defs>
            <linearGradient id="compare-pop-source-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SOURCE_FILL} />
              <stop offset="100%" stopColor="rgba(243,177,91,0.01)" />
            </linearGradient>
            <linearGradient id="compare-pop-target-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TARGET_FILL} />
              <stop offset="100%" stopColor="rgba(251,113,133,0.01)" />
            </linearGradient>
          </defs>

          <line
            x1="34"
            y1="190"
            x2="966"
            y2="190"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {comparison.sameHistory ? (
            <>
              <path
                d={buildPopulationAreaPath(sharedPoints)}
                fill="rgba(214,211,209,0.08)"
              />
              <path
                d={buildPopulationLinePath(sharedPoints)}
                fill="none"
                stroke={SHARED_LINE}
                strokeWidth="2.5"
              />
            </>
          ) : (
            <>
              <path
                d={buildPopulationAreaPath(comparison.source.points)}
                fill="url(#compare-pop-source-fill)"
              />
              <path
                d={buildPopulationAreaPath(comparison.target.points)}
                fill="url(#compare-pop-target-fill)"
              />
              <path
                d={buildPopulationLinePath(comparison.source.points)}
                fill="none"
                stroke={SOURCE_LINE}
                strokeWidth="2.5"
              />
              <path
                d={buildPopulationLinePath(comparison.target.points)}
                fill="none"
                stroke={TARGET_LINE}
                strokeWidth="2.5"
              />
            </>
          )}

          <g>
            <line
              x1={comparison.source.selectedPoint.x}
              y1={comparison.source.selectedPoint.y}
              x2={comparison.source.selectedPoint.x}
              y2="190"
              stroke="rgba(243,177,91,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 5"
            />
            <circle
              cx={comparison.source.selectedPoint.x}
              cy={comparison.source.selectedPoint.y}
              r="5"
              fill={SOURCE_LINE}
            />
            <text
              x={comparison.source.selectedPoint.x}
              y={comparison.source.selectedPoint.y < 54 ? comparison.source.selectedPoint.y + 22 : comparison.source.selectedPoint.y - 14}
              textAnchor="middle"
              className="fill-amber-100 text-[12px] uppercase tracking-[0.14em]"
            >
              {sourceLabel}
            </text>
          </g>

          <g>
            <line
              x1={comparison.target.selectedPoint.x}
              y1={comparison.target.selectedPoint.y}
              x2={comparison.target.selectedPoint.x}
              y2="190"
              stroke="rgba(251,113,133,0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 5"
            />
            <circle
              cx={comparison.target.selectedPoint.x}
              cy={comparison.target.selectedPoint.y}
              r="5"
              fill={TARGET_LINE}
            />
            <text
              x={comparison.target.selectedPoint.x}
              y={
                comparison.sameHistory
                  ? comparison.target.selectedPoint.y > 164
                    ? comparison.target.selectedPoint.y - 14
                    : comparison.target.selectedPoint.y + 22
                  : comparison.target.selectedPoint.y > 164
                    ? comparison.target.selectedPoint.y - 14
                    : comparison.target.selectedPoint.y + 22
              }
              textAnchor="middle"
              className="fill-rose-100 text-[12px] uppercase tracking-[0.14em]"
            >
              {targetLabel}
            </text>
          </g>
        </svg>
      </div>
    </section>
  )
}
