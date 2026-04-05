# Multi-Dataset Next Phase Plan

## Purpose

Define the next disciplined phase now that Britain, the United States, and France all exist as live fields inside the product.

The goal is not to keep adding datasets blindly.
The goal is to move from `three usable draft fields` to `a trustworthy multi-dataset system`.

## Current baseline

The product now has:
- Britain as template dataset 1
- United States as template dataset 2 at usable-draft maturity
- France as template dataset 3 at usable-draft maturity
- dataset switching in the live app
- shared pressure concepts across all three
- lived voice present across all three
- a repeatable dataset production baseline:
  - scaffold command
  - validation command
  - registry-driven data paths
  - operator runbook
  - editorial review checklist

That is enough to prove the system works.
It is not yet enough to claim the datasets are fully trusted or cross-comparable.

## Immediate objective

The next multi-dataset phase should do four things:

1. define the threshold above `usable draft`
2. selectively validate the current three datasets toward that threshold
3. make the multi-dataset experience feel more intentional in the UI
4. avoid opening cross-dataset comparison before the data can support it honestly

Population is now also an approved extension track inside that phase:
- extend the schema cleanly
- add one population value per period for the three live datasets
- expose population first as contextual scale, not decorative metadata

Status:
- the first population pass is now live in schema, data, detail, and compare
- a population tide line is now also live on the main Loom as a separate optional scale overlay
- the first dedicated Compare population chart is now also live as a full-width band below the two summary cards
- the next population question is no longer placement but refinement: whether the Compare band needs any secondary adjustment before population expands to another surface
- Compare itself now also leads with an echo-story hero when a curated echo exists, with shared forces treated as the main evidence layer rather than a hidden support list

Data science is now also an approved extension track:
- use derived analysis to surface clusters, co-movement, and candidate relationships
- support editorial insight and future UI prompts
- do not present automated inference as historical truth

## Maturity model

### Seed
- a field can load
- periods and pressures exist
- events, echoes, and snapshots are still sparse

### Usable draft
- the field is live and genuinely usable
- every period has enough material to read
- the field can support real exploration
- some content still carries explicit draft or exploratory status

### Solid
- source-backed event coverage is strong across the whole field
- watchlist periods no longer feel thin in live use
- the echo layer has been reviewed enough to separate strong, moderate, and exploratory echoes clearly
- lived voice reads as real human perspective rather than analyst prose in first person
- the field can support further product extension without needing constant structural repair

### Rich
- thematic coverage is dense and reliable
- pressure-event grounding is consistently strong
- geography and scale reads are coherent
- the field supports deeper guided experiences and stronger pattern discovery

### Cross-comparable
- concepts are normalized enough for responsible comparison across datasets
- compatible themes, pressure meanings, and confidence thresholds are in place
- the product can compare fields without pretending equivalence where none exists

## What `solid` means in practice

`Usable draft` is enough to load, explore, and iterate the product.

`Solid` is the point where a dataset stops feeling provisional.
That is the threshold for:
- extending the product more confidently
- building more ambitious pattern views
- using the dataset as a reliable base for future media layers
- considering cross-dataset mechanics later

This means the product can extend before every field is solid.
It should not extend into high-claim features until at least two fields are solid.

## Rollout discipline

Every new improvement must now declare its rollout scope explicitly.

Allowed rollout scopes:
- `whole-system`
- `all live datasets`
- `single-dataset pilot`
- `internal-only experimental`

This is now a process rule, not a suggestion.
If a change does not declare its rollout scope, it is not properly specified.

Pilot rule:
- every pilot must also declare its intended end state up front
- a pilot must move toward one of two outcomes:
  - promotion into the whole system or all live datasets
  - explicit retirement

What should not happen:
- pilots drifting indefinitely
- one dataset silently becoming structurally different from the others
- internal-only work being mistaken for finished product capability

This rule exists to keep schema, quality, and product behaviour cohesive across datasets.

## Next approved workstreams

### 1. Selective validation to solid

Do not reopen broad enrichment.

Instead:
- review watchlist periods only where live use shows a real weakness
- validate strong and exploratory echoes more explicitly
- tighten source-backed confidence notes where the field still feels provisional

### 2. Lived voice v2

The current lived voice layer is useful, but it is still too close to structural summary translated into first person.

The next version should aim for:
- a stronger sense of persona
- clearer everyday stakes
- speech that sounds like a person in a real situation
- future compatibility with generated portraits or voice playback

The preferred direction is:
- three voice positions per period where the data can support it
- likely examples: woman, man, and a third civic or work-defined voice
- presented as tabs or a light carousel inside the current detail flow

This remains a higher-reasoning content step because weak persona work will feel fake immediately.

Status:
- the first lived voice v2 pass is now implemented across Britain, USA, and France
- the detail panel now supports multiple voices per period through tabs
- the detail panel now also includes a compact `What life feels like here` lens beneath the quote, using:
  - safety
  - freedom
  - pressure
  - future
- those dimensions are derived from the existing period model rather than a separate sentiment system
- later refinement should focus on selective quality, not a second schema rewrite

### 3. Multi-dataset atmosphere

The product should not look identical across countries.

Immediate rule:
- use a dataset-specific atmospheric palette derived from the country flag and historical tone
- keep the current charcoal exhibit structure as the fallback base
- avoid literal flag reproduction
- do not limit the palette to two colors if the field needs more richness to feel distinct

This is now approved as a light UI system improvement, not a redesign.

### 4. Force Explorer

Before building a separate motion page, the main surface needs one stronger visual way to understand forces.

