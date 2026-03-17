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

An initial frontend prototype now exists with:
- React + TypeScript + Tailwind app scaffold
- local JSON-driven period, pressure, event, snapshot, and echo loading
- Loom overview with selectable periods
- pressure overlay and pressure selection
- right-hand detail panel with gains, losses, events, echo reveal, and multi-scale summaries

Current UX refinement priorities:
- make period cards beneath the Loom readable in a horizontal card format
- use more of the right-side panel's vertical space
- show active structural-force controls directly above the Loom
- keep polishing responsiveness and information hierarchy

## Geographic orientation idea

Add a lightweight map mode or map inset that answers: **where are we studying?**

Useful first version:
- a small Britain / British Isles map in the header or detail panel
- highlighted geography for the selected period or event
- subtle labels for England, Scotland, Wales, Ireland, Britain, and wider imperial/global scope when relevant
- event-level emphasis when geography narrows to places like Northern Ireland or England and Scotland

Why it matters:
- grounds the abstract structural view in actual territory
- helps users understand shifts between England, Britain, United Kingdom, British Isles, and global empire
- gives a clearer bridge into future comparative-region work
