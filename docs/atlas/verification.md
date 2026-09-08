# Verification · 8 September 2026

## Automated checks

- TypeScript project build passed.
- ESLint passed for `src/atlas` using the repository's existing configuration.
- All 11 atlas tests passed: BCE/CE arithmetic, continuous slider conversion, combined filtering, deterministic shared-tag ranking, irregular cycle intervals, exact observations, missing-year chart breaks, complete corpus references, malformed extension rejection, duplicate/broken journey rejection, and numerical snapshot provenance.
- Atlas validation passed: 49 moments, eight journeys, 237 series, 19,425 observations.
- Original data validation passed for all four registered histories and their derived insight packs.
- Vite production build passed with both `index.html` and `atlas.html`, local WOFF2 assets, and independently loaded analytics components. Used native config loading in the restricted Windows environment.

## Browser checks

Exercised in the Codex Chromium browser against both development and the built production preview. Visually reviewed desktop and 390px mobile layouts, dark and light themes.

- Journey progression through all three stops, incorrect/correct discovery answers, completion in collection, another journey's illustration and story view.
- Moment search, no-result recovery, reset, saved-moment persistence across reload, removal from collection.
- Map point discovery, related moments, zoom, timeline's oldest date, no horizontal overflow in tested mobile views.
- All three analytics views; life chart presets, animation controls, year slider, adding/removing a country; fingerprint follow action; cycle experiment empty selection and 244-year interval; arrow/Home tab keyboard navigation.
- Narration start/stop controls, optional ambient start/stop, dialog Escape dismissal. Audio control behavior was tested; voice quality has not been evaluated by human listening and varies by device.
- Production app's numerical data loaded successfully under `/history-loom/`; no browser errors were reported during the production smoke test.
- Original app opened through the new footer link, rendered its existing controls and British dataset, and accepted regional switching.

This is functional and visual development QA, not a formal WCAG audit, exhaustive browser compatibility test, historical peer review, or public usability study. Source access restrictions are recorded separately in `data/atlas/source-audit.json`. The experience is delivered locally; it has not been published to an external host.
