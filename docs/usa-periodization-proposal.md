# USA Periodization Proposal

## Purpose

Propose the first honest default lens for dataset 2, `United States, 1776-2025`.

This is a higher-reasoning step.
The choice of lens should fit U.S. historical structure rather than forcing the dataset into Britain's 12 x 80-year model.

## Recommendation

Use an `8-era civic lens` for the first USA seed pass.

Why:
- it matches major U.S. historical turns more honestly than equal-duration blocks
- it keeps the number of periods low enough for a first public-facing seed
- it gives the product a useful test case for multi-dataset mechanics, because the tool should not assume all datasets use the same period count or equal widths

## Proposed eras

1. `1776-1789` — Revolution and constitutional founding
2. `1789-1850` — republic-building, territorial expansion, and sectional strain
3. `1850-1877` — slavery crisis, civil war, and reconstruction
4. `1877-1929` — industrial concentration, segregation, reform, and imperial turn
5. `1929-1945` — depression, federal expansion, and world war
6. `1945-1968` — postwar order, cold war, and civil rights transformation
7. `1968-2001` — realignment, distrust, neoliberal turn, and media fracture
8. `2001-2025` — security state, platform era, and polarization

## Why this lens works

It follows the strongest public and institutional breaks in the U.S. story:
- founding settlement
- continental expansion and sectional conflict
- slavery crisis and reconstruction
- industrial and reform state formation
- depression and wartime federal transformation
- postwar order and rights expansion
- post-1968 realignment and distrust
- post-9/11 security and digital-era fragmentation

## Tradeoffs

Benefits:
- historically legible to non-specialists
- consistent with the existing question-led and pattern-led product direction
- strong enough for pressure tracing and echoes

Costs:
- different from the Britain's 12-period lens
- requires the multi-dataset layer to support variable period counts
- likely requires the chart to handle non-equal period widths or at least acknowledge that period duration differs

## Tool implication

Dataset 2 is likely the first dataset that should explicitly break the assumption that:
- every dataset has 12 periods
- every period should render as the same duration

That implication should be carried into the minimum multi-dataset mechanics.

## Source basis

This proposal is aligned to broad U.S. era boundaries surfaced in:
- Library of Congress U.S. History Primary Source Timeline
- National Archives milestone-document eras
- Britannica coverage for post-1968 turning points

## Status

This is the recommended default lens for USA seed v1.
It should be treated as `source-backed planning`, not yet as locked runtime data.
