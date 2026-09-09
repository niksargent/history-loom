import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve(import.meta.dirname, '../dist')
async function files(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]))).flat()
}
test('production artifact contains only public assets and all entrypoints', async () => {
  const built = await files(dist)
  for (const entry of ['index.html', 'classic/index.html', 'atlas.html']) {
    const html = await readFile(path.join(dist, entry), 'utf8')
    for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (/^https?:/.test(url)) continue
      const relative = url.replace(/^\/history-loom\//, '')
      assert.ok(built.includes(path.join(dist, relative)), `Missing asset: ${url}`)
    }
  }
  for (const file of built) {
    assert.doesNotMatch(path.relative(dist, file), /(?:^|[\\/])(?:\.env[^\\/]*|\.git|\.cache|tools|node_modules)(?:$|[\\/])/)
    if (/\.(?:js|html|json)$/.test(file)) {
      assert.doesNotMatch(await readFile(file, 'utf8'), /ELEVENLABS_API_KEY|OPENAI_API_KEY|xi-api-key/, `Server credential code leaked into ${file}`)
    }
  }
})
