# Data Schema — The History Loom

This document defines the core content objects needed to power the experience.

## 1. Design principle

The UI should be driven by a structured historical schema, not hard-coded copy. The schema must support:
- periods
- events
- pressures
- echoes
- themes
- multi-scale lived experience

## 2. Core objects
- Period
- Event
- PressureSeries
- EchoLink
- Theme
- HumanSnapshot

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

### Pressure fields
- `pressureScores` (object keyed by pressure id)
- `pressureSummary`
- `releaseType`

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

## 7. HumanSnapshot object

HumanSnapshot represents lived experience at one or more scales.

### Fields
- `id`
- `periodId`
- `title`
- `scale`
- `summary`
- `dailyReality`
- `sourcesOrRationale`

---

## 8. MVP minimum schema

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
