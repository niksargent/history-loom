import { useMemo, useState, type ReactNode } from 'react'
import {
  formatConfidence,
  formatPopulationEstimate,
  sentenceCase,
  titleCaseLabel,
} from '../lib/format'
import {
  buildGeographyInsetModel,
  buildPressureCascade,
  getScaleAccent,
  getReleaseLabel,
} from '../lib/loom-data'
import {
  getPublicConceptPhrase,
  getPublicEchoNotes,
  getPublicEchoSimilarityLabel,
  getPublicEchoSimilarityReasons,
  getPublicEventSummary,
  getPublicPeriodPressureSummary,
  getPublicPeriodReading,
  getPublicPeriodSummary,
  getPublicSnapshotDailyReality,
  getPublicSnapshotSummary,
  getPublicSnapshotTitle,
  getPublicVoicePrompt,
  getPublicVoiceResponse,
  getPublicVoiceSpeakerFrame,
} from '../lib/public-copy'
import type { LivedVoice, Period, Scale } from '../types/domain'
import type { InsightPrompt } from '../types/insights'
import type {
  DetailViewMode,
  PressureOverlaySeries,
  SelectedPeriodDetail,
} from '../types/view'
import { GeographyInset } from './GeographyInset'

type DetailSectionId = 'shifts' | 'scales' | 'pressures' | 'echoes' | 'texture'

function buildCollapsedSections(
  viewMode: DetailViewMode,
  showEchoes: boolean,
): Record<DetailSectionId, boolean> {
  if (viewMode === 'full') {
    return {
      shifts: false,
      scales: false,
      pressures: false,
      echoes: false,
      texture: false,
    }
  }

  return {
    shifts: false,
    scales: false,
    pressures: true,
    echoes: !showEchoes,
    texture: true,
  }
}

function getScaleShellClass(scale: Scale, isImpacted: boolean) {
  if (isImpacted) {
    return 'border-[rgba(243,177,91,0.18)] bg-[rgba(243,177,91,0.06)]'
  }

  switch (scale) {
    case 'personal':
      return 'border-[rgba(243,177,91,0.14)] bg-[rgba(243,177,91,0.035)]'
    case 'local':
      return 'border-[rgba(121,219,194,0.14)] bg-[rgba(121,219,194,0.035)]'
    case 'national':
      return 'border-[rgba(251,113,133,0.14)] bg-[rgba(251,113,133,0.035)]'
    case 'global':
      return 'border-[rgba(163,230,53,0.16)] bg-[rgba(163,230,53,0.035)]'
    default:
      return 'border-[rgba(214,211,209,0.08)] bg-white/4'
  }
}

function buildPeriodReading(detail: SelectedPeriodDetail) {
  const customReading = getPublicPeriodReading(detail.period)

  if (customReading) {
    return customReading
  }

  const valueLead = detail.period.dominantValues
    .slice(0, 2)
    .map((value) => sentenceCase(getPublicConceptPhrase(value)))
    .join(' and ')
  const moodLead = detail.period.socialMood
    .slice(0, 2)
    .map((mood) => sentenceCase(getPublicConceptPhrase(mood)))
    .join(' and ')
  const leadPressure =
    detail.allPressureSnapshots[0]?.publicLabel ?? detail.allPressureSnapshots[0]?.label ?? null

  if (leadPressure) {
    return `${detail.period.title} is a time of ${moodLead || 'mixed feeling'}. ${valueLead || 'Its main values'} sit close to the surface, and ${leadPressure.toLowerCase()} is shaping both daily life and political power.`
  }

  return `${detail.period.title} is shaped by ${valueLead || 'its main values'}, with a mood of ${moodLead || 'mixed feeling'}.`
}

