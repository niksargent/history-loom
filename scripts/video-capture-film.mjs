import { mkdir, readFile, writeFile, access, unlink } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const out = path.join(root, '.cache/video/film')
const require = createRequire(import.meta.url)
const ffmpeg = require('../.cache/video/tools/node_modules/ffmpeg-static')
const { chromium } = await import(pathToFileURL(process.env.VIDEO_PLAYWRIGHT_PATH).href)
const scenes = JSON.parse(await readFile(path.join(out, 'scenes.json'), 'utf8'))
const rehearsal = process.argv.includes('--rehearse')
const only = process.argv.find(a => a.startsWith('--scene='))?.split('=')[1]
const base = process.env.VIDEO_APP_URL ?? 'http://127.0.0.1:4175/history-loom/atlas.html'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const sleep = ms => new Promise(r => setTimeout(r, Math.max(0, ms)))
async function encode(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
    child.stderr.on('data', b => process.stderr.write(b))
    child.on('error', reject)
    child.on('close', c => c === 0 ? resolve() : reject(new Error(`FFmpeg ${c}`)))
  })
}
async function glide(page, target, click = true) {
  await target.waitFor({ state: 'visible' })
  const b = await target.boundingBox()
  if (!b || b.y < 0 || b.y + b.height > 1080) await target.scrollIntoViewIfNeeded()
  const r = await target.boundingBox()
  const x = r.x + r.width / 2, y = r.y + r.height / 2
  await page.evaluate(async ({ x, y }) => {
    let el = document.getElementById('film-pointer')
    if (!el) {
      el = document.createElement('div'); el.id = 'film-pointer'
      el.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;width:24px;height:28px;filter:drop-shadow(0 2px 3px #0008)'
      el.innerHTML = '<svg width="24" height="28" viewBox="0 0 24 28"><path d="M3 2L3 23L9 17L14 26L18 24L13 15L22 15Z" fill="#f0d3a7" stroke="#14252b" stroke-width="1.5"/></svg>'
      el.style.transform = 'translate(1760px,950px)'
    }
    ;(document.querySelector('dialog[open]') ?? document.body).append(el)
    el.style.opacity = '1'
    const a = el.animate([{ transform: el.style.transform }, { transform: `translate(${x}px,${y}px)` }], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' })
    await a.finished
    el.style.transform = `translate(${x}px,${y}px)`; a.cancel()
  }, { x, y })
  await page.mouse.move(x, y)
  if (click) await target.click()
  await sleep(250)
}
async function hidePointer(page) { await page.evaluate(() => { const p = document.getElementById('film-pointer'); if (p) p.style.opacity = '0' }) }
async function scroll(page, y, duration = 1300) {
  await hidePointer(page)
  await page.evaluate(({ y, duration }) => new Promise(resolve => {
    const start = window.scrollY, t = performance.now()
    function frame(now) { const f = Math.min(1, (now - t) / duration); const e = f < .5 ? 4*f*f*f : 1-Math.pow(-2*f+2,3)/2; window.scrollTo({top:start+(y-start)*e,behavior:'instant'}); if(f<1)requestAnimationFrame(frame);else resolve() }
    requestAnimationFrame(frame)
  }), { y, duration })
}
async function exploreTop(page) { return page.locator('#atlas-explore').evaluate(e => e.getBoundingClientRect().top + window.scrollY - 24) }
async function prepare(page, id) {
  await page.goto(`${base}#${['04','05','06'].includes(id) ? 'lab' : 'explore'}`)
  await page.evaluate(() => document.fonts.ready)
  if (['02','07'].includes(id)) {
    await page.getByRole('button', { name: /^One block\. A thousand voices\.,/ }).click()
    await scroll(page, await exploreTop(page), 1)
  }
  if (id === '03') {
    await page.getByRole('button', { name: 'Begin a journey', exact: true }).click()
    await page.getByRole('dialog').waitFor()
  }
  if (id === '04') {
    await page.getByRole('tab', { name: 'History’s fingerprints' }).click()
    await page.getByRole('heading', { name: 'Different years. Familiar pressures.' }).waitFor()
    await scroll(page, 300, 1)
  }
  if (id === '05') {
    await page.getByRole('tab', { name: 'Echoes across time' }).click()
    await page.getByRole('heading', { name: 'Echoes across time.' }).waitFor()
    await scroll(page, 380, 1)
  }
  if (id === '06') {
    await page.getByRole('button', { name: 'Switch to light theme' }).click()
    await page.getByRole('button', { name: 'Play history animation' }).waitFor()
    await scroll(page, 300, 1)
  }
  await hidePointer(page)
  await sleep(1200)
}
try {
  for (const scene of scenes.filter(s => !only || s.id === only)) {
    const folder = path.join(out, `scene-${scene.id}`)
    await mkdir(folder, { recursive: true })
    const output = path.join(folder, 'picture.mp4')
    if (!rehearsal && !only) { try { await access(output); console.log(`${scene.id}: using existing take`); continue } catch {} }
    if (!rehearsal) await writeFile(path.join(folder, 'capture.pending'), 'Recording in progress; do not assemble this scene yet.\n')
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
    const page = await context.newPage()
    const errors = [], cueLog = []
    page.on('pageerror', e => errors.push(e.message))
    await prepare(page, scene.id)
    await page.screenshot({ path: path.join(folder, 'start.png') })
    const saved = JSON.parse(await readFile(path.join(out, scene.alignment), 'utf8'))
    const align = saved.normalized_alignment ?? saved.alignment
    const chars = align.characters.join('')
    function phrase(text) {
      const i = chars.toLowerCase().indexOf(text.toLowerCase())
      if (i < 0) throw new Error(`Cue not found in scene ${scene.id}: ${text}`)
      return scene.lead + align.character_start_times_seconds[i]
    }
    const cdp = await context.newCDPSession(page)
    const frames = [], pending = []
    let start
    if (!rehearsal) {
      cdp.on('Page.screencastFrame', e => {
        const file = `frame-${String(frames.length).padStart(5, '0')}.jpg`
        frames.push({ file, time: e.metadata.timestamp })
        pending.push(writeFile(path.join(folder, file), Buffer.from(e.data, 'base64')))
        cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {})
      })
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
      while (!frames.length) await sleep(20)
      start = frames[0].time * 1000
    } else start = Date.now()
    async function at(text, action, early = .8) {
      const target = typeof text === 'number' ? text : phrase(text)
      if (!rehearsal) await sleep((target - early) * 1000 - (Date.now() - start))
      const actual = (Date.now() - start) / 1000
      await action()
      cueLog.push({ cue: text, target, actionStarted: actual })
      await page.screenshot({ path: path.join(folder, `cue-${cueLog.length}.png`) })
    }
    if (scene.id === '01') {
      await at('around the world', async () => scroll(page, await exploreTop(page), 2000), 1.8)
    }
    if (scene.id === '02') {
      await at('Open its story', () => glide(page, page.getByRole('button', { name: 'Step into this moment' })))
      await at('follow the thread', () => glide(page, page.locator('.related-moments button').first(), false))
      await at('sources behind it', async () => {
        await glide(page, page.locator('.moment-dialog summary'))
        await page.locator('.moment-dialog .evidence a').first().scrollIntoViewIfNeeded()
        await hidePointer(page)
      })
    }
    if (scene.id === '03') {
      await at('different places', () => glide(page, page.getByRole('button', { name: 'Travel onward', exact: true })))
      await at('connections invite', () => glide(page, page.getByRole('button', { name: 'Travel onward', exact: true })))
      await at('details remind', async () => { await glide(page, page.getByRole('button', { name: 'Find the connection', exact: true })); await glide(page, page.getByRole('button', { name: /They made ideas easier to copy/ })); await hidePointer(page) })
    }
    if (scene.id === '04') {
      await at('similar shape', () => glide(page, page.locator('.fingerprint-chart'), false))
      await at('historical interpretations', async () => { await hidePointer(page); await scroll(page, 300, 300) })
      await at('sharper questions', async () => {
        const selector = page.locator('.fingerprint-controls select')
        await glide(page, selector, false)
        await selector.focus()
        await selector.press('ArrowDown')
        await selector.press('Escape')
        await selector.blur()
      })
      await hidePointer(page)
    }
    if (scene.id === '05') {
      await at('similar pressures', () => glide(page, page.locator('.echo-constellation'), false))
      await at('put those dates back', async () => { await glide(page, page.getByRole('button', { name: 'Place in time', exact: true })); await scroll(page, 450, 600) })
      await at('eighty-year guide', async () => { await glide(page, page.getByRole('checkbox', { name: 'Show 80-year steps' })); await hidePointer(page) })
    }
    if (scene.id === '06') {
      await at('across the years', async () => { await glide(page, page.getByRole('button', { name: 'Play history animation' })); await hidePointer(page) })
      await at('helped that change', async () => { await glide(page, page.getByRole('button', { name: 'Latest', exact: true })); await hidePointer(page) })
    }
    if (scene.id === '07') {
      await at('Follow the connection', () => scroll(page, 0, 2000))
    }
    if (!rehearsal) {
      await sleep(scene.duration * 1000 - (Date.now() - start))
      await cdp.send('Page.stopScreencast')
      await Promise.all(pending)
      const list = frames.map((f, i) => `file '${f.file}'\nduration ${Math.max(.001, (frames[i+1]?.time ?? frames[0].time + scene.duration) - f.time).toFixed(6)}`).join('\n') + `\nfile '${frames.at(-1).file}'\n`
      await writeFile(path.join(folder, 'frames.ffconcat'), 'ffconcat version 1.0\n' + list)
      await encode(['-f','concat','-safe','0','-i',path.join(folder,'frames.ffconcat'),'-t',String(scene.duration),'-vf','fps=30,scale=in_range=full:out_range=tv:out_color_matrix=bt709','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',output])
    }
    await page.screenshot({ path: path.join(folder, 'end.png') })
    await writeFile(path.join(folder, rehearsal ? 'rehearsal.json' : 'capture.json'), JSON.stringify({ id: scene.id, duration: scene.duration, frameCount: frames.length, errors, cues: cueLog }, null, 2))
    await context.close()
    if (errors.length) throw new Error(`Browser errors in ${scene.id}: ${errors.join('; ')}`)
    if (!rehearsal) await unlink(path.join(folder, 'capture.pending'))
    console.log(`${scene.id}: ${rehearsal ? 'rehearsed' : 'captured'}, ${scene.duration.toFixed(2)} seconds, ${frames.length} damage frames`)
  }
} finally { await browser.close() }
