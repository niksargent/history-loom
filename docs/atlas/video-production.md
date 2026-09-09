# History Loom film — production record

## Confirmed settings

- Directed recording followed by editing.
- 1920 × 1080, 30 frames per second.
- ElevenLabs voice: `k8dq4mJpbfobhAWpYeng`.
- Credential loaded locally from `.env.local`; ignored by the existing `*.local` Git rule.
- Narration and sound effects generated locally, then assembled as static media.
- Draft duration: approximately three minutes; final timing follows the generated narration.

## Preparation

1. Validate the existing app and preserve the exact filmed version.
2. Generate and audition a short voice sample, checking dates, delivery and pauses.
3. Finalise a script for the Atlas; the root narration.txt describes the older app.
4. Create a scene and cue manifest using narration timestamps.
5. Prove the capture and editing tools with a short 1080p30 recording before promising capture quality.
6. Rehearse scene resets and actions in an isolated browser profile; preserve the user's saved state.
7. Record shots with editing handles and safety takes.
8. Assemble narration, picture, sound effects and captions; inspect the final encoded film.

## Voice sample

Run `node tools/video/video-voice-test.mjs` from the repository root. Requires a Node version supporting `process.loadEnvFile`.
The script makes one paid generation request and saves MP3, alignment and nonsecret generation settings in `.cache/video/voice-test/`.
An existing sample is reused without further generation. A timeout is not automatically retried because it may already have consumed credits.

The user approved the Multilingual v2 audition. Retain voice `k8dq4mJpbfobhAWpYeng`, stability 0.55, similarity boost 0.75, style 0.15 and speaker boost enabled. Preserve separate narration and effects tracks and use alignment data as the edit clock.

## Capture pilot and script

- Seven-scene script: `docs/atlas/video-script.md`, 288 spoken words plus visual pauses.
- Pilot driver: `tools/video/video-capture-pilot.mjs`. Requires `VIDEO_PLAYWRIGHT_PATH` pointing to an installed `playwright/index.mjs`, Edge and FFmpeg installed with `npm install --prefix .cache/video/tools --no-audit --no-fund ffmpeg-static`.
- Captures an isolated browser at 1920 × 1080. Browser frame timestamps determine duration; unchanged frames are held and the final encode is constant 30 fps.
- Initial encoded pilot passed a complete decode: H.264, 1920 × 1080, 30 fps, 444 frames. No browser errors. Framing review found that the larger charts require deliberate scrolling; the pilot now includes that movement and the 80-year guide.
- The pilot is silent technical footage, not the finished film. It does not yet include cursor choreography, narration sync or sound design.
- Output: `.cache/video/pilot/capture-pilot.mp4`, supporting screenshots and timing manifest.

## Production pipeline

- `node tools/video/video-audio.mjs`: generates seven narration clips with timestamps and two sound assets. Requests are cached by script/settings hash; the key is never logged.
- Set `VIDEO_PLAYWRIGHT_PATH` to the installed `playwright/index.mjs`. Optionally set `VIDEO_APP_URL` to the production preview URL.
- `node tools/video/video-capture-film.mjs --rehearse`: checks all scene interactions and saves framing screenshots without recording.
- `node tools/video/video-capture-film.mjs`: records the timed scenes. Existing takes are reused. After changing narration or shot directions, explicitly recapture affected scenes with `--scene=04` (or the relevant ID).
- `node tools/video/video-assemble.mjs`: applies transitions, assembles narration, ducks ambience, mixes accents, builds captions and exports clean/captioned H.264 films.
- `node tools/video/video-verify.mjs`: verifies caption timing, visual cue timing, browser errors, complete file decoding, resolution, frame rate and measured loudness.
- All generated media lives in `.cache/video/film/`; final deliverables are in its `delivery` subdirectory. Raw captures, API response alignments, clean audio stems and cue manifests are retained.
- The filmed app includes pre-existing uncommitted Atlas/data expansion work on top of Git revision `9b4fe728728821c8f00be8d286dd2895697c7d9d`. Video production changes are confined to tooling and documentation; they do not modify app behaviour.

## Progress

- Initial preflight: all 16 Atlas tests passed, Atlas data validation passed (69 moments, 13 journeys, 237 measured series), and production build passed after retrying outside the Windows sandbox.
- Voice test generated successfully with the confirmed voice using Multilingual v2: 28.003 seconds, 395 input characters. MP3, alignment and nonsecret settings are saved under `.cache/video/voice-test/`. User approved the audition.
- All seven scenes rehearsed and captured. Scene 02 uses the Diamond Sutra; scene 03 follows The first viral ideas through printing and the Web.
- Full narration and sound palette generated. Approved voice settings retained. The soundtrack uses a quiet loop and three understated discovery accents.
- Revised fingerprint take closes the native selector after changing eras. Revised light-theme chart framing shows the complete plot and returns to the latest values before the cut.
- Final exports complete: `delivery/history-loom.mp4` and `delivery/history-loom-captioned.mp4`.
- Validation passed: 153.033 seconds, 1920 × 1080 at 30 fps, seven scenes, 47 captions, no browser errors, all visual cue starts on time. Both files decode completely.
- All four audio stems and each scene voice track have exact sample counts. Lead-in silence is checked to prevent cumulative drift. A normalization timestamp issue found during assembly was corrected with sample-based padding/trimming and explicit timestamp resets.
- Measured final loudness: −16.16 LUFS integrated, −1.50 dBTP true peak. Clean film size: 16,791,087 bytes.
- Visual review included every scene's framing, a contact sheet across the complete edit, and an encoded caption frame. User approval covered the voice audition; the complete soundtrack is ready for user listening review.