interface EverydayLensMetric {
  id: string
  label: string
  value: number
  descriptor: string
  explanation: string
  accentClass: string
  fillClass: string
  glowClass: string
  shellClass: string
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function describeBand(
  value: number,
  bands: [number, string][],
) {
  for (const [threshold, label] of bands) {
    if (value <= threshold) {
      return label
    }
  }

  return bands[bands.length - 1]?.[1] ?? ''
}

function buildEverydayLens(period: Period): EverydayLensMetric[] {
  const pressure = period.pressureScores
  const safety = clampScore(
    average([
      100 - (pressure.economicPrecarity ?? 50),
      100 - (pressure.militarization ?? 50),
      100 - (pressure.ecologicalStrain ?? 50),
      pressure.socialCohesion ?? 50,
      pressure.institutionalLegitimacy ?? 50,
    ]),
  )
  const freedom = clampScore(
    average([
      pressure.individualAutonomy ?? 50,
      100 - (pressure.moralCertainty ?? 50),
      100 - (pressure.militarization ?? 50),
    ]),
  )
  const strain = clampScore(
    average([
      pressure.economicPrecarity ?? 50,
      pressure.inequality ?? 50,
      pressure.informationAcceleration ?? 50,
      pressure.militarization ?? 50,
      pressure.ecologicalStrain ?? 50,
    ]),
  )
  const future = clampScore(
    average([
      pressure.publicHope ?? 50,
      pressure.institutionalLegitimacy ?? 50,
      100 - (pressure.economicPrecarity ?? 50),
    ]),
  )

  return [
    {
      id: 'safety',
      label: 'Safety',
      value: safety,
      descriptor: describeBand(safety, [
        [25, 'precarious'],
        [45, 'fragile'],
        [65, 'uneven'],
        [85, 'mostly secure'],
        [100, 'secure'],
      ]),
      explanation: period.insecurityExposure,
      accentClass: 'text-cyan-100',
      fillClass: 'from-cyan-300/95 via-cyan-200/60 to-cyan-100/10',
      glowClass: 'bg-cyan-300/10',
      shellClass: 'border-[rgba(103,232,249,0.16)] bg-[rgba(103,232,249,0.05)]',
    },
    {
      id: 'freedom',
      label: 'Freedom',
      value: freedom,
      descriptor: describeBand(freedom, [
        [25, 'tightly limited'],
        [45, 'restricted'],
        [65, 'partial'],
        [85, 'widening'],
        [100, 'broad'],
      ]),
      explanation: period.autonomyVsObligation,
      accentClass: 'text-emerald-100',
      fillClass: 'from-emerald-300/95 via-emerald-200/60 to-emerald-100/10',
      glowClass: 'bg-emerald-300/10',
      shellClass: 'border-[rgba(110,231,183,0.16)] bg-[rgba(110,231,183,0.05)]',
    },
    {
      id: 'pressure',
      label: 'Pressure',
      value: strain,
      descriptor: describeBand(strain, [
        [25, 'light'],
        [45, 'present'],
        [65, 'heavy'],
        [85, 'intense'],
        [100, 'crushing'],
      ]),
      explanation: period.opportunityVsPrecarity,
      accentClass: 'text-amber-100',
      fillClass: 'from-amber-300/95 via-amber-200/65 to-amber-100/10',
      glowClass: 'bg-amber-300/10',
      shellClass: 'border-[rgba(243,177,91,0.16)] bg-[rgba(243,177,91,0.06)]',
    },
    {
      id: 'future',
      label: 'Future',
      value: future,
      descriptor: describeBand(future, [
        [25, 'dim'],
        [45, 'guarded'],
        [65, 'uncertain'],
        [85, 'open'],
        [100, 'hopeful'],
      ]),
      explanation: period.senseOfFuture,
      accentClass: 'text-fuchsia-100',
      fillClass: 'from-fuchsia-300/95 via-fuchsia-200/60 to-fuchsia-100/10',
      glowClass: 'bg-fuchsia-300/10',
      shellClass: 'border-[rgba(217,70,239,0.16)] bg-[rgba(217,70,239,0.05)]',
    },
  ]
}

interface SectionDisclosureProps {
  eyebrow?: string
  title: string
  summary: string
  isCollapsed: boolean
  onToggle: () => void
  children: ReactNode
}

function SectionDisclosure({
  eyebrow,
  title,
  summary,
  isCollapsed,
  onToggle,
  children,
}: SectionDisclosureProps) {
  return (
    <section className="reveal-up">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h3 className={`${eyebrow ? 'mt-1' : ''} text-base text-stone-100`}>{title}</h3>
          {isCollapsed ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-400">{summary}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          className="ui-action rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-300 transition hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
        >
          {isCollapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {!isCollapsed ? <div className="mt-3">{children}</div> : null}
    </section>
  )
}

function LivedVoiceCard({
  title,
  voices,
  period,
}: {
  title: string
  voices: LivedVoice[]
  period: Period
}) {
  const [activeVoiceId, setActiveVoiceId] = useState(voices[0]?.id ?? '')
  const everydayLens = useMemo(() => buildEverydayLens(period), [period])

  const activeVoice =
    voices.find((voice) => voice.id === activeVoiceId) ?? voices[0] ?? null

  if (!activeVoice) {
    return null
  }

  return (
    <article className="voice-shell reveal-up reveal-delay-1 relative overflow-hidden rounded-[1.35rem] border p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(243,177,91,0.08),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(121,219,194,0.08),_transparent_34%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Lived voice</p>
            <h3 className="mt-2 text-base text-stone-100">{title}</h3>
            {getPublicVoiceSpeakerFrame(activeVoice) ? (
              <p className="mt-2 text-sm leading-6 text-stone-300">
                {getPublicVoiceSpeakerFrame(activeVoice)}
              </p>
            ) : null}
          </div>
          <div className="voice-wave" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => (
              <span key={`${title}-voice-bar-${index}`} />
            ))}
          </div>
        </div>
        {voices.length > 1 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {voices.map((voice) => (
              <button
                key={voice.id}
                type="button"
                onClick={() => setActiveVoiceId(voice.id)}
                className={`ui-action rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                  voice.id === activeVoice.id
                    ? 'border-amber-300/30 bg-amber-300/10 text-amber-100'
                    : 'text-stone-300 hover:text-stone-100'
                }`}
              >
                {voice.label}
              </button>
            ))}
          </div>
        ) : null}
        {getPublicVoicePrompt(activeVoice) ? (
          <p className="mt-4 text-sm leading-6 text-stone-500">{getPublicVoicePrompt(activeVoice)}</p>
        ) : null}
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-50 md:text-lg">
          “{getPublicVoiceResponse(activeVoice)}”
        </p>
        <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4">
          <p className="eyebrow">What life feels like here</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {everydayLens.map((metric) => (
              <article
                key={metric.id}
                className={`rounded-[1.15rem] border p-4 ${metric.shellClass}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-[10px] uppercase tracking-[0.2em] ${metric.accentClass}`}>
                    {metric.label}
                  </p>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-stone-500">
                    {metric.descriptor}
                  </span>
                </div>
                <div className="mt-4 flex items-start gap-4">
                  <div className={`relative h-20 w-4 shrink-0 overflow-hidden rounded-full bg-white/6 ${metric.glowClass}`}>
                    <div
                      className={`absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t ${metric.fillClass}`}
                      style={{ height: `${metric.value}%` }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg text-stone-100">{metric.value}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{metric.explanation}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function EchoConstellation({
  sourceTitle,
  echoes,
  activeEchoId,
}: {
  sourceTitle: string
  echoes: SelectedPeriodDetail['echoes']
  activeEchoId: string | null
}) {
  return (
    <div className="rounded-[1rem] border border-cyan-300/14 bg-black/18 px-3 py-3">
      <div className="echo-constellation">
        <div className="echo-constellation-source">
          <span className="echo-route-stop echo-route-stop-source" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-amber-100">{sourceTitle}</span>
        </div>
        <div className="echo-constellation-branches">
          {echoes.map((echo) => {
            const isActive = echo.link.id === activeEchoId

            return (
              <div
                key={`constellation-${echo.link.id}`}
                className={`echo-constellation-branch ${isActive ? 'echo-constellation-branch-active' : ''}`}
              >
                <span className="echo-route-track" />
                <span className="echo-route-stop echo-route-stop-target" />
                <span
                  className={`text-[11px] uppercase tracking-[0.18em] ${
                    isActive ? 'text-cyan-50' : 'text-cyan-100/80'
                  }`}
                >
                  {echo.counterpart.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface DetailSectionsProps {
  detail: SelectedPeriodDetail
  selectedPressureId: string | null
  selectedPressureSeries: PressureOverlaySeries | null
  pressureCascade: ReturnType<typeof buildPressureCascade>
  showEchoes: boolean
  activeEchoLinkId: string | null
  viewMode: DetailViewMode
  onFocusEcho: (echoId: string) => void
  onFollowEcho: (periodId: string) => void
  onCompareToPeriod: (periodId: string) => void
}

function DetailSections({
  detail,
  selectedPressureId,
  selectedPressureSeries,
  pressureCascade,
  showEchoes,
  activeEchoLinkId,
  viewMode,
  onFocusEcho,
  onFollowEcho,
  onCompareToPeriod,
}: DetailSectionsProps) {
  const { period, events, snapshot, echoes, scaleSummaries, pressureSnapshots, allPressureSnapshots } = detail
  const activeEcho =
    echoes.find((echo) => echo.link.id === activeEchoLinkId) ?? echoes[0] ?? null
  const [collapsedSections, setCollapsedSections] = useState<Record<DetailSectionId, boolean>>(
    () => buildCollapsedSections(viewMode, showEchoes),
  )

  function toggleSection(sectionId: DetailSectionId) {
    setCollapsedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }))
  }

  return (
    <>
      <SectionDisclosure
        title="What changed"
        summary={`${period.whatEmerged.concat(period.newPossibilities).slice(0, 5).length} gains in view, ${period.whatFaded.concat(period.whatBroke).slice(0, 5).length} losses in view.`}
        isCollapsed={collapsedSections.shifts}
        onToggle={() => toggleSection('shifts')}
      >
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-emerald-200/10 bg-emerald-300/5 p-4">
            <h3 className="text-sm uppercase tracking-[0.22em] text-emerald-200">
              What emerged
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
              {period.whatEmerged.concat(period.newPossibilities).slice(0, 5).map((item) => (
                <li key={item}>{sentenceCase(getPublicConceptPhrase(item))}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-rose-200/10 bg-rose-300/5 p-4">
            <h3 className="text-sm uppercase tracking-[0.22em] text-rose-200">
              What frayed
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
              {period.whatFaded.concat(period.whatBroke).slice(0, 5).map((item) => (
                <li key={item}>{sentenceCase(getPublicConceptPhrase(item))}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="Across scales"
        summary={`${scaleSummaries.length} scale views stay available here.`}
        isCollapsed={collapsedSections.scales}
        onToggle={() => toggleSection('scales')}
      >
              <div className="mt-3 grid gap-3 2xl:grid-cols-2">
          {scaleSummaries.map((summary) => {
            const scaleIsImpacted = pressureCascade?.impactedScales.includes(summary.scale)

            return (
              <div
                key={summary.scale}
                className={`rounded-[1.25rem] border p-4 ${getScaleShellClass(
                  summary.scale,
                  Boolean(scaleIsImpacted),
                )}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`text-sm uppercase tracking-[0.22em] ${getScaleAccent(summary.scale)}`}
                  >
                    {titleCaseLabel(summary.scale)}
                  </h3>
                  <span className="text-xs text-stone-500">{summary.headline}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-300">{summary.body}</p>
              </div>
            )
          })}
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="Forces in play"
        summary={
          selectedPressureSeries
            ? `${selectedPressureSeries.publicLabel ?? selectedPressureSeries.label} is in focus within ${allPressureSnapshots.length} tracked forces. Showing the strongest ${pressureSnapshots.length}.`
            : `${allPressureSnapshots.length} tracked forces shape this period. Showing the strongest ${pressureSnapshots.length}.`
        }
        isCollapsed={collapsedSections.pressures}
        onToggle={() => toggleSection('pressures')}
      >
        <div className="mt-3 grid gap-3">
          {pressureSnapshots.map((pressure) => {
            const isSelectedPressure = selectedPressureId === pressure.id

            return (
              <div key={pressure.id}>
                <div className="flex items-center justify-between gap-3 text-sm text-stone-200">
                  <span className={isSelectedPressure ? 'text-amber-100' : ''}>
                    {pressure.publicLabel ?? pressure.label}
                  </span>
                  <span className="text-stone-400">{pressure.value}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                  <div
                    className={`h-full rounded-full ${
                      pressure.polarity === 'stress'
                        ? isSelectedPressure
                          ? 'bg-amber-300'
                          : 'bg-amber-300/85'
                        : isSelectedPressure
                          ? 'bg-cyan-300'
                          : 'bg-cyan-300/85'
                    }`}
                    style={{ width: `${pressure.value}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-sm leading-6 text-stone-400">
          {getPublicPeriodPressureSummary(period)}
        </p>
      </SectionDisclosure>

      <SectionDisclosure
        title="Follow echoes"
        summary={
          echoes.length
            ? `${echoes.length} curated echo${echoes.length === 1 ? '' : 'es'} open outward from this period.`
            : 'No echo yet.'
        }
        isCollapsed={collapsedSections.echoes}
        onToggle={() => toggleSection('echoes')}
      >
        <div className="mt-3 grid gap-3">
          {echoes.length ? (
            <>
              <div className="flex flex-wrap gap-2">
                {echoes.map((echo) => {
                  const isActiveEcho = activeEcho?.link.id === echo.link.id

                  return (
                    <button
                      key={echo.link.id}
                      type="button"
                      onClick={() => onFocusEcho(echo.link.id)}
                      className={`rounded-full border px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 ${
                        isActiveEcho
                          ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                          : 'border-white/10 bg-white/4 text-stone-300 hover:border-white/20 hover:text-stone-100'
                      }`}
                    >
                      {echo.counterpart.title}
                    </button>
                  )
                })}
              </div>

              {activeEcho ? (
                <article
                  className={`rounded-[1.25rem] border p-4 ${
                    showEchoes
                      ? 'border-cyan-300/18 bg-cyan-300/6'
                      : 'border-white/8 bg-white/4'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm uppercase tracking-[0.22em] text-cyan-100">
                        {activeEcho.counterpart.title}
                      </h4>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                        {activeEcho.counterpart.rangeLabel}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">
                      {formatConfidence(activeEcho.link.confidence)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <EchoConstellation
                      sourceTitle={period.title}
                      echoes={echoes}
                      activeEchoId={activeEcho.link.id}
                    />
                  </div>

                  <p className="mt-3 text-sm leading-6 text-stone-200">
                    {getPublicEchoSimilarityLabel(activeEcho.link)}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-400">
                    {getPublicEchoSimilarityReasons(activeEcho.link).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    {getPublicEchoNotes(activeEcho.link)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeEcho.link.dimensions.map((dimension) => (
                      <span
                        key={dimension}
                        className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-300"
                      >
                        {titleCaseLabel(dimension)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onFollowEcho(activeEcho.counterpart.id)}
                      className="ui-action rounded-full border-cyan-300/20 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-200/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45"
                    >
                      Jump to echoed period
                    </button>
                    <button
                      type="button"
                      onClick={() => onCompareToPeriod(activeEcho.counterpart.id)}
                      className="ui-action rounded-full border-cyan-300/20 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-200/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45"
                    >
                      Compare the pair
                    </button>
                  </div>
                </article>
              ) : null}
            </>
          ) : (
            <div className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4 text-sm leading-6 text-stone-400">
              No echo yet.
            </div>
          )}
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        title="Events"
        summary={`${events.length} event${events.length === 1 ? '' : 's'} anchor this period.`}
        isCollapsed={collapsedSections.texture}
        onToggle={() => toggleSection('texture')}
      >
        <div className="mt-3 grid gap-3">
          {events.map((event) => {
            const pressureMatch =
              !selectedPressureId || event.pressureDrivers.includes(selectedPressureId)

            return (
              <article
                key={event.id}
                className={`rounded-[1.25rem] border p-4 ${
                  selectedPressureId
                    ? pressureMatch
                      ? 'border-amber-300/16 bg-amber-300/6'
                      : 'border-white/8 bg-white/2 opacity-70'
                    : 'border-white/8 bg-white/4'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm uppercase tracking-[0.18em] text-stone-100">
                    {event.title}
                  </h4>
                  <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                    {event.startYear === event.endYear
                      ? event.startYear
                      : `${event.startYear}-${event.endYear}`}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  {getPublicEventSummary(event)}
                </p>
              </article>
            )
          })}

          {snapshot ? (
            <article className="rounded-[1.25rem] border border-amber-200/14 bg-amber-300/6 p-4">
              <h4 className="text-sm uppercase tracking-[0.2em] text-amber-100">
                {getPublicSnapshotTitle(snapshot)}
              </h4>
              <p className="mt-3 text-sm leading-6 text-stone-200">
                {getPublicSnapshotSummary(snapshot)}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                {getPublicSnapshotDailyReality(snapshot)}
              </p>
            </article>
          ) : null}

        </div>
      </SectionDisclosure>
    </>
  )
}

interface DetailPanelProps {
  datasetId: string
  detail: SelectedPeriodDetail
  insightPrompt: InsightPrompt | null
  isOpen: boolean
  showEchoes: boolean
  selectedPressureId: string | null
  selectedPressureSeries: PressureOverlaySeries | null
  activeEchoLinkId: string | null
  viewMode: DetailViewMode
  onToggleOpen: () => void
  onFocusEcho: (echoId: string) => void
  onFollowEcho: (periodId: string) => void
  onOpenInsights: (section: InsightPrompt['destinationSection'], targetId: string) => void
  onCompareToPeriod: (periodId: string) => void
  onViewModeChange: (viewMode: DetailViewMode) => void
}

export function DetailPanel({
  datasetId,
  detail,
  insightPrompt,
  isOpen,
  showEchoes,
  selectedPressureId,
  selectedPressureSeries,
  activeEchoLinkId,
  viewMode,
  onToggleOpen,
  onFocusEcho,
  onFollowEcho,
  onOpenInsights,
  onCompareToPeriod,
  onViewModeChange,
}: DetailPanelProps) {
  const { period, snapshot } = detail
  const livedVoices = useMemo(() => {
    if (!snapshot) {
      return []
    }

    if (snapshot.voices?.length) {
      return snapshot.voices
    }

    if (!snapshot.response) {
      return []
    }

    return [
      {
        id: `${snapshot.id}-voice`,
        label: 'Voice',
        voiceMode: snapshot.voiceMode,
        speakerFrame: snapshot.speakerFrame,
        publicSpeakerFrame: snapshot.publicSpeakerFrame,
        prompt: snapshot.prompt,
        publicPrompt: snapshot.publicPrompt,
        response: snapshot.response,
        publicResponse: snapshot.publicResponse,
      },
    ]
  }, [snapshot])
  const pressureCascade = buildPressureCascade(detail, selectedPressureId)
  const periodReading = buildPeriodReading(detail)
  const populationRead =
    period.populationLabel ?? formatPopulationEstimate(period.populationEstimate)
  const leadPressureChipLabel =
    detail.allPressureSnapshots[0]?.publicLabel ?? detail.allPressureSnapshots[0]?.label ?? null
  const geographyModel = buildGeographyInsetModel(
    Array.from(
      new Set(
        pressureCascade?.geographyLabels?.length
          ? period.geography.concat(pressureCascade.geographyLabels)
          : period.geography,
      ),
    ),
    pressureCascade
      ? `${pressureCascade.publicLabel ?? pressureCascade.label} through ${period.title}`
      : `${period.title} in place`,
  )
  const supportsInsetMap = datasetId === 'britain-1066-2025'

  return (
    <aside
      className={`glass-panel reveal-up overflow-hidden rounded-[2rem] border border-white/10 transition duration-300 xl:sticky xl:top-5 xl:h-[calc(100vh-2.5rem)] ${
        isOpen ? 'opacity-100' : 'opacity-85'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-6 py-5 md:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-stone-100">{period.title}</h2>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-stone-500">
                {period.rangeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleOpen}
              aria-expanded={isOpen}
              className="ui-action rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-300 transition hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
            >
              {isOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-stone-400">
            {getPublicPeriodSummary(period)}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {period.socialMood.map((mood) => (
              <span
                key={mood}
                className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300"
              >
                {sentenceCase(getPublicConceptPhrase(mood))}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onViewModeChange('guided')}
                className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                  viewMode === 'guided'
                    ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                    : 'text-stone-300 hover:text-stone-100'
                }`}
              >
                Calm read
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('full')}
                className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                  viewMode === 'full'
                    ? 'border-amber-300/35 bg-amber-300/10 text-amber-100'
                    : 'text-stone-300 hover:text-stone-100'
                }`}
              >
                Full read
              </button>
            </div>
          </div>
        </div>

        {isOpen ? (
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 md:px-7">
            {livedVoices.length ? (
              <LivedVoiceCard
                key={snapshot?.id ?? period.id}
                title={snapshot ? getPublicSnapshotTitle(snapshot) : period.title}
                voices={livedVoices}
                period={period}
              />
            ) : null}

            <section className="surface-depth reveal-up rounded-[1.5rem] border border-[rgba(214,211,209,0.08)] p-4">
              <h3 className="text-base text-stone-100">Reading this period</h3>
              <p className="mt-3 text-sm leading-6 text-stone-200">{periodReading}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(214,211,209,0.08)] bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-300">
                  {getReleaseLabel(period.releaseType)}
                </span>
                {leadPressureChipLabel ? (
                  <span className="rounded-full border border-[rgba(243,177,91,0.18)] bg-[rgba(243,177,91,0.08)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100">
                    {leadPressureChipLabel}
                  </span>
                ) : null}
              </div>
            </section>

            {populationRead ? (
              <section className="surface-depth reveal-up rounded-[1.5rem] border border-[rgba(121,219,194,0.16)] bg-[rgba(121,219,194,0.05)] p-4">
                <p className="eyebrow">Scale of life</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-base text-stone-100">{populationRead}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">
                      This is the rough human scale of the country in this period.
                    </p>
                  </div>
                  <span className="rounded-full border border-[rgba(121,219,194,0.16)] bg-[rgba(121,219,194,0.08)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                    Population
                  </span>
                </div>
              </section>
            ) : null}

            {insightPrompt ? (
              <section className="surface-depth reveal-up rounded-[1.5rem] border border-[rgba(243,177,91,0.16)] bg-[rgba(243,177,91,0.06)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow">Pattern to notice</p>
                    <p className="mt-2 text-sm leading-6 text-stone-200">
                      {insightPrompt.publicText ?? insightPrompt.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenInsights(
                        insightPrompt.destinationSection,
                        insightPrompt.destinationTargetId,
                      )
                    }
                    className="ui-action shrink-0 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-amber-100"
                  >
                    See why
                  </button>
                </div>
              </section>
            ) : null}

            {supportsInsetMap ? <GeographyInset model={geographyModel} /> : null}

            <DetailSections
              key={`${period.id}:${viewMode}:${showEchoes ? 'echoes' : 'quiet'}`}
              detail={detail}
              selectedPressureId={selectedPressureId}
              selectedPressureSeries={selectedPressureSeries}
              pressureCascade={pressureCascade}
              showEchoes={showEchoes}
              activeEchoLinkId={activeEchoLinkId}
              viewMode={viewMode}
              onFocusEcho={onFocusEcho}
              onFollowEcho={onFollowEcho}
              onCompareToPeriod={onCompareToPeriod}
            />
          </div>
        ) : null}
      </div>
    </aside>
  )
}
