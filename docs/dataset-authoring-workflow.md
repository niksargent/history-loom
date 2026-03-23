# Dataset Authoring Workflow

## Purpose

This document defines a repeatable process for building or expanding a dataset so the product does not depend on ad hoc research notes or inconsistent judgment.

## Workflow overview

1. Define the dataset charter
2. Calibrate the pressure model
3. Define the base lens and periodization
4. Collate events
5. Author snapshots and scale texture
6. Curate echoes
7. Review and validate
8. Publish dataset maturity

## 1. Dataset charter

Before any content work begins, define:
- dataset name
- scope
- time range
- why the dataset exists
- intended audience value
- initial lens or lenses
- maturity target for the first release

## 2. Pressure model calibration

Decide:
- which pressures are universal across datasets
- which are optional or dataset-specific
- what each pressure means in operational terms
- how scores should be interpreted

This is one of the most complex steps.
It may justify use of a higher-reasoning model because conceptual drift here will damage every downstream layer.

## 3. Base lens and periodization

Define:
- the default lens
- the period count
- why that lens is useful
- why it is a lens rather than a truth claim

This step is also high-complexity for future datasets.
Poor periodization will distort both event assignment and echo logic.

## 4. Event collation

For each period:
- collect candidate events
- choose anchor events
- assign pressure drivers
- assign consequences
- assign scales
- assign themes
- assign geography ids
- add brief internal rationale notes where useful

## 5. Snapshot and scale authorship

For each period:
- verify at least one human snapshot
- improve lived texture where the derived read is too generic
- decide whether additional scale-specific authored material is needed

## 6. Echo curation

After events and pressures are stable:
- identify likely structural echoes
- test them against pressures, themes, and period conditions
- record similarity reasons and dimensions
- record confidence and internal rationale
- note where the comparison breaks down

This is another high-complexity step and may justify a higher-reasoning model.

## 7. Review and validation

Check:
- all references resolve
- periods have enough event density
- pressure-event links are not arbitrary
- themes are used consistently
- geography is normalized
- echoes are meaningful and not redundant

If model-authored draft candidates have been added during prototyping:
- mark them explicitly as draft candidates
- keep them out of the mentally "fully validated" set
- move them into a source-backed review phase before treating them as settled content

## 8. Publish dataset maturity

Each dataset should be marked as one of:
- `seed`
- `usable`
- `rich`
- `cross-comparable`

This prevents the UI and product language from overclaiming.

## Validation boundary

The workflow should stop direct canonical enrichment and move to research when:
- the next useful step depends on a specific factual claim that is not already secure
- a new event would require source checking rather than high-confidence recall
- a new echo depends on nuanced comparison that should be defended explicitly

That boundary should be treated as a feature, not a failure.

## Review rubric

Ask:
- does this dataset support the current product honestly?
- where does it still feel thin?
- which features are already supported?
- which should remain hidden or deferred until the data improves?

## Reuse value

If this workflow is followed well for Britain, it becomes the template for:
- additional national datasets
- regional or civilizational datasets
- alternate lenses on the same dataset
- future machine-assisted curation support
