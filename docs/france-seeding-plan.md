# France Seeding Plan

## Purpose

Define the first source-backed seeding pass for `France, 1789-2025` without yet creating runtime dataset files.

This step should stay in the planning layer.
The goal is to decide what to collect, not to rush content into production data.

## Seeding target

France seed v1 should aim for:
- 9 periods
- 2 to 3 anchor events per period
- one initial pressure profile per period
- at least one draft echo for the strongest candidate periods
- one snapshot and one lived-voice entry per period

## Source posture

The first France seed should be built from source-backed planning using:
- Britannica overviews of French regime history
- Britannica entries on the Third Republic, Fourth Republic, and Fifth Republic
- Britannica coverage of major turning points such as the French Revolution and May 1968

Official or institutional references can be added later where useful, but the initial planning layer only needs stable historical anchors and defensible regime boundaries.

## Seeding sequence

### 1. Anchor-event shortlist

For each proposed era:
- identify 2 to 3 events that do real structural work
- prefer regime shifts, constitutional resets, major civic ruptures, mass conflict, and durable reforms
- avoid loading the shortlist with culturally famous but structurally redundant events

### 2. Pressure grounding map

For each era:
- identify the strongest likely pressures
- attach at least one plausible anchor event to each high-salience pressure where possible

The most important France pressures are likely to be:
- institutional legitimacy
- social cohesion
- inequality
- moral certainty
- militarization
- public hope
- information acceleration

### 3. Snapshot and lived-voice plan

For each era:
- write one plain-language snapshot
- write one lived-voice response
- make sure the voice translates the regime story into everyday stakes

### 4. Echo candidate pass

Do not try to make the first France seed echo-dense.

Instead:
- identify a small number of strong, legible structural echoes
- prioritize legitimacy crises, republic/empire reversals, occupation/liberation, and central-state backlash

## Quality rules for this seed

France seed v1 should follow the shared standards already documented in:
- `docs/dataset-authoring-workflow.md`
- `docs/dataset-authoring-standards.md`

That means:
- no event by fame alone
- no echo by cleverness alone
- no period without lived readability
- no pretending that draft content is fully trusted

## Recommended next actions

1. approve the first anchor-event shortlist
2. write the France pressure-grounding map
3. write the France snapshot and lived-voice strategy
4. only then create runtime France seed files
