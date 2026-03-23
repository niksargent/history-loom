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
    britain-v2-data-expansion.md
    britain-template-closeout-checklist.md
    britain-template-freeze-decision.md
    britain-v2-maturity-review.md
    britain-v2-validation-review.md
    usa-dataset-charter.md
    usa-seeding-plan.md
    usa-v1-gap-audit.md
    usa-v1-validation-review.md
    usa-lived-voice-layer.md
    usa-periodization-proposal.md
    usa-initial-seed-candidates.md
    usa-snapshot-strategy.md
    usa-pressure-grounding-map.md
    dataset-authoring-workflow.md
    multi-dataset-strategy.md
    research-notes.md
  data/
    datasets.json
    themes.json
    geographies.json
    validation-registry.json
    usa/
      meta.json
      periods.json
      events.json
      pressures.json
      echoes.json
      snapshots.json
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
- dataset registry and minimum dataset switching between Britain and the USA seed dataset
- source-backed USA seed files with an 8-era civic lens, 22 draft anchor events, draft echoes, and snapshots
- USA lived-voice content now exists as optional snapshot fields and renders in the detail panel
- Britain lived-voice content now exists as optional snapshot fields and renders in the detail panel

In progress:
- Britain selective validation rather than open-ended expansion
- repeatable research and collation workflow for future datasets
- USA dataset has reached a first usable draft baseline with a first plain-language snapshot uplift completed
- the USA lived-voice / vox-pop style content pass is now implemented
- the Britain lived-voice / vox-pop style content pass is now implemented
- geographic inset exists, but further tuning, layout changes, and placement decisions are postponed until product discussion
- future UI refinement, if revisited later, should focus on motion, animation, progressive reveal, and exhibit staging rather than broad layout change

Deferred:
- selectable lens length
- cycle-lens selection UI
- true alternate lenses
- thematic filters
- guided paths
- accessible lived-voice or `vox pop` cards in the detail pane to explain periods in plain language through imagined first-person street-level responses
- saved states
- quotes
- custom lenses
- advanced similarity engine

## What next

The next delivery sequence should be:
1. treat Britain as template dataset 1 rather than an active expansion target
2. run a top-to-bottom UI review using the installed `frontend-skill`
3. keep Britain in selective validation mode rather than open-ended enrichment
4. hold cross-dataset compare until both datasets are mature enough to support it honestly
5. keep UI work paused except for clear breakages or later exhibit-grade refinement
6. discuss geography before doing any further tuning or placement changes
7. only then choose the next product expansion, most likely France chartering, thematic filtering, or guided narrative

The important change is this:
- Britain should no longer be treated as a project to perfect
- Britain should now be treated as the first reusable dataset template

One future content direction should remain visible:
- the product needs a more accessible, more human narrative layer for younger and non-specialist audiences
- a likely answer is a `vox pop` or street-voice panel in the detail area, answering questions like `how are things affecting you?` and `what is everyday life like?` in clear, plain language
- the goal is not just to show structure, but to make the structure felt
- that lived-voice layer should be implemented for USA first and then Britain
- once both datasets have it, the next full product pass should be a top-to-bottom UI review using the installed `frontend-skill`

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
