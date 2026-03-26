# Data Science Insight Plan

## Purpose

Use a derived statistical layer to produce stronger `aha` moments from the structured pressure data without pretending that computation is historical truth.

The goal is not to build a research console.
The goal is to generate and surface patterns that feel genuinely revealing:
- recurring structural families of periods
- pressures that reliably travel together
- one-step lead-lag signals
- surprising outlier eras
- later, structural cousins across datasets

## Product posture

The posture is now fixed:
- editorial insights first
- statistics first, not ML first
- cross-dataset-ready architecture
- single-dataset public rollout first
- separate Insights Lab page for depth
- only light hooks on the main Loom page
- public wording must pass the `16-year-old test`
- visual grammar must carry part of the insight before the text does

Derived insight should support:
- insight discovery
- editorial curation
- stronger prompts on the main page
- later Compare, Force Explorer, and motion work

It should not replace:
- historical judgement
- authored echoes
- explicit uncertainty handling

## Current implementation status

Implemented now:
- a dedicated derived-insight schema in `src/types/insights.ts`
- offline generation pipeline in `scripts/generate-derived-insights.mjs`
- precomputed dataset insight packs in `data/derived/`
- a cross-dataset affinity pack in `data/derived/cross-dataset.json`
- a public USA insight pilot
- a separate `Insights Lab` page
- one restrained derived hook in the selected-period flow

Current public release posture:
- Britain, USA, and France insight prompts are public
- one reviewed USA-France cross-dataset cousin is public
- wider cross-dataset affinities remain internal

Rollout rule:
- this insight layer must also declare rollout scope clearly
- the original public USA insight was a `single-dataset pilot`
- that pilot has now been promoted into the three live datasets for the approved public surfaces
- wider cousin and echo-support release remains `internal-only experimental` unless explicitly promoted

Current promotion path:
- Phase 1: keep the three-dataset public surfaces editorially sharp
- Phase 2: keep one reviewed public cousin bounded and legible
- Phase 3: only then consider whether any further cousins or echo-support signals should be promoted

Current product correction:
- the first insight rollout proved the architecture
- the next pass must make the surfaced language and visuals more accessible to non-specialists
- internal analytical labels should no longer be exposed directly where they confuse general users
- the first editorial pass now replaces internal family language in public prompts with plainer, public-facing wording

## Core insight families

### 1. Structural families

Group periods by pressure profile to show recurring structural shapes.

Current method:
- per-dataset pressure vectors
- z-score normalisation
- hierarchical agglomerative clustering
- Ward-style merge cost

Public use:
- period family labels in Insights Lab
- one or two short family-based prompts

### 2. Force relationships

Detect strong within-dataset relationships between pressures.

Current method:
- Spearman rank correlation
- zero-lag co-movement
- one-period lagged correlation

Relationship types:
- `co-movement`
- `inverse`
- `lead-lag`

Public use:
- relationship cards in Insights Lab
- short prompt hooks when a selected period sits inside a strong relationship pattern

### 3. Outliers

Detect periods whose pressure profile sits away from the field’s typical pattern.

Current method:
- normalised profile distance
- cluster-edge style detection
- simple strength/confidence banding

Public use:
- outlier cards in Insights Lab
- period-level prompts that identify broken expectations

### 4. Echo support

Score authored echoes against structural similarity and trajectory similarity.

Current method:
- profile similarity scoring
- support labels: `reinforced`, `mixed`, `weak`

Current public posture:
- generated
- internal only
- not used to auto-publish canonical echoes

### 5. Cross-dataset cousins

Detect structural cousins across countries.

Current method:
- cosine similarity on normalised vectors
- thresholding plus shared signal checks

Current public posture:
- architecture ready
- one reviewed public reveal now exists:
  - USA `2001-2025`
  - France `1981-2025`
- wider release remains held back pending editorial review
- no second public cousin is approved yet
- no public echo-support release is approved yet

## UI role

### Main page

Keep this light.

Only public derived surface on the main page:
- one short period-level prompt
- one route into Insights Lab

### Insights Lab

This is the proper home for deeper derived reading.

Current public sections:
- period families
- force relationships
- outliers

Held back for now:
- wider public cross-dataset cousins
- public echo support judgements

Public rule:
- Insights Lab should feel like a discovery surface, not a methods page
- lead with what the user can notice, not with caveats about the model

## Safeguards

Never:
- present correlation as causation
- auto-publish canonical echoes
- let weak analytical output turn into strong product claims
- surface computational results just because they are available

Always:
- label this layer as derived
- keep confidence explicit
- prefer legibility over novelty
- review cross-dataset claims before public release
- translate internal analytical language into public-facing language before surfacing it
- use colour, grouping, and line behaviour to communicate pattern type

## Next steps

1. keep USA public while tightening editorial quality where the prompt layer is still repetitive
2. review Britain and France packs against the same public-language and visual standards
3. decide whether the current USA public surfaces are ready to promote across all live datasets
4. decide where population trend should surface as a chart without cluttering the main Loom
5. decide whether a second public hint belongs in Compare or Force Explorer
6. return to cousin and echo-support review only when there is clearer, more varied public value to release

## Constraint

If the result does not make the product more revealing to a general user, it does not belong in the UI.

The standard is not:
- mathematically interesting

The standard is:
- historically useful
- visually legible
- insight-generating
