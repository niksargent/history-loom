# The History Loom

The History Loom is an interactive history experience that reveals the past not merely as a sequence of events, but as a woven pattern of recurring phases, underlying pressures, gains, losses, and cross-era echoes.

It is not a conventional timeline.
It is a system for exploring:
- recurring historical structure
- pressure build-up and release
- what each era made possible
- what each era quietly destroyed
- how different periods can feel structurally similar even when the facts differ

## Core idea

The product combines three linked perspectives:
- **Clock** — history divided into comparable time chunks
- **Pressure** — deeper forces rising and falling beneath visible events
- **Echo** — similar structures, moods, or dynamics recurring across eras

## Product goals

The experience should help users:
- see repeating historical patterns
- understand events as outcomes of deeper pressures
- compare periods directly
- explore history at personal, local, national, and global scales
- discover what emerged and what was lost in each era

## Initial product shape

The recommended first build is:
- a horizontal timeline overview
- stacked equal-duration historical periods
- subtle pressure ribbons behind or through them
- a detail panel for the selected period
- an echo interaction to show structurally similar eras

## Key principle

The product should treat cycles as **lenses**, not absolute truth claims. It should help users explore recurrence without pretending history is a rigid machine.

## Recommended tech direction
- React
- TypeScript
- Tailwind CSS
- data-driven UI from JSON or YAML seed content

## Repo structure

```text
history-loom/
  README.md
  docs/
    prd.md
    interface-concepts.md
    data-schema.md
    content-taxonomy.md
    design-language.md
    mvp-scope.md
    implementation-brief-v1.md
    research-notes.md
  data/
    periods.json
    pressures.json
    echoes.json
    events.json
    snapshots.json
    meta.json
```

## Current starter dataset

This starter pack uses **Britain from 1066 to 2025** as the initial bounded stream and seeds a first lens of **12 equal 80-year periods**.

That lens is intentionally a design choice, not a claim that British history naturally falls into perfect 80-year blocks.

## Recommended first step

Build the first-pass prototype for **Concept 1 — The Loom** using the seed dataset in `/data`.

## Current status

The project is now at a **late-MVP prototype** stage.

An initial frontend prototype now exists with:
- React + TypeScript + Tailwind app scaffold
- local JSON-driven period, pressure, event, snapshot, and echo loading
- Loom overview with selectable periods
- pressure overlay and pressure selection
- right-hand detail panel with gains, losses, events, echo reveal, multi-scale summaries, pressure-cascade reading, and a geographic inset
- compare mode that can be launched from echo links or by choosing a second period, now surfaced as an overlay rather than a below-the-fold panel

Implemented now:
- core Loom surface
- pressure overlay and inline thread pills
- pressure-emphasized detail flow with clearer narrative framing
- geographic inset built from real topojson coastline data with product-level region highlights layered on top
- echo reveal
- side-by-side compare mode with explicit source/target color ownership and direct exit

In progress:
- tighter information density and hierarchy across the right-hand detail flow
- compare UX polish, including clearer insight surfacing and calmer visual balance
- geographic card tuning, including layout, scaling, and context behavior
- stronger narrative interpretation in the detail panel rather than a simple stack of facts
- user-controlled compact view for structural-force cards
- ideation on alternative intensity displays and user-controlled structural-force ordering, for example by intensity or by stress/stabiliser
- decision on whether geography belongs in the selected-period detail flow or at the dataset level when broader dataset expansion is defined
- identify and remove UI phrases that read like internal memo rather than user-facing product language
- clearer differentiation between buttons and passive data pills
- responsive refinement and accessibility polish

Deferred:
- true alternate lenses
- thematic filters
- guided paths
- saved states
- quotes
- custom lenses
- advanced similarity engine

## What next

The next delivery sequence should be:
1. finish compare UX polish
2. strengthen the right-hand panel as a more guided interpretive surface
3. tune the geographic card now that it sits on real geometry
4. complete accessibility and responsive refinement
5. only then choose the first true post-MVP expansion, most likely thematic filtering or guided narrative

What should not happen yet:
- do not add multi-lens UI without real alternate-lens data
- do not add advanced echo scoring while curated echoes are still being refined
- do not expand surface area faster than the current interaction design is being clarified

## Geographic orientation idea

Add a lightweight map mode or map inset that answers: **where are we studying?**

Current first version:
- a compact Britain / British Isles inset in the detail panel
- highlighted geography for the selected period, with additional event geography pulled in when a pressure cascade is active
- labels for England, Scotland, Wales, Ireland, Britain, and wider/global context where relevant

Why it matters:
- grounds the abstract structural view in actual territory
- helps users understand shifts between England, Britain, United Kingdom, British Isles, and global empire
- gives a clearer bridge into future comparative-region work
