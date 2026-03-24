# Implementation Brief v1 — First Prototype

## Goal

Build the first-pass interactive prototype for **Concept 1 — The Loom**.

The product direction is now clearer:
- a premium interactive exhibit for the web
- a public thinking tool for non-historians

It should use historical reasoning and data analysis to sharpen the experience, but not feel like a research dashboard.

## Current implementation status

The first interactive prototype now exists in code and has moved beyond proof-of-concept into a late-MVP prototype:
- Vite + React + TypeScript + Tailwind scaffold is in place
- local JSON data loads through a typed normalization layer
- the Loom overview renders the seeded 12-period Britain dataset
- users can now select periods directly from the chart as well as from the period stack
- the period stack now supports overview and expanded density modes
- the detail panel shows gains, losses, events, snapshot, and derived multi-scale summaries
- the detail panel now supports calm-read and full-read modes with collapsible lower sections
- the detail panel now opens with a top-level interpretive reading of the selected period
- the structural-force panel now supports compact and expanded card density
- structural forces can now be reordered by selected-period intensity, role, or label
- structural-force intensity is now shown with segmented bands and mini traces instead of a single flat bar
- pressure overlays and curated echo reveal are implemented
- a geographic inset built on real topojson geometry is implemented in the detail flow
- compare mode is implemented from echoes and second-period selection and now opens as an overlay with explicit source/target roles
- compare mode now includes an interpretive insight strip for overlap, separation, and pressure relationship
- echoes now support a more explicit route through the dataset, with focused counterpart selection plus jump and compare actions
- a first motion/material pass is now in place, with deeper surfaces, stronger compare staging, and restrained reveal/glow behavior
- compare and detail copy have been tightened so the interface sounds less like an internal memo
- a tabbed question-led, force-led, and pattern-led entry surface is now implemented in the top header
- the opening section now carries live current-focus context plus a compact visual summary strip instead of large static metadata cards
- the app now supports minimum dataset switching between Britain and the USA seed dataset
- the USA dataset now has a first usable draft baseline with an 8-era civic lens, 22 anchor events, 7 draft echoes, and 8 snapshots
- the next approved USA content move is a lived-voice layer built as an accessibility companion to the snapshot model
- the USA snapshot model now supports optional lived-voice fields and renders them in the detail panel when present
- the Britain snapshot model now also carries lived-voice fields and renders them in the detail panel
- the active refinement pass is now a documented exhibit UI pass using the installed `frontend-skill`

Current refinement focus:
- execute one bounded exhibit UI refinement pass focused on composition, copy economy, lived voice, and interpretive motion
- the first implementation slice of that pass is now in place:
  - simpler opening composition
  - reduced interface narration
  - promoted lived-voice presentation
  - more purposeful trace/reveal motion
- the second slice is now also in place:
  - lived voice now sits above `Reading this period` as the human introduction to the selected era
  - the page background now carries more atmosphere and less flat darkness
  - active echoes now read more like routes through the field than static linked records, using a canopy-style loom route fan
  - selected pressure focus now reliably preserves overlay visibility across force-entry surfaces without relying on unstable draw-on animation
  - selected pressure focus in the detail panel now reads more like a live field moving through the current period and its event flashpoints, not just a list of values and tagged events
  - remaining low-value structural copy has been reduced again across header state chips, force controls, compare-picking copy, and quiet echo states
