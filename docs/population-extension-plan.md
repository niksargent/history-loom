# Population Extension Plan

## Why this matters

Population is one of the biggest missing structural inputs in the current system.

It changes how users understand:
- scale
- pressure
- state capacity
- labour demand
- urbanisation
- resource stress
- legitimacy under crowding or dislocation

Without population, the product can still show recurring structure.
With population, it can show how large the human field actually is.

## Product role

Population should not be treated as a decorative stat.

It should become:
- a core contextual metric for each dataset
- a time-varying series that can be visualised
- a bridge between the historical reading surface and future motion/compare surfaces

## Schema direction

Population should be added as a first-class series rather than buried as a loose note.

Recommended additions:

### 1. `PopulationSeries`
- `id`
- `label`
- `scope`
- `unit`
- `valuesByPeriod`
- `anchors` (optional finer-grain points for interpolation)
- `notes`
- `sourceNotes`

### 2. Period additions
- `populationEstimate` (optional)
- `populationLabel` (optional display-friendly text)
- `urbanisationEstimate` (optional future companion)

### 3. Dataset registry additions
- whether a dataset has population coverage
- confidence level of that coverage

## Data strategy

Population should begin at the period level:
- one value per period for Britain, USA, and France

That is enough to:
- surface period context
- support compare-side reading
- support future motion views

Later, where source quality supports it, datasets can add:
- anchor points inside periods for smoother interpolation
- urban/rural split
- city concentration or major-centre share

## UI strategy

Population should enter the product carefully.

### Near-term
- selected-period population in the detail flow
- optional population chip or compact stat in the main reading surface
- population available to compare mode

### Next-layer
- population as an optional overlay or companion series in `In motion`
- same-time-range comparison between datasets for population and one selected force

### Later
- population-aware storytelling:
  - population growth against legitimacy
  - population growth against ecological strain
  - population growth against labour and technological change

## Interpretive value

Population becomes powerful when paired with existing forces:
- inequality
- ecological strain
- public hope
- technological disruption
- institutional legitimacy

That means the product can begin to show not just changing pressure, but changing pressure at changing human scale.

## Recommended sequence

1. extend schema to support population cleanly
2. add period-level population coverage for Britain, USA, and France
3. expose population in the detail and compare surfaces
4. plan population use inside `In motion`
5. only later decide whether population belongs as a main-page overlay

## Constraint

Population should improve understanding, not add clutter.

If it appears in the UI, it should do one of two jobs clearly:
- tell the user how large the human field is in the selected era
- reveal how scale changes through time

## Current status

The first live population pass is now complete:
- schema support exists in the live type system
- Britain, USA, and France now carry one population value per period
- the app now shows population first as contextual scale in the detail and compare surfaces

Still deferred:
- finer-grain anchor points inside periods
- urbanisation display
- main Loom population overlay
- population use in `In motion`

## Future chart placement

Population growth is likely to be one of the most revealing simple lines in the whole product.

Recommended future placement order:
1. `Compare`
   - a compact mirrored population chart below the two summary cards
   - strongest immediate value, because scale difference between periods is often startling
2. `Insights Lab`
   - a population sparkline or growth strip inside a future scale-oriented insight card
   - useful when population helps explain why a force profile feels more intense
3. `In motion`
   - a dedicated scale track or companion ribbon, not a main Loom overlay
   - strongest long-term storytelling value because the growth curve can feel dramatic in motion

Not recommended yet:
- a default population line in the main Loom

Reason:
- the growth curve is revealing, but the main Loom is already carrying period selection, forces, and echoes
- population should add scale, not compete with the primary field grammar
