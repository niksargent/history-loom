# Visual and audio provenance

The hero asset is `public/atlas/timeless-harbor.png`, generated for this project with the built-in image-generation tool. It is intentionally imagined scenery, not a reconstruction of a named historical place. Its role is atmospheric entry into the atlas. Do not use it as evidence of historical architecture or geography.

Production brief: a cinematic painterly timeless harbor at twilight; ancient stone, domes, a minaret, arches, a medieval sailing ship, layered mountain silhouettes; indigo and amber; a giant warm orange sun on the right, dark negative space for typography on the left; elegant atmospheric depth and no lettering. The resulting image was inspected in the responsive app in both themes.

`ThreadArt.tsx` supplies original SVG illustrations for networks, voices, cities, survival, and discovery. `WorldMap.tsx` uses public-domain Natural Earth coastlines through the existing world-atlas package. Connections are editorial relationships, not geographical reconstructions.

Local variable WOFF2 fonts are Cormorant Garamond and the interface fonts declared in `public/atlas/fonts/fonts.css`. Latin and Latin Extended subsets are bundled. Their OFL license files remain beside them; `data/atlas/fonts-source.css` records the provider CSS. Run `node tools/data/fetch-atlas-fonts.mjs` to reproduce downloads.

Ambient sound is a quiet original Web Audio synthesis, enabled only on request. Narration uses browser speech synthesis, with visible unavailable-voice handling. No paid speech API was called and no historic person is impersonated.
