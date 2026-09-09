import { loadEnvFile } from 'node:process'
import { mkdir, writeFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Credentials stay in process memory and are never written into production assets.
loadEnvFile(fileURLToPath(new URL('../../.env.local', import.meta.url)))
const key = process.env.ELEVENLABS_API_KEY
if (!key) throw new Error('ELEVENLABS_API_KEY is missing from .env.local')

const voiceId = 'k8dq4mJpbfobhAWpYeng'
const output = new URL('../../.cache/video/voice-test/', import.meta.url)
const audioPath = new URL('narration.mp3', output)
try {
  await access(audioPath)
  console.log('Voice test already exists; reusing it without another paid request.')
  process.exit(0)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}
const text = 'History Loom. Across centuries, familiar pressures return. In seventeen eighty-nine, France faces revolution. In eighteen forty-eight, unrest spreads across Europe. The people and circumstances are different. So what connects these moments? Follow a thread. Compare the pressures. Then look at the gaps between them. An echo is a resemblance we can explore. It is not a timetable for the future.'
const request = {
  text,
  model_id: 'eleven_multilingual_v2',
  voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
}
let response
try {
  response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(90000),
  })
} catch {
  throw new Error('ElevenLabs connection failed or timed out. Check connectivity before retrying; the request may have reached the provider.')
}
if (!response.ok) throw new Error(`ElevenLabs returned HTTP ${response.status}; response body omitted to keep logs free of credentials.`)
const result = await response.json()
if (!result.audio_base64) throw new Error('ElevenLabs response did not contain audio')
await mkdir(output, { recursive: true })
await writeFile(new URL('alignment.json', output), JSON.stringify({ alignment: result.alignment, normalized_alignment: result.normalized_alignment }, null, 2))
await writeFile(new URL('request.json', output), JSON.stringify({ voiceId, ...request }, null, 2))
await writeFile(audioPath, Buffer.from(result.audio_base64, 'base64'))
const alignment = result.normalized_alignment ?? result.alignment
console.log(JSON.stringify({ audio: fileURLToPath(audioPath), seconds: alignment?.character_end_times_seconds?.at(-1), characters: text.length, model: request.model_id }))
