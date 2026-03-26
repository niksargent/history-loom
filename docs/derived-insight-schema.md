# Derived Insight Schema

## Purpose

Define the derived data layer that sits alongside, but separate from, authored historical content.

Authored content remains canonical:
- periods
- events
- pressures
- echoes
- snapshots

Derived content remains explicitly analytical:
- statistically generated
- confidence-banded
- editorially surfaced
- never treated as historical truth by default

## Storage model

Derived insight packs are precomputed and checked into the repo as JSON artefacts.

Current files:
- `data/derived/britain-1066-2025.json`
- `data/derived/united-states-1776-2025.json`
- `data/derived/france-1789-2025.json`
- `data/derived/cross-dataset.json`

These packs are generated offline by:
- `scripts/generate-derived-insights.mjs`

This keeps the browser runtime light and avoids running statistical analysis in the client.

## Dataset insight pack

Type:
- `DatasetInsightPack`

Fields:
- `datasetId`
- `datasetLabel`
- `publicStatus`
- `generation`
- `periodClusters`
- `pressureRelationships`
- `outliers`
- `echoSupport`
- `prompts`

### `publicStatus`

Allowed values:
- `public`
- `internal`

This controls whether a dataset’s derived findings are surfaced in the public UI or retained as internal review material.

Current posture:
- USA: `public`
- Britain: `internal`
- France: `internal`

## Cross-dataset insight pack

Type:
- `CrossDatasetInsightPack`

Fields:
- `scope`
- `generation`
- `affinities`

Current posture:
- cross-dataset insight remains `internal`

This is architecture-ready, but not yet publicly surfaced.

## Record types

### `PeriodClusterAssignment`

Purpose:
- assign each period to a derived structural family

Fields:
- `id`
- `periodId`
- `clusterId`
- `clusterLabel`
- `strength`
- `confidence`
- `summary`
- `topSignals`

### `PressureRelationship`

Purpose:
- capture strong pressure relationships within a dataset

Fields:
- `id`
- `sourcePressureId`
- `sourceLabel`
- `targetPressureId`
- `targetLabel`
- `relationshipType`
- `lag`
- `strength`
- `confidence`
- `supportingPeriods`
- `summary`

Allowed relationship types:
- `co-movement`
- `inverse`
- `lead-lag`

Allowed lags in v1:
- `0`
- `1`

### `OutlierSignal`

Purpose:
- flag periods with unusual or structurally surprising pressure profiles

Fields:
- `id`
- `periodId`
- `outlierType`
- `strength`
- `confidence`
- `explanationLabel`
- `summary`
- `topSignals`

### `CrossDatasetAffinity`

Purpose:
- represent candidate structural cousins across datasets

Fields:
- `id`
- `sourceDatasetId`
- `sourcePeriodId`
- `targetDatasetId`
- `targetPeriodId`
- `similarityScore`
- `sharedTopSignals`
- `confidence`
- `summary`

### `EchoSupportSignal`

Purpose:
- provide analytical support or caution around authored echoes

Fields:
- `id`
- `echoId`
- `sourcePeriodId`
- `targetPeriodId`
- `supportStatus`
- `similarityScore`
- `confidence`
- `notes`

Allowed support statuses:
- `reinforced`
- `mixed`
- `weak`

### `InsightPrompt`

Purpose:
- provide the short hook surfaced in the main product and Insights Lab

Fields:
- `id`
- `periodId`
- `text`
- `insightKind`
- `confidence`
- `destinationSection`
- `destinationTargetId`

Allowed destination sections:
- `families`
- `relationships`
- `outliers`
- `echoes`
- `cousins`

## Generation model

Current generation metadata:
- versioned
- method-labelled
- timestamped

This makes the derived layer auditable even though it is not canonical content.

## Public language rules

Derived insight must:
- avoid causal wording unless explicitly manually authored
- remain short and legible
- prefer suggestive structural claims over mechanistic claims
- surface only stronger signals

Examples of acceptable tone:
- `This era belongs to a recurring brittle-order family`
- `These pressures repeatedly intensify together here`
- `This period sits at the edge of the field’s usual pattern`

Examples to avoid:
- `X causes Y`
- `the model proves`
- `history predicts`

## Current rollout

Implemented now:
- schema types
- offline generator
- per-dataset derived JSON packs
- cross-dataset affinity pack
- public USA pilot prompts
- Insights Lab page

Deferred:
- public cross-dataset cousins
- automated echo publication
- ML-first methods
- browser-side statistical computation
