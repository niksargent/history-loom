# Application separation and Pages verification

The pre-separation checkpoint is commit `00fc284`. Atlas and Classic now have separate source folders and HTML entry points; only the small version switch and historical corpus are shared.

## Checks performed

- Lint and TypeScript/production compilation passed.
- 19 unit and architecture tests passed, including history arithmetic, missing-data handling, pressure clustering and application import boundaries.
- Both data validators passed: four Classic datasets and their derived packs; 69 Atlas moments, 13 journeys, 237 measured series and 19,425 observations.
- Compared all 40 moved data files to the checkpoint. Historical content is unchanged. Only file references in the validation registry changed. The 17 existing Atlas data/public asset files also remain unchanged.
- Production artifact test passed: all three HTML entry points resolve their assets, and local credentials/tooling are excluded.
- Headless Edge smoke test passed against the production preview under `/history-loom/`: both directions of the experience switch, all four Classic histories, Classic Insights, all three Atlas analytics views, legacy URL query/hash preservation, mobile switching, and light/dark Atlas at widths 390, 800, 1024 and 1440. No application exceptions or failed site responses were observed.
- Desktop and mobile screenshots reviewed. Screenshots and other local test evidence remain in ignored `.cache/layout-qa/`.
- Video/data tool scripts pass Node syntax checks. No new voice generation was needed.

Repeatable commands and deployment configuration are documented in the repository README. The GitHub Pages workflow runs lint, unit/architecture tests, both data validators, the production build and the artifact check before deploying.
