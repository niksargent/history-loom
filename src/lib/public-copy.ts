import publicCopyJson from '../../data/public-copy.json'
import type {
  EchoLink,
  Event,
  HumanSnapshot,
  LivedVoice,
  Period,
  PressureSeries,
} from '../types/domain'
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
const publicPhraseOverrides = (publicCopy.publicPhraseOverrides ?? {}) as Record<string, string>

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

export function getPublicEventSummary(event: Event) {
  return event.publicSummary ?? event.summary
}

export function getPublicEchoSimilarityLabel(echo: EchoLink) {
  return echo.publicSimilarityLabel ?? echo.similarityLabel
}

export function getPublicEchoSimilarityReasons(echo: EchoLink) {
  return echo.publicSimilarityReasons ?? echo.similarityReasons
}

export function getPublicEchoNotes(echo: EchoLink) {
  return echo.publicNotes ?? echo.notes
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

export function getPublicConceptPhrase(rawPhrase: string) {
  const trimmed = rawPhrase.trim()

  if (!trimmed) {
    return trimmed
  }

  const lower = trimmed.toLowerCase()
  const exactOverride = publicPhraseOverrides[lower]

  if (exactOverride) {
    return exactOverride
  }

  return trimmed
    .replace(/\bconstitutional crisis\b/gi, 'crisis over the rules of government')
    .replace(/\bconstitutional change\b/gi, 'change in the rules of government')
    .replace(/\bconstitutional redesign\b/gi, 'new rules of government')
    .replace(/\bconstitutional monarchy\b/gi, 'monarchy with lasting limits')
    .replace(/\bconstitutional order\b/gi, 'rules of government')
    .replace(/\bconstitutional space\b/gi, 'room to act politically')
    .replace(/\bconstitutional restraint\b/gi, 'lasting limits on rulers')
    .replace(/\bsovereignty\b/gi, 'who really rules')
    .replace(/\blegitimacy\b/gi, 'public trust')
    .replace(/\bmonarchical\b/gi, 'monarchy')
    .replace(/\brestoration\b/gi, 'return of monarchy')
    .replace(/\bauthority\b/gi, 'power')
    .replace(/\bcivic\b/gi, 'public')
    .replace(/\bobedience\b/gi, 'being told to obey')
}
