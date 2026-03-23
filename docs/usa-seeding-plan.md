# USA Seeding Plan

## Purpose

Define how dataset 2 will be seeded using source-backed web research rather than unsourced recall.

## Source posture

The USA dataset should be seeded from reliable, stable historical sources.

Recommended source classes:
- National Archives milestone documents and contextual material
- Library of Congress U.S. history primary source timeline and related collections
- Britannica U.S. history overview and event pages

These sources are useful because they combine:
- broad historical coverage
- stable reference value
- accessible framing for later public-facing summaries

## Suggested seeding workflow

1. Confirm the dataset charter.
2. Propose the default lens and periodization.
3. Pull an initial candidate event list from source-backed milestones.
4. Reduce that list to the first anchor events per period.
5. Assign provisional pressure drivers, themes, and geography ids.
6. Mark everything as seed or draft until reviewed.

## Initial event-source buckets

The first event pass should draw from areas like:
- founding and constitutional settlement
- slavery, abolition, civil war, and reconstruction
- expansion and territorial/state growth
- industrialization, labour, and reform
- world wars and mass-state expansion
- civil rights and rights expansion
- neoliberal turn, media change, and polarization

## Validation rule

Any event or echo added to USA during the first seed pass should be treated as:
- source-backed draft
or
- seed content with explicit source rationale

It should not be treated as fully settled content merely because it is historically familiar.

## Immediate deliverables

The first USA seeding pass should produce:
- one dataset entry in the registry
- a proposed default lens
- a first candidate event list
- a first pressure-grounding map
- a first snapshot strategy

The planning deliverables now exist:
- [usa-periodization-proposal.md](./usa-periodization-proposal.md)
- [usa-initial-seed-candidates.md](./usa-initial-seed-candidates.md)
- [usa-snapshot-strategy.md](./usa-snapshot-strategy.md)
- [usa-pressure-grounding-map.md](./usa-pressure-grounding-map.md)

The first draft seed files also now exist under:
- `data/usa/meta.json`
- `data/usa/periods.json`
- `data/usa/events.json`
- `data/usa/pressures.json`
- `data/usa/echoes.json`
- `data/usa/snapshots.json`

These files are:
- source-backed at the event-anchor level
- interpretive at the period, snapshot, pressure-score, and echo-comparison level
- draft runtime content, now app-wired, but not yet canonical

The current phase is:
- `usable-enrichment`

That means the work has moved from first seeding into a bounded pass that strengthens thin periods and pressure grounding without reopening the entire dataset.
