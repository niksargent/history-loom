import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Period } from '../types/domain'
import type { PressureOverlaySeries } from '../types/view'

interface InMotionRacePanelProps {
  datasetLabel: string
  periods: Period[]
  pressureSeries: PressureOverlaySeries[]
  initialPeriodId: string
  initialPinnedPressureId: string | null
  onClose: () => void
}

type RaceFilter = 'all' | 'stress' | 'stabiliser'

const STAGE_WIDTH = 1000
const STAGE_HEIGHT = 620
const TRAIL_LEFT = 84
const PILL_LEFT = 774
const PILL_WIDTH = 196
const PILL_HEIGHT = 36
const PILL_TRAIL_X = PILL_LEFT - 28
const ROW_TOP = 68
const ROW_BOTTOM = 560
const TRAIL_WINDOW = 3.4
const TRAIL_STEPS = 12
const PERIOD_DURATION_MS = 2200
const SEGMENT_HOLD = 0.16
const RENDER_DPR_CAP = 1.25

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getRowY(index: number, count: number) {
  if (count <= 1) {
    return (ROW_TOP + ROW_BOTTOM) / 2
  }

  return ROW_TOP + (index / (count - 1)) * (ROW_BOTTOM - ROW_TOP)
}

function getPolarityTone(polarity: PressureOverlaySeries['polarity']) {
  return polarity === 'stress'
    ? {
        pill: 'border border-amber-300/12 bg-[linear-gradient(180deg,rgba(243,177,91,0.18),rgba(243,177,91,0.08))] text-amber-100',
        pillMuted: 'border border-amber-300/10 bg-[linear-gradient(180deg,rgba(243,177,91,0.12),rgba(243,177,91,0.035))] text-stone-200',
        line: 'rgba(243,177,91,0.95)',
        lineSoft: 'rgba(243,177,91,0.22)',
        dot: 'rgba(252,211,77,1)',
      }
    : {
        pill: 'border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(121,219,194,0.18),rgba(121,219,194,0.08))] text-cyan-100',
        pillMuted: 'border border-cyan-300/10 bg-[linear-gradient(180deg,rgba(121,219,194,0.12),rgba(121,219,194,0.035))] text-stone-200',
        line: 'rgba(121,219,194,0.98)',
        lineSoft: 'rgba(121,219,194,0.24)',
        dot: 'rgba(165,243,252,1)',
      }
}

function getTrailStrength(index: number, count: number) {
  if (count <= 1) {
    return 1
  }

  const ratio = 1 - index / (count - 1)
  return 0.42 + ratio * 0.58
}

function getSegmentMix(progress: number, maxIndex: number) {
  if (maxIndex <= 0) {
    return { baseIndex: 0, nextIndex: 0, mix: 0 }
  }

  const bounded = clamp(progress, 0, maxIndex + 1)

  if (bounded >= maxIndex) {
    return { baseIndex: maxIndex, nextIndex: maxIndex, mix: 1 }
  }

  const baseIndex = Math.floor(bounded)
  const nextIndex = Math.min(baseIndex + 1, maxIndex)
  const rawMix = bounded - baseIndex
  const mix =
    rawMix <= SEGMENT_HOLD ? 0 : clamp((rawMix - SEGMENT_HOLD) / (1 - SEGMENT_HOLD), 0, 1)

  return { baseIndex, nextIndex, mix }
}

function interpolateSeriesValue(series: PressureOverlaySeries, progress: number) {
  const points = series.points
  const lastIndex = points.length - 1

  if (!points.length) {
    return 0
  }

  if (lastIndex <= 0) {
    return points[0].value
  }

  const { baseIndex, nextIndex, mix } = getSegmentMix(progress, lastIndex)

  if (baseIndex >= lastIndex) {
    return points[lastIndex].value
  }

  const current = points[baseIndex]?.value ?? 0
  const next = points[nextIndex]?.value ?? current

  return current + (next - current) * mix
}

function buildRankMap(
  series: PressureOverlaySeries[],
  periodIndex: number,
  filter: RaceFilter,
) {
  return new Map(
    series
      .filter((item) => filter === 'all' || item.polarity === filter)
      .map((item) => ({
        id: item.id,
        value: item.points[Math.min(periodIndex, item.points.length - 1)]?.value ?? 0,
        label: item.label,
      }))
      .sort((left, right) => {
        const delta = right.value - left.value

        if (delta !== 0) {
          return delta
        }

        return left.label.localeCompare(right.label)
      })
      .map((item, index) => [item.id, index] as const),
  )
}

