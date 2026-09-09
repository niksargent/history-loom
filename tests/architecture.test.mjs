import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
async function files(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]))).flat()
}
test('experiences cannot import each other’s UI or exclusive data', async () => {
  for (const app of ['atlas','classic']) {
    const other=app==='atlas'?'classic':'atlas'
    for(const file of await files(path.join(root,'apps',app))) {
      if(!/\.(tsx?|css)$/.test(file))continue
      const source=await readFile(file,'utf8')
      for(const match of source.matchAll(/(?:from\s+|import\s*\(|url\()\s*['"]([^'"]+)['"]/g)) {
        if(!match[1].startsWith('.'))continue
        const resolved=path.resolve(path.dirname(file),match[1])
        for(const forbidden of [path.join(root,'apps',other),path.join(root,'data',other)])assert.ok(!resolved.startsWith(forbidden+path.sep),`${file} imports ${match[1]}`)
      }
    }
  }
})
test('the public entry points load separate applications', async () => {
  assert.match(await readFile(path.join(root,'index.html'),'utf8'),/\/apps\/atlas\/entry.ts/)
  assert.match(await readFile(path.join(root,'classic/index.html'),'utf8'),/\/apps\/classic\/src\/main.tsx/)
  assert.match(await readFile(path.join(root,'atlas.html'),'utf8'),/\/apps\/atlas\/legacy-entry.ts/)
})
test('legacy links preserve query strings and hash routes', async () => {
  const legacy=await readFile(path.join(root,'apps/atlas/legacy-entry.ts'),'utf8')
  assert.match(legacy,/window.location.search/)
  assert.match(legacy,/window.location.hash/)
  const entry=await readFile(path.join(root,'apps/atlas/entry.ts'),'utf8')
  assert.match(entry,/#insights/)
  assert.match(entry,/classic\//)
})
