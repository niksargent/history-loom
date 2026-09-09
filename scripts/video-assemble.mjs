import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const out = path.join(root, '.cache/video/film')
const delivery = path.join(out, 'delivery')
await mkdir(delivery, { recursive: true })
const ffmpeg = createRequire(import.meta.url)('../.cache/video/tools/node_modules/ffmpeg-static')
const scenes = JSON.parse(await readFile(path.join(out, 'scenes.json'), 'utf8'))
const mixOnly = process.argv.includes('--mix-only')
const run = args => new Promise((resolve, reject) => {
  const child = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { cwd: out, windowsHide: true, stdio: ['ignore','ignore','pipe'] })
  child.stderr.on('data', data => process.stderr.write(data))
  child.on('error', reject)
  child.on('close', c => c === 0 ? resolve() : reject(new Error(`FFmpeg exited ${c}`)))
})
const srtTime = seconds => { const ms=Math.round(seconds*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}` }
const captions = [], chapters = [], allCues = []
let offset = 0
for (const scene of scenes) {
  for (let attempt=0; ; attempt++) {
    let pending=false
    try { await access(path.join(out,`scene-${scene.id}/capture.pending`)); pending=true } catch {}
    if (!pending) break
    if (attempt>=300) throw new Error(`Scene ${scene.id} is still being recorded`)
    await new Promise(resolve=>setTimeout(resolve,1000))
  }
  const raw = JSON.parse(await readFile(path.join(out, scene.alignment), 'utf8'))
  const a = raw.normalized_alignment ?? raw.alignment
  const text = a.characters.join('')
  // Group timestamped words into short readable captions, preserving sentence ends.
  const words = [...text.matchAll(/\S+/g)]
  let batch = []
  function flush() {
    if (!batch.length) return
    const first=batch[0], last=batch.at(-1)
    captions.push({ start: offset+scene.lead+a.character_start_times_seconds[first.index], end: offset+scene.lead+a.character_end_times_seconds[last.index+last[0].length-1], text: batch.map(w=>w[0]).join(' ') })
    batch=[]
  }
  for (const word of words) {
    if (batch.length && batch.map(w=>w[0]).join(' ').length + word[0].length > 68) flush()
    batch.push(word)
    if (/[.!?]$/.test(word[0])) flush()
  }
  flush()
  const capture = JSON.parse(await readFile(path.join(out, `scene-${scene.id}/capture.json`), 'utf8'))
  if (capture.errors.length) throw new Error(`Scene ${scene.id} had browser errors`)
  allCues.push(...capture.cues.map(c => ({ scene: scene.id, ...c, globalTarget:offset+c.target })))
  chapters.push({ id:scene.id, title:scene.title, start:offset, end:offset+scene.duration })
  const fadeIn = scene.id === '01' ? .8 : .28
  const fadeOut = scene.id === '07' ? 1.3 : .28
  if (!mixOnly) {
    await run(['-i',`scene-${scene.id}/picture.mp4`,'-an','-vf',`fade=t=in:st=0:d=${fadeIn}:color=0x101d23,fade=t=out:st=${scene.duration-fadeOut}:d=${fadeOut}:color=0x101d23`,'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',`scene-${scene.id}/edited.mp4`])
  }
  const samples = Math.round(scene.duration*48000)
  await run(['-i',scene.audio,'-af',`loudnorm=I=-18:TP=-2:LRA=9,aresample=48000,asetpts=N/SR/TB,adelay=${scene.lead*1000}:all=1,apad=whole_len=${samples},atrim=end_sample=${samples},asetpts=N/SR/TB`,'-ar','48000','-ac','2','-c:a','pcm_s24le',`scene-${scene.id}/voice.wav`])
  offset += scene.duration
  console.log(`${scene.id}: edited and narration levelled`)
}
await writeFile(path.join(out, 'picture.ffconcat'), 'ffconcat version 1.0\n'+scenes.map(s=>`file 'scene-${s.id}/edited.mp4'`).join('\n'))
await writeFile(path.join(out, 'voice.ffconcat'), 'ffconcat version 1.0\n'+scenes.map(s=>`file 'scene-${s.id}/voice.wav'`).join('\n'))
await run(['-f','concat','-safe','0','-i','picture.ffconcat','-c','copy','picture.mp4'])
await run(['-f','concat','-safe','0','-i','voice.ffconcat','-c:a','pcm_s24le','delivery/narration.wav'])
const srt=captions.map((c,i)=>`${i+1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join('\n')
await writeFile(path.join(delivery,'history-loom.srt'),srt)
await writeFile(path.join(delivery,'history-loom.vtt'),'WEBVTT\n\n'+srt.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g,'$1.$2'))
const assTime=t=>{const n=Math.round(t*100);return `${Math.floor(n/360000)}:${String(Math.floor(n/6000)%60).padStart(2,'0')}:${String(Math.floor(n/100)%60).padStart(2,'0')}.${String(n%100).padStart(2,'0')}`}
const ass='[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,36,&H00FFFFFF,&H00FFFFFF,&H00202020,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,160,160,40,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'+captions.map(c=>`Dialogue: 0,${assTime(c.start)},${assTime(c.end)},Default,,0,0,0,,${c.text}`).join('\n')
await writeFile(path.join(delivery,'history-loom.ass'),ass)
await writeFile(path.join(delivery,'edit-timeline.json'),JSON.stringify({duration:offset,fps:30,chapters,captions,cues:allCues},null,2))
// A quiet loop and three brief accents. No sound is injected into the app itself.
const totalSamples=Math.round(offset*48000)
await run(['-stream_loop','-1','-i','atmosphere.mp3','-t',String(offset),'-af',`loudnorm=I=-37:TP=-9:LRA=7,aresample=48000,asetpts=N/SR/TB,afade=t=in:d=3,afade=t=out:st=${offset-4}:d=4,apad=whole_len=${totalSamples},atrim=end_sample=${totalSamples},asetpts=N/SR/TB`,'-ar','48000','-ac','2','-c:a','pcm_s24le','delivery/ambience.wav'])
const hits = [chapters[2].start + 1, chapters[4].start + 1, ...allCues.filter(c=>c.scene==='05'&&c.cue==='put those dates back').map(c=>c.globalTarget)]
const split = hits.map((_,i)=>`[s${i}]`).join('')
const delays = hits.map((t,i)=>`[s${i}]adelay=${Math.round(t*1000)}:all=1[d${i}]`).join(';')
await run(['-i','thread.mp3','-filter_complex',`[0:a]loudnorm=I=-29:TP=-9:LRA=7,aresample=48000,asetpts=N/SR/TB,asplit=${hits.length}${split};${delays};${hits.map((_,i)=>`[d${i}]`).join('')}amix=inputs=${hits.length}:normalize=0,apad=whole_len=${totalSamples},atrim=end_sample=${totalSamples},asetpts=N/SR/TB[a]`,'-map','[a]','-ar','48000','-ac','2','-c:a','pcm_s24le','delivery/effects.wav'])
await run(['-i','delivery/narration.wav','-i','delivery/ambience.wav','-i','delivery/effects.wav','-filter_complex',`[0:a]asplit=2[voice][key];[1:a][key]sidechaincompress=threshold=0.02:ratio=3:attack=60:release=700[bed];[voice][bed][2:a]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,aresample=48000,asetpts=N/SR/TB,apad=whole_len=${totalSamples},atrim=end_sample=${totalSamples}[a]`,'-map','[a]','-ar','48000','-c:a','pcm_s24le','delivery/mix.wav'])
const metadata=';FFMETADATA1\ntitle=History Loom — Follow the echoes\ncomment=AI narration and sound design generated with ElevenLabs. Recorded from the real History Loom app.\n'+chapters.map(c=>`[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(c.start*1000)}\nEND=${Math.round(c.end*1000)}\ntitle=${c.title}\n`).join('')
await writeFile(path.join(out,'chapters.txt'),metadata)
await run(['-i','picture.mp4','-i','delivery/mix.wav','-i','delivery/history-loom.srt','-i','chapters.txt','-map','0:v','-map','1:a','-map','2:s','-map_metadata','3','-map_chapters','3','-c:v','copy','-c:a','aac','-b:a','256k','-c:s','mov_text','-metadata:s:s:0','language=eng','-disposition:s:0','0','-t',String(offset),'-movflags','+faststart','delivery/history-loom.mp4'])
await run(['-i','delivery/history-loom.mp4','-vf','ass=delivery/history-loom.ass','-map','0:v','-map','0:a','-c:v','libx264','-preset','medium','-crf','19','-c:a','copy','-movflags','+faststart','delivery/history-loom-captioned.mp4'])
await run(['-ss','3','-i','delivery/history-loom.mp4','-frames:v','1','delivery/poster.jpg'])
await copyFile(path.join(root,'docs/atlas/video-script.md'),path.join(delivery,'script.md'))
await copyFile(path.join(out,'thread.mp3'),path.join(delivery,'thread-accent.mp3'))
await copyFile(path.join(out,'atmosphere.mp3'),path.join(delivery,'atmosphere-loop.mp3'))
await writeFile(path.join(delivery,'README.md'),`# History Loom film\n\nDuration: ${offset.toFixed(2)} seconds. 1920 × 1080, 30 fps.\n\n- history-loom.mp4: clean film with optional English subtitle track and chapters.\n- history-loom-captioned.mp4: captions permanently visible.\n- history-loom.srt / .vtt: timed captions.\n- narration.wav, ambience.wav, effects.wav and mix.wav: separate 48 kHz audio masters.\n- edit-timeline.json: chapter boundaries, narration cues and captions.\n- script.md: spoken script and production directions.\n\nNarration: ElevenLabs Multilingual v2, user-selected voice k8dq4mJpbfobhAWpYeng. Sound design: ElevenLabs Sound Effects v2. No API key is included in these assets.\n`)
console.log(`Delivered ${offset.toFixed(2)} seconds to ${delivery}`)
