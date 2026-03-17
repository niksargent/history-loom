# PRD — Interactive History Experience

## Working titles

* The History Loom
* Echoes of Time
* The Pressure Atlas
* Strata

**Recommended working title:** **The History Loom**

---

## 1. Product vision

Create an interactive historical experience that allows people to see history not merely as a sequence of events, but as a set of recurring structures, pressures, releases, values, moods, gains, losses, and human consequences.

The experience should feel:

* visually beautiful
* intellectually serious
* emotionally resonant
* simple on first contact
* deep on exploration

This is **not** a conventional timeline.
It is a system for revealing:

* recurring historical patterns
* pressure build-up and release
* echoes across eras
* the relationship between macro history and lived human experience

The user should come away feeling:

* “I can see history differently now.”
* “These eras are not identical, but they rhyme at a deep structural level.”
* “Events make more sense when seen as outcomes of underlying pressures.”

---

## 2. Core design principle

The experience must balance two truths:

### Truth A — Humans crave pattern

Users are drawn to repeatable chunks, cycles, phases, and visual recurrence.

### Truth B — History is not a clock

The product must avoid naive determinism. It should present cycles as **lenses** or **hypotheses**, while also allowing deeper exploration of non-rigid pressures and structural recurrence.

### Design implication

The interface should support **multiple views of the same historical material**, including:

1. a fixed-cycle view
2. a pressure-wave view
3. an echo/similarity view

These are not separate products. They are different lenses on the same historical substrate.

---

## 3. Product thesis

History is most illuminating when explored through three linked ideas:

### A. Periodicity

Time can be divided into comparable chunks using a chosen lens (e.g. 25-year, 50-year, 80-year, 200-year).

### B. Pressure

Events are often downstream of deeper pressures: inequality, legitimacy collapse, technological disruption, moral certainty, fragmentation, ecological strain, etc.

### C. Echo

Different eras often produce structurally similar patterns of feeling, conflict, emergence, and loss.

The experience should allow users to move fluidly between these three levels.

---

## 4. Audience

### Primary audience

* intellectually curious general users
* history enthusiasts
* designers / thinkers / educators
* people interested in civilizational patterns, not just dates

### Secondary audience

* teachers / lecturers
* writers / researchers / strategists
* museum / cultural experience designers
* people interested in long-term societal change

### Audience expectations

Users will expect:

* visual elegance
* low clutter
* immediate intelligibility
* meaningful depth
* a sense of discovery
* the ability to compare eras

---

## 5. Experience goals

The product should enable users to:

1. **See repeatable historical structures** through fixed time chunks.
2. **Understand causal build-up** through pressure accumulation and release.
3. **Compare different eras directly** using common dimensions.
4. **Explore the human condition at multiple scales**: personal, local, national, global.
5. **See what each era created and what it destroyed**.
6. **Find echoes across time** based on structural similarity, not just topical similarity.
7. **Move from calm overview to rich detail** without losing visual coherence.

---

## 6. Non-goals

The product is **not** trying to:

* provide a complete history of everything
* claim a single deterministic master cycle explains all history
* overwhelm users with encyclopedic detail
* act as a textbook replacement
* turn all history into war, rulers, and dates

---

## 7. Core interaction modes

## Mode 1 — Clock

### Purpose

Provide the seductive, immediately graspable view of history as a sequence of equal-duration periods.

### Visual model

* equal-size stacked or folded blocks
* each block represents one chosen time chunk
* present at top/front, past descending backward/downward
* each block has the same internal fields

### Each block may contain

* dominant values
* social mood
* institutional condition
* material condition
* key emergences
* major losses
* representative events
* human experience summary

### Key interaction

* click a period to expand its internal structure
* highlight the same position across all other blocks
* compare “phase positions” across periods
* shift the cycle length and watch the alignment change

### Emotional effect

This mode should create immediate fascination and pattern recognition.

---

## Mode 2 — Pressure

### Purpose

Reveal the underlying forces that drive visible historical events.

### Visual model

