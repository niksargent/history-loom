# Data Schema — The History Loom

This document defines the core content objects needed to power the experience.

## 1. Design principle

The UI should be driven by a structured historical schema, not hard-coded copy. The schema must support:
- periods
- events
- pressures
- population
- echoes
- themes
- multi-scale lived experience
- normalized geography
- repeatable dataset expansion
- future multi-dataset support

## 2. Core objects
- Period
- Event
- PressureSeries
- PopulationSeries
- EchoLink
- Theme
- HumanSnapshot
- Geography
- DatasetRegistryEntry

---

## 3. Period object

A Period is the main historical unit shown in the interface.

### Required fields
- `id`
- `title`
- `startYear`
- `endYear`
- `scope`
- `geography`
- `summary`

### Structural fields
- `dominantValues` (array)
- `socialMood` (array)
- `materialCondition`
- `institutionalCondition`
- `technologicalCondition`
- `religiousPhilosophicalCondition`
- `informationEnvironment`
- `cohesionLevel`
- `legitimacyLevel`
- `inequalityLevel`

### Human-condition fields
- `dailyLife`
- `labour`
- `familyHousehold`
- `insecurityExposure`
- `autonomyVsObligation`
- `opportunityVsPrecarity`
- `senseOfFuture`
- `emotionalClimate`

### Emergence fields
- `whatEmerged` (array)
- `whatExpanded` (array)
- `newPossibilities` (array)

### Loss fields
- `whatFaded` (array)
- `whatBroke` (array)
- `whatBecameHarder` (array)
- `whatWasForgotten` (array)

### Link fields
- `eventIds` (array)
- `snapshotIds` (array)
- `echoIds` (array)
- `themeIds` (optional array)
- `geographyIds` (optional array)

### Pressure fields
- `pressureScores` (object keyed by pressure id)
- `pressureSummary`
- `releaseType`

### Optional population fields
- `populationEstimate`
- `populationLabel`
- `urbanisationEstimate`

### Optional internal fields
- `authoringNotes`
- `confidenceNotes`

---

## 4. Event object

An Event is a specific moment, process, crisis, reform, invention, war, cultural breakthrough, or social shift.

### Fields
- `id`
- `title`
- `startYear`
- `endYear`
- `scope`
- `geography`
- `summary`
- `type`
- `periodIds` (array)
- `pressureDrivers` (array)
- `consequences` (array)
- `scalesAffected` (array: personal/local/national/global)
- `madePossible` (array)
- `destroyedOrDisplaced` (array)
- `themeIds` (optional array)
- `geographyIds` (optional array)
- `sourcesOrRationale` (optional internal note)

---

## 5. PressureSeries object

PressureSeries describes one recurring force or structural dimension over time.

### Fields
- `id`
- `label`
- `description`
- `category`
- `polarity`
- `valuesByPeriod` (object keyed by period id, numeric 0–100)
- `peakPeriods` (array)
- `releasePatterns` (array)
- `relatedPressureIds` (array)

### Notes on polarity
Some dimensions are mainly **stressors** (for example inequality or economic precarity).
Others are mainly **stabilisers** (for example public hope, social cohesion, institutional legitimacy).

---

## 6. EchoLink object

EchoLink connects two or more historical units by structural similarity.

### Fields
- `id`
- `sourcePeriodId`
- `targetPeriodId`
- `similarityLabel`
- `similarityReasons` (array)
- `dimensions` (array)
- `confidence`
- `notes`

---

## 7. PopulationSeries object

PopulationSeries describes changing human scale through time for a dataset.

### Fields
- `id`
- `label`
- `scope`
- `unit`
- `valuesByPeriod` (object keyed by period id)
- `anchors` (optional finer-grain points for interpolation)
- `notes`
- `sourceNotes`

### Notes

Population should begin as one value per period for each live dataset.
Later additions can include finer-grain anchor points, urbanisation, or other settlement-scale measures where source quality supports them.

---

## 8. HumanSnapshot object

HumanSnapshot represents lived experience at one or more scales.

### Fields
- `id`
- `periodId`
- `title`
- `scale`
- `summary`
- `dailyReality`
- `voiceMode` (optional)
- `speakerFrame` (optional)
- `prompt` (optional)
- `response` (optional)
- `voices` (optional array of lived-voice entries)
- `sourcesOrRationale`

### Notes

The optional lived-voice fields support a more accessible, more human reading layer without requiring a separate top-level content file.

`voices` is the forward path for lived voice v2:
- multiple personae can sit inside one period snapshot
- legacy single-voice fields remain valid as fallback
- the UI should prefer `voices` when present and fall back to `response` when not

Each `voices` entry should include:
- `id`
- `label`
- `voiceMode` (optional)
- `speakerFrame` (optional)
- `prompt` (optional)
- `response`

---

## 9. Theme object

Theme is a controlled vocabulary item used across periods and events.

### Fields
- `id`
- `label`
- `description`

---

## 10. Geography object

Geography is a normalized place or region used for repeatable mapping and future cross-dataset comparison.

### Fields
- `id`
- `label`
- `kind`

---

## 11. DatasetRegistryEntry object

DatasetRegistryEntry records what a dataset is, how mature it is, and what it currently supports.

### Fields
- `id`
- `label`
- `scope`
- `startYear`
- `endYear`
- `status`
- `currentPriority`
- `defaultLensId`
- `availableLensIds`
- `supportedThemeIds`
- `supportedGeographyIds`
- `hasPopulationCoverage`
- `populationConfidence`
- `notes`

---

## 12. MVP minimum schema

For MVP, each Period should include at least:
- id
- title
- startYear
- endYear
- summary
- dominantValues
- socialMood
- pressureScores
- whatEmerged
- whatFaded
- eventIds
- one human snapshot summary
- one or more echo links

## 13. Britain v2 additions

The Britain v2 expansion phase should add:
- a controlled theme file
- a normalized geography file
- a dataset registry file
- optional theme and geography ids on periods and events
- stronger internal rationale fields where curation complexity is high

The UI does not need to expose all of these immediately.
The goal is to make research and future dataset growth repeatable.

## 14. Population extension

Population is now an approved next-layer schema extension.

Recommended rollout:
- add one `PopulationSeries` per live dataset
- add period-level population fields for readable context
- expose population first in detail and compare surfaces
- only later decide whether population belongs in the main Loom or `In motion`

Status:
- live type support now exists for `populationEstimate`, `populationLabel`, and optional `urbanisationEstimate`
- dataset registry entries can now declare population coverage and confidence
- the first live product pass uses period-level population context in detail and compare
