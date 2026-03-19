import { useState } from 'react'
import { ComparePanel } from './components/ComparePanel'
import { DetailPanel } from './components/DetailPanel'
import { LoomCanvas } from './components/LoomCanvas'
import { PressureLegend } from './components/PressureLegend'
import {
  getCounterpartIds,
  getLoomDataset,
  getPressureOverlaySeriesById,
} from './lib/loom-data'
import type { DetailViewMode, LoomDensityMode } from './types/view'

function App() {
  const [{ dataset, loadError }] = useState(() => {
    try {
      return { dataset: getLoomDataset(), loadError: null as string | null }
    } catch (error) {
      return {
        dataset: null,
        loadError: error instanceof Error ? error.message : 'Unknown dataset error.',
      }
    }
  })
  const [selectedPeriodId, setSelectedPeriodId] = useState(
    dataset?.periods[dataset.periods.length - 1]?.id ?? '',
  )
  const [selectedPressureId, setSelectedPressureId] = useState<string | null>(null)
  const [showPressureOverlay, setShowPressureOverlay] = useState(true)
  const [showEchoes, setShowEchoes] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(true)
  const [loomDensity, setLoomDensity] = useState<LoomDensityMode>('compact')
  const [detailMode, setDetailMode] = useState<DetailViewMode>('guided')
  const [compareSourceId, setCompareSourceId] = useState<string | null>(null)
  const [compareTargetId, setCompareTargetId] = useState<string | null>(null)
  const [comparePicking, setComparePicking] = useState(false)

  if (!dataset || loadError) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] px-4 py-10 text-stone-100">
        <main className="mx-auto max-w-3xl rounded-[2rem] border border-rose-300/20 bg-rose-300/8 p-8">
          <p className="eyebrow">Application error</p>
          <h1 className="font-display mt-3 text-4xl text-stone-50">
            The History Loom could not load its dataset
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-300">
            The page stayed blank because the app failed before the first render.
            The underlying error is shown below so it can be fixed directly.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-rose-100">
            {loadError ?? 'Dataset unavailable.'}
          </pre>
        </main>
      </div>
    )
  }

  const detail = dataset.selectedDetailsById[selectedPeriodId]
  const compareSourceDetail = compareSourceId
    ? dataset.selectedDetailsById[compareSourceId]
    : null
  const compareDetail =
    compareSourceId && compareTargetId && compareTargetId !== compareSourceId
      ? dataset.selectedDetailsById[compareTargetId]
      : null
  const echoCounterpartIds = showEchoes ? getCounterpartIds(detail) : new Set<string>()
  const selectedPressureSeries = selectedPressureId
    ? getPressureOverlaySeriesById(selectedPressureId)
    : null
  const compareAnchoredToSelected = compareSourceId === selectedPeriodId
  const compareActive = Boolean(compareSourceDetail && compareDetail)
  const questionEntries = [
    {
      id: 'brittle-order',
      label: 'Question',
      title: 'When does order start to feel brittle?',
      body: 'Jump to a low-legitimacy period and trace the stabiliser that begins to fail.',
      periodId: 'p08',
      pressureId: 'institutionalLegitimacy',
      showEchoes: false,
      tone: 'amber',
    },
    {
      id: 'technology-strain',
      label: 'Question',
      title: 'What happens when technology outruns society?',
      body: 'Open the late modern period and follow technological disruption at full force.',
      periodId: 'p12',
      pressureId: 'technologicalDisruption',
      showEchoes: false,
      tone: 'cyan',
    },
    {
      id: 'rhyming-eras',
      label: 'Question',
      title: 'Which distant eras feel strangely alike?',
      body: 'Start from a period rich in curated echoes and let the structural links light up.',
      periodId: 'p12',
      pressureId: null,
      showEchoes: true,
      tone: 'cyan',
    },
    {
      id: 'hope-and-order',
      label: 'Question',
      title: 'When does hope reinforce order?',
      body: 'Move into a higher-cohesion, higher-hope period and trace the stabilising forces together.',
      periodId: 'p09',
      pressureId: 'publicHope',
      showEchoes: false,
      tone: 'amber',
    },
  ] as const

  function clearCompare() {
    setCompareSourceId(null)
    setCompareTargetId(null)
    setComparePicking(false)
  }

  function handleStartComparePick() {
    if (compareAnchoredToSelected && (comparePicking || compareActive)) {
      clearCompare()
      return
    }

    setCompareSourceId(selectedPeriodId)
    setCompareTargetId(null)
    setComparePicking(true)
    setIsDetailOpen(true)
  }

  function handleCompareToPeriod(periodId: string) {
    if (periodId === selectedPeriodId) {
      return
    }

    setCompareSourceId(selectedPeriodId)
    setCompareTargetId(periodId)
    setComparePicking(false)
    setIsDetailOpen(true)
  }

  function handlePeriodSelect(periodId: string) {
    const activeCompareSourceId = compareSourceId ?? selectedPeriodId

    if (comparePicking) {
      if (periodId === activeCompareSourceId) {
        return
      }

      setCompareSourceId(activeCompareSourceId)
      setCompareTargetId(periodId)
      setComparePicking(false)
      setIsDetailOpen(true)
      return
    }

    setSelectedPeriodId(periodId)
    if (periodId === compareSourceId || periodId === compareTargetId) {
      clearCompare()
    }
    setIsDetailOpen(true)
  }

  function handleQuestionEntry(
    periodId: string,
    pressureId: string | null,
    revealEchoes: boolean,
  ) {
    clearCompare()
    setSelectedPeriodId(periodId)
    setSelectedPressureId(pressureId)
    setShowPressureOverlay(true)
    setShowEchoes(revealEchoes)
    setLoomDensity('compact')
    setDetailMode('guided')
    setIsDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-stone-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(55,81,92,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(219,181,108,0.16),_transparent_30%),linear-gradient(180deg,rgba(14,17,18,0.96),rgba(8,10,11,1))]" />

      <main className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-5 md:px-6 lg:px-8">
        <header className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] px-6 py-6 md:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
            <div className="max-w-4xl">
              <p className="eyebrow">Not a timeline. A loom.</p>
              <h1 className="font-display text-4xl leading-tight text-stone-50 md:text-6xl">
                The History Loom
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300 md:text-lg">
                A visualisation of Britain from {dataset.meta.startYear} to{' '}
                {dataset.meta.endYear} as recurring structure: equal periods in the
                foreground, pressure undercurrents beneath, and curated echoes between
                distant eras.
              </p>

              <div className="mt-6 grid gap-3 text-sm text-stone-300 md:grid-cols-3">
                <div className="rounded-[1.4rem] border border-[rgba(214,211,209,0.08)] bg-white/4 px-4 py-4">
                  <p className="eyebrow">Lens</p>
                  <p className="mt-2 font-display text-2xl text-stone-100">
                    {dataset.lens.label}
                  </p>
                  <p className="mt-2 leading-6 text-stone-400">
                    {dataset.lens.periodCount} periods across {dataset.lens.spanLabel}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-[rgba(214,211,209,0.08)] bg-white/4 px-4 py-4">
                  <p className="eyebrow">Dataset</p>
                  <p className="mt-2 font-display text-2xl text-stone-100">
                    {dataset.meta.scope}
                  </p>
                  <p className="mt-2 leading-6 text-stone-400">{dataset.meta.dataset}</p>
                </div>
                <div className="rounded-[1.4rem] border border-[rgba(214,211,209,0.08)] bg-white/4 px-4 py-4">
                  <p className="eyebrow">Method</p>
                  <p className="mt-2 font-display text-2xl text-stone-100">Lens, not law</p>
                  <p className="mt-2 leading-6 text-stone-400">{dataset.lens.note}</p>
                </div>
              </div>
            </div>

            <section className="surface-depth rounded-[1.7rem] border border-[rgba(214,211,209,0.08)] px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <p className="eyebrow">Start With A Question</p>
                  <h2 className="font-display mt-2 text-2xl text-stone-100">
                    Does history repeat itself?
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-stone-400">
                    Enter through a pressure, a pattern, or a structural rhyme.
                    Each prompt below opens the existing dataset in a different way.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {questionEntries.map((entry) => {
                  const isActive =
                    selectedPeriodId === entry.periodId &&
                    selectedPressureId === entry.pressureId &&
                    showEchoes === entry.showEchoes

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() =>
                        handleQuestionEntry(
                          entry.periodId,
                          entry.pressureId,
                          entry.showEchoes,
                        )
                      }
                      className={`rounded-[1.35rem] border px-4 py-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${
                        isActive
                          ? entry.tone === 'amber'
                            ? 'border-[rgba(243,177,91,0.28)] bg-[rgba(243,177,91,0.08)]'
                            : 'border-[rgba(121,219,194,0.28)] bg-[rgba(121,219,194,0.08)]'
                          : 'border-[rgba(214,211,209,0.08)] bg-white/4 hover:border-[rgba(214,211,209,0.14)] hover:bg-white/6'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="eyebrow">{entry.label}</span>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            entry.tone === 'amber'
                              ? 'bg-amber-300/90 shadow-[0_0_14px_rgba(252,211,77,0.35)]'
                              : 'bg-cyan-300/90 shadow-[0_0_14px_rgba(103,232,249,0.35)]'
                          }`}
                        />
                      </div>
                      <h3 className="mt-3 font-display text-xl leading-tight text-stone-100">
                        {entry.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-stone-400">{entry.body}</p>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowPressureOverlay((current) => !current)}
              className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${
                showPressureOverlay
                  ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              {showPressureOverlay ? 'Hide pressure lines' : 'Show pressure lines'}
            </button>
            <button
              type="button"
              onClick={() => setShowEchoes((current) => !current)}
              className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 ${
                showEchoes
                  ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              {showEchoes ? 'Hide echoes' : 'Show echoes'}
            </button>
          </div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.8fr)] xl:items-start">
          <div className="space-y-5">
            <LoomCanvas
              periods={dataset.periods}
              overlaySeries={dataset.pressureOverlaySeries}
              selectedPeriodId={selectedPeriodId}
              selectedPressureId={selectedPressureId}
              comparePicking={comparePicking}
              compareTargetId={compareTargetId}
              compareActive={compareActive}
              showPressureOverlay={showPressureOverlay}
              echoCounterpartIds={echoCounterpartIds}
              showEchoes={showEchoes}
              density={loomDensity}
              onPeriodSelect={handlePeriodSelect}
              onDensityChange={setLoomDensity}
              onPressureSelect={(pressureId) => {
                setSelectedPressureId(pressureId)
                setShowPressureOverlay(true)
              }}
            />

            <PressureLegend
              pressureSeries={dataset.pressureOverlaySeries}
              selectedPressureId={selectedPressureId}
              currentPeriodId={detail.period.id}
              currentPeriodScores={detail.period.pressureScores}
              onPressureSelect={setSelectedPressureId}
            />
          </div>

          <DetailPanel
            detail={detail}
            isOpen={isDetailOpen}
            showEchoes={showEchoes}
            selectedPressureId={selectedPressureId}
            selectedPressureSeries={selectedPressureSeries}
            comparePicking={comparePicking && compareAnchoredToSelected}
            compareActive={compareActive && compareAnchoredToSelected}
            viewMode={detailMode}
            onToggleOpen={() => setIsDetailOpen((current) => !current)}
            onToggleEchoes={() => setShowEchoes((current) => !current)}
            onStartComparePick={handleStartComparePick}
            onCompareToPeriod={handleCompareToPeriod}
            onViewModeChange={setDetailMode}
          />
        </div>

        {compareSourceDetail && compareDetail ? (
          <ComparePanel
            model={{ source: compareSourceDetail, target: compareDetail }}
            selectedPressureId={selectedPressureId}
            selectedPressureLabel={selectedPressureSeries?.label ?? null}
            onClose={clearCompare}
          />
        ) : null}
      </main>
    </div>
  )
}

export default App