function buildDisplayedSeries(
  visible: PressureOverlaySeries[],
  progress: number,
  rankMaps: Map<string, number>[],
) {
  const count = visible.length

  if (!count) {
    return []
  }

  const lastIndex = Math.max(visible[0]?.points.length - 1, 0)
  const { baseIndex, nextIndex, mix } = getSegmentMix(progress, lastIndex)
  const rankMapA = rankMaps[baseIndex] ?? new Map()
  const rankMapB = rankMaps[nextIndex] ?? rankMapA

  return visible
    .map((item) => {
      const rankA = rankMapA.get(item.id) ?? count - 1
      const rankB = rankMapB.get(item.id) ?? rankA
      const yA = getRowY(rankA, count)
      const yB = getRowY(rankB, count)

      return {
        ...item,
        currentValue: interpolateSeriesValue(item, progress),
        rank: rankA + (rankB - rankA) * mix,
        y: yA + (yB - yA) * mix,
      }
    })
    .sort((left, right) => left.y - right.y)
}

function getInterpolatedY(
  seriesId: string,
  count: number,
  progress: number,
  rankMaps: Map<string, number>[],
  lastIndex: number,
) {
  const { baseIndex, nextIndex, mix } = getSegmentMix(progress, lastIndex)
  const rankMapA = rankMaps[baseIndex] ?? new Map()
  const rankMapB = rankMaps[nextIndex] ?? rankMapA
  const rankA = rankMapA.get(seriesId) ?? count - 1
  const rankB = rankMapB.get(seriesId) ?? rankA
  const yA = getRowY(rankA, count)
  const yB = getRowY(rankB, count)

  return yA + (yB - yA) * mix
}

function buildTrailSamples(
  visible: PressureOverlaySeries[],
  progress: number,
  rankMaps: Map<string, number>[],
) {
  if (progress <= 0) {
    return new Map<string, { x: number; y: number }[]>()
  }

  const sampleStart = Math.max(progress - TRAIL_WINDOW, 0)
  const span = Math.max(progress - sampleStart, 0.001)
  const steps = TRAIL_STEPS
  const sampleMap = new Map<string, { x: number; y: number }[]>()
  const count = visible.length
  const lastIndex = Math.max(visible[0]?.points.length - 1, 0)

  for (let step = 0; step <= steps; step += 1) {
    const sampleProgress = sampleStart + (span * step) / steps
    const age = progress - sampleProgress
    const x = PILL_TRAIL_X - (age / TRAIL_WINDOW) * (PILL_TRAIL_X - TRAIL_LEFT)

    for (const series of visible) {
      const points = sampleMap.get(series.id) ?? []
      points.push({
        x,
        y: getInterpolatedY(series.id, count, sampleProgress, rankMaps, lastIndex),
      })
      sampleMap.set(series.id, points)
    }
  }

  return sampleMap
}

function buildInterpolatedYear(periods: Period[], progress: number) {
  if (!periods.length) {
    return ''
  }

  const lastIndex = periods.length - 1
  const bounded = clamp(progress, 0, periods.length)

  if (bounded >= lastIndex) {
    const lastPeriod = periods[lastIndex]
    const finalMix = clamp(bounded - lastIndex, 0, 1)
    const fromYear = lastPeriod?.startYear ?? 0
    const toYear = lastPeriod?.endYear ?? fromYear

    return `${Math.round(fromYear + (toYear - fromYear) * finalMix)}`
  }

  const { baseIndex, nextIndex, mix } = getSegmentMix(bounded, lastIndex)
  const current = periods[baseIndex]
  const next = periods[nextIndex]
  const fromYear = current?.startYear ?? 0
  const toYear = next ? next.startYear : current?.endYear ?? fromYear

  return `${Math.round(fromYear + (toYear - fromYear) * mix)}`
}

function getActivePeriod(periods: Period[], progress: number) {
  if (!periods.length) {
    return null
  }

  return periods[Math.min(Math.floor(clamp(progress, 0, periods.length - 1)), periods.length - 1)] ?? null
}

