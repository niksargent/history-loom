# In Motion Brief

## Purpose

`In motion` should become a separate secondary surface for watching historical forces shift through time.

It is not another dashboard page.
It is the motion-led counterpart to the main Loom:
- the Loom is for reading
- `In motion` is for watching

The job of this surface is to answer:
- which forces rise and fall
- which forces overtake others
- when the field becomes stress-heavy or stabiliser-heavy
- how change feels across time rather than only at one selected period

## Product role

`In motion` should sit outside the main page as a separate view, modal, or dedicated secondary mode.

It should not add more clutter to the main Loom surface.

The main page remains responsible for:
- period selection
- detailed reading
- force follow
- echo follow

`In motion` should handle:
- ranking shifts
- temporal balance
- animated structural relationships

## Visual thesis

Broadcast analysis meets museum installation.

The surface should feel:
- slick
- restrained
- dark and atmospheric
- low-text
- driven by motion rather than chrome

It should use colour as information encoding, not decoration.
Stress and stabiliser families must read instantly without requiring explanatory labels.

## Content plan

The surface should have one dominant stage and minimal surrounding UI.

Recommended structure:
1. short orientation header
2. one large animated visual mode
3. small controls for play, pause, scrub, and mode switching
4. sparse supporting readouts only where they improve interpretation

## Interaction thesis

Core interactions:
- play through time
- pause
- scrub to a period
- pin one force
- switch view mode without losing the selected dataset or period

Motion should explain change, not decorate the page.

## Approved mode set

### 1. Race

This should be the default mode.

Chart family:
- ranked pills with motion trails rather than conventional bars

What it shows:
- force ranking over time
- pills reordering as periods change
- one selected force can be pinned or highlighted
- rank movement is visible immediately

Required feature:
- the race chart must show trails so recent movement and momentum are visible, not just the current order

Locked v1 decisions:
- it opens as an expansive modal rather than a new page
- playback advances automatically by period but interpolates more smoothly between period states
- v1 is one dataset at a time
- future architecture must allow same-time-range dataset comparison later

Detailed implementation spec:
- see `docs/in-motion-race-spec.md`

What it answers:
- which force leads in each era
- which forces surge
- which ones decline
- whether stress or stabilisers dominate at different points

### 2. Tension

This should be the second mode.

Purpose:
- show the balance between stress and stabiliser families over time
- make the centre of gravity of the field visible

Important note:
- do not lock the exact chart form yet
- the force-pull / tension visual should remain open until the project is informed by the Race build and live use

This mode is approved conceptually, but the exact chart grammar is still intentionally undecided.

### 3. Network

This should be the third mode and the most tightly scoped.

Best use:
- selected force network

Suggested node structure:
- selected force at centre
- linked periods around it
- flashpoint events branching from those periods
- optional future theme or echo links only if the graph remains legible

This is where a force-directed graph may be useful.

Important constraint:
- do not use a force-directed graph as the whole-history default view
- keep the graph bounded to one selected force or one selected period

## Architecture requirements

`In motion` must be designed so it can later compare datasets that cover the same time range.

Examples:
- Britain vs United States
- Britain vs France
- United States vs France

That does not mean shipping cross-dataset compare now.
It means the architecture should be prepared for it.

Requirements:
- motion views should operate on a normalized time axis abstraction, not assume one dataset only
- the data layer should support one or two active datasets in the motion surface later
- views should be able to render a single force or a selected set of forces across multiple datasets when the datasets are mature enough
- chart components should not hardcode one dataset’s period count or width

Current product rule still stands:
- cross-dataset compare remains off until at least two datasets are `solid`

## What current data can support now

With current data, the product can already support:
- Race for Britain, USA, and France individually
- a first Tension mode for Britain, USA, and France individually
- a bounded Network mode for selected force to periods to events

No schema rewrite is required to prove the concept.

## What this should not become

Do not let `In motion` become:
- another card dashboard
- another text-heavy inspector
- a permanent clutter layer on the main page
- a graph soup of every dataset and every relationship at once

## Success condition

`In motion` is successful if:
- users can understand change through movement rather than reading dense explanation
- force ranking and balance become easier to grasp than on the static page
- the motion view feels like a real second way to think, not a novelty animation
- the architecture is ready for later same-time-range dataset comparison without a rewrite

## Recommended implementation sequence

1. define the surface and state model
2. build `Race` first
3. evaluate what the product learns from Race
4. then choose the exact Tension chart form
5. add a bounded Network mode only if it clearly improves insight

## Higher-reasoning step

The highest-reasoning part of this feature is not the animation itself.
It is deciding which motion grammar genuinely clarifies history rather than merely making the interface look clever.
