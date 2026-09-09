# Extending the atlas

## Add sourced moments

Use `data/atlas/extensions.json` for new records. The 35 initial records are in `src/atlas/content.ts`; 14 records demonstrate the extension pipeline, and 20 further reviewed records live in `data/atlas/tranche-two.json`. All three are combined before validation, so duplicate detection also covers the new tranche. Copy one record to a draft JSON file and give it a new, permanent, lowercase ID. A draft can contain one object or an array.

Every record needs `id`, `title`, `year`, `place`, `region`, `[longitude, latitude]` coordinates, `theme`, at least two distinct `tags`, `hook`, `story`, `consequence`, `caution`, and a `sources` array of `{title, url}`. Optional `approximate` and `endYear` describe uncertain dates or spans. Use negative years for BCE, never zero. Regions are the six inhabited continents; themes are `ideas`, `connection`, `power`, `freedom`, and `survival`.

1. Find and read a relevant museum, archive, university, scholarly publication, or official institution source. Check the actual claim, not merely whether a URL returns 200. Prefer multiple independent sources for contested claims.
2. Write original, approachable summaries. The hook should invite curiosity; the consequence explains what changed. The caution must name a real limit, disagreement, or important difference. Do not invent quotations, quantitative scores, or causal certainty.
3. Anchor the map to a defensible location. Global events need an explicitly described anchor; it is not a claim of exclusive origin. Approximate ancient dates should say so. Avoid falsely precise founding dates for settlements that developed over centuries.
4. Use tags for actual shared mechanisms. The app ranks related moments by shared-tag overlap; it does not infer historical causation. Prefer connections with meaningful differences, and avoid a collection dominated by European political history.
5. Validate the draft, review its source content, then import:

```sh
npm run add:atlas -- candidate.json
npm run add:atlas -- candidate.json --write --reviewed
npm run validate:atlas
npm run test:atlas
```

The first command changes nothing. Import rejects duplicate IDs, invalid dates, coordinates, missing context, unsafe URLs, and malformed records. The explicit `--reviewed` flag records an editorial workflow requirement; it cannot itself establish that the content is true. Imports use an atomic replacement and never write into the original app's datasets. Check the resulting card and source links in both themes and on mobile before committing.

Add guided journeys in `content.ts`: three existing moment IDs, one accessible question, answer options, a zero-based answer index, explanation, rhyme, difference, and a supported SVG art variant. Validation checks references. The homepage's featured journeys are selected by stable IDs, so inserting a journey cannot silently change the hero experience.

## Refresh numerical data

```sh
npm run refresh:atlas
npm run validate:atlas
npm run test:atlas
```

The importer downloads [OWID's life-expectancy CSV](https://ourworldindata.org/grapher/life-expectancy), checks the schema, rejects duplicates and impossible values, keeps ISO3 countries/territories and World, and retains every available annual observation within 1800–2023. It does not interpolate. Values are rounded to two decimal places. Raw input, retrieval date, citation, and SHA-256 provenance are retained; a compact manifest supplies the public coverage counts.

The endpoint is deliberately fixed at 2023 to exclude projections. To extend it, first verify the upstream estimation/projection boundary, then update the importer, chart controls, tests, and documentation together. Source terms travel with the snapshot. New measures should have their own typed importer, provenance, uncertainty treatment, and user-facing explanation; do not squeeze unlike measurements into the life-expectancy series.

## Source reachability

`npm run audit:atlas-sources` writes `data/atlas/source-audit.json`. The second-tranche audit on 8 September 2026 reached 32 of 70 sources directly; 36 returned access protection (403), one a rate limit (429), and the UPU history page a server error (500). UPU's content was also available through web retrieval during research. This is a reachability audit, not a historical review. Do not delete useful institutional evidence simply because automated requests fail. Check it in a normal browser and distinguish access failure from a missing page.
