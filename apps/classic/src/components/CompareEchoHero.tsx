import { sentenceCase } from '../lib/format'
import type { CompareStoryModel } from '../lib/compare-story'
import type { ComparePanelModel } from '../types/view'

interface CompareEchoHeroProps {
  model: ComparePanelModel
  story: CompareStoryModel
}

function modeLabel(story: CompareStoryModel) {
  if (story.mode === 'curated') {
    return 'Echo story'
  }

  if (story.mode === 'generated') {
    return 'Comparison story'
  }

  return 'Contrast story'
}

export function CompareEchoHero({ model, story }: CompareEchoHeroProps) {
  return (
    <section className="surface-depth reveal-up reveal-delay-2 mt-6 overflow-hidden rounded-[1.65rem] border border-[rgba(214,211,209,0.08)] bg-[linear-gradient(135deg,rgba(243,177,91,0.08),rgba(255,255,255,0.02)_36%,rgba(251,113,133,0.08))] p-5 md:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{modeLabel(story)}</p>
              <h3 className="mt-2 font-display text-2xl text-stone-100 md:text-[2rem]">
                {story.heading}
              </h3>
            </div>
            {story.echoLink ? (
              <span className="rounded-full border border-cyan-300/18 bg-cyan-300/8 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                {Math.round(story.echoLink.confidence * 100)}% confidence
              </span>
            ) : null}
          </div>

          <p className="mt-5 max-w-3xl text-xl leading-8 text-stone-100">{story.claim}</p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300">{story.body}</p>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <article className="rounded-[1.2rem] border border-[rgba(243,177,91,0.18)] bg-black/16 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-100">What returns</p>
              <div className="mt-3 grid gap-2">
                {story.returns.slice(0, 3).map((item) => (
                  <p key={item} className="text-sm leading-6 text-stone-200">
                    {item}
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-[1.2rem] border border-[rgba(251,113,133,0.18)] bg-black/16 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-rose-100">
                What changes this time
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-200">{story.changeLine}</p>
            </article>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-[rgba(214,211,209,0.08)] bg-black/18 p-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">
            The bridge between them
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(140px,0.65fr)_minmax(0,1fr)] md:items-center">
            <article className="rounded-[1.15rem] border border-[rgba(243,177,91,0.18)] bg-[rgba(243,177,91,0.06)] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-amber-100">
                {model.source.period.rangeLabel}
              </p>
              <h4 className="mt-2 text-base leading-6 text-stone-100">{model.source.period.title}</h4>
              <p className="mt-3 text-xs leading-5 text-amber-50/90">{story.sourceEdgeLabel}</p>
            </article>

            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-4 hidden h-[calc(100%-2rem)] w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(243,177,91,0.7),rgba(255,255,255,0.28),rgba(251,113,133,0.7))] md:block" />
              <div className="grid gap-2">
                {(story.bridgeLabels.length ? story.bridgeLabels : ['Shared pressure mix']).map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-[rgba(214,211,209,0.1)] bg-white/7 px-3 py-1.5 text-center text-[10px] uppercase tracking-[0.18em] text-stone-100"
                  >
                    {sentenceCase(label)}
                  </span>
                ))}
              </div>
            </div>

            <article className="rounded-[1.15rem] border border-[rgba(251,113,133,0.18)] bg-[rgba(251,113,133,0.06)] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-rose-100">
                {model.target.period.rangeLabel}
              </p>
              <h4 className="mt-2 text-base leading-6 text-stone-100">{model.target.period.title}</h4>
              <p className="mt-3 text-xs leading-5 text-rose-50/90">{story.targetEdgeLabel}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
