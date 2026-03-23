# USA Lived-Voice Layer

## Purpose

Define the next accessibility layer for the USA dataset after the first plain-language snapshot uplift.

## Why this layer is next

The USA dataset now has:
- a usable structural baseline
- a stronger plain-language snapshot layer
- enough event and echo density to support meaningful exploration

The next gain is not more structure by default.
It is more human readability.

The current tool can explain what is happening structurally.
It is still weaker at making that structure feel immediate to a younger or less historically fluent audience.

## Product role

This layer should act like:
- a `vox pop`
- a short lived-voice response
- a grounded answer to questions like:
  - what does this period feel like?
  - how are these forces affecting everyday life?
  - what would an ordinary person notice first?

It should not replace the structural summary.
It should sit beside it as a more human access point.

## Recommended format

Per period:
- 1 short lived-voice card
- optional second variant later if the dataset becomes richer

Each card should include:
- `speakerFrame`
  - e.g. worker, household, voter, migrant, farmer, student
- `prompt`
  - a simple framing question
- `response`
  - 2 to 4 short sentences in plain language
- `voiceMode`
  - e.g. personal, street-level, household, worker, civic

## Tone rules

The layer should be:
- plain
- vivid
- concrete
- emotionally legible
- accessible to younger users

It should not be:
- slangy
- theatrical
- fake-vernacular
- historically cosplay-like
- falsely universal

## Guardrails

- treat each lived-voice card as an interpretive lens, not a representative sample
- avoid pretending to speak for everyone in a period
- do not invent niche factual detail that is not grounded in the broader period model
- keep the prose short enough to scan instantly

## Schema recommendation

Best path:
- extend `snapshots.json` rather than adding a new top-level file immediately

Suggested optional fields:
- `voiceMode`
- `speakerFrame`
- `prompt`
- `response`

Why:
- keeps the layer attached to the existing period snapshot model
- avoids immediate UI and loader complexity
- allows gradual rollout by dataset

## UI fit

Best first placement:
- inside the detail panel, below the current snapshot or as a companion card

Avoid for now:
- making it a new primary mode
- giving it too much visual priority over the structural read

## Recommended rollout

1. Add the schema fields as optional.
2. Write one lived-voice card per USA period first.
3. Check whether this materially improves comprehension for non-specialist users.
4. If it works, apply the same layer to Britain.

## Cross-dataset note

This should not remain USA-only.

Britain should receive the same lived-voice treatment after the USA version is proven.
That keeps the accessibility layer consistent across the first two datasets and avoids making one field feel more human than the other.

## Status

Implemented now for USA:
- optional lived-voice fields on the snapshot model
- one lived-voice card per USA period
- detail-panel rendering as a companion layer to the existing snapshot

## Decision

Once the USA and Britain lived-voice layers are both in place, the next product-wide step should be:
- a top-to-bottom UI review using the installed `frontend-skill`

That review should assess:
- how the richer content now reads in the current interface
- where the visual hierarchy still fails
- where motion, staging, compaction, or card treatment should improve next
- whether the tool now needs another exhibit-grade polish pass before France planning advances
