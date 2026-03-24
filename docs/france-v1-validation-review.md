# France V1 Validation Review

## Purpose

Record the first validation judgment over the initial France runtime draft seed.

This is a basic validation gate, not a final scholarly certification.
The goal is to decide whether the France draft is strong enough to be wired into the dataset path as a guarded draft field.

## Scope reviewed

Reviewed runtime seed:
- `data/france/meta.json`
- `data/france/periods.json`
- `data/france/events.json`
- `data/france/pressures.json`
- `data/france/echoes.json`
- `data/france/snapshots.json`

## Validation posture

### Events

Judgment: `strong source-backed draft baseline`

Reason:
- the event set is built from stable, legible anchor events rather than novelty or over-detail
- each era has 2 to 3 anchors that do real structural work
- the draft does not yet attempt exhaustive coverage, which is correct at this stage

Notes:
- the event layer is strongest where regime change and legitimacy rupture are clearest
- later refinement may add density in some eras, but no current era feels under-anchored for first-use purposes

### Period layer

Judgment: `usable draft baseline`

Reason:
- all 9 periods are structurally distinct
- the lens is honest to France rather than forced into another dataset's shape
- the summaries and pressure profiles are coherent with the charter and grounding map

Watchpoints:
- `fr-p03` and `fr-p07` are conceptually strong, but less iconically legible to a general audience than the revolutionary, Third Republic, or late-modern periods
- that is not currently a blocker, but they should be watched in later lived use

### Pressure layer

Judgment: `coherent shared-model adaptation`

Reason:
- the shared pressure model still works for France
- high-salience France pressures are correctly foregrounded
- no pressure appears obviously misfit to the field

Watchpoint:
- `ecologicalStrain` remains intentionally low-salience in the France seed
- that is acceptable and more honest than inflating a weak signal

### Snapshot and lived-voice layer

Judgment: `good first readable layer`

Reason:
- the lived layer is present across all 9 periods
- it is accessible without collapsing into caricature
- it translates structural history into ordinary stakes, which is the correct standard

Watchpoint:
- later refinement may want more regional or class variation
- that is a quality improvement, not a current blocker

### Echo layer

Judgment: `moderate-to-strong structural draft`

Reason:
- the echoes are structurally legible and aligned to the product thesis
- they are not overloaded into the first seed
- they remain interpretive, which is appropriate at this stage

Confidence read:
- strongest: `fr-x01`, `fr-x05`
- solid: `fr-x03`, `fr-x06`
- more comparative/exploratory: `fr-x02`, `fr-x04`

No current France echo should be treated as canonical truth.
All should remain explicitly draft-scoped.

## Overall judgment

The France dataset now passes a `basic validation gate` as a first runtime draft seed.

That means:
- it is strong enough to be wired into the dataset registry
- it should still be treated as draft, not canonical
- it should not yet enable cross-dataset comparison
- it is ready for guarded exposure in the app after registry wiring

It does **not** mean:
- every echo is equally strong
- the dataset is fully mature
- further research or later refinement is unnecessary

## Recommended next step

Proceed to:
- `france-task-07` wire France into the dataset registry and app path as a guarded draft field

Keep these conditions:
- France should still present as draft maturity
- cross-dataset compare should remain off
- France should be watched for which periods feel most or least legible in live use
