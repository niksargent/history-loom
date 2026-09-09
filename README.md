# History Loom

Two independently built experiences, maintained in one repository:

- **Atlas (v2)** — the immersive experience at `/history-loom/`.
- **Classic (v1)** — the original research experience at `/history-loom/classic/`.

The Atlas/Classic switch connects them. Existing `atlas.html` links keep their query strings and hash routes. Old root `#insights` links open Classic.

## Working locally

Use Node.js 24, then `npm ci`. Run `npm run dev:atlas` or `npm run dev:classic`; both experiences are served by the same development server.

Before publishing, run `npm run lint`, `npm test`, `npm run validate:data`, `npm run validate:atlas`, `npm run build`, and `npm run test:build`. Use `npm run preview` to check the production build under `/history-loom/`.

For the browser smoke test, start the preview on port 4176 and run `npm run test:browser`. It uses Playwright and Edge; set `PLAYWRIGHT_PATH` to an existing Playwright `index.mjs` if Playwright is not installed in this project. Set `APP_URL` to test another server (including the live site), and `BROWSER_CHANNEL` for another installed Chromium browser. Screenshots are written to `.cache/layout-qa/`.

## Where things live

| Folder | Responsibility |
| --- | --- |
| `apps/atlas` | Atlas application and styles |
| `apps/classic` | Original application, styles and media |
| `apps/shared` | Small experience switch only |
| `data/shared` | Historical corpus used by both experiences |
| `data/atlas` | Atlas moments, journeys, sources and statistical series |
| `data/classic` | Classic derived analyses, public copy and research queues |
| `tools/data` | Validation, imports, scaffolding and derived analysis |
| `tools/video` | Narration, recording and film assembly tools |
| `docs/atlas` | Atlas data and video documentation |
| `docs/classic` | Original research and implementation documentation |

Keep each application's UI and styles inside its own folder. Neither imports the other application's implementation. Changes to shared historical data must pass both validators. The architecture tests enforce application boundaries.

## Publishing

GitHub Actions validates and builds every push to `main`, then deploys only `dist/` to GitHub Pages. The repository's Pages source must be **GitHub Actions**. Both experiences ship together, with independent HTML entry points and application bundles.

The default production base is `/history-loom/`. For another host or repository path, set `VITE_BASE_PATH` when building (for example `/` for a root domain).

The public apps need no API key or application server. Voice and effects are generated locally using the ignored `.env.local`; recordings and intermediate media stay in ignored `.cache/`. Never place API keys in `VITE_*` variables or in `public/`. Only deliberately published assets belong in `public/`.
