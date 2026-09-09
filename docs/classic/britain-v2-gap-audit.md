# Britain v2 Gap Audit

## Purpose

This audit translates the Britain v2 plan into a concrete enrichment queue.

It focuses on the gaps that most directly weaken the current product:
- sparse event density
- weak pressure-to-event grounding
- uneven echo network coverage
- missing theme and geography normalization

## Current baseline

Current dataset counts:
- periods: 12
- events: 40
- echoes: 18
- snapshots: 12
- pressures: 12

Relative to the Britain v2 target, the main deficits are event density, echo density, and grounding of major pressures in named events.

## Highest-value findings

### 1. Inequality was structurally central but event-invisible

`inequality` was one of the strongest recurring pressures across the dataset while remaining unattached to any event.

That has now been substantially repaired in the first grounding pass.
It is currently attached to 14 events, which is a major improvement, but it remains uneven across the dataset.

Why this matters:
- it weakens pressure cascade
- it makes several periods feel under-explained
- it reduces the credibility of structural comparison

This remains a priority, but it is no longer a zero-coverage gap.

### 2. Several periods are still thin, but not in the same way

Weakest periods by density:
- `p01` Norman Consolidation
  - 4 events
  - 2 echoes
  - event grounding is materially better and the period is no longer isolated, though it remains thinner than the late-state clusters
- `p03` Charter, Parliament, and Plantagenet Order
  - 4 events
  - 2 echoes
  - now materially less isolated, though still not among the richest periods
- `p04` War, Plague, and Social Upheaval
  - 5 events
  - 2 echoes
  - no longer weak in events or critically isolated in the echo network
- `p07` Religious Conflict and Composite Monarchy
  - 5 events
  - 2 echoes
  - now more connected, though still not among the richest periods
- `p02`, `p05`, and `p06`
  - all now have workable mid-level density
  - no longer among the thinnest periods

These periods should be expanded before already-rich late periods are expanded further.

### 3. Echo density is uneven

Echo degree by period is heavily skewed toward late and dramatic periods:
- strongest: `p08` = 6, `p12` = 6
- `p06` and `p09` = 4
- `p10` and `p11` = 3
- `p01`, `p02`, `p03`, `p04`, `p05`, and `p07` = 2

This makes the product feel smarter in some eras than others.

### 4. Pressure grounding is uneven

Weakest pressures by event grounding:
- `ecologicalStrain` = 1
- `individualAutonomy` = 1
- `technologicalDisruption` = 2
- `informationAcceleration` = 3
- `publicHope` = 6
- `socialCohesion` = 11
- `inequality` = 14, improved substantially but still patchy relative to its structural importance

Strongest:
- `institutionalLegitimacy` = 31
- `eliteCompetition` = 13

This means the product now explains social strain better than it did, but it still under-explains technology, information change, ecology, and autonomy.

### 5. Geography normalization is usable, but raw labels still vary

Current raw event geography labels:
- Britain
- Britain and global war
- England
- England and Scotland
- England and Wales
- England, Scotland, Ireland
- England/France
- Global empire
- Northern Ireland
- United Kingdom

These are now backed by normalized geography ids, which is enough for current product needs.
The remaining task is consistency and discipline for future datasets, not the absence of a normalization layer.

## Priority period queue

### Tier 1
No single period is now critically isolated.

### Tier 1.5
- `p01`
- `p03`
- `p04`
- `p07`

These periods are no longer isolated, but they remain thinner than the late modern and civil-war clusters.

### Tier 2
- `p02`
- `p05`
- `p06`
- `p11`

These are partially workable but still thin in ways that matter.

### Tier 3
- `p06`
- `p08`
- `p09`
- `p10`
- `p12`

These are the strongest current periods and should be expanded later or only where a clear thematic gap is found.

## Priority pressure queue

### Immediate
- `inequality`
- `technologicalDisruption`
- `informationAcceleration`

### Next
- `socialCohesion`
- `moralCertainty`
- `ecologicalStrain`
- `individualAutonomy`

## Immediate Britain v2 work packages

### Work package A: event enrichment
- continue adding 1 to 2 events only where a clearly justified source-backed case remains
- prefer events that ground currently ungrounded top pressures
- treat any new event beyond high-confidence recall as research-gated by default

### Work package B: pressure grounding
- continue repairing `inequality` in the periods where it still remains ungrounded
- improve `technologicalDisruption` and `informationAcceleration` grounding in later periods
- review whether `publicHope` and `socialCohesion` are now sufficiently grounded to drop out of the immediate queue

### Work package C: echo enrichment
The first gap-filling pass is now complete.
Further echo work should be selective rather than evenly distributed.

### Work package D: normalization
- add theme ids and geography ids to current events and periods
- keep raw geography labels for display, but normalize them underneath

This first normalization pass is now complete.

## Most complex next steps

These are the steps most likely to benefit from a higher-reasoning model:

### Pressure grounding strategy
- deciding which events should genuinely express `inequality` rather than merely correlate with it
- deciding when `informationAcceleration` or `technologicalDisruption` are actually causal

### Echo expansion
- generating new echoes that are structurally convincing and not repetitive
- especially for thin periods like `p03` and `p07`

### Theme assignment
- deciding where themes meaningfully add clarity instead of duplicating pressure labels or event types

### Validation boundary
- deciding when a model-authored addition is safe to keep as a draft candidate
- deciding when a claim has crossed the line into source-backed research work

## Recommended execution order

1. review whether `p01` still needs one more source-backed event
2. continue repairing missing inequality grounding in the remaining weak periods
3. review whether Britain is approaching `rich` maturity
4. only then add further selective echoes where they make the experience genuinely smarter
