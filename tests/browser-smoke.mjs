import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const { chromium } = process.env.PLAYWRIGHT_PATH
  ? await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href)
  : await import('playwright')
const base = process.env.APP_URL ?? 'http://127.0.0.1:4176/history-loom/'
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: true })
const errors = []
await mkdir('.cache/layout-qa', { recursive: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', e => errors.push(e.message))
  page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) errors.push(`${r.status()} ${r.url()}`) })
  const switcher = () => page.getByRole('navigation', { name: 'Choose experience' })
  await page.goto(base)
  await page.getByRole('heading', { name: /The past is alive/ }).waitFor()
  await switcher().getByRole('link', { name: 'Classic', exact: true }).click()
  await page.waitForURL(`${base}classic/`)
  await page.getByRole('heading', { name: 'The History Loom', exact: true }).waitFor()
  for (const country of ['United States', 'France', 'Germany', 'Britain']) {
    await page.getByRole('button', { name: country, exact: true }).click()
    await page.getByText(`A way to see ${country}`, { exact: false }).waitFor()
  }
  await page.screenshot({ path: '.cache/layout-qa/classic-desktop.png' })
  await page.getByRole('button', { name: 'Insights lab', exact: true }).click()
  await page.waitForURL(/#insights/)
  await switcher().getByRole('link', { name: 'Atlas', exact: true }).click()
  await page.getByRole('button', { name: 'Pattern lab', exact: true }).click()
  for (const name of ['Lives getting longer', 'History’s fingerprints', 'Echoes across time']) {
    await page.getByRole('tab', { name, exact: true }).click()
    await page.getByRole('tabpanel').locator('svg').first().waitFor()
  }
  await page.screenshot({ path: '.cache/layout-qa/atlas-lab.png' })
  await page.goto(`${base}atlas.html?demo=1#lab`)
  await page.waitForURL(`${base}?demo=1#lab`)
  await page.getByRole('tab', { name: 'History’s fingerprints' }).waitFor()
  await page.goto(`${base}#insights`)
  await page.waitForURL(`${base}classic/#insights`)
  await switcher().waitFor()
  await page.goto(base)
  for (const width of [1440, 1024, 800, 390]) {
    await page.setViewportSize({ width, height: 900 })
    for (const theme of ['light', 'dark']) {
      const toggle = page.getByRole('button', { name: `Switch to ${theme} theme` })
      if (await toggle.count()) await toggle.click()
      await page.waitForTimeout(300)
      const boxes = await page.locator('.atlas-brand-group, .header-actions').evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return { x: r.x, right: r.right, y: r.y, bottom: r.bottom } }))
      assert.ok(boxes[0].right <= boxes[1].x, `Header overlaps at ${width}/${theme}`)
      const bounds = await switcher().boundingBox()
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0, `Switch outside viewport ${width}`)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Horizontal overflow at ${width}`)
      await page.screenshot({ path: `.cache/layout-qa/atlas-${width}-${theme}.png` })
    }
  }
  await switcher().getByRole('link', { name: 'Classic', exact: true }).click()
  await page.getByRole('heading', { name: 'The History Loom', exact: true }).waitFor()
  await page.screenshot({ path: '.cache/layout-qa/classic-mobile.png' })
  await switcher().getByRole('link', { name: 'Atlas', exact: true }).click()
  await page.getByRole('heading', { name: /The past is alive/ }).waitFor()
  assert.deepEqual(errors, [])
  console.log('PASS: both experiences, four Classic datasets, three analytics views, legacy links, mobile switching, four viewport widths and both Atlas themes; no page errors or failed site responses.')
} finally {
  await browser.close()
}
