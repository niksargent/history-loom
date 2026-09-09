import { loadEnvFile } from 'node:process'
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
loadEnvFile(path.join(root, '.env.local'))
const key = process.env.ELEVENLABS_API_KEY
if (!key) throw new Error('Missing ELEVENLABS_API_KEY')
const out = path.join(root, '.cache/video/film')
await mkdir(out, { recursive: true })
const doc = await readFile(path.join(root, 'docs/atlas/video-script.md'), 'utf8')
const scenes = [...doc.matchAll(/## (\d\d) · (.+)\r?\n([\s\S]*?)(?=\r?\n## |$)/g)].map(m => ({ id: m[1], title: m[2], text: m[3].split(/\r?\n/).filter(l => l.startsWith('> ')).map(l => l.slice(2)).join(' ') }))
if (scenes.length !== 7 || scenes.some(s => !s.text)) throw new Error('Expected seven narrated scenes')
const exists = async p => { try { await access(p); return true } catch { return false } }
async function post(endpoint, body) {
  let response
  try {
    response = await fetch(`https://api.elevenlabs.io/v1/${endpoint}`, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) })
  } catch { throw new Error('ElevenLabs network error. No automatic retry: the request may have been billed.') }
  if (!response.ok) throw new Error(`ElevenLabs HTTP ${response.status}; secret-bearing response details omitted`)
  return response
}
for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i]
  const request = { text: scene.text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true }, previous_text: scenes[i - 1]?.text, next_text: scenes[i + 1]?.text }
  const hash = createHash('sha256').update(JSON.stringify(request)).digest('hex').slice(0, 12)
  scene.audio = `${scene.id}-${hash}.mp3`
  scene.alignment = `${scene.id}-${hash}.json`
  const cached = await exists(path.join(out, scene.audio)) && await exists(path.join(out, scene.alignment))
  if (!cached) {
    const result = await (await post('text-to-speech/k8dq4mJpbfobhAWpYeng/with-timestamps?output_format=mp3_44100_128', request)).json()
    if (!result.audio_base64 || !result.alignment) throw new Error('Speech response missing audio or timestamps')
    await writeFile(path.join(out, scene.alignment), JSON.stringify({ ...request, voiceId: 'k8dq4mJpbfobhAWpYeng', alignment: result.alignment, normalized_alignment: result.normalized_alignment }, null, 2))
    await writeFile(path.join(out, scene.audio), Buffer.from(result.audio_base64, 'base64'))
  }
  const saved = JSON.parse(await readFile(path.join(out, scene.alignment), 'utf8'))
  const alignment = saved.normalized_alignment ?? saved.alignment
  scene.speechDuration = alignment.character_end_times_seconds.at(-1)
  scene.lead = 1.5
  scene.duration = Math.ceil((scene.speechDuration + scene.lead + 2) * 30) / 30
  console.log(`${scene.id}: ${cached ? 'cached' : 'generated'}, ${scene.speechDuration.toFixed(2)} seconds`)
}
await writeFile(path.join(out, 'scenes.json'), JSON.stringify(scenes, null, 2))
const effects = [
  { id: 'atmosphere', text: 'Seamless quiet atmospheric soundscape. Warm soft air, distant rounded glass resonances, delicate organic texture. Serene curiosity and spaciousness. No voice, no beat, no impacts, no dramatic swell. Consistent gentle level throughout.', duration_seconds: 24, loop: true },
  { id: 'thread', text: 'One delicate airy silk-thread sweep followed by a single soft warm glass resonance. Elegant, understated, gentle discovery. No harsh frequencies, no voices, no music, no bass impact. Fade completely into silence.', duration_seconds: 3, loop: false },
]
for (const effect of effects) {
  const target = path.join(out, `${effect.id}.mp3`)
  if (await exists(target)) { console.log(`${effect.id}: cached`); continue }
  const { id, ...body } = effect
  const request = { ...body, model_id: 'eleven_text_to_sound_v2', prompt_influence: 0.5 }
  const response = await post('sound-generation', request)
  await writeFile(target, Buffer.from(await response.arrayBuffer()))
  await writeFile(path.join(out, `${id}-request.json`), JSON.stringify(request, null, 2))
  console.log(`${id}: generated`)
}
