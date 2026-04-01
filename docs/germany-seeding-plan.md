# Germany, 1815-2025 Seeding Plan

## Data pack

- folder: `data/germany`
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

- `docs/germany-dataset-charter.md`
- `docs/germany-periodization-proposal.md`
- `docs/germany-initial-seed-candidates.md`
- `docs/germany-pressure-grounding-map.md`
- `docs/germany-snapshot-strategy.md`

## Commands

```powershell
npm run validate:data
npm run generate:insights
```