export function InMotionRacePanel({
  datasetLabel,
  periods,
  pressureSeries,
  initialPeriodId,
  initialPinnedPressureId,
  onClose,
}: InMotionRacePanelProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sliderRef = useRef<HTMLInputElement | null>(null)
  const titleTextRef = useRef<HTMLHeadingElement | null>(null)
  const yearTextRef = useRef<HTMLParagraphElement | null>(null)
  const rangeTextRef = useRef<HTMLParagraphElement | null>(null)
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const scoreRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const animationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number | null>(null)
  const stageMetricsRef = useRef({ width: STAGE_WIDTH, height: STAGE_HEIGHT, dpr: 1 })
  const progressRef = useRef(0)
  const fpsSampleRef = useRef<number[]>([])
  const fpsFrameCounterRef = useRef(0)
  const initialIndex = Math.max(
    0,
    periods.findIndex((period) => period.id === initialPeriodId),
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [filter, setFilter] = useState<RaceFilter>('all')
  const [pinnedForceId, setPinnedForceId] = useState<string | null>(initialPinnedPressureId)
  const [speed, setSpeed] = useState(1)
  const [fps, setFps] = useState(0)

  const maxProgress = Math.max(periods.length, 0)
  const visibleSeries = useMemo(
    () => pressureSeries.filter((item) => filter === 'all' || item.polarity === filter),
    [filter, pressureSeries],
  )
  const rankMaps = useMemo(() => {
    const length = visibleSeries[0]?.points.length ?? 0

    return Array.from({ length }, (_, index) => buildRankMap(visibleSeries, index, 'all'))
  }, [visibleSeries])
  const effectivePinnedForceId = pressureSeries.some((series) => series.id === pinnedForceId)
    ? pinnedForceId
    : null

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [onClose])

  useEffect(() => {
    const canvas = canvasRef.current
    const guideCanvas = guideCanvasRef.current
    if (!canvas || !guideCanvas) {
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, RENDER_DPR_CAP)
    const rect = canvas.getBoundingClientRect()
    const width = rect.width || STAGE_WIDTH
    const height = rect.height || STAGE_HEIGHT

    stageMetricsRef.current = { width, height, dpr }

    for (const target of [canvas, guideCanvas]) {
      target.width = Math.round(width * dpr)
      target.height = Math.round(height * dpr)
    }

    const guideContext = guideCanvas.getContext('2d')
    if (!guideContext) {
      return
    }

    guideContext.setTransform(dpr, 0, 0, dpr, 0, 0)
    guideContext.clearRect(0, 0, width, height)
    guideContext.lineCap = 'round'
    guideContext.lineJoin = 'round'

    for (let index = 0; index < visibleSeries.length; index += 1) {
      const y = getRowY(index, visibleSeries.length)
      guideContext.strokeStyle = 'rgba(255,255,255,0.025)'
      guideContext.lineWidth = 1
      guideContext.beginPath()
      guideContext.moveTo(TRAIL_LEFT, y)
      guideContext.lineTo(PILL_TRAIL_X - 14, y)
      guideContext.stroke()
    }
  }, [visibleSeries.length])

  const drawFrame = useCallback(
    (frameProgress: number) => {
      const orderedSeries = buildDisplayedSeries(visibleSeries, frameProgress, rankMaps)
      const trailSamples = buildTrailSamples(visibleSeries, frameProgress, rankMaps)
      const activePeriod = getActivePeriod(periods, frameProgress)
      const interpolatedYear = buildInterpolatedYear(periods, frameProgress)

      const canvas = canvasRef.current
      const guideCanvas = guideCanvasRef.current
      if (canvas && guideCanvas) {
        const context = canvas.getContext('2d')
        if (context) {
          const { width, height, dpr } = stageMetricsRef.current

          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          context.lineCap = 'round'
          context.lineJoin = 'round'

          for (let index = 0; index < orderedSeries.length; index += 1) {
            const y = getRowY(index, orderedSeries.length)
            context.strokeStyle = 'rgba(255,255,255,0.025)'
            context.lineWidth = 1
            context.beginPath()
            context.moveTo(TRAIL_LEFT, y)
            context.lineTo(PILL_TRAIL_X - 10, y)
            context.stroke()
          }

          orderedSeries.forEach((series, index) => {
            const tone = getPolarityTone(series.polarity)
            const isPinned = series.id === effectivePinnedForceId
            const trailStrength = getTrailStrength(index, orderedSeries.length)
            const points = trailSamples.get(series.id) ?? []

            if (points.length < 2) {
              return
            }

            context.beginPath()
            context.moveTo(points[0].x, points[0].y)
            for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
              context.lineTo(points[pointIndex].x, points[pointIndex].y)
            }
            context.strokeStyle = tone.lineSoft
            context.globalAlpha = isPinned ? 0.42 : 0.06 + trailStrength * 0.14
            context.lineWidth = isPinned ? 12 : 5 + trailStrength * 2.4
            context.stroke()

            context.beginPath()
            context.moveTo(points[0].x, points[0].y)
            for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
              context.lineTo(points[pointIndex].x, points[pointIndex].y)
            }
            context.strokeStyle = tone.line
            context.globalAlpha = isPinned ? 0.98 : 0.2 + trailStrength * 0.24
            context.lineWidth = isPinned ? 3.6 : 1.1 + trailStrength * 1.1
            context.stroke()
          })

          context.globalAlpha = 1
        }
      }

      orderedSeries.forEach((series, index) => {
        const pill = pillRefs.current[series.id]
        const score = scoreRefs.current[series.id]
        const isPinned = series.id === effectivePinnedForceId
        const trailStrength = getTrailStrength(index, orderedSeries.length)

        if (pill) {
          pill.style.transform = `translate3d(0, ${series.y - PILL_HEIGHT / 2}px, 0)`
          pill.style.opacity = `${isPinned ? 1 : 0.76 + trailStrength * 0.18}`
        }

        if (score) {
          const nextScore = `${Math.round(series.currentValue)}`
          if (score.textContent !== nextScore) {
            score.textContent = nextScore
          }
        }
      })

      if (titleTextRef.current) {
        const nextTitle = activePeriod?.title ?? ''
        if (titleTextRef.current.textContent !== nextTitle) {
          titleTextRef.current.textContent = nextTitle
        }
      }
      if (yearTextRef.current) {
        if (yearTextRef.current.textContent !== interpolatedYear) {
          yearTextRef.current.textContent = interpolatedYear
        }
      }
      if (rangeTextRef.current) {
        const nextRange = activePeriod?.rangeLabel ?? ''
        if (rangeTextRef.current.textContent !== nextRange) {
          rangeTextRef.current.textContent = nextRange
        }
      }
      if (sliderRef.current && document.activeElement !== sliderRef.current) {
        sliderRef.current.value = frameProgress.toFixed(3)
      }
    },
    [effectivePinnedForceId, periods, rankMaps, visibleSeries],
  )

  useEffect(() => {
    progressRef.current = initialIndex
    drawFrame(initialIndex)
  }, [drawFrame, initialIndex])

  useEffect(() => {
    if (!isPlaying || progressRef.current >= maxProgress) {
      return
    }

    function tick(timestamp: number) {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp
      }

      const delta = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp
      const instantFps = delta > 0 ? 1000 / delta : 0
      const samples = fpsSampleRef.current
      samples.push(instantFps)
      if (samples.length > 20) {
        samples.shift()
      }
      fpsFrameCounterRef.current += 1
      if (fpsFrameCounterRef.current % 12 === 0) {
        setFps(samples.reduce((sum, sample) => sum + sample, 0) / samples.length)
      }

      const next = progressRef.current + (delta / PERIOD_DURATION_MS) * speed
      progressRef.current = Math.min(next, maxProgress)
      drawFrame(progressRef.current)

      if (next >= maxProgress) {
        setIsPlaying(false)
        return
      }

      animationFrameRef.current = window.requestAnimationFrame(tick)
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = null
      lastFrameTimeRef.current = null
    }
  }, [drawFrame, isPlaying, maxProgress, speed])

  useEffect(() => {
    drawFrame(progressRef.current)
  }, [drawFrame, filter, pinnedForceId])

  return (
    <div className="compare-backdrop fixed inset-0 z-50 overflow-y-auto px-4 py-6 md:px-6">
      <section
        className="glass-panel surface-depth reveal-up relative mx-auto w-full max-w-[1480px] overflow-hidden rounded-[2rem] border border-[rgba(214,211,209,0.08)] p-5 md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(219,181,108,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(121,219,194,0.08),_transparent_32%)]" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="eyebrow">In motion</p>
              <h2 id={titleId} className="font-display text-3xl text-stone-100 md:text-4xl">
                Race
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                Watch forces re-rank through time, trace their recent movement, and pin one thread
                to follow it across the whole field.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/8 bg-white/6 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-200">
                {datasetLabel}
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-300 transition hover:text-stone-100"
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_16rem]">
            <section className="rounded-[1.8rem] bg-black/18 px-5 py-5 shadow-[0_24px_48px_rgba(0,0,0,0.2)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Live field</p>
                  <h3 ref={titleTextRef} className="mt-2 font-display text-2xl text-stone-100">
                    {getActivePeriod(periods, initialIndex)?.title}
                  </h3>
                </div>

                <div className="text-right">
                  <p ref={yearTextRef} className="font-display text-4xl text-stone-100">
                    {buildInterpolatedYear(periods, initialIndex)}
                  </p>
                  <p
                    ref={rangeTextRef}
                    className="mt-2 text-[11px] uppercase tracking-[0.18em] text-stone-500"
                  >
                    {getActivePeriod(periods, initialIndex)?.rangeLabel}
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 py-5">
                <div className="relative h-[620px]">
                  <canvas ref={guideCanvasRef} className="hidden" aria-hidden="true" />
                  <canvas
                    ref={canvasRef}
                    width={STAGE_WIDTH}
                    height={STAGE_HEIGHT}
                    className="absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  />

                  {visibleSeries.map((series, index) => {
                    const tone = getPolarityTone(series.polarity)
                    const isPinned = series.id === effectivePinnedForceId

                    return (
                      <button
                        key={`${series.id}-pill`}
                        ref={(node) => {
                          pillRefs.current[series.id] = node
                        }}
                        type="button"
                        onClick={() =>
                          setPinnedForceId((current) =>
                            current === series.id ? null : series.id,
                          )
                        }
                        className={`absolute flex items-center justify-between gap-3 rounded-full px-4 text-left shadow-[0_12px_24px_rgba(0,0,0,0.18)] ${
                          isPinned ? tone.pill : tone.pillMuted
                        }`}
                        style={{
                          left: `${PILL_LEFT}px`,
                          top: '0px',
                          width: `${PILL_WIDTH}px`,
                          height: `${PILL_HEIGHT}px`,
                          transform: `translate3d(0, ${getRowY(index, visibleSeries.length) - PILL_HEIGHT / 2}px, 0)`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: tone.dot }} />
                        <span className="min-w-0 flex-1 truncate text-sm">{series.label}</span>
                        <span
                          ref={(node) => {
                            scoreRefs.current[series.id] = node
                          }}
                          className="shrink-0 text-[10px] uppercase tracking-[0.18em]"
                        >
                          {Math.round(interpolateSeriesValue(series, initialIndex))}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-5">
                <input
                  ref={sliderRef}
                  type="range"
                  min={0}
                  max={maxProgress}
                  step={0.001}
                  defaultValue={initialIndex}
                  onChange={(event) => {
                    progressRef.current = Number(event.target.value)
                    setIsPlaying(false)
                    drawFrame(progressRef.current)
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/8"
                  aria-label="Scrub time"
                />
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-stone-500">
                  <span>{periods[0]?.startYear}</span>
                  <span>{periods[periods.length - 1]?.endYear}</span>
                </div>
              </div>
            </section>

            <aside className="space-y-4 xl:sticky xl:top-5">
              <section className="surface-depth rounded-[1.5rem] border border-[rgba(214,211,209,0.06)] p-4">
                <p className="eyebrow">Controls</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((current) => !current)}
                    className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-200"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      progressRef.current = 0
                      if (sliderRef.current) {
                        sliderRef.current.value = '0'
                      }
                      drawFrame(0)
                      setIsPlaying(true)
                    }}
                    className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-200"
                  >
                    Restart
                  </button>
                </div>

                <div className="mt-4">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                    Speed
                  </label>
                  <div className="mt-2 flex gap-2">
                    {[0.5, 0.75, 1, 1.5].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSpeed(option)}
                        className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                          speed === option
                            ? 'border-amber-300/24 bg-amber-300/10 text-amber-100'
                            : 'border-white/8 bg-white/[0.03] text-stone-300'
                        }`}
                      >
                        {option}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-stone-500">
                  <span>Render</span>
                  <span>{Number.isFinite(fps) ? `${Math.round(fps)} FPS` : '0 FPS'}</span>
                </div>
              </section>

              <section className="surface-depth rounded-[1.5rem] border border-[rgba(214,211,209,0.06)] p-4">
                <p className="eyebrow">View</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(['all', 'stress', 'stabiliser'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFilter(option)}
                      className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                        filter === option
                          ? 'border-cyan-300/24 bg-cyan-300/10 text-cyan-100'
                          : 'border-white/8 bg-white/[0.03] text-stone-300'
                      }`}
                    >
                      {option === 'all'
                        ? 'All'
                        : option === 'stress'
                          ? 'Stress'
                          : 'Stabiliser'}
                    </button>
                  ))}
                </div>
              </section>

              <section className="surface-depth rounded-[1.5rem] border border-[rgba(214,211,209,0.06)] p-4">
                <p className="eyebrow">Focus</p>
                <div className="mt-4 space-y-3">
                  <p className="text-sm leading-6 text-stone-300">
                    Click any force pill to pin it. Click it again to release it.
                  </p>
                  {effectivePinnedForceId ? (
                    <button
                      type="button"
                      onClick={() => setPinnedForceId(null)}
                      className="ui-action w-full rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-200"
                    >
                      Clear pinned force
                    </button>
                  ) : null}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