History shown as a field of horizontal pressure bands or waveforms over time.

### Example pressures

* inequality
* elite competition
* institutional legitimacy
* technological disruption
* communication acceleration
* ecological strain
* militarization
* religious certainty / moral confidence
* social cohesion / fragmentation
* status anxiety
* public hope / social confidence
* individual agency / fatalism

### Key interaction

* hover a pressure peak to see events and conditions it influenced
* click a pressure line to isolate it across centuries
* show intersections between multiple pressures
* reveal “pressure -> release -> new pressure” chains

### Emotional effect

This mode should make history feel like a living weather system rather than a row of facts.

---

## Mode 3 — Echo

### Purpose

Allow users to discover similar historical structures across distant eras.

### Visual model

* nodes across time connected by lines of structural similarity
* or a side-by-side “this felt like that” comparator
* or clusters of similar eras in a similarity field

### Example echo queries

* periods of confidence before overreach
* institutional decay under outward prosperity
* spiritual unrest amid material advance
* fragmentation followed by demand for order
* liberation that produced instability
* post-trauma rebuilding with cultural flowering

### Key interaction

* click an era or event and request “show me another time this felt structurally similar”
* filter by dimension: politics, daily life, values, innovation, collapse, cohesion, religion, identity, economy

### Emotional effect

This mode should produce the “wow” moment.

---

## 8. Supporting visual concepts

These may appear as subviews, alternative layouts, or narrative transitions.

### A. The stacked block / codex

A layered, repeated block structure that turns time into comparable cells.

### B. The pressure-wave score

A musical-score-like field of rising and falling forces.

### C. The pressure-release braid

Braided ribbons that show order, strain, backlash, release, fragmentation, renewal.

### D. The historical core sample

Vertical strata of history, like geological or ice layers.

### E. Phase-space map

Societies or eras moving through a state-space: cohesion, inequality, legitimacy, confidence, experimentation.

### F. Echo map / constellation

Non-linear network linking similar historical conditions across time.

---

## 9. Core information model

Every historical unit in the experience should be modelled with a consistent schema.

## Historical Unit

A period, event, or condition window.

### Required fields

* title
* start year
* end year
* geography / civilization / scope
* scale (personal / local / national / global)
* summary

### Structural fields

* dominant values
* social mood
* material condition
* institutional condition
* technological condition
* religious / philosophical condition
* information environment
* cohesion vs fragmentation
* legitimacy / trust level
* inequality / stratification level

### Human-condition fields

* daily life qualities
* labour conditions
* family / household pattern
* exposure to violence / insecurity
* autonomy vs obligation
* opportunity vs precarity
* sense of future
* typical emotional climate

### Emergence fields

* what emerged
* what expanded
* what became newly possible

### Loss fields

* what faded
* what broke
* what became harder
* what was forgotten or displaced

### Event fields

* representative events
* representative figures
* representative texts / art / inventions

### Pressure fields

* pressure scores by category
* pressure transitions
* pressure release type

### Echo fields

* similar periods
* similarity reasons
* similarity confidence

---

## 10. Multi-scale history design

A key product differentiator is preserving multiple scales of historical life.

Each selected period should be explorable across four synchronized lanes:

### 1. Personal

What life felt like to an individual or household.

### 2. Local

How towns, villages, neighbourhoods, and communities functioned.

### 3. National / state

How institutions, authority, taxation, law, warfare, and governance operated.

### 4. Global / civilizational

Trade, empire, migration, ecology, technology transfer, global conflict, cultural circulation.

### Design purpose

This prevents the experience collapsing into only elite or geopolitical history.

---

## 11. Signature interaction ideas

### 1. “Show me another time this felt the same”

The user explores one era and the system finds structurally similar eras elsewhere.

### 2. “What did this era make possible?”

Reveals gains, innovations, freedoms, forms of beauty, cooperation, thought.

### 3. “What did this era quietly destroy?”

Reveals costs, displacements, losses, rigidities, simplifications, spiritual or social erosion.

### 4. Phase alignment

