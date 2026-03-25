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
    exhibit-ui-refinement-plan.md
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
    usa-period-quality-review.md
    usa-periodization-proposal.md
    usa-initial-seed-candidates.md
    usa-snapshot-strategy.md
    usa-pressure-grounding-map.md
    france-dataset-charter.md
    france-periodization-proposal.md
    france-seeding-plan.md
    france-initial-seed-candidates.md
    france-pressure-grounding-map.md
    france-snapshot-strategy.md
    france-v1-validation-review.md
    france-period-quality-review.md
    france-maturity-checkpoint-decision.md
    multi-dataset-next-phase-plan.md
    multi-dataset-solid-readiness-review.md
    force-explorer-plan.md
    lived-voice-v2.md
    population-extension-plan.md
    data-science-insight-plan.md
    dataset-authoring-workflow.md
    dataset-authoring-standards.md
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
    france/
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
- the exhibit UI refinement pass is now in progress, with header simplification, copy reduction, stronger lived-voice presentation, and more purposeful reveal/trace motion now implemented
- the next data phase is now USA validation-and-quality review rather than further open-ended expansion
- the period-by-period USA quality review is now complete, with the remaining watchlist concentrated in `us-p01`, `us-p02`, and `us-p07`
- authoring standards are now being tightened so France starts from a clearer content method than either Britain or early USA did
- the USA maturity checkpoint is now accepted: USA is template dataset 2 at usable-draft maturity, so France can begin without waiting for USA perfection
- France chartering is now active as dataset 3, with the charter complete and periodization/seeding next
- France now has a proposed `9-era civic lens` aligned to regime and legitimacy breaks rather than equal-duration blocks
- France now also has a first seeding plan and anchor shortlist, but still no runtime dataset files
- France now also has a pressure-grounding map and snapshot/lived-voice strategy, and a first runtime France draft seed now exists on disk
- France now also has a first basic validation review and is wired into the app path as a guarded draft field
- France remains draft-scoped, and cross-dataset compare remains off
- France now also has a first live-use clarity review, with the main watchlist concentrated in `fr-p03`, `fr-p06`, and `fr-p07`
- France is now accepted as template dataset 3 at usable-draft maturity
- the next active project phase is now explicitly multi-dataset: move the three live fields toward `solid`, not toward endless new seeding
- lived voice v2 is now implemented across Britain, USA, and France with tabbed persona switching in the detail panel
- the first selective validation review against the new `solid` threshold is now complete: no live dataset is yet solid, but all three are strong enough for further low-claim product extension
- a small UI defect watchlist is now explicit: remove redundant `lived voice` repetition in the texture section, enforce British English consistently, and revisit the legibility of the `Force in focus` / `Through` card
- the next feature-leap is now explicitly `Force Explorer`, replacing the weak detail-panel force explanation before any separate `In motion` view is designed
- Force Explorer is now implemented on the main page as the primary force relationship surface, with clickable period nodes on the trace, padded edge periods, a stable top-right score/date read, and a selected date-range marker replacing the ambiguous `current` label
- Force Explorer flashpoints now read as full-width event cards with summary first and metadata underneath, rather than competing text and pill columns
- `In motion` now has its first live implementation: a `Race` modal opened from the header, showing ranked force pills, autoplay with interpolated movement, trails, scrubbing, family filtering, and pinned-force emphasis for one dataset at a time
- population is now recognised as a major missing structural series, and a first explicit extension plan now exists for schema, dataset, and UI support
- derived insight and data science are now recognised as a separate next-layer track for clusters, correlations, lead-lag relationships, and stronger `aha` prompts
- geography is now handled honestly: the inset map is shown only for Britain until USA and France have their own real map treatments
- lived voice now leads the right-hand detail flow as the human entry into a period before the more analytical read
- the page background has been rebalanced toward a lighter, more atmospheric exhibit field rather than a near-black shell
- dataset backgrounds are now allowed to vary by field using flag-derived atmospheric palettes rather than one hardcoded global background
- those palettes should now be treated as richer atmospheric syntheses rather than simple two-color gradients, so each field reads differently at first glance
- active echoes now render more spatially, with a canopy-style route fan in the Loom and a matching constellation treatment in the detail panel
- selected pressure focus now keeps the pressure overlay active regardless of whether the force was chosen from the Loom or the structural-force panel, using stable highlight behavior rather than animated line drawing
- selected pressure focus in the detail panel now uses a more embodied field-to-period-to-flashpoint treatment rather than a simple descriptive score block
- a final ink-economy pass has trimmed more low-value structural copy from header state pills, force controls, compare prompting, and empty echo states
- the next header-adjacent refinement is now clearly defined: the header should read as an entry deck, not a mixed control-and-readout strip, with `Structural fingerprint` and `Pressure balance` moved lower into the exploration flow
- field setup and live selection context are now being separated more honestly: dataset/lens/echo setup belongs in the right-hand entry rail, while the selected-period read belongs inside the Loom itself
- geographic inset exists, but further tuning, layout changes, and placement decisions are postponed until product discussion
- future UI refinement, if revisited later, should focus on motion, animation, progressive reveal, and exhibit staging rather than broad layout change

Deferred:
- selectable lens length
- cycle-lens selection UI
- true alternate lenses
- thematic filters
- guided paths
- accessible lived-voice or `vox pop` cards in the detail pane to explain periods in plain language through imagined first-person street-level responses
- richer lived-voice personae per period, likely as tabbed woman/man/third-voice positions where the content can support it
- saved states
- quotes
- custom lenses
- advanced similarity engine
- later `In motion` modes beyond Race, including the still-undecided Tension chart and any bounded Network mode
- future candidate datasets after France: Scotland, Britain before 1066, Roman, Germany, India, Japan, Mexico, and Russia / USSR

## What next

The next delivery sequence should be:
1. treat Britain as template dataset 1 rather than an active expansion target
2. complete the bounded exhibit UI refinement pass documented in `docs/exhibit-ui-refinement-plan.md`
3. keep Britain in selective validation mode rather than open-ended enrichment
4. move Britain, USA, and France from `usable draft` toward `solid` through selective validation rather than broad enrichment
5. hold cross-dataset compare until at least two datasets are solid enough to support it honestly
6. discuss geography before doing any further tuning or placement changes
7. move next into a lower-claim extension such as an `In motion` view while continuing only targeted validation toward `solid`
8. extend the schema and live datasets to support population as a first-class contextual metric, beginning in detail and compare
9. define a derived-insight layer so the product can surface clusters, co-movement, and candidate relationships without overstating causation

The important change is this:
- Britain should no longer be treated as a project to perfect
- Britain should now be treated as the first reusable dataset template

One future content direction should remain visible:
- the product needs a more accessible, more human narrative layer for younger and non-specialist audiences
- a likely answer is a `vox pop` or street-voice panel in the detail area, answering questions like `how are things affecting you?` and `what is everyday life like?` in clear, plain language
- the goal is not just to show structure, but to make the structure felt
- that lived-voice layer now exists across Britain, USA, and France in a first persona-driven v2 pass, and can later grow into image or audio-led presentation
- now that three datasets are live, the immediate next product phase is the one documented in `docs/multi-dataset-next-phase-plan.md`

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
