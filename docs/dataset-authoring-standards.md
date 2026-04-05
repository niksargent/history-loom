# Dataset Authoring Standards

## Purpose

Turn the lessons from Britain and USA into explicit authoring rules so future datasets do not depend on ad hoc taste or one-off fixes.

This is a higher-reasoning step because the main risk is no longer missing structure. It is inconsistency:
- inconsistent event selection
- inconsistent echo confidence
- inconsistent lived-voice quality
- inconsistent pressure use across datasets

These standards are meant to be the baseline for France and any later dataset.

## Core principle

The product is not trying to be exhaustive.

It is trying to be:
- structurally legible
- historically defensible
- accessible to non-specialists
- reusable across datasets

That means every content object should earn its place by improving the tool's ability to show pattern, pressure, lived reality, or recurrence.

## 1. Period standard

A period is good enough when it is:
- structurally distinct
- readable in plain language
- grounded by meaningful events
- connected by at least one worthwhile echo
- supported by a snapshot and lived voice
- supported by strong lived-condition fields that can feed the public experiential lens

A period should not be judged by word count.
It should be judged by whether a user can understand:
- what kind of time this is
- what pressures dominate it
- what changed
- how it felt to live through it

### Minimum acceptable standard

Each period should have:
- at least 2 meaningful anchor events
- at least 1 snapshot
- at least 1 lived-voice response
- at least 1 echo
- a pressure profile that is not purely abstract
- usable entries for:
  - `insecurityExposure`
  - `autonomyVsObligation`
  - `opportunityVsPrecarity`
  - `senseOfFuture`

### Preferred standard

Each period should have:
- 3 anchor events where that materially improves interpretation
- at least one strong echo, not just an available echo
- enough human texture that the period feels inhabited

### Experiential-lens rule

The public `Lived voice` card now includes a compact experiential lens built from:
- safety
- freedom
- pressure
- future

Those dimensions are driven from the period model, especially:
- `insecurityExposure`
- `autonomyVsObligation`
- `opportunityVsPrecarity`
- `senseOfFuture`

Those fields must therefore be:
- concrete
- plain-language
- distinct from one another
- useful to a non-specialist reader without further decoding

Bad pattern:
- four fields that all say the same thing in slightly different abstract language

Good pattern:
- each field clarifies a different part of lived experience and helps the quote feel grounded

## 2. Event standard

An event belongs in the dataset when it does at least one of these:
- grounds a major pressure already present in the period model
- materially clarifies a turning point in the period
- improves the user's understanding of what changed structurally
- improves the interpretive value of compare or echo

An event does **not** belong just because:
- it is famous
- it is narratively dramatic
- it fills a numeric quota

### Good event criteria

A good event should be:
- historically stable
- central rather than decorative
- compressible into one clear summary
- clearly linked to pressures, consequences, and scales

### Watch-outs

Avoid events that are:
- too niche to carry weight in a public-facing product
- redundant with another event already doing the same structural work
- only interesting if heavily explained

## 3. Echo standard

Echoes are the highest-risk content type because they are interpretive by nature.

An echo should survive three tests:

1. `Structural test`
- does it connect real shared pressures, conditions, or institutional problems?

2. `Legibility test`
- can a non-specialist understand the rhyme quickly?

3. `Non-triviality test`
- is it more than a clever analogy or mood match?

### Echo confidence tiers

Use these practical classes:

- `strong structural draft`
  The echo is legible, defensible, and useful in the tool.

- `moderate structural draft`
  The echo is useful, but depends more heavily on interpretation.

- `exploratory structural draft`
  The echo is interesting, but should not carry too much product weight.

### Echo rule

Do not add an echo only to improve network density.
An echo should improve the user's thinking, not merely the graph.

## 4. Lived-voice standard

Lived voice exists to make the structure felt by younger and non-specialist audiences.

It is successful when it:
- sounds human
- stays plain-language
- reflects the period's real structural tensions
- avoids costume-drama imitation
- avoids modern slang that breaks tone

### Good lived-voice criteria

Each lived-voice item should:
- answer a concrete question
- stay concise
- feel like something a person might plausibly say
- translate structure into everyday stakes
- imply a real social position, household role, or civic vantage rather than a generic narrator
- sound like a person describing consequences in daily life, not like an analyst summarising the period in first person
- work with the experiential lens rather than duplicating it word-for-word

### Stronger persona standard

When the product moves to lived voice v2, each period should aim to support multiple personae where the data can sustain them.

The preferred direction is:
- one female-coded everyday voice
- one male-coded everyday voice
- one third voice shaped by work, civic role, age, or outsider status

These should feel like distinct windows into the same field, not three paraphrases of the same summary.

### Bad lived-voice patterns

Avoid:
- textbook paraphrase
- melodrama
- over-specific fictional biography
- modern editorial commentary disguised as a voice
- repeating directly what the lens fields already explain more clearly

## 5. Pressure-grounding standard

A pressure should not live only as a number unless that is truly unavoidable.

A pressure is well grounded when:
- at least one event clearly helps explain it
- the period summary aligns with it
- the lived layer does not contradict it

### Weakly grounded pressures

These need explicit caution in review because they often drift:
- `technologicalDisruption`
- `informationAcceleration`
- `ecologicalStrain`
- `publicHope`
- `individualAutonomy`

These pressures can become hand-wavy if they are not tied to clear events or lived consequences.

## 6. Accessibility standard

The dataset is not just for historians.

At least one layer per period should be understandable to a bright 13-year-old:
- summary
- lived voice
- event summary

If a period only works when read through abstract structural language, it is not finished.

## 6a. Language standard

Default to British English across:
- UI labels
- dataset copy
- snapshot text
- lived voice
- docs, unless quoting a source directly

This should be treated as the hard default for the project rather than a per-file preference.

## 7. Validation standard

Every dataset should keep the boundary between:
- source-backed draft
- structural draft
- exploratory draft
- trusted/validated content

This boundary must remain explicit.
Do not let polished UI make provisional content look more final than it is.

## 8. Maturity rule

A dataset should advance in maturity only when:
- the weakest periods are still usable
- the strongest periods do not distort the whole field
- pressure grounding is broadly credible
- echoes are more enlightening than ornamental
- lived voice is consistently present and useful

## 9. France readiness rule

France should not begin from Britain's earlier, rougher method.

France should start only once:
- these standards are accepted as the baseline
- USA reaches a maturity checkpoint
- the team is ready to enforce quality rather than just expand coverage