Approved direction:
- build a dedicated `Force Explorer` surface on the main page
- show force selection, field trace, and current-period flashpoints together
- retire the weaker detail-panel force card
- keep the relationship visual first, not label first

Status:
- Force Explorer is now implemented
- the old detail-panel force card has been retired
- geography now follows the honest rule: Britain map only until other datasets have real map treatments
- `Start compare` and `Reveal echoes` now also live in the Loom control row, because they are field-level actions rather than detail-only controls

### 5. Motion and alternate views

Do not overload the main page.

After Force Explorer, record a second-layer exhibit idea:
- an `In motion` or `Interactive time` view or modal

Candidate views:
- a `bar chart race` for pressure rank order over time
- a tension view showing stressers and stabilisers pulling against each other
- a trace-first animation view where pressure lines and echo routes unfold through time

These are promising because they shift explanation from text to movement.
They should remain separate from the main Loom page unless they clearly outperform the current reading surface.

Status:
- the first product brief for `In motion` now exists in `docs/in-motion-brief.md`
- the approved default mode is `Race`
- the race chart must show trails
- the exact chart form for the force-pull / tension view is still intentionally open
- the architecture should be prepared for later same-time-range dataset comparison without turning cross-dataset compare on yet
- the concrete v1 Race spec now exists in `docs/in-motion-race-spec.md`
- the first live Race modal is now implemented for one dataset at a time
- live use on a second machine now suggests Race is performant enough for current purposes
- no default frame cap is planned at this stage; any cap should be evidence-led, not speculative

### 6. Population as scale context

Population is one of the biggest missing structural data points in the current system.

Approved direction:
- add population as a first-class series, not a loose note
- start with one period-level value for Britain, the United States, and France
- use it first in detail and compare
- plan for later use inside `In motion`

Status:
- the planning layer exists in `docs/population-extension-plan.md`
- the first implementation pass is now complete
- population now also appears on the Loom as an optional tide-line scale overlay
- Compare now also carries a dedicated full-width population band for growth shape and selected-period scale
- the next question is whether population should later gain a second surface in `In motion` or `Insights Lab`

### 7. Derived insight and data science

The product needs stronger `aha` moments, not just more content and more presentation.

Approved direction:
- use derived analysis to spot clusters within and across datasets
- identify pressures that tend to rise together
- identify suggestive lead-lag relationships between stressors and stabilisers
- support echo curation with structural similarity signals

Status:
- the planning layer now exists in `docs/data-science-insight-plan.md`
- the derived-insight schema now exists
- an offline generation pipeline now produces checked-in derived JSON packs
- approved public insight now runs across Britain, USA, and France through the main-page prompt and `Insights Lab`
- one reviewed public cross-dataset cousin is now live:
  - USA `2001-2025`
  - France `1981-2025`
- wider cross-dataset affinities and echo-support signals remain internal
- this remains a low-claim feature, not a public truth engine
- the next promotion question is now selective:
  - keep the first public cousin bounded
  - review whether any further cousin or echo-support signals are truly public-safe

### 8. Public language and visual grammar

The product now has a new explicit rule:
- every public-facing surface should pass the `16-year-old test`

That means:
- less builder or academic language in public UI
- more concrete wording
- stronger visual explanation through colour, grouping, and motion
- internal labels and public labels should be allowed to differ

This applies across the whole tool, not just Insights Lab.

Status:
- the issue is now recognised as whole-product, not page-local
- the first public-language remediation pass is now live across the main public surfaces
- phase 2 visible prose now also covers events, echoes, and snapshot text across Britain, USA, and France
- a public-copy usage audit now exists so visible surfaces can be checked for leaks systematically

### 8a. Compare as echo explanation

Compare is now explicitly an echo-explanation surface first.

That means:
- the top of Compare should explain why two periods belong together
- curated echo text should lead whenever it exists
- the bridge visual should replace taxonomy-led top cards
- shared force mix should do the main evidence work
- lower bucket sections should support the story, not dominate it

## What stays off

Still deferred:
- cross-dataset compare
- automatic similarity scoring as truth
- major new UI surfaces on the main page
- dataset 4 seeding

## Future dataset candidates

The next serious dataset candidates after France should remain:
- Scotland as its own field
- Britain before the current 1066 threshold
- the Roman world as a deeper civilizational field
- Germany, 1815-2025
- India, 1757-2025
- Japan, 1603-2025
- Mexico, 1810-2025
- Russia / USSR, 1861-2025

These should not begin yet.
They belong after the current three datasets are stronger and the multi-dataset system is more settled.

## Immediate sequence

1. keep the current three live datasets aligned and selectively validate only where a real weakness still shows in use
2. keep Race under review, but do not force a frame cap or second motion mode without evidence from real use
3. keep the public-language pass in maintenance mode through live QA and public-copy audits rather than broad new rewrites
4. review the live Compare story hero, bridge visual, and shared-force evidence layer before making further compare changes
5. review the live Compare population band before adding toggles or another population surface
6. hold wider cross-dataset cousin or echo-support release unless a second reveal adds genuinely new public value

## Higher-reasoning steps

These steps are the ones most likely to benefit from a higher-reasoning model:
- deciding when a dataset has genuinely crossed from `usable draft` to `solid`
- designing lived-voice personas that feel human rather than synthetic
- deciding whether a motion-first view clarifies the data or merely decorates it
- deciding when cross-dataset comparison would be honest
- deciding how population should inform interpretation without turning the UI into a statistics layer
- deciding which derived patterns are genuinely illuminating rather than merely computationally available
- deciding when internal cross-dataset affinities are strong and honest enough to surface publicly
