import { sentenceCase } from '../lib/format'
import type { CompareSharedPressureEntry } from '../lib/compare-story'

interface CompareSharedPressureMixProps {
  entries: CompareSharedPressureEntry[]
  selectedPressureId: string | null
}

export function CompareSharedPressureMix({
  entries,
  selectedPressureId,
}: CompareSharedPressureMixProps) {
  const visibleEntries = entries.slice(0, 5)

  if (!visibleEntries.length) {
    return null
  }

  return (
    <section className="surface-depth reveal-up reveal-delay-3 mt-6 rounded-[1.5rem] border border-[rgba(214,211,209,0.07)] bg-black/18 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Shared forces</p>
          <h3 className="mt-2 font-display text-2xl text-stone-100">
            The strongest evidence that these periods belong together
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-6 text-stone-400">
          These are the forces that stay strong in both periods, even when the mood or public language changes.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {visibleEntries.map((entry) => {
          const highlighted = entry.id === selectedPressureId

          return (
            <article
              key={entry.id}
              className={`rounded-[1.15rem] border p-4 transition ${
                highlighted
                  ? 'border-[rgba(255,255,255,0.16)] bg-[linear-gradient(90deg,rgba(243,177,91,0.12),rgba(255,255,255,0.04),rgba(251,113,133,0.12))]'
                  : 'border-[rgba(214,211,209,0.08)] bg-[linear-gradient(90deg,rgba(243,177,91,0.06),rgba(255,255,255,0.02),rgba(251,113,133,0.06))]'
              }`}
            >
              <div className="grid gap-3 md:grid-cols-[80px_minmax(0,1fr)_120px_minmax(0,1fr)_80px] md:items-center">
                <div className="text-left text-sm text-amber-100 md:text-right">{entry.sourceValue}</div>

                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/7">
                    <div
                      className="ml-auto h-full rounded-full bg-amber-300/85"
                      style={{ width: `${entry.sourceValue}%` }}
                    />
                  </div>
                </div>

                <div className="text-center text-[11px] uppercase tracking-[0.18em] text-stone-100">
                  {sentenceCase(entry.label)}
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/7">
                    <div
                      className="h-full rounded-full bg-rose-300/85"
                      style={{ width: `${entry.targetValue}%` }}
                    />
                  </div>
                </div>

                <div className="text-left text-sm text-rose-100">{entry.targetValue}</div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
