import publicCopyJson from '../../data/public-copy.json'
import type { HumanSnapshot, LivedVoice, Period, PressureSeries } from '../types/domain'
import type { OutlierType } from '../types/insights'

const publicCopy = publicCopyJson
const pressureCopyById = publicCopy.pressureCopy as Record<
  string,
  { label: string; description: string }
>
const familyCopyById = publicCopy.familyCopy as Record<
  string,
  { label: string; prompt: string }
>
const outlierCopyById = publicCopy.outlierCopy as Record<string, { label: string }>

export const bannedPublicTerms = publicCopy.bannedPublicTerms

export function getPublicPressureLabel(
  pressure: Pick<PressureSeries, 'id' | 'label'> & { publicLabel?: string },
) {
  return pressure.publicLabel ?? pressureCopyById[pressure.id]?.label ?? pressure.label
}

export function getPublicPressureDescription(
  pressure: Pick<PressureSeries, 'id' | 'description'> & { publicDescription?: string },
) {
  return (
    pressure.publicDescription ??
    pressureCopyById[pressure.id]?.description ??
    pressure.description
  )
}

export function getPublicPressureLabelById(pressureId: string, fallbackLabel: string) {
  return pressureCopyById[pressureId]?.label ?? fallbackLabel
}

export function getPublicPressureDescriptionById(
  pressureId: string,
  fallbackDescription: string,
) {
  return pressureCopyById[pressureId]?.description ?? fallbackDescription
}

export function getPublicFamilyLabel(clusterLabel: string) {
  return familyCopyById[clusterLabel]?.label ?? 'Recurring pattern'
}

export function getPublicFamilyPrompt(clusterLabel: string) {
  return familyCopyById[clusterLabel]?.prompt ?? 'This era belongs to a recurring pattern.'
}

export function getPublicOutlierLabel(outlierType: OutlierType, fallbackLabel: string) {
  return outlierCopyById[outlierType]?.label ?? fallbackLabel
}

export function getPublicPeriodSummary(period: Period) {
  return period.publicSummary ?? period.summary
}

export function getPublicPeriodPressureSummary(period: Period) {
  return period.publicPressureSummary ?? period.pressureSummary
}

export function getPublicPeriodReading(period: Period) {
  return period.publicReading ?? null
}

export function getPublicSnapshotTitle(snapshot: HumanSnapshot) {
  return snapshot.publicTitle ?? snapshot.title
}

export function getPublicSnapshotSummary(snapshot: HumanSnapshot) {
  return snapshot.publicSummary ?? snapshot.summary
}

export function getPublicSnapshotDailyReality(snapshot: HumanSnapshot) {
  return snapshot.publicDailyReality ?? snapshot.dailyReality
}

export function getPublicVoiceSpeakerFrame(voice: LivedVoice) {
  return voice.publicSpeakerFrame ?? voice.speakerFrame
}

export function getPublicVoicePrompt(voice: LivedVoice) {
  return voice.publicPrompt ?? voice.prompt
}

export function getPublicVoiceResponse(voice: LivedVoice) {
  return voice.publicResponse ?? voice.response
}
