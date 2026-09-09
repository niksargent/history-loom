# Exhibit UI Refinement Plan

## Purpose

The current UI is usable, coherent, and increasingly rich, but it still reads more like a capable product interface than a memorable public exhibit.

This pass should improve:
- first-impression impact
- information economy
- lived readability for non-specialists
- motion as guidance rather than decoration

This pass should not:
- reopen broad layout experimentation everywhere
- revisit geography placement
- add major new product modes
- destabilize the now-working multi-dataset surface

## Design thesis

The History Loom should feel like an illuminated historical field rather than a dashboard of panels.

That means:
- one dominant visual idea per layer
- less explanatory copy
- stronger use of tone, motion, and sequencing
- clearer distinction between analysis and human texture

## Immediate execution goals

### 1. Reduce interface narration
- remove or shorten status lines that merely explain UI state
- remove placeholder and fallback copy where omission or a lighter visual treatment is enough
- cut repeated structural labels such as `selected period`, `question`, `pattern`, and `in selected period` where layout already makes the meaning clear

### 2. Simplify the opening viewport
- reduce fragmentation in the top section
- make the first screen feel more like one composed front door and less like several equal-weight cards
- keep `Start with a...` but reduce the amount of competing copy and metadata around it

### 3. Promote lived voice
- treat `lived voice` as a distinct medium rather than a nested note card
- make it feel plausibly speech-ready even before audio playback exists
- give it enough visual identity that younger and non-specialist users notice it immediately

### 4. Make motion do interpretive work
- use reveal and glow sparingly but more intentionally
- let interaction states feel staged
- make selections, echoes, and voice content feel more alive without becoming noisy

## Execution chunks

### Chunk A: composition and copy
- simplify the top section
- tighten Loom and detail copy
- reduce placeholder text
- reduce redundant labels in force and compare surfaces

### Chunk B: lived voice and reveal
- visually elevate lived voice
- add motion and texture that support reading order
- improve the sense that the interface is unfolding rather than statically listing

## Deliberately deferred

- geography tuning and placement
- another major compare redesign
- cross-dataset compare
- major new navigation systems

## Finish condition for this pass

This refinement pass is successful if:
- the first screen feels calmer and more iconic
- the UI explains itself less in words
- lived voice becomes one of the most legible and memorable features
- motion improves hierarchy and presence without turning the product into a motion demo

## Current status

Implemented now:
- top-of-page composition has been simplified by reducing competing header panels
- state narration and placeholder text have been shortened across the Loom, detail panel, compare, and force surfaces
- lived voice has been promoted from a nested note block into a more distinct, speech-ready visual treatment and now sits above the analytic reading in the detail flow
- selected pressure traces now animate more intentionally across the Loom
- the page background now carries more exhibit atmosphere, with a lighter top-right field graduating into charcoal
- active echoes now read as routes rather than only tags, with a full canopy-style route fan in the Loom and a small echo-constellation map in the detail panel
- selected pressure lines now keep overlay visibility when chosen from both the Loom and the structural-force panel, without relying on fragile draw-on animation
- selected force-follow in the detail panel now reads more like a field moving through the period and into event flashpoints, rather than a flat score card plus list
- the last obvious structural filler text has been reduced, especially around force ordering, compare-picking, echo-empty states, and header state pills

Still deferred for later:
- geography reconsideration
- larger compare rethinking
- deeper exhibit choreography beyond the current bounded pass

## Immediate next implementation

The next immediate UI pass should be tightly scoped:
- restage the top header as a clearer entry deck for setup and orientation
- split field setup from live Loom readout, with dataset selection and lens/echo summary on the right and selected-period context inside the Loom itself
- move `Structural fingerprint` and `Pressure balance` out of the header and down into the main exploration flow, directly above Force Explorer
- recast `Pressure balance` as an opposing pull bar from a centre line, using average stress and stabiliser scores as relative pull rather than pretending they form one conserved total
- fix the detail-panel reading logic so user-selected force highlighting does not rewrite the authored period reading

## Known UI defects and watchpoints

These should be treated as explicit cleanup items rather than vague impressions:

- the detail section title `Events and lived voice` is now redundant because lived voice already leads the panel and does not need to be repeatedly named lower down
- the `Force in focus` / `Through` card is conceptually stronger than it is immediately legible; some users do not understand that it is showing a force moving from field climate into the selected period and then into named flashpoints
- copy and labelling should default to British English consistently across the whole product
