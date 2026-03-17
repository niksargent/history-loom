import type { PressureOverlaySeries } from '../types/view'

interface PressureLegendProps {
  pressureSeries: PressureOverlaySeries[]
  selectedPressureId: string | null
  currentPeriodScores: Record<string, number>
  onPressureSelect: (pressureId: string | null) => void
}

export function PressureLegend({
  pressureSeries,
  selectedPressureId,
  currentPeriodScores,
  onPressureSelect,
}: PressureLegendProps) {
  return (
    <section className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Pressure Field</p>
          <h2 className="font-display text-2xl text-stone-100">Structural forces</h2>
        </div>
        <button
          type="button"
          onClick={() => onPressureSelect(null)}
          className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-300 transition hover:border-white/20 hover:text-stone-100"
        >
          Clear focus
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pressureSeries.map((series) => {
          const isSelected = selectedPressureId === series.id
          const currentValue = currentPeriodScores[series.id]

          return (
            <button
              key={series.id}
              type="button"
              onClick={() => onPressureSelect(series.id)}
              className={`rounded-[1.25rem] border px-4 py-4 text-left transition duration-300 ${
                isSelected
                  ? 'border-amber-300/55 bg-amber-300/7 shadow-[0_18px_60px_rgba(0,0,0,0.25)]'
                  : 'border-white/8 bg-white/3 hover:border-white/16 hover:bg-white/6'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium tracking-[0.02em] text-stone-100">
                    {series.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    {series.description}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] ${
                    series.polarity === 'stress'
                      ? 'bg-amber-300/10 text-amber-200'
                      : 'bg-cyan-300/10 text-cyan-200'
                  }`}
                >
                  {series.polarity}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-stone-500">
                  <span>Current intensity</span>
                  <span>{currentValue}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/7">
                  <div
                    className={`h-full rounded-full ${
                      series.polarity === 'stress' ? 'bg-amber-300/85' : 'bg-cyan-300/85'
                    }`}
                    style={{ width: `${currentValue}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
