# Insights Lab Brief

## Purpose

`Insights Lab` is the visual discovery surface for analytics-led historical patterns.

It exists so the main Loom can stay sparse while a separate page shows:
- recurring pattern runs
- forces moving together or against each other
- eras that break the usual rule
- selected cross-country cousin signals

The page is not:
- a research dashboard
- a wall of cards
- a prose wrapper around hidden analytics

It is:
- a discovery surface
- an exhibit-style instrument panel
- editorially captioned
- always linked back into the Loom

## Product role

The main page should surface one small hook.

Insights Lab should answer:
- where this period sits inside a bigger historical pattern
- whether that pattern is a short burst, a long run, or a return after a gap
- which forces tend to move together, pull apart, or move first
- which eras sit outside the usual pattern
- where a bounded cross-country cousin deserves inspection

Whole-history rule:
- Insights Lab is a whole-history destination, not a selected-era inspector
- the selected period is only an entry clue into the page
- the page should not reorganise itself around a single focused era

## Redesign direction

The redesign principle is:
- visual proof first
- text as caption

The current card-and-paragraph treatment undercommunicates the actual insight power.

The redesigned page should feel like:
- a museum exhibit
- a broadcast explainer
- a live historical instrument panel

It should not feel like:
- a report
- a taxonomy page
- a methods note

## Section model

### 1. Pattern bands

This becomes the dominant top section.

Job:
- show recurring patterns across the whole history as banded timeline rows

Core rule:
- contiguous eras merge into one continuous run
- gaps create returns
- the selected era is highlighted inside the row

Desired read:
- `this pattern shaped a long stretch of history`
- `this pattern vanished and then came back`
- `this was a short, intense phase`

Phase 1 build scope:
- replace family-card-first layout with pattern-band rows
- preserve subgroup variants only in the active row detail
- use captions like `A long-running pattern` or `Returns after a break`

### 2. Force choreography

Job:
- show relationships between forces visually, not as card prose

Target form:
- matrix or selected-pair analytic view

Desired read:
- `these forces tend to move together`
- `these forces usually pull apart`
- `this force often moves first`

### 3. Outlier map

Job:
- show which eras visibly break the norm

Target form:
- anomaly map or clustered point field

Desired read:
- `this era sits outside the usual pattern`

### 4. Cross-country cousin

Job:
- keep bounded cross-country comparison distinct from internal analytics

Visual rule:
- this is the section that may use blue

## Visual rules

The page should be:
- calm
- atmospheric
- visual-first
- not dashboard-like

Hard rules:
- no wall of equal-weight cards
- no explanatory filler if the UI can make the point visually
- no blue for analytics-led internal patterning

Colour semantics:
- pattern bands: amber / copper
- force choreography: mint / sea-glass
- outliers: rose / ember
- cross-country cousin: blue

## Information architecture warning

The page currently has a mixed information architecture and this needs a later redesign pass.

Current issue:
- some sections are whole-history analytic surfaces
- some sections are tied closely to the selected period
- some actions still jump the user back to the Loom for proper inspection

That mix is confusing and breaks the feeling of one coherent lab.

Future requirement:
- decide whether Insights Lab is primarily:
  - a whole-history analytics surface
  - a selected-period investigation surface
  - or a deliberately split two-mode surface
- reduce cases where the page invites exploration but then ejects the user back to the Loom as the main way to complete the task

Decision now taken:
- whole-history analytics surface
- selected era only as entry context
- no primary `focus this era` style actions inside the lab

## Interaction rules

The page should always let the user:
- go back to the Loom
- inspect a period in context
- inspect a force in context

The Lab should not trap the user inside abstract analysis.

Section interaction:
- pattern rows should expand into detail on selection
- force relationships should reveal support visually
- outliers should be inspectable without paragraph-first explanation

## Tone rules

Keep the copy:
- short
- declarative
- non-causal
- public-language compliant

Avoid:
- statistical jargon in the main surface
- method explanations in the content flow
- internal terms like `cluster`, `motif`, or `support signal`

Method detail belongs in docs, not in the reader journey.

## Current rollout posture

Public now:
- public prompts across Britain, USA, and France
- period families / relationships / outliers in Insights Lab
- one bounded public cross-country cousin

Current redesign status:
- family title pills and subgroup preservation are interim
- Phase 1 now moves to full pattern-band rows

## Implementation order

1. Pattern bands
- highest priority
- replaces family-card-first layout

2. Force choreography
- replace relationship card stack with analytic visual surface

3. Outlier map
- replace outlier cards with anomaly visual

4. motion and language polish

## Success test

Insights Lab is working when:
- a user can see the difference between a long run and a return after a gap
- a pattern becomes legible before they read the caption
- the page no longer feels like a wall of smart cards
- the analytics feel discoverable rather than narrated
