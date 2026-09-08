import { moments } from '../src/atlas/content.ts'
import { writeFile } from 'node:fs/promises'
const sources = [
  ...new Map(moments.flatMap((m) => m.sources).map((s) => [s.url, s])).values(),
]
const results = []
for (let i = 0; i < sources.length; i += 6) {
  const batch = await Promise.all(
    sources.slice(i, i + 6).map(async (s) => {
      try {
        const response = await fetch(s.url, {
          signal: AbortSignal.timeout(20000),
        })
        const text = await response.text()
        return {
          ...s,
          status: response.status,
          finalUrl: response.url,
          pageTitle:
            text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '',
        }
      } catch (error) {
        return { ...s, status: 'unverified', reason: error.message }
      }
    }),
  )
  results.push(...batch)
}
await writeFile(
  'data/atlas/source-audit.json',
  JSON.stringify(
    {
      checked: new Date().toISOString(),
      note: 'HTTP reachability is not historical verification. Some publishers block automated requests; review content separately.',
      results,
    },
    null,
    2,
  ) + '\n',
)
console.log(
  JSON.stringify(
    results.filter((s) => s.status !== 200),
    null,
    2,
  ),
)
console.log(
  `${results.filter((s) => s.status === 200).length}/${results.length} directly reachable. All results saved to data/atlas/source-audit.json.`,
)
