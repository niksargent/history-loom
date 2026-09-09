# History Loom · The living atlas

A separate, visual-first experience alongside the original History Loom. The original remains at `index.html`; the new app is at `atlas.html`. No original historical datasets or application components were replaced.

## Run

Use Node 22.18 or later (the data tools import TypeScript directly).

```sh
npm install
npm run dev:atlas
```

Open the printed local server URL followed by `/atlas.html`. The footer links back to the original app. Run `npm run build` for both entries, then `npm run preview`; the production path is `/history-loom/atlas.html` to match the existing hosting configuration. If a restricted Windows environment prevents Vite's config bundler from spawning, use `node node_modules/vite/bin/vite.js --configLoader native` or the corresponding `build --configLoader native` command.

## What is here

- A cinematic imagined harbor, animated illustrated journeys, an interactive atlas, thematic connections, a continuous historical timeline, and search.
- 69 sourced moments across six inhabited continents, from approximately 4500 BCE to 2020; thirteen three-stop journeys with a short discovery question and a comparison of similarities and differences.
- Three experiments: observed life-expectancy estimates, the original app's editorial pressure fingerprints, and a constellation grouping all 32 original eras by their scores, with their closest comparisons placed on a timeline.
- 19,425 annual estimates for 236 countries and territories plus World, covering 1800–2023. Coverage varies by country and year; missing values remain missing.
- Equally considered light and dark palettes, responsive layouts, keyboard controls, reduced-motion support, native modal focus handling, optional narration and ambient sound.
- Saved moments and completed journeys stored locally in the browser. No login, remote account, tracking, or server is required.

Narration currently uses the device's speech synthesis voices. Voice quality and availability depend on the browser/device. Ambient sound is an original Web Audio composition. Both require a deliberate user action. Paid ElevenLabs/OpenAI generation has not been connected; no API key is needed for the delivered app.

## Maintain

`src/atlas/AtlasApp.tsx` owns navigation and discovery state. `WorldMap`, `StoryDialog`, and the three independently loaded lab components own their respective experiences. `engine.ts` holds the pure historical/filtering calculations. `content.ts` combines curated stories and the validated extension file. The data snapshot is fetched locally only when the life chart opens. Styling and fonts are isolated to the atlas entry.

```sh
npm run test:atlas
npm run validate:atlas
npm run validate:data
npm run build
```

See [the data workflow](data-workflow.md), [research and interpretation](research.md), and [visual provenance](visual-assets.md). This is a curated starting collection, not an exhaustive account of world history or a prediction engine.
