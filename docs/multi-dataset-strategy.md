# Multi-Dataset Strategy

## Purpose

Define how the product should grow from one rich dataset into multiple datasets without exposing users to a messy database-switching experience.

## Product vision

Users should feel they are entering a `historical field`, not selecting a data partition.

The product should eventually support:
- multiple datasets
- multiple lenses per dataset
- cross-dataset comparison where the data is strong enough

## Dataset model

Each dataset should carry:
- id
- label
- scope
- time range
- status or maturity
- available lenses
- supported themes
- supported geography regions
- notes on what the dataset can honestly do

## Maturity levels

### Seed
- periods and pressure series exist
- minimal events
- sparse echoes
- limited snapshots

### Usable
- all periods have meaningful events
- pressure reading works
- echoes are present
- snapshots are present

### Rich
- thematic coverage is reliable
- pressure-event linkage is strong
- echo network is dense enough for exploration
- geography and scale reads are coherent

### Cross-comparable
- concepts are normalized enough for responsible comparison to another dataset
- themes, pressures, and geography ids are stable enough for cross-dataset use

## User-facing mechanics

The future UI should likely support:
- dataset selection
- lens selection only where real lenses exist
- question, force, and pattern entry within the chosen dataset
- optional compare across datasets only when both are mature enough

The user should not have to understand internal schema or maturity metadata.

## Cross-dataset comparison rules

Only allow cross-dataset compare when:
- both datasets share normalized pressure concepts
- both datasets share a compatible theme vocabulary
- the maturity level is high enough
- echoes or pattern matches are defensible rather than cosmetic

## Most complex steps

These are the hardest strategic mechanics and may justify a higher-reasoning model:
- normalizing pressures across different societies and eras
- designing a theme system that stays meaningful across datasets
- deciding when cross-dataset comparison is honest rather than misleading
- building machine-assisted suggestion logic without presenting it as objective truth

## Recommended sequence

1. close Britain as the first `template dataset`
2. define the registry and maturity system
3. choose dataset 2 and write its charter immediately after Britain close-out
4. build only the minimum mechanics needed to support dataset-level switching
5. delay true cross-dataset compare until both datasets are at least `usable`, ideally `rich`

Current decision:
- dataset 2 = `United States, 1776-2025`
- dataset 3 candidate = `France`

Current implication:
- USA is the first planned dataset likely to use a different period count and non-equal period durations from Britain
- minimum multi-dataset mechanics should therefore avoid assuming `12 periods` or `equal-width periods`

## Dataset 2 launch criteria

Dataset 2 should begin when:
- Britain is no longer in blanket expansion mode
- the authoring workflow is stable enough to reuse
- the pressure model is stable enough to apply outside Britain
- the registry and maturity model are good enough to describe multiple fields honestly

That threshold has now been met for USA planning and seeding.

## Minimum tool changes for dataset 2

The product does not need a large new interface before dataset 2 starts.

Minimum required mechanics:
- a dataset registry that the app can read
- a way to load dataset-specific period, event, echo, pressure, and snapshot files
- dataset-level metadata in the top framing layer
- graceful handling of different dataset maturity levels
- support for dataset-specific period counts and, if needed later, non-equal historical durations

Not required immediately:
- cross-dataset compare
- multi-lens UI for every dataset
- advanced recommendation or similarity logic
