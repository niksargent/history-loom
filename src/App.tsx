import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { DetailPanel } from './components/DetailPanel'
import { ForceExplorer } from './components/ForceExplorer'
import { LoomCanvas } from './components/LoomCanvas'
import {
  getDatasetRegistry,
  getCounterpartIds,
  getLoomDataset,
} from './lib/loom-data'
import type { LoomDataset, PressureOverlaySeries, PressureSnapshot } from './types/view'
import type { DetailViewMode, LoomDensityMode } from './types/view'
import type { DatasetVisualTheme } from './types/domain'

const ComparePanel = lazy(() =>
  import('./components/ComparePanel').then((module) => ({
    default: module.ComparePanel,
  })),
)

const InMotionRacePanel = lazy(() =>
  import('./components/InMotionRacePanel').then((module) => ({
    default: module.InMotionRacePanel,
  })),
)

type EntryTab = 'question' | 'force' | 'pattern'
type EntryTone = 'amber' | 'cyan'

const plannedDatasets = [
  'Scotland',
  'Britain before 1066',
  'Roman world',
  'Germany, 1815-2025',
  'India, 1757-2025',
  'Japan, 1603-2025',
  'Mexico, 1810-2025',
  'Russia / USSR, 1861-2025',
] as const

const defaultBackgroundTheme: DatasetVisualTheme = {
  light: 'rgba(244,241,233,0.78)',
  cool: 'rgba(87,126,138,0.24)',
  warm: 'rgba(196,176,136,0.1)',
  contrast: 'rgba(176,160,132,0.12)',
  glow: 'rgba(172,164,148,0.12)',
  baseTop: 'rgba(70,76,80,0.98)',
  baseMid: 'rgba(44,48,51,0.98)',
  baseBottom: 'rgba(12,14,15,1)',
}

function buildDatasetBackground(datasetId: string, theme?: DatasetVisualTheme) {
  const palette = theme ?? defaultBackgroundTheme

  if (datasetId === 'united-states-1776-2025') {
    return [
      `radial-gradient(circle at 82% 6%, ${palette.light}, rgba(245, 240, 229, 0.34) 16%, transparent 42%)`,
      `radial-gradient(circle at 14% 18%, ${palette.cool}, transparent 34%)`,
      `radial-gradient(circle at 72% 34%, ${palette.warm}, transparent 28%)`,
      `radial-gradient(circle at 18% 78%, ${palette.contrast}, transparent 26%)`,
      `radial-gradient(circle at 88% 68%, ${palette.glow}, transparent 24%)`,
      `linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent 34%)`,
      `linear-gradient(180deg, ${palette.baseTop} 0%, ${palette.baseMid} 30%, rgba(18, 22, 28, 1) 58%, ${palette.baseBottom} 100%)`,
    ].join(', ')
  }

  if (datasetId === 'france-1789-2025') {
    return [
      `radial-gradient(circle at 54% 4%, ${palette.light}, rgba(245, 241, 235, 0.3) 18%, transparent 44%)`,
      `radial-gradient(circle at 18% 22%, ${palette.cool}, transparent 32%)`,
      `radial-gradient(circle at 84% 24%, ${palette.warm}, transparent 30%)`,
      `radial-gradient(circle at 50% 72%, ${palette.contrast}, transparent 24%)`,
      `radial-gradient(circle at 16% 82%, ${palette.glow}, transparent 22%)`,
      `linear-gradient(90deg, rgba(255, 255, 255, 0.02), transparent 26%, rgba(255, 255, 255, 0.03) 52%, transparent 74%)`,
      `linear-gradient(180deg, ${palette.baseTop} 0%, ${palette.baseMid} 28%, rgba(17, 20, 24, 1) 58%, ${palette.baseBottom} 100%)`,
    ].join(', ')
  }

  return [
    `radial-gradient(circle at 78% 8%, ${palette.light}, rgba(224, 216, 202, 0.24) 16%, transparent 44%)`,
    `radial-gradient(circle at 14% 18%, ${palette.cool}, transparent 34%)`,
    `radial-gradient(circle at 72% 28%, ${palette.warm}, transparent 30%)`,
    `radial-gradient(circle at 44% 70%, ${palette.contrast}, transparent 24%)`,
    `radial-gradient(circle at 18% 82%, ${palette.glow}, transparent 22%)`,
    `linear-gradient(180deg, ${palette.baseTop} 0%, ${palette.baseMid} 28%, rgba(24, 27, 29, 1) 58%, ${palette.baseBottom} 100%)`,
  ].join(', ')
}

