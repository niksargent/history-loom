import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import path from 'node:path'

// Production tooling only: runs in a fresh browser profile without changing the app.
const root = fileURLToPath(new URL('../../', import.meta.url))
const packagePath = process.env.VIDEO_PLAYWRIGHT_PATH
if (!packagePath) throw new Error('Set VIDEO_PLAYWRIGHT_PATH to the installed playwright/index.mjs')
const { chromium } = await import(pathToFileURL(packagePath).href)
const require = createRequire(import.meta.url)
const ffmpeg = require('../../.cache/video/tools/node_modules/ffmpeg-static')
const out = path.join(root, '.cache/video/pilot')
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(process.env.VIDEO_APP_URL ?? 'http://127.0.0.1:4175/history-loom/atlas.html#lab')
  await page.getByRole('tab', { name: 'History’s fingerprints' }).click()
  await page.getByRole('heading', { name: 'Different years. Familiar pressures.' }).waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(out, 'fingerprints.png') })
  const cdp = await context.newCDPSession(page)
  const frames = []
  const pending = []
  cdp.on('Page.screencastFrame', event => {
    const filename = `frame-${String(frames.length).padStart(5, '0')}.jpg`
    frames.push({ file: filename, time: event.metadata.timestamp })
    pending.push(writeFile(path.join(out, filename), Buffer.from(event.data, 'base64')))
    cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
  const started = Date.now()
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }))
  await page.waitForTimeout(2500)
  await page.screenshot({ path: path.join(out, 'fingerprints-framed.png') })
  await page.getByRole('tab', { name: 'Echoes across time' }).click()
  await page.getByRole('heading', { name: 'Echoes across time.' }).waitFor()
  await page.evaluate(() => window.scrollTo({ top: 450, behavior: 'smooth' }))
  await page.waitForTimeout(3500)
  await page.screenshot({ path: path.join(out, 'groups.png') })
  await page.getByRole('button', { name: 'Place in time', exact: true }).click()
  await page.waitForTimeout(2000)
  await page.getByRole('checkbox', { name: 'Show 80-year steps' }).check()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(out, 'time.png') })
  await page.getByRole('button', { name: 'Group by similarity', exact: true }).click()
  await page.waitForTimeout(3000)
  const stopped = Date.now()
  await cdp.send('Page.stopScreencast')
  await Promise.all(pending)
  if (frames.length < 2) throw new Error('Capture returned too few frames')
  const duration = (stopped - started) / 1000
  const timeline = frames.map((frame, i) => {
    const next = frames[i + 1]?.time ?? frames[0].time + duration
    return `file '${frame.file}'\nduration ${Math.max(1 / 1000, next - frame.time).toFixed(6)}`
  }).join('\n') + `\nfile '${frames.at(-1).file}'\n`
  await writeFile(path.join(out, 'frames.ffconcat'), 'ffconcat version 1.0\n' + timeline)
  await writeFile(path.join(out, 'capture.json'), JSON.stringify({ viewport: { width: 1920, height: 1080 }, outputFps: 30, duration, frames: frames.length, errors, note: 'Browser damage frames carry real timestamps; unchanged frames are held. Encode resamples to constant 30 fps.' }, null, 2))
  await new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(out, 'frames.ffconcat'), '-t', String(duration), '-vf', 'fps=30,scale=in_range=full:out_range=tv:out_color_matrix=bt709', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', path.join(out, 'capture-pilot.mp4')], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
    child.stderr.on('data', data => process.stderr.write(data))
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`)))
  })
  console.log(JSON.stringify({ file: path.join(out, 'capture-pilot.mp4'), duration, frames: frames.length, errors }))
} finally {
  await browser.close()
}