Highlights the same relative phase across different equal-size periods.

### 5. Pressure cascade

Selecting one pressure shows downstream events and human consequences.

### 6. Lens switching

The same history can be viewed by:

* time chunk
* pressure
* scale
* geography
* theme
* emotional tone
* emergence / loss

### 7. Structural similarity comparator

Two eras shown side by side with matched dimensions.

---

## 12. User journey

## Entry experience

The opening screen should be calm, sparse, and inviting.

Possible opening:

* a single present-era block
* subtle stacked layers receding into the past
* faint pressure lines visible behind
* one short invitation: “History does not repeat exactly. But it does build, strain, release, and echo.”

## First actions

The user can choose:

* a cycle length / lens
* a region / civilization
* a thematic mode
* a curated story path

## Core loop

1. user sees an overview
2. user selects a period / pressure / theme
3. user opens detail
4. user discovers recurrence, tension, or consequence
5. user jumps to similar periods or adjacent pressures
6. user forms a broader sense of pattern

## Deep exploration

At deeper levels, users can open:

* events
* quotes
* lived experience snapshots
* values and losses
* comparisons
* pressure explanations

---

## 13. Suggested initial lenses

To keep the product intellectually credible, users should not be locked into one historical chunk size.

### Lens options

* generational lens (~25–30 years)
* social / civic lens (~75–100 years)
* long secular pressure lens (~150–250 years)
* custom chunk lens

### UI implication

The interface should make it obvious that chunk size is a viewing lens, not a universal fact.

---

## 14. Content strategy

### Strong recommendation

Do **not** begin with all of world history.

Start with one bounded historical scope, such as:

* Britain from 1066 to present
* Europe from 1500 to present
* the modern world from 1700 to present

### Why

This allows:

* tighter curation
* stronger narrative consistency
* better visual density control
* lower data burden
* clearer proof of concept

### Expansion path

After the grammar works, extend to:

* other regions
* comparative civilizations
* thematic overlays
* user-defined comparisons

---

## 15. Design language

### Overall feel

* elegant
* restrained
* meditative
* premium
* intelligent
* quietly cinematic

### Visual behaviour

The surface should remain simple.
Richness should appear only when explored.

### Principle

**Calm at rest. Deep in motion.**

### Possible visual directions

* dark mineral / charcoal interface
* parchment-black hybrid palette
* muted metallic accents
* very limited colour vocabulary by default
* colour reserved for active pressures, selected eras, or themes

### Typography

* refined serif or humanist display for headings
* clean modern sans for interface and annotations
* short labels, not paragraph clutter

### Motion

* gentle unfolding
* subtle glow and tracing
* no gimmicky motion
* transitions should feel like revealing hidden structure

---

## 16. Information density rules

The product must resist overload.

### Default layer should show only:

* structure
* a few labels
* current lens
* selected time span

### On demand, reveal:

* detail cards
* event clusters
* value/mood labels
* gains/losses
* human snapshots
* echo links

### Rule

At no point should the screen feel like a textbook exploded onto glass.

---

## 17. Data / content objects needed for build

## A. Period records

Chunked historical windows.

## B. Event records

Specific moments, crises, breakthroughs, reforms, wars, inventions, cultural works.

## C. Pressure records

Time-series or categorical curves for each pressure dimension.

## D. Human snapshots

Short vignettes describing lived experience at one or more scales.

## E. Echo links

Curated or algorithmic connections between similar units.

## F. Themes

Work, faith, identity, freedom, state power, mobility, belonging, family, knowledge, death, progress, alienation, etc.

---

## 18. MVP recommendation

The first build should prove the grammar, not solve all of history.

## MVP scope

* one geography / civilizational stream
* one bounded time range
* 3 main views: Clock / Pressure / Echo
* limited but carefully curated dataset
* elegant interaction prototype

## MVP content depth

For each period, include:

* title
* dates
* 3–5 dominant values
* 3–5 pressure scores
* mood
* what emerged
* what was lost
* key events
* one human snapshot
* 1–3 echo links

## MVP user promise

