import { sentenceCase } from './format'
import {
  getPublicConceptPhrase,
  getPublicEchoNotes,
  getPublicEchoSimilarityLabel,
  getPublicEchoSimilarityReasons,
} from './public-copy'
import type { ComparePanelModel, EchoRevealModel, PressureSnapshot } from '../types/view'

export type CompareStoryMode = 'curated' | 'generated' | 'thin'

export interface CompareSharedPressureEntry {
  id: string
  label: string
  sourceValue: number
  targetValue: number
  averageValue: number
}

export interface CompareEvidenceSection {
  id: 'values' | 'mood' | 'building' | 'losing'
  title: string
  overlap: string[]
  sourceOnly: string[]
  targetOnly: string[]
  emptySharedLabel: string
}

export interface CompareStoryModel {
  mode: CompareStoryMode
  echoLink: EchoRevealModel['link'] | null
  heading: string
  claim: string
  body: string
  returns: string[]
  changeLine: string
  bridgeLabels: string[]
  sourceEdgeLabel: string
  targetEdgeLabel: string
  sharedPressures: CompareSharedPressureEntry[]
  evidenceSections: CompareEvidenceSection[]
}

function intersect(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()))
  return left.filter((item) => rightSet.has(item.toLowerCase())).map(getPublicConceptPhrase)
}

function difference(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()))
  return left.filter((item) => !rightSet.has(item.toLowerCase())).map(getPublicConceptPhrase)
}

function buildEvidenceSections(model: ComparePanelModel): CompareEvidenceSection[] {
  return [
    {
      id: 'values',
      title: 'What both periods are trying to protect',
      overlap: intersect(model.source.period.dominantValues, model.target.period.dominantValues),
      sourceOnly: difference(model.source.period.dominantValues, model.target.period.dominantValues),
      targetOnly: difference(model.target.period.dominantValues, model.source.period.dominantValues),
      emptySharedLabel: 'These periods are protecting different things.',
    },
    {
      id: 'mood',
      title: 'What everyday life feels like',
      overlap: intersect(model.source.period.socialMood, model.target.period.socialMood),
      sourceOnly: difference(model.source.period.socialMood, model.target.period.socialMood),
      targetOnly: difference(model.target.period.socialMood, model.source.period.socialMood),
      emptySharedLabel: 'Even with some of the same pressures, daily life does not feel the same.',
    },
    {
      id: 'building',
      title: 'What each period is building',
      overlap: intersect(
        model.source.period.whatEmerged.concat(model.source.period.newPossibilities),
        model.target.period.whatEmerged.concat(model.target.period.newPossibilities),
      ),
      sourceOnly: difference(
        model.source.period.whatEmerged.concat(model.source.period.newPossibilities).slice(0, 8),
        model.target.period.whatEmerged.concat(model.target.period.newPossibilities).slice(0, 8),
      ),
      targetOnly: difference(
        model.target.period.whatEmerged.concat(model.target.period.newPossibilities).slice(0, 8),
        model.source.period.whatEmerged.concat(model.source.period.newPossibilities).slice(0, 8),
      ),
      emptySharedLabel: 'These periods are not building the same new things.',
    },
    {
      id: 'losing',
      title: 'What each period is losing',
      overlap: intersect(
        model.source.period.whatFaded.concat(model.source.period.whatBroke),
        model.target.period.whatFaded.concat(model.target.period.whatBroke),
      ),
      sourceOnly: difference(
        model.source.period.whatFaded.concat(model.source.period.whatBroke).slice(0, 8),
        model.target.period.whatFaded.concat(model.target.period.whatBroke).slice(0, 8),
      ),
      targetOnly: difference(
        model.target.period.whatFaded.concat(model.target.period.whatBroke).slice(0, 8),
        model.source.period.whatFaded.concat(model.source.period.whatBroke).slice(0, 8),
      ),
      emptySharedLabel: 'They are losing different things from the older world.',
    },
  ]
}

function buildSharedPressures(model: ComparePanelModel): CompareSharedPressureEntry[] {
  const targetById = new Map(model.target.allPressureSnapshots.map((pressure) => [pressure.id, pressure]))

  return model.source.allPressureSnapshots
    .map((sourcePressure) => {
      const targetPressure = targetById.get(sourcePressure.id)

      if (!targetPressure) {
        return null
      }

      return {
        id: sourcePressure.id,
        label: sourcePressure.publicLabel ?? sourcePressure.label,
        sourceValue: sourcePressure.value,
        targetValue: targetPressure.value,
        averageValue: (sourcePressure.value + targetPressure.value) / 2,
      }
    })
    .filter((entry): entry is CompareSharedPressureEntry => Boolean(entry))
    .sort((left, right) => right.averageValue - left.averageValue)
}

