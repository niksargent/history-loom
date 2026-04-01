# Public Language Remediation Inventory

## Purpose

This inventory tracks where public-facing language became too technical, abstract, or inward-looking, and records the first surface-first remediation pass.

## Public UI literals

### App shell
- [src/App.tsx](/c:/Users/nik_sargent/OneDrive/Code/history-loom/src/App.tsx)
- Problems found:
  - `field` used in visible setup, loading, and prompt copy
  - low-level analytical terms such as `legitimacy`
  - helper text that sounded more like system thinking than public guidance

### Period detail and compare
- [src/components/DetailPanel.tsx](/c:/Users/nik_sargent/OneDrive/Code/history-loom/src/components/DetailPanel.tsx)
- [src/components/ComparePanel.tsx](/c:/Users/nik_sargent/OneDrive/Code/history-loom/src/components/ComparePanel.tsx)
- Problems found:
  - visible summaries and helper lines inherited technical phrasing from authored content
  - pressure labels stayed too academic for public display

### Force and insight surfaces
- [src/components/ForceExplorer.tsx](/c:/Users/nik_sargent/OneDrive/Code/history-loom/src/components/ForceExplorer.tsx)
- [src/components/InsightsLabPage.tsx](/c:/Users/nik_sargent/OneDrive/Code/history-loom/src/components/InsightsLabPage.tsx)
- [src/components/LoomCanvas.tsx](/c:/Users/nik_sargent/OneDrive/Code/history-loom/src/components/LoomCanvas.tsx)
- [src/components/InMotionRacePanel.tsx](/c:/Users/nik_sargent/OneDrive/Code/history-loom/src/components/InMotionRacePanel.tsx)
- Problems found:
  - `field`, `structural`, and rollout/internal language appearing in public copy
  - public cards still depending on internal cluster names and pressure labels

## Generated public copy

### Derived insight packs
- [data/derived](/c:/Users/nik_sargent/OneDrive/Code/history-loom/data/derived)
- Problems found:
  - prompts, cluster summaries, and relationship summaries were generated from analytical language
  - public surfaces still depended on runtime translation from internal labels like `mobilised settlement`

## Dataset-authored visible copy

### Period summaries used in the live app
- [data/periods.json](/c:/Users/nik_sargent/OneDrive/Code/history-loom/data/periods.json)
- [data/usa/periods.json](/c:/Users/nik_sargent/OneDrive/Code/history-loom/data/usa/periods.json)
- [data/france/periods.json](/c:/Users/nik_sargent/OneDrive/Code/history-loom/data/france/periods.json)
- Problems found:
  - phrases like `constitutional settlement`, `legitimacy breakthrough`, and `republican legitimacy`
  - period summaries and pressure summaries that were historically defensible but too specialist for public UI

### Visible snapshot copy
- Snapshot titles, summaries, and daily-reality copy are now part of the public-copy layer, but most of the actual rewriting is deferred to phase 2.

## Internal-only copy

### Docs, review notes, and analytical labels
- Internal documentation and generation notes may remain technical.
- Internal terms such as `clusterLabel`, `structural`, `derived`, and `legitimacy` are allowed there as long as they do not leak into public surfaces.

## Phase 1 completion target

The first pass is complete when:
- public UI no longer relies on banned internal terms
- generated insight packs carry their own public labels and summaries
- all live datasets have public period summaries and public pressure summaries for the main surfaces
- the validator can flag banned public terms before they ship

## Phase 2 backlog

- event summaries
- echo notes and reasons
- lower-visibility snapshot prose
- long-form comparative/explanatory copy