“I can explore historical recurrence and pressure in a way I have never seen before.”

---

## 19. Suggested MVP feature list

### Must-have

* overview timeline / block view
* adjustable cycle lens
* selectable period
* pressure visualization
* period detail panel
* gains vs losses reveal
* echo suggestions
* multi-scale summary panel

### Should-have

* side-by-side compare mode
* thematic filters
* animated transitions between views
* curated narrative tours

### Could-have

* quote overlays
* sound design / ambient cues
* save/share comparison states
* user-created lens presets
* guided “structural match” storytelling

---

## 20. Risks

### 1. Overclaiming historical certainty

Mitigation: present cycle lengths and similarity logic as lenses/hypotheses.

### 2. Visual complexity

Mitigation: strict hierarchy, progressive disclosure, calm default state.

### 3. Abstractness without humanity

Mitigation: include lived-experience and gains/losses everywhere.

### 4. Shallow pattern-matching

Mitigation: ground similarities in explicit dimensions and reasons.

### 5. Dataset sprawl

Mitigation: start narrow and curated.

---

## 21. Success criteria

The product succeeds if users can:

* intuitively grasp the overview within seconds
* discover at least one meaningful cross-era pattern
* understand at least one event as an outcome of deeper pressures
* see both gains and losses in a period
* feel history has become more legible, not more flattened

### Strong success signal

Users spontaneously say some version of:

* “I’ve never seen history shown like this.”
* “This makes patterns visible.”
* “This makes events feel explained rather than isolated.”

---

## 22. Future expansion directions

### A. Civilization comparison

Compare Rome, Britain, Qing China, modern America, etc. through a common structure.

### B. Theme-led exploration

Trace a theme like work, childhood, trust, faith, loneliness, or identity across history.

### C. Emotion-led history

Explore eras by dominant felt climate: confidence, dread, exhaustion, fervour, humiliation, possibility.

### D. Alternate lens design

Allow multiple scholarly or speculative models to coexist.

### E. Museum / installation mode

Turn the experience into a wall-scale interactive exhibit.

---

## 23. Recommended initial concept direction

For the first design pass, combine these elements:

### Primary structure

A horizontal timeline with a vertical or folded stack of equal-duration blocks.

### Secondary layer

Pressure ribbons or waveforms running across / behind the periods.

### Tertiary layer

Echo links revealed on demand between structurally similar periods.

### Why this combination

It unites:

* the appeal of recurrence
* the truth of pressures
* the wonder of cross-era echoes

This should be the foundational experience grammar.

---

## 24. One-sentence concept summary

**The History Loom is an interactive experience that reveals history as a woven pattern of recurring phases, underlying pressures, and cross-era echoes — showing not just what happened, but what built, what broke, what emerged, what was lost, and how human life felt within it.**

---

## 25. Immediate next design deliverables

1. Create 3–4 distinct interface concepts based on this PRD.
2. Choose an initial historical scope for the MVP.
3. Define the period schema and pressure taxonomy.
4. Build a sample dataset for 6–12 periods.
5. Prototype the overview interaction before deep content expansion.

---

## 26. Suggested first historical scope options

### Option A — Britain, 1066 to present

Strong continuity, rich institutional shifts, manageable scope.

### Option B — Europe, 1500 to present

Strong modernity arc, religion-state-economy transformations.

### Option C — Modern world, 1700 to present

More global relevance, but more complexity.

**Recommended:** Option A or B.

---

## 27. Suggested first pressure taxonomy

A first-pass taxonomy could include:

* inequality
* elite competition
* institutional legitimacy
* social cohesion
* technological disruption
* information acceleration
* ecological strain
* militarization
* moral certainty / ideological rigidity
* public hope / future confidence
* individual autonomy
* economic precarity

This list should remain editable.

---

## 28. Final design mantra

**Not a timeline. A loom.**

**Not just events. Conditions.**

**Not just repetition. Pressure and release.**

**Not just the past. The shape of human recurrence.**

---

## 29. Interface concept directions