function findEchoLink(model: ComparePanelModel) {
  return (
    model.source.echoes.find((echo) => echo.counterpart.id === model.target.period.id)?.link ??
    model.target.echoes.find((echo) => echo.counterpart.id === model.source.period.id)?.link ??
    null
  )
}

function strongestEdgePressure(
  sourcePressures: PressureSnapshot[],
  targetPressures: PressureSnapshot[],
  direction: 'source' | 'target',
) {
  const targetById = new Map(targetPressures.map((pressure) => [pressure.id, pressure]))
  const deltas = sourcePressures
    .map((sourcePressure) => {
      const targetPressure = targetById.get(sourcePressure.id)
      if (!targetPressure) {
        return null
      }

      const delta = sourcePressure.value - targetPressure.value
        return {
        label: sourcePressure.publicLabel ?? sourcePressure.label,
        delta,
      }
    })
    .filter((entry): entry is { label: string; delta: number } => Boolean(entry))

  const filtered =
    direction === 'source'
      ? deltas.filter((entry) => entry.delta > 0).sort((left, right) => right.delta - left.delta)
      : deltas.filter((entry) => entry.delta < 0).sort((left, right) => left.delta - right.delta)

  return filtered[0]?.label ?? null
}

function pickLead(items: string[]) {
  return items[0] ? sentenceCase(items[0]) : null
}

function strongestDifferenceSection(sections: CompareEvidenceSection[]) {
  return (
    [...sections].sort(
      (left, right) =>
        right.sourceOnly.length +
        right.targetOnly.length -
        (left.sourceOnly.length + left.targetOnly.length),
    )[0] ?? null
  )
}

function strongestSharedValues(sections: CompareEvidenceSection[]) {
  return [...sections].sort((left, right) => right.overlap.length - left.overlap.length)[0] ?? null
}

function buildGeneratedBody(sharedPressures: CompareSharedPressureEntry[], model: ComparePanelModel) {
  const topLabels = sharedPressures.slice(0, 3).map((entry) => sentenceCase(entry.label))

  if (topLabels.length >= 3) {
    return `${model.source.period.title} and ${model.target.period.title} are pushed by similar forces: ${topLabels[0]}, ${topLabels[1]}, and ${topLabels[2]}.`
  }

  if (topLabels.length === 2) {
    return `${model.source.period.title} and ${model.target.period.title} are pulled in similar directions by ${topLabels[0]} and ${topLabels[1]}.`
  }

  if (topLabels.length === 1) {
    return `${model.source.period.title} and ${model.target.period.title} connect most clearly through ${topLabels[0]}.`
  }

  return 'These periods are easier to read through contrast than through a strong recurring pattern.'
}

function buildChangeLine(
  differenceSection: CompareEvidenceSection | null,
  sourceEdgeLabel: string | null,
  targetEdgeLabel: string | null,
) {
  const sourceLead = pickLead(differenceSection?.sourceOnly ?? [])
  const targetLead = pickLead(differenceSection?.targetOnly ?? [])

  if (differenceSection?.id === 'building') {
    if (sourceLead && targetLead) {
      return `The first period pushes more toward ${sourceLead}, while the second pushes more toward ${targetLead}.`
    }

    return 'The biggest difference is what kind of future each period is trying to create.'
  }

  if (differenceSection?.id === 'losing') {
    if (sourceLead && targetLead) {
      return `The first period is losing ${sourceLead}, while the second is losing ${targetLead}.`
    }

    return 'The biggest difference is what each period feels is slipping away.'
  }

  if (differenceSection?.id === 'mood') {
    if (sourceLead && targetLead) {
      return `The first period feels more ${sourceLead}, while the second feels more ${targetLead}.`
    }

    return 'The mood changes more sharply than the pressure pattern does.'
  }

  if (differenceSection?.id === 'values') {
    if (sourceLead && targetLead) {
      return `The first period is defending ${sourceLead} more strongly, while the second leans more toward ${targetLead}.`
    }

    return 'The same pressure mix can still serve different ideals.'
  }

  if (sourceEdgeLabel && targetEdgeLabel) {
    return `${sentenceCase(sourceEdgeLabel)} stands out more in one period, while ${sentenceCase(targetEdgeLabel)} stands out more in the other.`
  }

  return 'The returning pattern is real, but it lands differently the second time.'
}

