# Britain v2 Data Expansion Plan

## Purpose

Deepen the Britain dataset so the existing product can support stronger reasoning, richer echo journeys, better thematic entry, and more credible answers to the question: `does history repeat itself?`

This is the next active phase of work.
The UI is considered good enough for now and should only be changed if a breakage appears or if later exhibit-grade refinement is deliberately reopened.

This phase is now bounded.
Britain v2 should be closed once it is good enough to act as the template dataset for future fields, not perfected indefinitely.

## Target outcomes

Britain v2 should:
- make pressure cascade feel grounded in explicit event links
- give most periods more than one meaningful echo option
- support thematic entry and thematic browsing
- improve multi-scale reading with more authored texture
- make the current prototype feel smarter without requiring a new interface

## Scope

The work is organised into five layers.

### 1. Event density
- increase the number of anchor events per period
- ensure each period has enough event structure to support pressure reading and compare
- move from a thin seed layer to a usable explanatory layer

### 2. Pressure-to-event linkage
- explicitly connect events to the structural forces that most plausibly drive them
- strengthen event consequences and scale impact
- improve the explanatory quality of pressure cascade and pattern detection

### 3. Echo network density
- expand the number of curated echoes
- ensure echoes are structurally meaningful, not merely narratively similar
- add clearer dimensional coverage so echoes can support thematic and future cross-dataset use

### 4. Thematic coverage
- define a controlled theme vocabulary for periods and events
- use themes to support future thematic entry, browsing, and guided paths
- keep the theme list stable enough that future datasets can reuse it

### 5. Authored lived texture
- improve human snapshots
- strengthen authored scale summaries where the current derived text is too generic
- add just enough texture to stop the product feeling purely schematic
- prepare for a future `vox pop` layer:
  - short, plain-language imagined responses from ordinary people inside each period
  - focused on daily impact, practical worries, and social feeling
  - designed to make the tool accessible to younger and non-specialist audiences without flattening historical seriousness

## Recommended content targets

For Britain v2:
- periods: keep current 12
- events: target 36 to 60
- pressures: keep current 12 unless a clear gap is discovered
- echoes: target 18 to 30
- snapshots: target 12 minimum, with optional secondary snapshots for weaker periods
- themes: target 12 to 20 controlled themes

These numbers are not goals in themselves.
They are density targets that should support better product behavior.

Current live state:
- events: 40
- echoes: 19

This means the lower event-density floor has now been crossed.
The remaining problem is no longer raw event count alone, but distribution across periods, balance across pressures, and echo-network density.

Current phase shift:
- the first gap-filling pass is effectively complete
- the next phase is targeted pressure grounding plus Britain maturity review
- new events should now be added only where a clearly justified source-backed case exists
- Britain has now reached the point where it can be frozen as template dataset 1

## Current stopping rule

Britain v2 should stop being the primary expansion target when all of the following are true:
- no period is critically isolated
- event density is broadly workable across the full lens
- the weakest pressures have at least minimal credible grounding
- the validation boundary is explicit
- the authoring workflow is clear enough to onboard a second dataset

That point is now close.
Britain should be treated as a `template close-out` task, not an open-ended enrichment task.

That stopping condition has now been met.

## Schema and content additions

The next data layer should add or normalize:
- theme vocabulary as a separate controlled file
- normalized geography registry as a separate controlled file
- dataset registry metadata including maturity level
- optional theme ids on periods and events
- optional geography ids on periods and events
- optional internal rationale or evidence notes for events and echoes

The UI does not need to use all of this immediately.
The point is to make the research layer coherent and repeatable.

## Expected product benefits

Britain v2 will improve:
- pressure cascade quality
- echo journey quality
- compare credibility
- thematic entry points
- future guided narrative
- future machine-assisted suggestion of echo candidates and patterns
- future accessible narrative layers such as street-level `vox pop` responses in the detail panel

## Most complex steps

The following steps are the hardest and may justify use of a higher-reasoning model, especially if partially machine-assisted:

### Pressure model calibration
- deciding whether the existing pressure set is complete and consistently defined
- keeping meanings stable across periods and future datasets

### Echo curation
- deciding which periods genuinely rhyme structurally
- distinguishing strong structural similarity from superficial resemblance
- assigning confidence without false precision

### Theme system design
- choosing a theme vocabulary broad enough for reuse but specific enough to be meaningful
- preventing overlap and drift between themes, pressures, and event types

### Cross-dataset normalization
- designing fields that Britain can use now but other datasets can also adopt later
- avoiding Britain-specific assumptions becoming global defaults

### Multi-scale authorship
- deciding where derived summaries are sufficient and where authored content is needed
- preserving clarity without turning the dataset into a text-heavy essay collection

## Immediate execution order

1. freeze Britain as the first template dataset
2. begin dataset 2 launch preparation
3. define the minimum mechanics needed for dataset-level switching
4. keep Britain in selective validation mode rather than active expansion

## Immediate close-out checklist

Britain close-out is done when:
- `p01` has been reviewed and either explicitly left as-is or given one final justified source-backed event
- weak pressures have been reassessed after the latest grounding pass
- draft additions are clearly separated from validated seed content
- the maturity review says Britain is usable as the template dataset
- dataset 2 planning has begun in parallel

## Success criteria

Britain v2 is successful if:
- most periods have a richer event layer
- pressure cascade is more often event-grounded than climate-only
- echoes feel like a real network, not a sparse flourish
- themes are stable enough to support future thematic features
- the research process is clear enough that a second dataset could follow it

Operationally, success also means:
- Britain no longer blocks dataset 2
- future work is driven by selective validation and reuse, not by blanket content expansion
