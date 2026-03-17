# Interface Concepts — The History Loom

This document describes four distinct interface concepts. These are different structural approaches, not minor stylistic variants.

## Concept 1 — The Loom

### Core metaphor
History as woven structure.

### Best for
A flagship experience that balances beauty, recurrence, and explanation.

### Layout
- horizontal master timeline
- vertical or folded stack of equal-size period blocks below
- pressure ribbons woven through or behind the blocks
- side panel for selected era details
- echo links revealed as luminous threads

### Interaction model
- user selects a cycle lens
- periods align into repeated chunks
- selecting a block reveals values, mood, gains, losses, events, and lived experience
- selecting a pressure traces it across time
- selecting “show echoes” reveals structurally similar eras elsewhere

### Strengths
- best alignment with product thesis
- combines recurrence, pressure, and echo in one view
- emotionally resonant and visually distinctive

### Risks
- hardest to execute cleanly
- can become visually tangled without strong restraint

### Recommendation
**Lead concept for the product.**

---

## Concept 2 — The Codex Stack

### Core metaphor
History as a folded archive or layered codex.

### Best for
Period comparison, clarity, and a more architectural interface.

### Layout
- one present block in focus
- identical blocks stacked backward or downward into time
- each block opens like a drawer or page
- a phase indicator aligns equivalent positions across blocks
- pressure information appears as side overlays or mini-graphs

### Strengths
- highly legible
- easy to understand quickly
- strong for comparison workflows

### Risks
- can feel too much like an advanced timeline if not animated well
- underplays fluidity compared to The Loom

### Recommendation
Best fallback concept if clarity and buildability take priority.

---

## Concept 3 — The Pressure Score

### Core metaphor
History as a musical score of rising and falling forces.

### Best for
Showing causation, build-up, release, and interaction of pressures.

### Layout
- full-width time axis
- multiple horizontal pressure bands or waveforms
- event clusters at intersections or peaks
- selected era expands to show effects at multiple scales
- optional fixed-period overlays can be toggled on

### Strengths
- best expression of the “events are downstream” thesis
- intellectually strong
- excellent for theme-led exploration

### Risks
- less intuitive for casual users
- weaker on the visual satisfaction of equal chunks

### Recommendation
Strong as the second major mode, even if not the default view.

---

## Concept 4 — The Echo Atlas

### Core metaphor
History as a constellation of structurally similar moments.

### Best for
Surprise, discovery, and “history rhymes” moments.

### Layout
- central selected period or event
- surrounding nodes show similar moments elsewhere
- timeline anchor remains visible
- similarity reasons shown as matched dimensions
- compare mode opens side-by-side cards

### Strengths
- strongest “wow” factor
- memorable discoveries
- ideal for the signature interaction “show me another time this felt the same”

### Risks
- can become abstract if detached from chronology
- depends on strong curation or similarity modelling

### Recommendation
Use as a discovery layer on top of a more grounded primary view.

---

## Recommended concept strategy

Do not treat these as mutually exclusive.

Recommended structure:
- **Primary default:** The Loom
- **High-clarity alternate overview:** The Codex Stack
- **Causal mode:** The Pressure Score
- **Discovery mode:** The Echo Atlas

This gives the product:
- recurrence
- comparability
- causation
- surprise

## Recommended first prototype

Build:
- The Loom as the main canvas
- a simplified Pressure Score layer behind it
- an Echo reveal interaction for selected eras

## Geographic Map Layer

### Purpose
Orient the user spatially so the experience makes clear **where** the current lens is operating.

### Recommended first use
- a compact map inset of Britain / the British Isles
- highlight the active geography of the selected period or event
- support labels that distinguish England, Britain, the United Kingdom, and wider global scope

### Why it helps
- reduces abstraction in a structurally focused interface
- clarifies scope changes across the dataset
- creates a clean bridge to future region comparison or empire/global overlays

### Best placement in v1
- a small inset in the right-hand detail panel or top header
- not a full primary mode yet
