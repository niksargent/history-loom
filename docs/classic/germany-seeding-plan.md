# Germany, 1815-2025 Seeding Plan

## Data pack

- folder: `data/shared/germany`
- files:
  - `meta.json`
  - `periods.json`
  - `events.json`
  - `pressures.json`
  - `echoes.json`
  - `snapshots.json`

## Minimum seed standard

- [ ] each period has at least 2 anchor events
- [ ] each period has at least 1 snapshot
- [ ] each period has at least 1 echo
- [ ] all canonical pressures have values
- [ ] summaries and lived material are plain-language enough for non-specialists

## Required planning companions

- `docs/classic/germany-dataset-charter.md`
- `docs/classic/germany-periodization-proposal.md`
- `docs/classic/germany-initial-seed-candidates.md`
- `docs/classic/germany-pressure-grounding-map.md`
- `docs/classic/germany-snapshot-strategy.md`

## Commands

```powershell
npm run validate:data
npm run generate:insights
```