function strongestPressure(
  snapshots: PressureSnapshot[],
  polarity: 'stress' | 'stabiliser',
) {
  return snapshots.find((pressure) => pressure.polarity === polarity) ?? null
}

function pickPeakPeriodId(dataset: LoomDataset, pressureId: string) {
  return (
    dataset.pressureOverlaySeries.find((series) => series.id === pressureId)?.peaks[0] ??
    dataset.periods[dataset.periods.length - 1]?.id ??
    ''
  )
}

function buildHeaderThreadPath(
  points: PressureOverlaySeries['points'],
  width: number,
  height: number,
  offset = 0,
) {
  if (!points.length) {
    return ''
  }

  const xStep = points.length > 1 ? width / (points.length - 1) : width

  return points
    .map((point, index) => {
      const x = index * xStep
      const y = height - point.normalized * (height * 0.7) - offset
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function pickHeaderThreadSeries(
  overlaySeries: PressureOverlaySeries[],
  selectedPressureId: string | null,
) {
  const byAverage = [...overlaySeries].sort((left, right) => {
    const leftAverage =
      left.points.reduce((sum, point) => sum + point.value, 0) / Math.max(left.points.length, 1)
    const rightAverage =
      right.points.reduce((sum, point) => sum + point.value, 0) /
      Math.max(right.points.length, 1)

    return rightAverage - leftAverage
  })

  const chosen: PressureOverlaySeries[] = []
  const seen = new Set<string>()

  if (selectedPressureId) {
    const selected = overlaySeries.find((series) => series.id === selectedPressureId)
    if (selected) {
      chosen.push(selected)
      seen.add(selected.id)
    }
  }

  for (const polarity of ['stress', 'stabiliser'] as const) {
    const candidate = byAverage.find((series) => series.polarity === polarity && !seen.has(series.id))
    if (candidate) {
      chosen.push(candidate)
      seen.add(candidate.id)
    }
  }

  for (const series of byAverage) {
    if (chosen.length >= 7) {
      break
    }

    if (!seen.has(series.id)) {
      chosen.push(series)
      seen.add(series.id)
    }
  }

  return chosen.slice(0, 7)
}

function buildQuestionEntries(dataset: LoomDataset) {
  const details = Object.values(dataset.selectedDetailsById)
  const lowestLegitimacy = [...details].sort(
    (left, right) => left.period.legitimacyLevel - right.period.legitimacyLevel,
  )[0]
  const highestTech = [...details].sort(
    (left, right) =>
      (right.period.pressureScores.technologicalDisruption ?? 0) -
      (left.period.pressureScores.technologicalDisruption ?? 0),
  )[0]
  const echoRich = [...details].sort((left, right) => right.echoes.length - left.echoes.length)[0]
  const highestHope = [...details].sort(
    (left, right) =>
      (right.period.pressureScores.publicHope ?? 0) -
      (left.period.pressureScores.publicHope ?? 0),
  )[0]

  return [
    {
      id: 'brittle-order',
      title: 'When does order start to feel brittle?',
      body: 'Jump to a low-legitimacy period and trace the stabiliser that begins to fail.',
      periodId: lowestLegitimacy?.period.id ?? dataset.periods[0]?.id ?? '',
      pressureId: 'institutionalLegitimacy',
      showEchoes: false,
      tone: 'amber' as const,
    },
    {
      id: 'technology-strain',
      title: 'What happens when technology outruns society?',
      body: 'Open the most technologically disruptive period and trace the strain directly.',
      periodId: highestTech?.period.id ?? dataset.periods[0]?.id ?? '',
      pressureId: 'technologicalDisruption',
      showEchoes: false,
      tone: 'cyan' as const,
    },
    {
      id: 'rhyming-eras',
      title: 'Which distant eras feel strangely alike?',
      body: 'Start from the most echo-rich period and let the structural links light up.',
      periodId: echoRich?.period.id ?? dataset.periods[0]?.id ?? '',
      pressureId: null,
      showEchoes: true,
      tone: 'cyan' as const,
    },
    {
      id: 'hope-and-order',
      title: 'When does hope reinforce order?',
      body: 'Move into the highest-hope period and trace the stabilising forces together.',
      periodId: highestHope?.period.id ?? dataset.periods[0]?.id ?? '',
      pressureId: 'publicHope',
      showEchoes: false,
      tone: 'amber' as const,
    },
  ]
}

function buildPatternEntries(dataset: LoomDataset) {
  const details = Object.values(dataset.selectedDetailsById)
  const brittle = [...details].sort(
    (left, right) => left.period.legitimacyLevel - right.period.legitimacyLevel,
  )[0]
  const shock = [...details].sort(
    (left, right) =>
      (right.period.pressureScores.economicPrecarity ?? 0) -
      (left.period.pressureScores.economicPrecarity ?? 0),
  )[0]
  const rhyme = [...details].sort((left, right) => right.echoes.length - left.echoes.length)[0]
  const settlement = [...details].sort(
    (left, right) =>
      (right.period.pressureScores.institutionalLegitimacy ?? 0) +
        (right.period.pressureScores.publicHope ?? 0) -
      ((left.period.pressureScores.institutionalLegitimacy ?? 0) +
        (left.period.pressureScores.publicHope ?? 0)),
  )[0]

  return [
    {
      id: 'pattern-brittle',
      title: 'Brittle order',
      body: 'Accepted rule starts to thin out and the centre begins to wobble.',
      periodId: brittle?.period.id ?? dataset.periods[0]?.id ?? '',
      pressureId: 'institutionalLegitimacy',
      showEchoes: false,
      tone: 'amber' as const,
    },
    {
      id: 'pattern-shock',
      title: 'System shock',
      body: 'Heavy change rewrites labour, security, and the social bargain.',
      periodId: shock?.period.id ?? dataset.periods[0]?.id ?? '',
      pressureId: 'economicPrecarity',
      showEchoes: false,
      tone: 'amber' as const,
    },
    {
      id: 'pattern-rhyme',
      title: 'Deep rhyme',
      body: 'A structurally resonant era with strong curated echoes into another time.',
      periodId: rhyme?.period.id ?? dataset.periods[0]?.id ?? '',
      pressureId: null,
      showEchoes: true,
      tone: 'cyan' as const,
    },
    {
      id: 'pattern-settlement',
      title: 'Renewed settlement',
      body: 'Hope and legitimacy rise together and steady the wider field.',
      periodId: settlement?.period.id ?? dataset.periods[0]?.id ?? '',
      pressureId: 'institutionalLegitimacy',
      showEchoes: false,
      tone: 'cyan' as const,
    },
  ]
}

function LoadingVeil({
  label,
  detail,
  delayMs = 180,
  centered = false,
}: {
  label: string
  detail: string
  delayMs?: number
  centered?: boolean
}) {
  const [isVisible, setIsVisible] = useState(delayMs === 0)

  useEffect(() => {
    if (delayMs === 0) {
      return
    }

    const timeout = window.setTimeout(() => setIsVisible(true), delayMs)
    return () => window.clearTimeout(timeout)
  }, [delayMs])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`pointer-events-auto absolute inset-0 z-40 flex justify-center rounded-[inherit] bg-[linear-gradient(180deg,rgba(9,10,11,0.14),rgba(9,10,11,0.26))] backdrop-blur-[2px] ${
        centered ? 'items-center' : 'items-start'
      }`}
    >
      <div
        className={`rounded-[1.4rem] border border-[rgba(214,211,209,0.08)] bg-[linear-gradient(180deg,rgba(26,29,31,0.92),rgba(18,20,22,0.88))] px-5 py-4 shadow-[0_22px_48px_rgba(0,0,0,0.24)] ${
          centered ? '' : 'mt-10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-200/85" />
            <span className="h-px w-8 bg-[linear-gradient(90deg,rgba(251,191,36,0.42),rgba(121,219,194,0.26))]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-200/80 [animation-delay:140ms]" />
            <span className="h-px w-8 bg-[linear-gradient(90deg,rgba(121,219,194,0.26),rgba(251,191,36,0.18))]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-stone-200/70 [animation-delay:280ms]" />
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300">{label}</p>
            <p className="mt-1 text-sm leading-6 text-stone-400">{detail}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PanelFallback({ label }: { label: string }) {
  return (
    <div className="compare-backdrop fixed inset-0 z-50 overflow-y-auto px-4 py-6 md:px-6">
      <section className="glass-panel surface-depth reveal-up relative mx-auto min-h-[72vh] w-full max-w-[1480px] overflow-hidden rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5 md:min-h-[80vh] md:p-7">
        <LoadingVeil
          label={label}
          detail="Preparing panel…"
          delayMs={120}
          centered
        />
      </section>
    </div>
  )
}

function App() {
  const datasetRegistry = getDatasetRegistry()
  const defaultDatasetId = datasetRegistry[0]?.id ?? 'britain-1066-2025'
  const [datasetId, setDatasetId] = useState(defaultDatasetId)
  const [dataset, setDataset] = useState<LoomDataset | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isDatasetLoading, setIsDatasetLoading] = useState(true)
  const [pendingDatasetId, setPendingDatasetId] = useState<string | null>(null)
  const [selectedPeriodId, setSelectedPeriodId] = useState('')
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
  const [isInMotionOpen, setIsInMotionOpen] = useState(false)
  const loadRequestRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    getLoomDataset(datasetId)
      .then((nextDataset) => {
        if (cancelled) {
          return
        }

        setDataset(nextDataset)
        setSelectedPeriodId((current) => {
          if (current && nextDataset.selectedDetailsById[current]) {
            return current
          }

          return nextDataset.periods[nextDataset.periods.length - 1]?.id ?? ''
        })
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setDataset(null)
        setLoadError(error instanceof Error ? error.message : 'Unknown dataset error.')
      })
      .finally(() => {
        if (!cancelled) {
          setIsDatasetLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [datasetId])

  function handleDatasetChange(nextDatasetId: string) {
    if (nextDatasetId === datasetId || nextDatasetId === pendingDatasetId) {
      return
    }

    const requestId = loadRequestRef.current + 1
    loadRequestRef.current = requestId
    setIsDatasetLoading(true)
    setLoadError(null)
    setPendingDatasetId(nextDatasetId)
    setSelectedPressureId(null)
    setShowPressureOverlay(true)
    setShowEchoes(false)
    setActiveEchoLinkId(null)
    setIsDetailOpen(true)
    setLoomDensity('compact')
    setDetailMode('guided')
    setEntryTab('question')
    setCompareSourceId(null)
    setCompareTargetId(null)
    setComparePicking(false)
    setIsInMotionOpen(false)

    getLoomDataset(nextDatasetId)
      .then((nextDataset) => {
        if (loadRequestRef.current !== requestId) {
          return
        }

        setDataset(nextDataset)
        setDatasetId(nextDatasetId)
        setPendingDatasetId(null)
        setSelectedPeriodId(nextDataset.periods[nextDataset.periods.length - 1]?.id ?? '')
      })
      .catch((error) => {
        if (loadRequestRef.current !== requestId) {
          return
        }

        setPendingDatasetId(null)
        setLoadError(error instanceof Error ? error.message : 'Unknown dataset error.')
      })
      .finally(() => {
        if (loadRequestRef.current === requestId) {
          setIsDatasetLoading(false)
        }
      })
  }

  if (isDatasetLoading && !dataset && !loadError) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] px-4 py-10 text-stone-100">
        <main className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <LoadingVeil label="Loading" detail="Preparing the field…" delayMs={0} />
          <div className="min-h-[16rem]" />
        </main>
      </div>
    )
  }

  if (!dataset) {
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

  const resolvedSelectedPeriodId =
    selectedPeriodId && dataset.selectedDetailsById[selectedPeriodId]
      ? selectedPeriodId
      : dataset.periods[dataset.periods.length - 1]?.id ?? ''
  const detail = dataset.selectedDetailsById[resolvedSelectedPeriodId]
  const compareSourceDetail = compareSourceId
    ? dataset.selectedDetailsById[compareSourceId]
    : null
  const compareDetail =
    compareSourceId && compareTargetId && compareTargetId !== compareSourceId
      ? dataset.selectedDetailsById[compareTargetId]
      : null
  const echoCounterpartIds = showEchoes ? getCounterpartIds(detail) : new Set<string>()
  const selectedPressureSeries = selectedPressureId
    ? dataset.pressureOverlaySeries.find((series) => series.id === selectedPressureId) ?? null
    : null
  const activeEcho =
    detail.echoes.find((echo) => echo.link.id === activeEchoLinkId) ?? detail.echoes[0] ?? null
  const activeEchoCounterpartId = showEchoes ? activeEcho?.counterpart.id ?? null : null
  const compareAnchoredToSelected = compareSourceId === resolvedSelectedPeriodId
  const compareActive = Boolean(compareSourceDetail && compareDetail)
  const uniqueEchoCount = new Set(
    Object.values(dataset.selectedDetailsById).flatMap((item) =>
      item.echoes.map((echo) => echo.link.id),
    ),
  ).size
  const dominantStress = strongestPressure(detail.allPressureSnapshots, 'stress')
  const dominantStabiliser = strongestPressure(detail.allPressureSnapshots, 'stabiliser')
  const stressSnapshots = detail.allPressureSnapshots.filter(
    (pressure) => pressure.polarity === 'stress',
  )
  const stabiliserSnapshots = detail.allPressureSnapshots.filter(
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
  const stressPullWidth = Math.max(10, Math.min(50, Math.round((stressMean / 100) * 50)))
  const stabiliserPullWidth = Math.max(
    10,
    Math.min(50, Math.round((stabiliserMean / 100) * 50)),
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
  const questionEntries = buildQuestionEntries(dataset)
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
  const patternEntries = buildPatternEntries(dataset)
  const entryTabs = [
    { id: 'question', label: 'Question' },
    { id: 'force', label: 'Force' },
    { id: 'pattern', label: 'Pattern' },
  ] as const
  const displayDatasetId = pendingDatasetId ?? datasetId
  const currentDatasetEntry =
    datasetRegistry.find((entry) => entry.id === displayDatasetId) ?? null
  const atmosphericBackground = buildDatasetBackground(
    displayDatasetId,
    currentDatasetEntry?.visualTheme,
  )
  const headerThreadSeries = pickHeaderThreadSeries(
    dataset.pressureOverlaySeries,
    selectedPressureId,
  )

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

    setCompareSourceId(resolvedSelectedPeriodId)
    setCompareTargetId(null)
    setComparePicking(true)
    setIsDetailOpen(true)
  }

  function handleCompareToPeriod(periodId: string) {
    if (periodId === resolvedSelectedPeriodId) {
      return
    }

    setCompareSourceId(resolvedSelectedPeriodId)
    setCompareTargetId(periodId)
    setComparePicking(false)
    setIsDetailOpen(true)
  }

  function handlePeriodSelect(periodId: string) {
    const activeCompareSourceId = compareSourceId ?? resolvedSelectedPeriodId

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
    if (!dataset) {
      return
    }

    const periodId = pickPeakPeriodId(dataset, pressureId) || resolvedSelectedPeriodId

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
    <div className="relative isolate min-h-screen bg-[color:var(--bg)] text-stone-100">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: atmosphericBackground }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-5 md:px-6 lg:px-8">
        {isDatasetLoading && dataset ? (
          <LoadingVeil
            label={pendingDatasetId ? 'Switching dataset' : 'Loading'}
            detail={
              pendingDatasetId && currentDatasetEntry
                ? `Preparing ${currentDatasetEntry.scope}…`
                : 'Preparing the field…'
            }
          />
        ) : null}
        <header
          className="relative overflow-hidden rounded-[2.2rem] border border-[rgba(255,248,236,0.12)] px-6 py-6 shadow-[0_24px_64px_rgba(0,0,0,0.2)] backdrop-blur-[28px] md:px-8"
          style={{
            background: [
              'radial-gradient(circle at top right, rgba(255, 242, 214, 0.14), transparent 58%)',
              'radial-gradient(circle at top left, rgba(255, 255, 255, 0.08), transparent 42%)',
              'linear-gradient(180deg, rgba(248, 242, 233, 0.16), rgba(236, 231, 223, 0.08))',
              'rgba(86, 87, 89, 0.52)',
            ].join(', '),
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.2)',
          }}
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
            <div className="relative max-w-4xl">
              <p className="eyebrow" style={{ color: 'rgba(42,44,47,0.72)' }}>
                Not a timeline. A loom.
              </p>
              <h1 className="font-display text-4xl leading-tight text-stone-50 md:text-6xl">
                The History Loom
              </h1>
              <h2 className="font-display mt-5 max-w-3xl text-2xl leading-tight text-[rgba(246,205,148,0.92)] md:text-4xl">
                Does history repeat itself, or do pressures, moods, and institutions only rhyme?
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300 md:text-lg">
                A visualisation of {dataset.meta.scope} from {dataset.meta.startYear} to{' '}
                {dataset.meta.endYear} as recurring structure: periods in the foreground,
                pressure undercurrents beneath, and curated echoes between distant eras.
              </p>

              <div
                className="pointer-events-none absolute left-0 top-[calc(100%+0.8rem)] hidden h-24 w-[74%] md:block"
                style={{
                  maskImage:
                    'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.76) 68%, rgba(0,0,0,0.16) 92%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.76) 68%, rgba(0,0,0,0.16) 92%, transparent 100%)',
                }}
              >
                <svg
                  viewBox="0 0 520 96"
                  className="h-full w-full overflow-visible"
                  aria-hidden="true"
                >
                  {headerThreadSeries.map((series, index) => (
                    <path
                      key={series.id}
                      d={buildHeaderThreadPath(series.points, 520, 84, index * 2.1)}
                      fill="none"
                      stroke={
                        series.polarity === 'stress'
                          ? 'rgba(243,177,91,0.16)'
                          : 'rgba(121,219,194,0.14)'
                      }
                      strokeWidth={index === 0 ? 1.6 : 1}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
              </div>
            </div>

            <div className="relative space-y-3">
              <section className="relative overflow-visible rounded-[1.7rem] border border-[rgba(255,255,255,0.045)] bg-[linear-gradient(180deg,rgba(255,241,220,0.06),rgba(255,255,255,0.024))] px-5 py-5 shadow-[0_20px_44px_rgba(0,0,0,0.16)] backdrop-blur-xl md:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="eyebrow" style={{ color: 'rgba(42,44,47,0.72)' }}>
                      Field setup
                    </p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      Choose a field
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {datasetRegistry.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => handleDatasetChange(entry.id)}
                          className={`ui-action rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition ${
                            displayDatasetId === entry.id
                              ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                              : 'text-stone-300 hover:text-stone-100'
                          }`}
                        >
                          {entry.scope}
                        </button>
                      ))}
                      <div className="group relative">
                        <button
                          type="button"
                          aria-haspopup="true"
                          aria-expanded="false"
                          className="ui-action rounded-full border border-dashed border-white/12 bg-white/4 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-stone-400 transition hover:border-white/18 hover:bg-white/6 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
                        >
                          Coming soon
                        </button>
                        <div className="pointer-events-none absolute left-0 top-[calc(100%+0.7rem)] z-20 w-[21rem] max-w-[calc(100vw-4rem)] translate-y-1 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                          <div className="surface-depth rounded-[1.35rem] border border-[rgba(214,211,209,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-4 shadow-[0_22px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                            <p className="eyebrow">Planned fields</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {plannedDatasets.map((plannedDataset) => (
                                <span
                                  key={plannedDataset}
                                  className="rounded-full border border-white/8 bg-white/[0.045] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                                >
                                  {plannedDataset}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(42,44,47,0.68)]">
                        Lens
                      </p>
                      <p className="mt-1 font-display text-xl text-stone-100">
                        {dataset.lens.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(42,44,47,0.68)]">
                        Echoes
                      </p>
                      <p className="mt-1 font-display text-xl text-stone-100">
                        {uniqueEchoCount}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="surface-depth rounded-[1.7rem] border border-[rgba(214,211,209,0.08)] px-5 py-5 md:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="eyebrow">Start with a...</p>
                    <h2 className="font-display mt-2 text-2xl text-stone-100">
                      Choose a way in
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
                          resolvedSelectedPeriodId === entry.periodId &&
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
                            className={`rounded-[1.15rem] border px-4 py-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${getEntryCardClass(
                              isActive,
                              entry.tone,
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-display text-lg leading-tight text-stone-100">
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
                                <h3 className="font-display text-lg leading-tight text-stone-100">
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
                          resolvedSelectedPeriodId === entry.periodId &&
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
                            className={`rounded-[1.15rem] border px-4 py-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 ${getEntryCardClass(
                              isActive,
                              entry.tone,
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-display text-lg leading-tight text-stone-100">
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
                </div>
              </section>
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
              onClick={() => setIsInMotionOpen(true)}
              className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45 hover:text-stone-100"
            >
              In motion
            </button>
          </div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.8fr)] xl:items-start">
          <div className="space-y-5">
            <LoomCanvas
              periods={dataset.periods}
              overlaySeries={dataset.pressureOverlaySeries}
              selectedPeriodTitle={detail.period.title}
              selectedPeriodRangeLabel={detail.period.rangeLabel}
              selectedPeriodId={resolvedSelectedPeriodId}
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

            <div className="grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <section className="surface-depth rounded-[1.35rem] border border-[rgba(214,211,209,0.08)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">Structural fingerprint</p>
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
                <div className="mt-4 rounded-[1.1rem] bg-white/[0.035] px-4 py-4">
                  <div className="relative h-12 overflow-hidden rounded-full bg-white/5">
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/18" />
                    <div
                      className="absolute right-1/2 top-1/2 h-3 -translate-y-1/2 rounded-l-full bg-[linear-gradient(90deg,rgba(243,177,91,0.18),rgba(243,177,91,0.88))] shadow-[0_0_18px_rgba(243,177,91,0.2)]"
                      style={{ width: `${stressPullWidth}%` }}
                    />
                    <div
                      className="absolute left-1/2 top-1/2 h-3 -translate-y-1/2 rounded-r-full bg-[linear-gradient(90deg,rgba(121,219,194,0.88),rgba(121,219,194,0.18))] shadow-[0_0_18px_rgba(121,219,194,0.16)]"
                      style={{ width: `${stabiliserPullWidth}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-amber-100">
                        Stress
                      </p>
                      <p className="mt-2 font-display text-2xl text-stone-100">{stressMean}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-400">
                        {dominantStress?.label ?? 'Low signal'}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100">
                        Stabiliser
                      </p>
                      <p className="mt-2 font-display text-2xl text-stone-100">
                        {stabiliserMean}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-stone-400">
                        {dominantStabiliser?.label ?? 'Low signal'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <ForceExplorer
              detail={detail}
              periods={dataset.periods}
              pressureSeries={dataset.pressureOverlaySeries}
              selectedPressureId={selectedPressureId}
              currentPeriodId={detail.period.id}
              currentPeriodScores={detail.period.pressureScores}
              onPressureSelect={(pressureId) => {
                setSelectedPressureId(pressureId)
                setShowPressureOverlay(true)
              }}
              onPeriodSelect={handlePeriodSelect}
            />
          </div>

          <DetailPanel
            datasetId={datasetId}
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
          <Suspense fallback={<PanelFallback label="Compare periods" />}>
            <ComparePanel
              model={{ source: compareSourceDetail, target: compareDetail }}
              selectedPressureId={selectedPressureId}
              selectedPressureLabel={selectedPressureSeries?.label ?? null}
              onClose={clearCompare}
            />
          </Suspense>
        ) : null}

        {isInMotionOpen ? (
          <Suspense fallback={<PanelFallback label="In motion" />}>
            <InMotionRacePanel
              datasetLabel={currentDatasetEntry?.scope ?? dataset.meta.scope}
              periods={dataset.periods}
              pressureSeries={dataset.pressureOverlaySeries}
              initialPeriodId={resolvedSelectedPeriodId}
              initialPinnedPressureId={selectedPressureId}
              onClose={() => setIsInMotionOpen(false)}
            />
          </Suspense>
        ) : null}
      </main>
    </div>
  )
}

export default App
