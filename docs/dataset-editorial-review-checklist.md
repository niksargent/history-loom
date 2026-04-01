# Dataset Editorial Review Checklist

## Purpose

This is the missing human review layer between:
- technical validity
- and honest dataset maturity

Use this after a dataset pack is assembled and technically coherent.

Read it alongside:
- `docs/dataset-authoring-standards.md`
- `docs/dataset-authoring-workflow.md`
- `docs/dataset-production-runbook.md`

This checklist is not a schema validator.
It is the editorial gate that decides whether a dataset is merely filled in, or genuinely usable.

## When to use it

Run this checklist:
- before a new dataset is added to the live registry
- before promoting a dataset from `seed` to `usable draft`
- before promoting a dataset from `usable draft` to `solid`
- before making strong public claims through compare, insights, or echoes

## Review output

The reviewer should produce a clear outcome:
- `promote`
- `hold with watchlist`
- `return for revision`

The reviewer should also record:
- maturity judgment
- main blockers
- what must be fixed now
- what can wait

## 1. Boundary and lens

Ask:
- Is the dataset boundary historically honest?
- Does the chosen lens reveal real structural shifts rather than neat symmetry?
- Are any periods too broad to feel distinct?
- Are any periods too narrow to carry enough material?
- Does the lens help the product think better, or just divide time mechanically?

Fail signs:
- periods feel arbitrary
- the lens hides obvious regime or legitimacy breaks
- the dataset feels over-neatened

## 2. Period distinctness

Ask:
- Does each period feel meaningfully different from the others?
- Can a non-specialist grasp what kind of time it is?
- Does the summary describe a real field condition, not just a list of events?
- Are the weakest periods still readable and useful?

Fail signs:
- multiple periods feel interchangeable
- summaries sound generic
- the field has one or two strong periods and several thin ones

## 3. Event quality

Ask:
- Are the events structurally central?
- Does each event earn its place by clarifying pressure, change, or consequence?
- Is any event present only because it is famous?
- Are any events redundant with each other?
- Do the events help a user understand what changed?

Fail signs:
- decorative event choices
- redundant anchors doing the same work
- niche events that require too much explanation

## 4. Pressure grounding

Ask:
- Does each major pressure have clear support in the period summary and event layer?
- Are the scores plausible rather than vague?
- Do the strongest pressures feel legible in lived terms?
- Are the known weak pressures grounded well enough:
  - `technologicalDisruption`
  - `informationAcceleration`
  - `ecologicalStrain`
  - `publicHope`
  - `individualAutonomy`

Fail signs:
- scores feel hand-wavy
- pressure labels do not match the events
- summaries and scores tell different stories

## 5. Snapshot and lived voice quality

Ask:
- Does the dataset feel inhabited?
- Does each period have at least one genuinely useful human window?
- Is the language plain and vivid?
- Does lived voice sound human rather than analytical in first person?
- Are everyday stakes visible, not just structural claims?

Fail signs:
- textbook paraphrase disguised as a person
- melodrama
- abstract voice with no real social position
- periods that still feel bloodless

## 6. Echo quality

Ask:
- Is each echo structurally meaningful?
- Can a non-specialist understand the rhyme quickly?
- Is the echo more than a clever analogy?
- Is the confidence level honest?
- Are there too many weak echoes added only for density?

Fail signs:
- mood-match rather than structural similarity
- echoes that need heavy defence to make sense
- over-dense echo network with little user value

## 7. Accessibility and language

Ask:
- Does the dataset pass the `16-year-old test`?
- Are summaries and snapshots understandable without specialist vocabulary?
- Does the copy avoid academic or builder language?
- Would a curious non-specialist feel invited in rather than talked down to?
- Are the public-facing `public*` fields present where the live product needs them?
- Does the banned-term scan pass without special pleading?

Fail signs:
- abstract nouns stacking up
- phrases that sound like internal project language
- copy that explains the model rather than the history
- a public dataset still relying on raw fallback copy for its main live surfaces

## 8. Balance across the field

Ask:
- Are the strongest periods overpowering the weaker ones?
- Does the dataset feel balanced overall?
- Is there enough variation in pressure and mood across the field?
- Are the later periods disproportionately richer than the earlier ones, or vice versa?

Fail signs:
- one section of the field has all the interpretive richness
- weak periods drag the whole dataset below the maturity being claimed

## 9. Comparative readiness

Ask:
- Is the field internally coherent enough to stand beside the live datasets?
- Are pressure meanings aligned with the shared model?
- Would compare clarify or mislead at the current maturity?
- Are any dataset-specific assumptions still too unresolved?

Fail signs:
- pressure concepts mean different things here without being acknowledged
- compare would imply parity the data has not earned

## 10. Insight readiness

Ask:
- Is the dataset strong enough to support derived insight generation without producing junk?
- Are the periods and pressure profiles distinct enough for clustering and affinity work to be meaningful?
- Would public prompts be honest, or would they overclaim?

Fail signs:
- insight output is computationally available but not editorially meaningful
- prompts would need too much caveating to be public-safe

## 11. Maturity decision

### Seed

Use if:
- the field can load
- the structure exists
- but the content is still obviously provisional

### Usable draft

Use if:
- every period is readable
- the weakest periods are still usable
- the dataset supports real exploration honestly
- some explicit watchlist issues remain

### Solid

Use if:
- the field no longer feels provisional in live use
- pressure grounding is broadly credible across the whole dataset
- echoes are more enlightening than ornamental
- lived voice is consistently useful
- the product can extend without constant structural repair

## Final reviewer statement

Every review should end with:

1. Maturity:
- `seed`
- `usable draft`
- `solid`

2. Outcome:
- `promote`
- `hold with watchlist`
- `return for revision`

3. Blockers:
- the concrete issues preventing promotion

4. Next actions:
- what must be fixed now
- what can remain on a watchlist

This is the checklist that turns dataset creation from a content-writing exercise into a disciplined editorial process.
