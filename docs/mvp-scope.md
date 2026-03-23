# MVP Scope — The History Loom

## 1. MVP objective

Prove the interaction grammar of the product, not all of history.

The MVP should demonstrate that users can:
- grasp the overview quickly
- select a period
- see pressure context
- discover gains and losses
- find at least one cross-era echo

The intended audience is not only history specialists.
The MVP should also work as:
- a premium web exhibit
- a public thinking tool for curious non-historians

## 2. Historical scope

Use:
- **Britain, 1066 to 2025**
- **12 equal 80-year periods** as the starter lens

## 3. Recommended data volume

For the first MVP:
- 12 periods
- 24–36 key events
- 12 pressures
- 10–16 echo links
- 12 human snapshots

## 4. Must-have features
- timeline overview
- equal-duration period blocks
- period detail panel
- gains vs losses view
- basic pressure overlay
- at least one echo interaction
- multi-scale summary for selected period

## Current implementation note

Implemented in the current prototype:
- timeline overview
- period selection
- direct chart-based period selection
- pressure overlay
- echo reveal
- focused echo journey actions for selecting, following, and comparing a rhyme
- question-led, force-led, and pattern-led entry paths in the header
- gains/losses detail
- multi-scale summary
- geographic inset
- compare mode with overlay presentation and source/target ownership
- top-of-panel interpretive period reading
- compare insight cards for overlap, separation, and pressure relationship
- overview and expanded density modes for the period stack
- calm-read and full-read density modes for the right-hand panel, with collapsible lower sections
- compact and expanded density modes for structural-force cards
- structural-force ordering by selected-period intensity, role, or label
- segmented and traced structural-force intensity display
- a first motion/material pass across surfaces, overlays, and selection states
- cleaner compare/detail copy with less internal memo language
- a more data-led opening surface with live current-focus context and a compact visual summary strip

Still not implemented in the current MVP branch:
- alternate lenses and lens-selection UI, which are explicitly deferred below

Current stage:
- the prototype is now late-MVP rather than early exploratory scaffolding
- the UI is good enough to freeze for now outside of obvious breakages
- the next phase is data expansion and content-system maturity rather than more interface work

## 5. Should-have features
- side-by-side compare mode
- thematic filters
- animated transitions between overview and detail
- curated guided path

## 6. Could-have features
- quotes
- plain-language `vox pop` cards in the detail panel so non-specialist users can understand how a period feels in everyday life
- ambient sound
- saved states
- user-defined custom lenses
- advanced similarity engine

## 7. MVP content requirements per period

Each period should include:
- title and years
- short summary
- dominant values
- social mood
- 3–5 pressure highlights
- what emerged
- what faded or broke
- key events
- one human snapshot
- one or more echo links

## 8. MVP success test

The MVP succeeds if a new user can, within a short session:
- understand the core layout
- explain one pressure-driven historical pattern
- identify one gain/loss tension in an era
- use the echo feature to compare two periods

## Current product note

The next quality threshold is not more interface surface but richer data:
- the UI should now be treated as stable enough for Britain v2 content work
- further UI refinement, if revisited later, should focus on motion, animation, progressive reveal, and exhibit staging
- Britain needs deeper event density, better pressure-event linkage, richer echoes, stronger thematic tagging, and more authored lived texture
- a future accessible narrative layer should be considered, such as `vox pop` responses in plain language for younger and non-specialist audiences
- the geographic inset is implemented, but further tuning and placement work remain paused pending product discussion

## Recommended next steps

1. execute the Britain v2 data-expansion plan
2. establish a repeatable research and collation workflow
3. define dataset maturity and multi-dataset mechanics
4. deepen Britain before adding alternate lenses or a second dataset
5. discuss whether geography belongs in the period detail flow or at the dataset level as the product expands
6. defer post-MVP expansion features until the Britain dataset is materially richer

## Deferred from future versions

- selectable lens length
- cycle-lens selection UI
- alternate lenses backed by real data