Below are four distinct interface concepts for the product. These are not minor style variations. Each proposes a different mental model for how users perceive history.

## Concept 1 — The Loom

### Core metaphor

History as woven structure.

### Best for

A premium flagship experience that balances beauty, recurrence, and explanation.

### Layout

* horizontal master timeline across the centre
* vertical or folded stack of equal-size period blocks below it
* pressure ribbons woven through or behind the blocks
* side panel for selected era details
* echo links revealed as luminous threads between eras

### Visual character

* dark mineral background
* restrained metallic thread lines
* subtle glow on selected relationships
* elegant typography
* calm, sparse by default

### Interaction model

* user selects a cycle lens
* blocks align into repeated units
* selecting a block reveals its internal structure
* selecting a pressure threads it through periods
* selecting “show echoes” lights similar eras elsewhere

### Strengths

* most aligned with the product name and thesis
* combines chunking, pressure, and echo in one view
* emotionally resonant and visually distinctive

### Risks

* hardest to execute elegantly
* can become visually tangled if not tightly controlled

### Recommendation

**Strongest overall concept.**
This should be considered the lead concept for the product.

---

## Concept 2 — The Codex Stack

### Core metaphor

History as a folded archive or layered codex.

### Best for

Users who want strong period comparison and a more legible block-based interface.

### Layout

* one primary present block in focus
* identical historical blocks stacked backward/downward into time
* each block opens like a drawer or page
* a horizontal phase indicator aligns equivalent positions across blocks
* pressure information appears as slim side graphs or overlays

### Visual character

* archival luxury
* black, stone, parchment, muted copper
* crisp edges, layered shadows, precise geometry
* less fluid than The Loom, more architectural

### Interaction model

* choose lens length
* stack re-divides into equal periods
* open any block to reveal values, mood, gains, losses, events, lived experience
* compare block-to-block in synchronized view
* optional toggle to show pressure overlays

### Strengths

* extremely clear and teachable
* easy for users to understand immediately
* ideal for side-by-side comparison and chunk logic

### Risks

* may underplay the fluidity of historical forces
* could feel more like an advanced timeline unless animated well

### Recommendation

Best concept if clarity and buildability are prioritized over poetic dynamism.

---

## Concept 3 — The Pressure Score

### Core metaphor

History as a musical score of rising and falling forces.

### Best for

Showing causation, build-up, release, and interaction of multiple historical pressures.

### Layout

* full-width time axis
* multiple horizontal pressure bands or waveforms
* event clusters appear at crossings, peaks, and breakdown points
* selected era expands vertically to show human consequences at several scales
* fixed-period chunk overlays can be toggled on for comparison

### Visual character

* sleek, scientific, atmospheric
* very thin lines and translucent layers
* subtle moving traces
* more analytical, less object-like

### Interaction model

* isolate one pressure or several
* hover peaks for affected events and outcomes
* trace chains like legitimacy decline -> unrest -> crackdown -> reform
* switch to multi-scale view for personal/local/national/global effects
* compare how different pressures rose in different eras

### Strengths

* best expression of the “events are downstream” thesis
* unique and intellectually strong
* ideal for exploration by theme or cause

### Risks

* less immediately intuitive for general users
* weaker on the satisfying visual logic of equal chunk repetition

### Recommendation

Excellent as the second major mode, even if not the default landing view.

---

## Concept 4 — The Echo Atlas

### Core metaphor

History as a constellation of structurally similar moments.

### Best for

Delivering surprise, pattern recognition, and the feeling that distant eras rhyme.

### Layout

* central selected period or event
* surrounding nodes represent similar historical moments
* a timeline anchor remains visible so users never lose chronology
* similarity reasons appear as labeled dimensions
* optional split-screen compare opens matched eras side by side

### Visual character

* celestial / cartographic
* dark field with sparse luminous nodes
* elegant curved connectors
* highly focused, dramatic reveals

### Interaction model

* select an era, event, mood, or pressure pattern
* system reveals similar moments elsewhere
* filter similarity by politics, daily life, legitimacy, innovation, spiritual climate, etc.
* open a comparison card to see why they match and where they diverge

