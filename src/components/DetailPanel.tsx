import { useState, type ReactNode } from 'react'
import { formatConfidence, sentenceCase, titleCaseLabel } from '../lib/format'
import {
  buildGeographyInsetModel,
  buildPressureCascade,
  getScaleAccent,
} from '../lib/loom-data'
import type { Scale } from '../types/domain'
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

interface SectionDisclosureProps {
  eyebrow: string
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
          <p className="eyebrow">{eyebrow}</p>
          <h3 className="mt-1 text-base text-stone-100">{title}</h3>
          {isCollapsed ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-400">{summary}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="ui-action rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-300 transition hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
        >
          {isCollapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {!isCollapsed ? <div className="mt-3">{children}</div> : null}
    </section>
  )
}

interface DetailSectionsProps {
  detail: SelectedPeriodDetail
  selectedPressureId: string | null
  selectedPressureSeries: PressureOverlaySeries | null
  pressureCascade: ReturnType<typeof buildPressureCascade>
  showEchoes: boolean
  viewMode: DetailViewMode
  onCompareToPeriod: (periodId: string) => void
}

function DetailSections({
  detail,
  selectedPressureId,
  selectedPressureSeries,
  pressureCascade,
  showEchoes,
  viewMode,
  onCompareToPeriod,
}: DetailSectionsProps) {
  const { period, events, snapshot, echoes, scaleSummaries, pressureSnapshots } = detail
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
        eyebrow="What shifted"
        title="What emerged and what frayed"
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
        eyebrow="Multi-scale read"
        title="The same period across several scales"
        summary={`${scaleSummaries.length} scale reads stay available here.`}
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
        eyebrow="Pressure summary"
        title="Tracked forces in this period"
        summary={
          selectedPressureSeries
            ? `${selectedPressureSeries.label} is in focus within ${pressureSnapshots.length} tracked forces.`
            : `${pressureSnapshots.length} tracked forces shape this period.`
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
                    {pressure.label}
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
        <p className="mt-4 text-sm leading-6 text-stone-400">{period.pressureSummary}</p>
      </SectionDisclosure>

      <SectionDisclosure
        eyebrow="Echoes"
        title="Cross-era structural rhymes"
        summary={
          echoes.length
            ? `${echoes.length} curated echo${echoes.length === 1 ? '' : 'es'} connect this period to another era.`
            : 'No curated echo pair is attached to this period yet.'
        }
        isCollapsed={collapsedSections.echoes}
        onToggle={() => toggleSection('echoes')}
      >
        <div className="mt-3 grid gap-3">
          {echoes.length ? (
            echoes.map((echo) => (
              <article
                key={echo.link.id}
                className={`rounded-[1.25rem] border p-4 ${
                  showEchoes
                    ? 'border-cyan-300/18 bg-cyan-300/6'
                    : 'border-white/8 bg-white/4'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm uppercase tracking-[0.22em] text-cyan-100">
                      {echo.counterpart.title}
                    </h4>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                      {echo.counterpart.rangeLabel}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">
                    {formatConfidence(echo.link.confidence)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-stone-200">
                  {echo.link.similarityLabel}
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-400">
                  {echo.link.similarityReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => onCompareToPeriod(echo.counterpart.id)}
                    className="ui-action rounded-full border-cyan-300/20 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-200/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45"
                  >
                    Compare these periods
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4 text-sm leading-6 text-stone-400">
              This period does not yet have a curated echo pair.
            </div>
          )}
        </div>
      </SectionDisclosure>

      <SectionDisclosure
        eyebrow="Events and lived texture"
        title="Named events and daily life"
        summary={`${events.length} event${events.length === 1 ? '' : 's'}${snapshot ? ' and one lived snapshot' : ''} anchor this period.`}
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
                {snapshot.title}
              </h4>
              <p className="mt-3 text-sm leading-6 text-stone-200">{snapshot.summary}</p>
              <p className="mt-3 text-sm leading-6 text-stone-400">{snapshot.dailyReality}</p>
            </article>
          ) : null}
        </div>
      </SectionDisclosure>
    </>
  )
}

interface DetailPanelProps {
  detail: SelectedPeriodDetail
  isOpen: boolean
  showEchoes: boolean
  selectedPressureId: string | null
  selectedPressureSeries: PressureOverlaySeries | null
  comparePicking: boolean
  compareActive: boolean
  viewMode: DetailViewMode
  onToggleOpen: () => void
  onToggleEchoes: () => void
  onStartComparePick: () => void
  onCompareToPeriod: (periodId: string) => void
  onViewModeChange: (viewMode: DetailViewMode) => void
}

export function DetailPanel({
  detail,
  isOpen,
  showEchoes,
  selectedPressureId,
  selectedPressureSeries,
  comparePicking,
  compareActive,
  viewMode,
  onToggleOpen,
  onToggleEchoes,
  onStartComparePick,
  onCompareToPeriod,
  onViewModeChange,
}: DetailPanelProps) {
  const { period } = detail
  const pressureCascade = buildPressureCascade(detail, selectedPressureId)
  const geographyModel = buildGeographyInsetModel(
    Array.from(
      new Set(
        pressureCascade?.geographyLabels?.length
          ? period.geography.concat(pressureCascade.geographyLabels)
          : period.geography,
      ),
    ),
    pressureCascade
      ? `${pressureCascade.label} through ${period.title}`
      : `${period.title} in place`,
  )

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
              <p className="eyebrow">Selected period</p>
              <h2 className="font-display text-2xl text-stone-100">{period.title}</h2>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-stone-500">
                {period.rangeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleOpen}
              className="ui-action rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-300 transition hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45"
            >
              {isOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-stone-400">{period.summary}</p>

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
              Choose the second period on the Loom.
            </p>
          ) : null}

          {compareActive ? (
            <p className="mt-4 text-sm leading-6 text-rose-100/85">
              Comparison stays open with the rose-marked period.
            </p>
          ) : null}
        </div>

        {isOpen ? (
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 md:px-7">
            <GeographyInset model={geographyModel} />

            {pressureCascade && selectedPressureSeries ? (
              <section className="surface-depth reveal-up reveal-delay-1 rounded-[1.5rem] border border-amber-300/14 bg-amber-300/7 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Pressure cascade</p>
                    <h3 className="mt-2 text-base text-stone-100">{pressureCascade.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-stone-300">
                      {pressureCascade.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-300/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-100">
                    {pressureCascade.value}
                  </span>
                </div>

                <div className="surface-depth mt-4 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-amber-100">
                    Reading this period through {pressureCascade.label.toLowerCase()}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-stone-200">
                    {period.title} feels this force at {pressureCascade.value}/100.
                    {pressureCascade.matchedEvents.length
                      ? ` It gathers around ${pressureCascade.matchedEvents.length} named event${pressureCascade.matchedEvents.length === 1 ? '' : 's'} and reads most strongly at ${pressureCascade.impactedScales.length ? pressureCascade.impactedScales.map((scale) => titleCaseLabel(scale)).join(', ').toLowerCase() : 'the visible event layer'}.`
                      : ' Here it shapes the climate of the period more than one named turning point.'}
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/7">
                  <div
                    className={`h-full rounded-full ${
                      pressureCascade.polarity === 'stress'
                        ? 'bg-amber-300/85'
                        : 'bg-cyan-300/85'
                    }`}
                    style={{ width: `${pressureCascade.value}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {pressureCascade.impactedScales.length ? (
                    pressureCascade.impactedScales.map((scale) => (
                      <span
                        key={scale}
                        className={`rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${getScaleAccent(scale)}`}
                      >
                        {titleCaseLabel(scale)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm leading-6 text-stone-400">
                      No named event in this period is tagged directly to this force.
                    </span>
                  )}
                </div>

                {pressureCascade.matchedEvents.length ? (
                  <div className="mt-4 grid gap-3">
                    {pressureCascade.matchedEvents.map((event) => (
                      <article
                        key={event.id}
                        className="rounded-[1.25rem] border border-amber-300/16 bg-black/15 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm uppercase tracking-[0.18em] text-amber-100">
                            {event.title}
                          </h4>
                          <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                            {event.geography}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-stone-300">
                          {event.summary}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            <DetailSections
              key={`${period.id}:${viewMode}:${showEchoes ? 'echoes' : 'quiet'}`}
              detail={detail}
              selectedPressureId={selectedPressureId}
              selectedPressureSeries={selectedPressureSeries}
              pressureCascade={pressureCascade}
              showEchoes={showEchoes}
              viewMode={viewMode}
              onCompareToPeriod={onCompareToPeriod}
            />
          </div>
        ) : null}
      </div>
    </aside>
  )
}
