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
- a first motion/material pass is now in place, with deeper surfaces, stronger compare staging, and restrained reveal/glow behavior
- compare and detail copy have been tightened so the interface sounds less like an internal memo

Current refinement focus:
- replace passive top-of-page framing with a stronger question-led entry surface
- use the large header area to invite exploration rather than explain the interface at length
- deepen pressure-cascade storytelling further
- tighten the remaining copy so the detail flow reads as guided interpretation rather than product notes
- strengthen compare insight highlighting so overlap and divergence are more legible at a glance
- finish the motion and material polish so reveal states feel deliberate rather than static
- geography is implemented, but further rendering, scaling, and placement work is postponed until product discussion
- decide whether the new segmented/trace intensity treatment is the lasting visual language for structural forces or only an interim step
- decide whether geography should remain period-bound in the detail panel or move toward a dataset-level home when multiple datasets or expansion views exist
- identify all UI copy that reads like internal memo and replace it with user-facing language
- differentiate interactive buttons from passive data pills more consistently
- continue responsive and accessibility polish
- keep docs aligned with the real implementation state

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
- compare needs another UX pass so similarities, differences, and seeded echo logic are more obvious at first glance
- the detail panel should feel more like guided historical reading and less like a structured dossier
- the opening screen should help users begin with a question, not just with the layout
- the geography card should not be changed further until its role and placement are discussed
- structural-force controls should become more legible and more user-directable without increasing clutter
- UI copy and control language should be audited so the interface stops sounding like an internal design note

## Recommended next sequence

1. add question-led entry points and improve the top-of-page framing
2. finish compare polish
3. continue strengthening the right-hand narrative flow and copy economy
4. complete accessibility and responsive cleanup
5. discuss geography before further map tuning or placement changes
6. only then add one post-MVP expansion feature

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
