import { writeFile, mkdir } from 'node:fs/promises'
await mkdir('public/atlas/fonts', { recursive: true })
const stylesheet = await fetch(
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..600;1,400..600&family=Manrope:wght@400..700&display=swap',
  {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    },
  },
)
if (!stylesheet.ok) throw Error('Font stylesheet could not be retrieved')
const original = await stylesheet.text()
// Latin Extended preserves Māori names. Avoid downloading scripts this edition does not use.
const css = [
  ...original.matchAll(
    /\/\* (latin(?:-ext)?) \*\/\s*(@font-face\s*\{[^}]+\})/g,
  ),
]
  .map((match) => match[0])
  .join('\n')
if (!css.includes('woff2')) throw Error('Expected modern WOFF2 fonts')
await writeFile('data/atlas/fonts-source.css', css)
let local = css
const urls = [...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]))]
for (const [i, url] of urls.entries()) {
  const response = await fetch(url)
  if (!response.ok) throw Error(`Font download failed: ${response.status}`)
  const name = `atlas-${i}.woff2`
  await writeFile(
    `public/atlas/fonts/${name}`,
    Buffer.from(await response.arrayBuffer()),
  )
  local = local.replaceAll(url, `./${name}`)
}
await writeFile('public/atlas/fonts/fonts.css', local)
for (const family of ['manrope', 'cormorantgaramond']) {
  const response = await fetch(
    `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`,
  )
  if (!response.ok) throw Error('Could not retrieve font license')
  await writeFile(`public/atlas/fonts/${family}-OFL.txt`, await response.text())
}
console.log(`Saved ${urls.length} self-hosted fonts and OFL licenses.`)