export function buildCompareStory(model: ComparePanelModel): CompareStoryModel {
  const echoLink = findEchoLink(model)
  const evidenceSections = buildEvidenceSections(model)
  const sharedPressures = buildSharedPressures(model)
  const topBridgeLabels = sharedPressures.slice(0, 3).map((entry) => sentenceCase(entry.label))
  const sourceEdgeLabel =
    strongestEdgePressure(model.source.allPressureSnapshots, model.target.allPressureSnapshots, 'source') ??
    null
  const targetEdgeLabel =
    strongestEdgePressure(model.target.allPressureSnapshots, model.source.allPressureSnapshots, 'source') ??
    null
  const differenceSection = strongestDifferenceSection(evidenceSections)

  if (echoLink) {
    const reasons = getPublicEchoSimilarityReasons(echoLink).slice(0, 3)

    return {
      mode: 'curated',
      echoLink,
      heading: 'Why these periods belong together',
      claim: getPublicEchoSimilarityLabel(echoLink),
      body: getPublicEchoNotes(echoLink),
      returns: reasons.length ? reasons : ['The same forces keep showing up in both periods.'],
      changeLine: buildChangeLine(differenceSection, sourceEdgeLabel, targetEdgeLabel),
      bridgeLabels: topBridgeLabels.length ? topBridgeLabels : reasons.map((reason) => sentenceCase(reason)).slice(0, 3),
      sourceEdgeLabel: sourceEdgeLabel ? `Stands out more here: ${sentenceCase(sourceEdgeLabel)}` : 'Stands out more here: earlier pressures',
      targetEdgeLabel: targetEdgeLabel ? `Stands out more here: ${sentenceCase(targetEdgeLabel)}` : 'Stands out more here: later pressures',
      sharedPressures,
      evidenceSections,
    }
  }

  const overlapLeader = strongestSharedValues(evidenceSections)
  const enoughSharedPressure = sharedPressures.filter((entry) => entry.averageValue >= 45).length >= 3
  const enoughSharedTexture = Boolean(overlapLeader?.overlap.length) || sharedPressures.length >= 4

  if (enoughSharedPressure || enoughSharedTexture) {
    const claim =
      sharedPressures.length >= 3
        ? 'These periods are pushed by a similar mix of forces.'
        : 'These periods belong in the same conversation, even without a hand-written echo.'

    return {
      mode: 'generated',
      echoLink: null,
      heading: 'Why these periods belong together',
      claim,
      body: buildGeneratedBody(sharedPressures, model),
      returns:
        topBridgeLabels.length
          ? topBridgeLabels.map((label) => `${label} is strong in both periods.`)
          : ['The same forces are doing more of the work than repeated labels are.'],
      changeLine: buildChangeLine(differenceSection, sourceEdgeLabel, targetEdgeLabel),
      bridgeLabels: topBridgeLabels,
      sourceEdgeLabel: sourceEdgeLabel ? `Stronger here: ${sentenceCase(sourceEdgeLabel)}` : 'Stronger here: this side of the story',
      targetEdgeLabel: targetEdgeLabel ? `Stronger here: ${sentenceCase(targetEdgeLabel)}` : 'Stronger here: this side of the story',
      sharedPressures,
      evidenceSections,
    }
  }

  return {
    mode: 'thin',
    echoLink: null,
    heading: 'Where the contrast matters more',
    claim: 'These periods are clearer as a contrast than as a strong echo.',
    body: 'The comparison still helps, but it teaches more by showing what changes than by claiming a tight echo.',
    returns: ['A few pressures overlap, but not enough to carry the whole comparison.'],
    changeLine: buildChangeLine(differenceSection, sourceEdgeLabel, targetEdgeLabel),
    bridgeLabels: topBridgeLabels,
    sourceEdgeLabel: sourceEdgeLabel ? `Stronger here: ${sentenceCase(sourceEdgeLabel)}` : 'Stronger here: this side of the story',
    targetEdgeLabel: targetEdgeLabel ? `Stronger here: ${sentenceCase(targetEdgeLabel)}` : 'Stronger here: this side of the story',
    sharedPressures,
    evidenceSections,
  }
}
