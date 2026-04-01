# Dataset Production Runbook

## Purpose

This is the operator guide for building a new dataset without relying on project memory.

Use it together with:
- `docs/dataset-authoring-workflow.md`
- `docs/dataset-authoring-standards.md`
- `docs/dataset-editorial-review-checklist.md`
- `docs/data-schema.md`
- `docs/public-language-guide.md`

The workflow document explains the content sequence.
This runbook explains the repeatable repo operations.

## Commands

Create a new dataset scaffold:

```powershell
npm run scaffold:dataset -- --id germany-1815-2025 --label "Germany, 1815-2025" --scope Germany --start 1815 --end 2025 --lens germany-civic-9-era --lens-count 9 --folder germany --short germany
```

Validate all registered live datasets and derived packs:

```powershell
npm run validate:data
```

Regenerate derived insight packs:

```powershell
npm run generate:insights
```

## Rule

Do not add a new dataset to `data/datasets.json` until:
- the scaffolded planning docs exist
- the six runtime JSON files exist
- the seed pack is coherent enough to validate honestly

The scaffold script creates preparation assets.
It does not make a dataset live automatically.

## Phase 1. Acquire and charter

1. Run the scaffold command.
2. Fill:
   - `docs/<short>-dataset-charter.md`
   - `docs/<short>-periodization-proposal.md`
   - `docs/<short>-seeding-plan.md`
   - `docs/<short>-initial-seed-candidates.md`
   - `docs/<short>-pressure-grounding-map.md`
   - `docs/<short>-snapshot-strategy.md`
   - `data/<short>-priority-queue.json`
3. Decide rollout scope explicitly:
   - `single-dataset pilot`
   - `all live datasets`
   - `whole-system`
   - `internal-only experimental`

For a new dataset seed, the correct initial scope is normally `single-dataset pilot`.

## Phase 2. Assemble the seed pack

Fill the scaffolded dataset folder:
- `data/<folder>/meta.json`
- `data/<folder>/periods.json`
- `data/<folder>/events.json`
- `data/<folder>/pressures.json`
- `data/<folder>/echoes.json`
- `data/<folder>/snapshots.json`

Minimum assembly rule:
- periods are defined first
- events, echoes, and snapshots only reference real period ids
- every canonical pressure has a value for every period

Do not register the dataset yet.

## Phase 3. Enrich to first usable seed

Use the authoring workflow and standards:
- choose anchor events
- ground each pressure
- add lived texture
- add initial echoes carefully

Target:
- every period is readable
- every period has at least 2 meaningful anchor events
- every period has at least 1 snapshot
- every period has at least 1 echo
- the copy is plain-language enough for non-specialists

## Phase 4. Validate

Run:

```powershell
npm run validate:data
```

The validator checks:
- registry consistency
- dataset file presence
- period continuity and year bounds
- cross-file references
- full pressure coverage
- theme and geography ids
- validation-registry references
- derived insight pack references
- banned public terms in public UI literals and `public*` copy fields

Only after the dataset is wired into the registry will it be included in this command.

Before registry wiring, use the same validation expectations manually against the new pack.

## Phase 5. Register the dataset

Only after the seed pack is coherent:
1. add a new entry to `data/datasets.json`
2. set:
   - `id`
   - `dataPath`
   - `label`
   - `scope`
   - `startYear`
   - `endYear`
   - `defaultLensId`
   - supported theme and geography ids
   - initial status and notes
3. provide a visual theme only when ready

Now rerun:

```powershell
npm run validate:data
```

The dataset is not considered live if this fails.

## Phase 6. Cross-analysis and insight generation

Once the registered dataset validates and the seed is strong enough:

```powershell
npm run generate:insights
```

This is the repeatable cross-analysis step.

Rule:
- insight packs may begin as `internal-only experimental`
- public surfacing requires editorial review
- pilots must later promote or retire explicitly

## Phase 7. Review and promotion

Promotion path:
1. `seed`
2. `usable draft`
3. `solid`
4. later `cross-comparable`

Do not skip directly from seed to cross-dataset claims.

Required review outputs should include:
- editorial review against `docs/dataset-editorial-review-checklist.md`
- validation review
- public-language review against `docs/public-language-guide.md`
- period-quality review
- maturity checkpoint decision
- any editorial review needed for derived insight

## Exit criteria

A dataset is ready to become a live field when:
- the scaffolded planning docs are filled, not empty shells
- the runtime pack is coherent
- the registry entry exists
- `npm run validate:data` passes
- the dataset is honest about maturity and rollout scope

That is the repeatable baseline for future datasets such as Germany, India, Japan, Mexico, and Russia / USSR.
