# Implementation Brief v1 — First Prototype

## Goal

Build the first-pass interactive prototype for **Concept 1 — The Loom**.

## Current implementation status

The first interactive prototype now exists in code:
- Vite + React + TypeScript + Tailwind scaffold is in place
- local JSON data loads through a typed normalization layer
- the Loom overview renders the seeded 12-period Britain dataset
- the detail panel shows gains, losses, events, snapshot, and derived multi-scale summaries
- pressure overlays and curated echo reveal are implemented

Current refinement focus:
- improve card readability under the Loom
- use more of the right-hand panel's viewport height
- make structural-force context visible directly above the chart
- continue tightening information density and layout balance

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
- minimal top controls for lens selection and view toggles

## Required interactions
- select a cycle lens
- click a period block to open detail
- show values, mood, gains, losses, key events, and human snapshot in detail panel
- toggle pressure overlay visibility
- trigger a basic echo reveal for the selected period

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
