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

## Product direction

The product is leaning toward two complementary identities:
- a premium interactive exhibit published on the web
- a public thinking tool for curious non-historians

It should feel closer to intelligent edutainment than to a research console, while still drawing on strong historical reasoning and data analysis where they improve clarity.

That means:
- visualisations should do as much explanatory work as possible
- the interface should invite exploration through compelling questions, not only through controls
- the product should remain intellectually serious without becoming academic or over-explained

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
- tabbed question-led, force-led, and pattern-led entry points in the top header
- pressure overlay and inline thread pills
- direct period selection from both the chart surface and the period-card stack
- user-controlled period-card density with overview and expanded stack modes
- user-controlled detail density with calm-read and full-read modes plus collapsible lower sections
- pressure-emphasized detail flow with clearer narrative framing
- top-of-panel interpretive reading for the selected period
- structural-force cards with compact and expanded modes
- structural-force ordering by selected-period intensity, role, or label
- richer structural-force intensity treatment using segmented bands and mini traces
- geographic inset built from real topojson coastline data with product-level region highlights layered on top
- echo reveal
- focused echo journey flow with counterpart selection, jump-to-period, and compare actions
- side-by-side compare mode with explicit source/target color ownership and direct exit
- compare insight cards that surface shared pull, main separation, and pressure relationship
- deeper material treatment and restrained reveal/glow motion across the Loom, detail panel, and compare overlay
- cleaner compare/detail copy, with less internal-memo language and clearer source/comparison/shared reading
- a denser, more data-led top section with live current-focus context and a compact visual summary strip

In progress:
- tighter narrative interpretation and copy economy across the right-hand detail flow
- more intelligent interpretive framing where it materially improves discovery for non-historians
- compare UX polish only where it improves clarity without reopening the overall design direction
- geographic inset exists, but further tuning, layout changes, and placement decisions are postponed until product discussion
- further ideation on whether structural-force intensity should stay segmented/trace-based or move toward a more bespoke visual language
- decision on whether geography belongs in the selected-period detail flow or at the dataset level when broader dataset expansion is defined
- identify and remove UI phrases that read like internal memo rather than user-facing product language
- clearer differentiation between buttons and passive data pills
- finish the motion and material pass so the interface feels calmer at rest and more alive when interacting
- responsive refinement and accessibility polish

Deferred:
- selectable lens length
- cycle-lens selection UI
- true alternate lenses
- thematic filters
- guided paths
- saved states
- quotes
- custom lenses
- advanced similarity engine

## What next

The next delivery sequence should be:
1. refine the top-of-page entry surface so users can begin through questions, forces, and patterns without being hit by a wall of explanation
2. strengthen interpretive framing where it produces a clear uplift, especially for first-time and non-historian users
3. define the first data-expansion plan for the Britain dataset so the next wave of content unlocks stronger thematic and reasoning experiences
4. keep compare changes limited to high-value clarity improvements rather than redesigning a working surface
5. address only critical accessibility and responsive issues
6. discuss geography before doing any further tuning or placement changes
7. only then choose the first true post-MVP expansion, most likely thematic filtering or guided narrative

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
