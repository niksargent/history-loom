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

type EntryTab = 'question' | 'force' | 'pattern'
type EntryTone = 'amber' | 'cyan'

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
  const [activeEchoLinkId, setActiveEchoLinkId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(true)
  const [loomDensity, setLoomDensity] = useState<LoomDensityMode>('compact')
  const [detailMode, setDetailMode] = useState<DetailViewMode>('guided')
  const [entryTab, setEntryTab] = useState<EntryTab>('question')
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
  const activeEcho =
    detail.echoes.find((echo) => echo.link.id === activeEchoLinkId) ?? detail.echoes[0] ?? null
  const activeEchoCounterpartId = showEchoes ? activeEcho?.counterpart.id ?? null : null
  const compareAnchoredToSelected = compareSourceId === selectedPeriodId
  const compareActive = Boolean(compareSourceDetail && compareDetail)
  const uniqueEchoCount = new Set(
    Object.values(dataset.selectedDetailsById).flatMap((item) =>
      item.echoes.map((echo) => echo.link.id),
    ),
  ).size
  const dominantStress =
    detail.pressureSnapshots.find((pressure) => pressure.polarity === 'stress') ?? null
  const dominantStabiliser =
    detail.pressureSnapshots.find((pressure) => pressure.polarity === 'stabiliser') ?? null
  const stressSnapshots = detail.pressureSnapshots.filter(
    (pressure) => pressure.polarity === 'stress',
  )
  const stabiliserSnapshots = detail.pressureSnapshots.filter(
    (pressure) => pressure.polarity === 'stabiliser',
  )
  const stressMean = Math.round(
    stressSnapshots.reduce((sum, pressure) => sum + pressure.value, 0) /
      Math.max(stressSnapshots.length, 1),
  )
  const stabiliserMean = Math.round(
    stabiliserSnapshots.reduce((sum, pressure) => sum + pressure.value, 0) /
      Math.max(stabiliserSnapshots.length, 1),
  )
  const periodFingerprint = [
    {
      label: 'Cohesion',
      value: detail.period.cohesionLevel,
      toneClass: 'bg-cyan-300/80',
      labelClass: 'text-cyan-100',
    },
    {
      label: 'Legitimacy',
      value: detail.period.legitimacyLevel,
      toneClass: 'bg-cyan-300/60',
      labelClass: 'text-cyan-100/90',
    },
    {
      label: 'Inequality',
      value: detail.period.inequalityLevel,
      toneClass: 'bg-amber-300/80',
      labelClass: 'text-amber-100',
    },
  ] as const
  const liveModeLabel = comparePicking
    ? 'Choose a comparison period on the loom.'
    : showEchoes
      ? 'Echo links are active.'
      : selectedPressureSeries
        ? `${selectedPressureSeries.label} is active.`
        : showPressureOverlay
          ? 'Pressure lines are visible.'
          : 'Overview view.'
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
  const forceEntries = [
    {
      id: 'institutionalLegitimacy',
      title: 'Institutional legitimacy',
      body: 'Track when accepted order holds and when it thins out.',
      tone: 'cyan',
    },
    {
      id: 'technologicalDisruption',
      title: 'Technological disruption',
      body: 'Follow moments when new systems outrun settled life.',
      tone: 'amber',
    },
    {
      id: 'inequality',
      title: 'Inequality',
      body: 'See how concentrated advantage reshapes eras from above.',
      tone: 'amber',
    },
    {
      id: 'publicHope',
      title: 'Public hope',
      body: 'Look for periods where confidence stabilises the whole field.',
      tone: 'cyan',
    },
  ] as const
  const patternEntries = [
    {
      id: 'pattern-brittle',
      title: 'Brittle order',
      body: 'Accepted rule starts to thin out and the centre begins to wobble.',
      periodId: 'p08',
      pressureId: 'institutionalLegitimacy',
      showEchoes: false,
      tone: 'amber',
    },
    {
      id: 'pattern-shock',
      title: 'System shock',
      body: 'Heavy change rewrites labour, security, and the social bargain.',
      periodId: 'p10',
      pressureId: 'economicPrecarity',
      showEchoes: false,
      tone: 'amber',
    },
    {
      id: 'pattern-rhyme',
      title: 'Deep rhyme',
      body: 'A structurally resonant era with strong curated echoes into another time.',
      periodId: 'p12',
      pressureId: null,
      showEchoes: true,
      tone: 'cyan',
    },
    {
      id: 'pattern-settlement',
      title: 'Renewed settlement',
      body: 'Hope and legitimacy rise together and steady the wider field.',
      periodId: 'p09',
      pressureId: 'institutionalLegitimacy',
      showEchoes: false,
      tone: 'cyan',
    },
  ] as const
  const entryTabs = [
    { id: 'question', label: 'Question' },
    { id: 'force', label: 'Force' },
    { id: 'pattern', label: 'Pattern' },
  ] as const

  function getEntryCardClass(isActive: boolean, tone: EntryTone) {
    if (isActive) {
      return tone === 'amber'
        ? 'border-[rgba(243,177,91,0.28)] bg-[rgba(243,177,91,0.08)]'
        : 'border-[rgba(121,219,194,0.28)] bg-[rgba(121,219,194,0.08)]'
    }

    return 'border-[rgba(214,211,209,0.08)] bg-white/4 hover:border-[rgba(214,211,209,0.14)] hover:bg-white/6'
  }

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
    setActiveEchoLinkId(null)
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
    setActiveEchoLinkId(null)
    setLoomDensity('compact')
    setDetailMode('guided')
    setIsDetailOpen(true)
  }

  function handleForceEntry(pressureId: string) {
    const pressure = dataset?.pressureOverlaySeries.find((series) => series.id === pressureId)
    const periodId = pressure?.peaks[0] ?? selectedPeriodId

    clearCompare()
    setSelectedPeriodId(periodId)
    setSelectedPressureId(pressureId)
    setShowPressureOverlay(true)
    setShowEchoes(false)
    setActiveEchoLinkId(null)
    setLoomDensity('compact')
    setDetailMode('guided')
    setIsDetailOpen(true)
  }

  function handleFocusEcho(echoId: string) {
    setShowEchoes(true)
    setActiveEchoLinkId(echoId)
    setIsDetailOpen(true)
  }

  function handleFollowEcho(periodId: string) {
    clearCompare()
    setSelectedPeriodId(periodId)
    setShowEchoes(true)
    setActiveEchoLinkId(null)
    setIsDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-stone-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(55,81,92,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(219,181,108,0.16),_transparent_30%),linear-gradient(180deg,rgba(14,17,18,0.96),rgba(8,10,11,1))]" />

      <main className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-5 md:px-6 lg:px-8">
        <header className="glass-panel rounded-[2rem] border border-[rgba(214,211,209,0.08)] px-6 py-6 md:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
            <div className="max-w-4xl">
              <p className="eyebrow">Not a timeline. A loom.</p>
              <h1 className="font-display text-4xl leading-tight text-stone-50 md:text-6xl">
                The History Loom
              </h1>
              <h2 className="font-display mt-5 max-w-3xl text-2xl leading-tight text-stone-200 md:text-4xl">
                Does history repeat itself, or do pressures, moods, and institutions only rhyme?
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300 md:text-lg">
                A visualisation of Britain from {dataset.meta.startYear} to{' '}
                {dataset.meta.endYear} as recurring structure: equal periods in the
                foreground, pressure undercurrents beneath, and curated echoes between
                distant eras.
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <section className="surface-depth rounded-[1.35rem] border border-[rgba(214,211,209,0.08)] px-4 py-4">
                  <p className="eyebrow">Field</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                        Lens
                      </p>
                      <p className="mt-1 font-display text-xl text-stone-100">
                        {dataset.lens.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                        Echoes
                      </p>
                      <p className="mt-1 font-display text-xl text-stone-100">
                        {uniqueEchoCount}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-stone-400">{dataset.lens.note}</p>
                </section>

                <section className="surface-depth rounded-[1.35rem] border border-[rgba(214,211,209,0.08)] px-4 py-4">
                  <p className="eyebrow">Current focus</p>
                  <h3 className="mt-2 font-display text-2xl leading-tight text-stone-100">
                    {detail.period.title}
                  </h3>
                  <p className="mt-1 text-sm uppercase tracking-[0.22em] text-stone-500">
                    {detail.period.rangeLabel}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-stone-300">{liveModeLabel}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-400">{detail.period.summary}</p>
                </section>
              </div>
            </div>

            <div className="space-y-3">
              <section className="surface-depth rounded-[1.7rem] border border-[rgba(214,211,209,0.08)] px-5 py-5 md:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="eyebrow">Start with a...</p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      Choose a way into the same field
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entryTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setEntryTab(tab.id)}
                        className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
                          entryTab === tab.id
                            ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                            : 'text-stone-300 hover:text-stone-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {entryTab === 'question'
                    ? questionEntries.map((entry) => {
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
                            className={`rounded-[1.25rem] border px-4 py-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${getEntryCardClass(
                              isActive,
                              entry.tone,
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="eyebrow">Question</span>
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
                            <p className="mt-2 text-sm leading-6 text-stone-400">{entry.body}</p>
                          </button>
                        )
                      })
                    : null}

                  {entryTab === 'force'
                    ? forceEntries.map((entry) => {
                        const isActive = selectedPressureId === entry.id

                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => handleForceEntry(entry.id)}
                            className={`rounded-[1.15rem] border px-4 py-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${getEntryCardClass(
                              isActive,
                              entry.tone,
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                                  Force
                                </p>
                                <h3 className="mt-1 font-display text-lg leading-tight text-stone-100">
                                  {entry.title}
                                </h3>
                                <p className="mt-1.5 text-sm leading-6 text-stone-400">
                                  {entry.body}
                                </p>
                              </div>
                              <span
                                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                  entry.tone === 'amber'
                                    ? 'bg-amber-300/90 shadow-[0_0_14px_rgba(252,211,77,0.35)]'
                                    : 'bg-cyan-300/90 shadow-[0_0_14px_rgba(103,232,249,0.35)]'
                                }`}
                              />
                            </div>
                          </button>
                        )
                      })
                    : null}

                  {entryTab === 'pattern'
                    ? patternEntries.map((entry) => {
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
                            className={`rounded-[1.25rem] border px-4 py-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${getEntryCardClass(
                              isActive,
                              entry.tone,
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="eyebrow">Pattern</span>
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
                            <p className="mt-2 text-sm leading-6 text-stone-400">{entry.body}</p>
                          </button>
                        )
                      })
                    : null}
                </div>
              </section>

              <div className="grid gap-3 md:grid-cols-2">
                <section className="surface-depth rounded-[1.35rem] border border-[rgba(214,211,209,0.08)] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">Fingerprint</p>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                      {dataset.meta.scope}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {periodFingerprint.map((metric) => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className={metric.labelClass}>{metric.label}</span>
                          <span className="text-stone-400">{metric.value}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                          <div
                            className={`h-full rounded-full ${metric.toneClass}`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="surface-depth rounded-[1.35rem] border border-[rgba(214,211,209,0.08)] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">Pressure balance</p>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                      {detail.echoes.length} echo{detail.echoes.length === 1 ? '' : 'es'}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <div className="rounded-[1rem] border border-[rgba(243,177,91,0.12)] bg-[rgba(243,177,91,0.05)] px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-amber-100">
                        Stress
                      </p>
                      <p className="mt-2 font-display text-2xl text-stone-100">{stressMean}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-400">
                        {dominantStress?.label ?? 'No stress signal'}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[rgba(121,219,194,0.12)] bg-[rgba(121,219,194,0.05)] px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100">
                        Stabiliser
                      </p>
                      <p className="mt-2 font-display text-2xl text-stone-100">
                        {stabiliserMean}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-stone-400">
                        {selectedPressureSeries?.label ??
                          dominantStabiliser?.label ??
                          'No stabiliser signal'}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
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
              activeEchoCounterpartId={activeEchoCounterpartId}
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
            activeEchoLinkId={activeEchoLinkId}
            viewMode={detailMode}
            onToggleOpen={() => setIsDetailOpen((current) => !current)}
            onToggleEchoes={() => setShowEchoes((current) => !current)}
            onFocusEcho={handleFocusEcho}
            onFollowEcho={handleFollowEcho}
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
