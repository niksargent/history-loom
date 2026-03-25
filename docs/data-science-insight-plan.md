# Data Science Insight Plan

## Purpose

Define how the product should use data science to surface patterns, clusters, correlations, and candidate explanations without pretending that automated inference is historical truth.

The goal is not to turn the product into a research console.
The goal is to create more `aha` moments:
- which periods cluster together
- which pressures tend to rise together
- which pressures appear to precede or stabilise others
- which datasets show similar structural patterns across comparable time windows

## Product role

Data science should support:
- insight discovery
- editorial curation
- stronger question-led entry
- future motion and compare modes

It should not replace:
- historical judgement
- authored echo curation
- explicit uncertainty handling

The right posture remains:
- human-curated
- machine-assisted

## Core insight types

### 1. Pattern clustering

Within one dataset:
- cluster periods by pressure profile
- identify recurring regime shapes or pressure signatures

Across datasets:
- cluster periods from different fields by shared structural profile
- surface candidate cross-dataset affinities without declaring them equivalent

## 2. Correlation and co-movement

Look for:
- pressures that tend to rise or fall together
- stabilisers that repeatedly weaken when specific stressors intensify
- relationships that are strong within one dataset and weak in another

This is useful for:
- “these forces often travel together”
- “this stabiliser tends to erode under these conditions”

## 3. Lead-lag and directional relationships

Explore whether:
- one pressure often intensifies before another
- one stabiliser tends to recover after a specific decline pattern
- certain pressure combinations precede rupture, reform, or consolidation

This is the closest the system gets to “two pressures tend to drive another”.

It must always be framed carefully:
- suggestive relationship
- not proof of causation

## 4. Outlier and inflection detection

Identify:
- periods that break the normal pressure pattern
- sudden rank shifts
- unusual combinations of high stress and high stability

These can drive:
- featured insight prompts
- Force Explorer cues
- future `In motion` callouts

## 5. Candidate echo support

Use pressure similarity and trajectory similarity to:
- suggest candidate echoes
- rank existing echoes for review
- identify where an apparently plausible echo is actually weak

This supports curation.
It should not auto-publish echoes as truth.

## UI and product implications

The first uses should be modest and legible:

### Near-term
- insight prompts in the detail or compare flow
- short statements such as:
  - `These two pressures often rise together here`
  - `This period clusters with two other strain-heavy eras`
  - `Legitimacy tends to weaken after inequality and information acceleration spike together`

### Next-layer
- cluster views or cluster tags
- force relationship hints inside Force Explorer
- `In motion` callouts for rank swaps, unusual surges, or inflection points

### Later
- bounded cross-dataset pattern comparison
- editorially reviewed “you may also want to inspect” paths

## Architectural direction

The product should plan for derived analytical artefacts such as:
- pressure correlation matrices
- period cluster assignments
- lead-lag relationship notes
- confidence or strength bands

These should be stored as derived data, not mixed carelessly into authored source content.

Recommended approach:
- raw/authored historical content remains primary
- derived insight data is generated separately
- the UI can choose whether to reveal it

## Safeguards

This is a higher-risk area and needs clear rules.

Never:
- present correlation as causation
- auto-generate canonical echoes without review
- hide uncertainty
- let statistical convenience override historical intelligibility

Always:
- label derived insight as derived
- prefer patterns that are legible and useful
- use editorial review before turning findings into strong product claims

## Recommended sequence

1. define the derived-insight schema
2. generate a first internal-only pass for one dataset
3. review which insight types are actually useful
4. expose only the clearest, lowest-risk findings first
5. extend across datasets only after the single-dataset pass is trustworthy

## Constraint

If the output does not make the product feel more revealing to a general user, it does not belong in the UI.

The standard is not:
- mathematically interesting

The standard is:
- historically useful
- visually legible
- insight-generating
