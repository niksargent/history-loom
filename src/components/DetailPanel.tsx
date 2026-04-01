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
import type { LivedVoice, Scale } from '../types/domain'
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
    .map((value) => sentenceCase(value))
    .join(' and ')
  const moodLead = detail.period.socialMood
    .slice(0, 2)
    .map((mood) => sentenceCase(mood))
    .join(' / ')
  const leadPressure =
    detail.allPressureSnapshots[0]?.publicLabel ?? detail.allPressureSnapshots[0]?.label ?? null
  const releaseLabel = getReleaseLabel(detail.period.releaseType).toLowerCase()

  if (leadPressure) {
    return `${detail.period.title} feels like a ${releaseLabel} moment: ${valueLead || 'its main values'} sit close to the surface, the mood leans ${moodLead || 'mixed'}, and one of the biggest pressures is ${leadPressure.toLowerCase()}.`
  }

  return `${detail.period.title} feels like a ${releaseLabel} moment shaped by ${valueLead || 'its main values'}, with a mood of ${moodLead || 'mixed feeling'}.`
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
}: {
  title: string
  voices: LivedVoice[]
}) {
  const [activeVoiceId, setActiveVoiceId] = useState(voices[0]?.id ?? '')

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
                <li key={item}>{sentenceCase(item)}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-rose-200/10 bg-rose-300/5 p-4">
            <h3 className="text-sm uppercase tracking-[0.22em] text-rose-200">
              What frayed
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
              {period.whatFaded.concat(period.whatBroke).slice(0, 5).map((item) => (
                <li key={item}>{sentenceCase(item)}</li>
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
                    {activeEcho.link.similarityLabel}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-400">
                    {activeEcho.link.similarityReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
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
                <p className="mt-3 text-sm leading-6 text-stone-300">{event.summary}</p>
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
  comparePicking: boolean
  compareActive: boolean
  activeEchoLinkId: string | null
  viewMode: DetailViewMode
  onToggleOpen: () => void
  onToggleEchoes: () => void
  onFocusEcho: (echoId: string) => void
  onFollowEcho: (periodId: string) => void
  onOpenInsights: (section: InsightPrompt['destinationSection'], targetId: string) => void
  onStartComparePick: () => void
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
  comparePicking,
  compareActive,
  activeEchoLinkId,
  viewMode,
  onToggleOpen,
  onToggleEchoes,
  onFocusEcho,
  onFollowEcho,
  onOpenInsights,
  onStartComparePick,
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
                {mood}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onStartComparePick}
                className="ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-300 transition hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
              >
                {compareActive
                  ? 'Exit compare'
                  : comparePicking
                    ? 'Cancel compare'
                    : 'Start compare'}
              </button>
              <button
                type="button"
                onClick={onToggleEchoes}
                className={`ui-action rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 ${
                  showEchoes
                    ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                    : 'text-stone-300 hover:text-stone-100'
                }`}
              >
                {showEchoes ? 'Hide echoes' : 'Reveal echoes'}
              </button>
            </div>

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

          {comparePicking ? (
            <p className="mt-4 text-sm leading-6 text-amber-100/90">
              Choose the second period.
            </p>
          ) : null}
        </div>

        {isOpen ? (
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 md:px-7">
            {livedVoices.length ? (
              <LivedVoiceCard
                key={snapshot?.id ?? period.id}
                title={snapshot?.title ?? period.title}
                voices={livedVoices}
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