- keep Britain in selective validation mode
- move effort into USA validation-and-quality review, authoring standards, and repeatable research operations
- the period-by-period USA quality review is now complete; the next real data task is authoring-standard tightening, not more raw additions
- the USA maturity checkpoint is now accepted, so France can begin from a stronger baseline than either Britain or early USA had
- the France dataset charter is now written, so the next data task has shifted from USA maturity to France periodization and seeding design
- the France periodization proposal is now set to a `9-era civic lens`, which reinforces the product rule that honest lenses matter more than matching period counts across datasets
- France now has a seeding plan and initial anchor shortlist, but runtime data creation remains deliberately blocked behind pressure grounding and lived-readability planning
- the France pressure-grounding map and snapshot/lived-voice strategy are now complete, and the first runtime France draft seed now exists on disk
- France now also has a first basic validation review and is wired into the app path as a guarded draft field
- France remains draft-scoped, and cross-dataset compare is still intentionally off
- France now also has a live-use clarity review, with the watchlist concentrated in `fr-p03`, `fr-p06`, and `fr-p07`
- France is now accepted as template dataset 3 at usable-draft maturity
- the next product phase is now multi-dataset consolidation, not immediate dataset 4 seeding
- lived voice v2 is now implemented as a tabbed persona layer inside the detail panel, using multi-voice snapshot support rather than a single response block
- the first solid-readiness review is now complete: Britain, USA, and France all remain below `solid`, but none is blocking lower-claim product extension
- Force Explorer is now implemented as the first real feature-leap after the bounded UI pass, replacing the weaker detail-panel force explanation with a dedicated relationship surface, direct period selection from the field trace, and a more readable full-width flashpoint layout
- the first `In motion` implementation now exists as an expansive Race modal, using autoplay, interpolated movement, force trails, scrubbing, family filtering, and pinned-force emphasis for a single dataset
- geography is now constrained to Britain until the other datasets have real map treatments rather than a misleading reused inset
- hold off on more structural expansion unless lived use reveals real weak spots
- keep dataset maturity, registry metadata, and future multi-dataset behavior aligned with the real code path
- keep geography implemented but paused pending product discussion
- reserve any later UI work for further exhibit refinements beyond the current pass
- dataset-specific atmospheric backgrounds should now reflect the selected field rather than relying on one global background

## What is solid

The following interaction grammar is now established:
- period selection through the Loom overview
- direct period selection through the chart surface itself
- pressure reading across the timeline and detail panel
- echo reveal from a selected period
- side-by-side period comparison
- geographic orientation tied to the current selection
- adjustable density in both the period stack and the detail panel
- adjustable density and ordering in the structural-force panel

## What still needs design work

The next quality threshold is interpretive clarity, not feature count:
- the opening screen should feel like the true front door of the product, not a header above it
- the detail panel should feel more like guided historical reading and less like a structured dossier
- the next interpretive gains should come from intelligent framing and better visual analysis, not from more explanatory text
- compare should only receive careful incremental polish where clarity is still weak
- the geography card should not be changed further until its role and placement are discussed
- structural-force controls should become more legible and more user-directable without increasing clutter
- UI copy and control language should be audited so the interface stops sounding like an internal design note

## Recommended next sequence

1. complete the bounded exhibit UI refinement pass
2. keep Britain in selective validation mode and move USA into validation-and-quality review
3. establish the repeatable authoring workflow, standards, and review process
4. treat Britain, USA, and France as live fields that now need selective validation toward a `solid` threshold
5. delay cross-dataset compare until at least two datasets are solid enough
6. discuss geography before further map tuning or placement changes
7. use the current dataset baseline to add one lower-claim post-MVP expansion feature, most likely an `In motion` view, while keeping cross-dataset compare off

## Product intent

This is an elegant interactive history overview that shows equal-duration historical periods, subtle pressure structure, and the beginnings of cross-era echo discovery.

## Tech direction
- React
- TypeScript
- Tailwind CSS
- seed data from JSON

## Core layout
- horizontal timeline across the main canvas
- stacked or folded equal-duration period blocks
- subtle pressure ribbons behind or through the periods
- right-hand detail panel for selected period
- minimal top controls for view toggles and pressure/echo visibility

## Required interactions
- click a period block to open detail
- show values, mood, gains, losses, key events, and human snapshot in detail panel
- toggle pressure overlay visibility
- trigger a basic echo reveal for the selected period

## Deferred from later versions
- selectable lens length
- cycle-lens selection UI
- alternate lenses backed by real data

## Visual requirements
- dark premium aesthetic
- calm default state
- restrained motion
- no clutter
- progressive disclosure only

## Data source assumptions
Prototype should read from:
- `data/periods.json`
- `data/pressures.json`
- `data/echoes.json`
- `data/events.json`
- `data/snapshots.json`

## Initial build priority
Prioritize:
1. structural clarity
2. layout coherence
3. interaction logic
4. visual elegance

Do not overbuild advanced filtering or full similarity modelling in v1.

## Acceptance criteria

The prototype is successful if it:
- renders a coherent overview
- allows selection of periods
- shows detail cleanly
- displays pressure context without clutter
- reveals at least one meaningful echo interaction
- feels visually intentional and premium

## Notes for the builder
Treat cycles as a lens, not a truth claim.
Keep labels short.
Make the interface feel like a calm surface with depth underneath.
