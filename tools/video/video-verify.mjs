import assert from 'node:assert/strict'
import { readFile, writeFile, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import path from 'node:path'

const root = fileURLToPath(new URL('../../', import.meta.url))
const out = path.join(root, '.cache/video/film')
const ffmpeg = createRequire(import.meta.url)('../../.cache/video/tools/node_modules/ffmpeg-static')
const scenes = JSON.parse(await readFile(path.join(out,'scenes.json'),'utf8'))
const timeline = JSON.parse(await readFile(path.join(out,'delivery/edit-timeline.json'),'utf8'))
async function wavInfo(relative) {
  const buffer=await readFile(path.join(out,relative))
  assert.equal(buffer.toString('ascii',0,4),'RIFF')
  let sampleRate,blockAlign,dataOffset,dataBytes
  for(let p=12;p+8<=buffer.length;) {
    const id=buffer.toString('ascii',p,p+4), size=buffer.readUInt32LE(p+4)
    if(id==='fmt ') {sampleRate=buffer.readUInt32LE(p+12);blockAlign=buffer.readUInt16LE(p+20)}
    if(id==='data') {dataOffset=p+8;dataBytes=size;break}
    p+=8+size+(size%2)
  }
  assert.equal(sampleRate,48000)
  assert.equal(blockAlign,6)
  assert.ok(dataOffset&&dataBytes)
  return {buffer,dataOffset,samples:dataBytes/blockAlign,sampleRate}
}
assert.equal(scenes.length,7)
for (const scene of scenes) {
  const saved=JSON.parse(await readFile(path.join(out,scene.alignment),'utf8'))
  const a=saved.normalized_alignment??saved.alignment
  assert.equal(a.characters.length,a.character_start_times_seconds.length)
  assert.equal(a.characters.length,a.character_end_times_seconds.length)
  assert.ok(scene.speechDuration+scene.lead<scene.duration,`Narration must fit in scene ${scene.id}`)
  const wav=await wavInfo(`scene-${scene.id}/voice.wav`)
  assert.equal(wav.samples,Math.round(scene.duration*48000),`Exact audio duration for scene ${scene.id}`)
  const leadBytes=Math.floor((scene.lead-.01)*48000)*6
  assert.ok(wav.buffer.subarray(wav.dataOffset,wav.dataOffset+leadBytes).every(v=>v===0),`Leading silence for scene ${scene.id}`)
  for(let i=0;i<a.characters.length;i++) {
    assert.ok(a.character_end_times_seconds[i]>=a.character_start_times_seconds[i])
    if(i)assert.ok(a.character_start_times_seconds[i]>=a.character_start_times_seconds[i-1])
  }
  const capture=JSON.parse(await readFile(path.join(out,`scene-${scene.id}/capture.json`),'utf8'))
  assert.deepEqual(capture.errors,[])
  assert.ok(capture.frameCount>1)
  for(const cue of capture.cues)assert.ok(cue.actionStarted<=cue.target+.4,`Late visual cue in ${scene.id}: ${cue.cue}`)
}
for(const stem of ['narration','ambience','effects','mix']) {
  const wav=await wavInfo(`delivery/${stem}.wav`)
  assert.equal(wav.samples,Math.round(timeline.duration*48000),`${stem} duration must exactly match the film`)
}
for(let i=0;i<timeline.captions.length;i++) {
  const c=timeline.captions[i]
  assert.ok(c.start>=0&&c.end>c.start&&c.end<=timeline.duration)
  if(i)assert.ok(c.start>=timeline.captions[i-1].end-.02,'Captions must not overlap')
}
async function inspect(file,filter) {
  return new Promise((resolve,reject)=>{
    let output=''
    const args=['-hide_banner','-i',file,...(filter?['-af',filter]:[]),'-f','null','-']
    const p=spawn(ffmpeg,args,{cwd:out,windowsHide:true,stdio:['ignore','ignore','pipe']})
    p.stderr.on('data',d=>{output+=d})
    p.on('error',reject)
    p.on('close',code=>code===0?resolve(output):reject(new Error(`Decode failed for ${file}: ${output.slice(-1000)}`)))
  })
}
const clean=await inspect('delivery/history-loom.mp4','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json')
assert.match(clean,/1920x1080/)
assert.match(clean,/30 fps/)
assert.match(clean,/Audio: aac/)
const match=clean.match(/\{\s*"input_i"[\s\S]*?\}/)
assert.ok(match,'Expected loudness report')
const loudness=JSON.parse(match[0])
assert.ok(Math.abs(Number(loudness.input_i)+16)<1.5,'Integrated loudness outside target tolerance')
assert.ok(Number(loudness.input_tp)<0,'Clipping detected')
await inspect('delivery/history-loom-captioned.mp4')
const report={passed:true,scenes:scenes.length,seconds:timeline.duration,captions:timeline.captions.length,resolution:'1920x1080',fps:30,loudness,bytes:(await stat(path.join(out,'delivery/history-loom.mp4'))).size,checks:['Every scene has aligned narration and zero browser errors','All caption timestamps are ordered and inside the film','Visual cue starts meet narration deadlines','Both exported films decode completely','Resolution, frame rate, audio format and loudness validated']}
await writeFile(path.join(out,'delivery/verification.json'),JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