### Strengths

* strongest “wow” factor
* creates memorable discoveries
* ideal for the signature interaction “show me another time this felt the same”

### Risks

* can become too abstract if detached from the base timeline
* depends on strong curation or similarity modelling

### Recommendation

Best used as a revelatory exploration mode layered on top of a more grounded primary view.

---

## 30. Recommended concept strategy

Do not choose only one concept as the whole product.

### Best overall product structure

* **Primary default experience:** Concept 1 — The Loom
* **High-clarity fallback / alternate overview:** Concept 2 — The Codex Stack
* **Causal exploration mode:** Concept 3 — The Pressure Score
* **Revelation / discovery mode:** Concept 4 — The Echo Atlas

### Why

Together these cover:

* recurrence
* comparability
* causation
* surprise

This combination creates a product that is both seductive and intellectually serious.

---

## 31. Recommended first prototype direction

For the first working prototype, build:

* The Loom as the main canvas
* a simplified Pressure Score layer behind it
* an Echo reveal interaction for selected eras

This produces the strongest proof of concept with the fewest compromises.

---

## 32. Codex handoff strategy

When moving this project into Codex, do **not** rely on a long conversational thread alone.

Instead, prepare a small project package with:

### A. Master brief

A short `README.md` or `PROJECT_BRIEF.md` containing:

* concept summary
* product thesis
* target users
* primary views
* MVP scope
* design principles
* success criteria

### B. Structured product docs

Recommended files:

* `docs/prd.md`
* `docs/interface-concepts.md`
* `docs/data-schema.md`
* `docs/content-taxonomy.md`
* `docs/mvp-scope.md`
* `docs/design-language.md`

### C. Seed data

Add a small JSON or YAML dataset, e.g.:

* `data/periods.json`
* `data/pressures.json`
* `data/echoes.json`

### D. Clear first build task

Examples:

* “Build a React prototype of Concept 1: The Loom with 8 sample periods and a right-hand detail panel.”
* “Create a dark interactive overview with stacked blocks, pressure ribbons, and click-to-expand era cards.”

### E. Constraints

State explicitly:

* preferred stack (e.g. React + TypeScript + Tailwind)
* visual tone
* no overclutter
* progressive disclosure only
* data-driven structure

### F. Asset references

Include:

* sketches
* rough wireframes
* palette notes
* typography notes
* any prior image inspirations

---

## 33. Practical Codex workflow recommendation

### Best approach

1. Create a local project folder or repo.
2. Put the PRD and concept docs into `/docs`.
3. Add a small sample dataset into `/data`.
4. Add one very explicit implementation brief.
5. Open Codex in that repo and give it one bounded task at a time.

### Reason

Codex works best when it can read:

* the codebase structure
* the docs
* the data
* the current objective

This is much stronger than pasting large, ambiguous instructions repeatedly.

---

## 34. Example Codex starter prompt

“Read `docs/prd.md` and `docs/interface-concepts.md`. Build the first-pass React prototype for Concept 1: The Loom. Use a dark premium aesthetic, with a horizontal timeline, stacked equal-duration period blocks, subtle pressure ribbons behind them, and a right-side detail panel. Use the sample data in `/data/periods.json`. Keep the default state calm and minimal. Make interactions smooth and restrained. Prioritize structure over polish, but ensure the result is visually coherent and elegant.”

---

## 35. Build sequencing recommendation

### Phase 1

Static visual prototype of the main overview.

### Phase 2

Interactive period selection and detail panel.

### Phase 3

Pressure overlays and filtering.

### Phase 4

Echo relationships and similarity interactions.

### Phase 5

Lens switching and compare mode.

This sequencing will keep the build tractable.

---

## 36. Immediate next design deliverables

1. Write a dedicated interface concepts document.
2. Choose the lead concept for prototype.
3. Define the sample data schema.
4. Create 8–12 sample periods.
5. Draft the first implementation brief for Codex.
