# MVP Scope — The History Loom

## 1. MVP objective

Prove the interaction grammar of the product, not all of history.

The MVP should demonstrate that users can:
- grasp the overview quickly
- select a period
- see pressure context
- discover gains and losses
- find at least one cross-era echo

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

Still not implemented in the current MVP branch:
- alternate lenses and lens-selection UI, which are explicitly deferred below

Current stage:
- the prototype is now late-MVP rather than early exploratory scaffolding
- the remaining work is primarily design, clarity, and quality refinement rather than basic feature plumbing

## 5. Should-have features
- side-by-side compare mode
- thematic filters
- animated transitions between overview and detail
- curated guided path

## 6. Could-have features
- quotes
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

## Current UX note

The next quality threshold is not more features but clearer interpretation:
- the compare view should make overlap, difference, and curated echo reasons scan immediately
- the geographic inset is implemented, but further tuning and placement work is paused pending product discussion
- the right-hand detail story should keep shifting from stacked information toward guided interpretation
- structural-force intensity still needs a final visual language decision, even after the current compact/order/trace treatment
- buttons should read clearly as actions and not blur into passive data pills
- overview and detail density controls should feel elegant rather than merely functional
- motion and material should keep staging attention rather than becoming ambient noise
- all internal-memo style UI phrases should be identified and removed

## Recommended next steps

1. finish compare UX polish
2. continue improving the interpretive quality and copy economy of the right-hand panel
3. complete accessibility and responsive refinement
4. discuss whether geography belongs in the period detail flow or at the dataset level as the product expands
5. defer post-MVP expansion features until the existing MVP interactions feel fully coherent

## Deferred from future versions

- selectable lens length
- cycle-lens selection UI
- alternate lenses backed by real data
