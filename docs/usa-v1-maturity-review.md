# USA V1 Maturity Review

## Purpose

Define the current maturity of the USA dataset after the first usable-draft pass, and set a bounded next phase.

This is a higher-reasoning review step because the issue is no longer content count alone. The question is whether the dataset is strong, legible, and defensible enough to serve the product well without slipping back into open-ended enrichment.

## Current status

The USA dataset has moved beyond `seed` and now functions as a `usable draft field`.

That means:
- the app can load and use it cleanly
- every period has anchor events, a snapshot, and at least one echo
- the lived-voice layer is present across the full field
- the dataset is strong enough for real use in the product

It does **not** yet mean:
- all draft additions are fully validated
- all echoes should be treated as equally strong
- every period is equally vivid or equally grounded
- the dataset is ready for cross-dataset compare

## Period-by-period read

### `us-p01` Revolution and Constitutional Founding

Strengths:
- conceptually strong opening period
- lived voice is clear and accessible
- major founding events and echoes are already legible

Watchpoint:
- still slightly lean on event density compared with the middle and late field

Judgment:
- keep as usable, but watch for whether one additional source-backed event is ever needed later

### `us-p02` Republic-Building, Expansion, and Sectional Strain

Strengths:
- the Indian Removal Act materially improved the period
- the structure of expansion, dispossession, and hardening contradiction is now readable

Watchpoint:
- echo network remains thinner here than in the strongest periods

Judgment:
- good enough for current use; no immediate new anchor needed

### `us-p03` Slavery Crisis, Civil War, and Reconstruction

Strengths:
- strong event clarity
- strong echo logic
- one of the clearest periods in the dataset

Judgment:
- no immediate action needed

### `us-p04` Industrial Concentration, Segregation, Reform, and Imperial Turn

Strengths:
- period logic is strong
- event density is workable
- pressure profile is rich and intelligible

Watchpoint:
- lived texture is solid but could become more vivid later if this period becomes a public favorite

Judgment:
- good enough for current use

### `us-p05` Depression, New Deal, and World War

Strengths:
- one of the strongest periods in the whole field
- event grounding, force grounding, and echo logic are all good
- Dust Bowl addition improved ecological grounding meaningfully

Judgment:
- strong anchor period

### `us-p06` Postwar Order and Civil Rights Transformation

Strengths:
- clear structural role
- strong federal-citizenship echoes
- highly legible to general audiences

Judgment:
- strong anchor period

### `us-p07` Late-20th-Century Distrust and Restructuring

Strengths:
- PATCO materially improved the labour-order read
- echoes are now workable
- lived voice is strong and accessible

Watchpoint:
- still interpretively more dependent on framing than the strongest periods

Judgment:
- usable, but watch in later validation for whether the event layer is vivid enough

### `us-p08` Security Shock, Platform Publics, and Fragmented Legitimacy

Strengths:
- late-system shock is now well grounded
- strong contemporary resonance
- highly effective for question-led entry and public use

Watchpoint:
- easy for this period to dominate attention over the rest of the field

Judgment:
- strong anchor period

## Structural read

### Strong now

- overall period coverage
- usable event density
- workable echo density
- lived-voice accessibility
- basic pressure grounding

### Still weak or uneven

- not all echoes are equally strong
- `ecologicalStrain` remains comparatively lightly grounded even after repair
- `technologicalDisruption` and `informationAcceleration` are powerful in the model, but still rely heavily on a small number of anchors
- the weakest remaining issue is now not quantity, but `comparative confidence`

## What the next phase should be

The next USA phase should be `validation and quality review`, not more broad enrichment.

That phase should do four things:

1. review the exploratory and moderate-strength echoes
2. tighten the distinction between:
   - strong source-backed draft
   - strong structural draft
   - exploratory structural draft
3. assess whether any period is still underpowered in lived clarity
4. decide whether USA is ready to remain a `usable draft` or can be promoted to a stronger maturity state later

## Stop rule

Do **not** keep adding events and echoes by default.

Add more only if one of these is true:
- a period is materially underpowered in the live product
- a key pressure remains under-grounded
- a later validation pass reveals a structural gap that actually matters to users

Otherwise, treat the next work as:
- validation
- authoring standards
- maturity judgment

## Immediate recommendation

Proceed next with:
1. complete the explicit period-quality review in `docs/usa-period-quality-review.md`
2. authoring-standard tightening based on what Britain and USA now reveal together
3. USA maturity checkpoint
4. only then decide whether France chartering should begin
