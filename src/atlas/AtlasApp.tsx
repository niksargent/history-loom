import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import { moments, journeys, momentById } from './content'
import {
  filterMoments,
  momentDate,
  relatedMoments,
  themes,
  yearLabel,
  yearToAxis,
  axisToYear,
  yearDistance,
} from './engine'
import { ThreadArt } from './ThreadArt'
import { WorldMap } from './WorldMap'
import { JourneyDialog, MomentDialog } from './StoryDialog'
import { Modal } from './Modal'
import { useAmbient, useStored } from './useExperience'
import type { Journey, Moment, Theme } from './types'
import lifeManifest from '../../data/atlas/life-manifest.json'
const PatternLab = lazy(() => import('./PatternLab'))
type Page = 'explore' | 'journeys' | 'lab' | 'collection'
const validPages: Page[] = ['explore', 'journeys', 'lab', 'collection']
const firstYear = moments[0].year
const lastYear = moments[moments.length - 1].year
const axisStart = yearToAxis(firstYear)
const axisEnd = yearToAxis(lastYear)
const featuredJourneys = ['words', 'routes', 'voices'].map((id) =>
  journeys.find((j) => j.id === id)!,
)
const initialPage = () =>
  validPages.includes(location.hash.slice(1) as Page)
    ? (location.hash.slice(1) as Page)
    : 'explore'

function JourneyCard({
  journey,
  index,
  onStart,
  completed,
}: {
  journey: Journey
  index: number
  onStart: () => void
  completed: boolean
}) {
  return (
    <button
      className="journey-card"
      onClick={onStart}
      style={{ '--card-color': themes[journey.theme].color } as CSSProperties}
    >
      <div className="journey-card-art">
        <ThreadArt kind={journey.art} />
        <span className="journey-card-number">0{index + 1}</span>
        <span className="journey-card-category">
          {completed ? (
            <>
              <Icon name="check" size={12} /> DISCOVERED
            </>
          ) : (
            themes[journey.theme].label
          )}
        </span>
      </div>
      <div className="journey-card-copy">
        <h3>{journey.title}</h3>
        <p>{journey.subtitle}</p>
        <div>
          <span>
            3 moments <span>·</span> 3 min journey
          </span>
          <span className="card-arrow">
            <Icon name="arrow" size={17} />
          </span>
        </div>
      </div>
    </button>
  )
}

export default function AtlasApp() {
  const [page, setPage] = useState<Page>(initialPage)
  const [appearance, setAppearance] = useStored<'dark' | 'light'>(
    'theme',
    'dark',
  )
  const [saved, setSaved] = useStored<string[]>('saved', [])
  const [completed, setCompleted] = useStored<string[]>('completed', [])
  const [selectedId, setSelectedId] = useState('silk')
  const [theme, setTheme] = useState<Theme | 'all'>('all')
  const [until, setUntil] = useState(lastYear)
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState<Moment | null>(null)
  const [journey, setJourney] = useState<Journey | null>(null)
  const [about, setAbout] = useState(false)
  const [viewAll, setViewAll] = useState(false)
  const ambient = useAmbient()
  useEffect(() => {
    document.documentElement.dataset.theme = appearance
    document.documentElement.style.colorScheme = appearance
  }, [appearance])
  useEffect(() => {
    const handler = () => setPage(initialPage())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  const navigate = (next: Page) => {
    setPage(next)
    location.hash = next
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const filtered = useMemo(
    () => filterMoments(moments, query, theme, until),
    [query, theme, until],
  )
  const selected =
    filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null
  const echoes = useMemo(
    () =>
      selected
        ? relatedMoments(selected, filtered)
            .slice(0, 3)
            .map((r) => r.moment)
        : [],
    [selected, filtered],
  )
  const select = (moment: Moment) => setSelectedId(moment.id)
  const toggleSave = (id: string) =>
    setSaved((v) => (v.includes(id) ? v.filter((s) => s !== id) : [...v, id]))
  const surprise = () => {
    const pool = moments.filter(
      (m) => m.id !== selectedId && !saved.includes(m.id),
    )
    const choices = pool.length ? pool : moments
    const next = choices[Math.floor(Math.random() * choices.length)]
    setSelectedId(next.id)
    setDetail(next)
  }
  const startJourney = (j: Journey) => setJourney(j)
  const reset = () => {
    setTheme('all')
    setUntil(lastYear)
    setQuery('')
    setViewAll(false)
  }
  const browse = () =>
    document.getElementById('atlas-explore')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    })
  const validSaved = Array.isArray(saved)
    ? saved.filter((id) => momentById[id])
    : []
  return (
    <div className="atlas-app">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to the experience
      </a>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigate('explore')}
          aria-label="History Loom home"
        >
          <svg viewBox="0 0 38 38" aria-hidden="true">
            <path d="M7 7c17 0 7 24 24 24M7 19c17 0 7-12 24-12M7 31c17 0 7-12 24-12M7 7v24M31 7v24" />
          </svg>
          <span>
            history<span className="brand-serif">loom</span>
            <small>THE PAST, CONNECTED</small>
          </span>
        </button>
        <nav aria-label="Main navigation">
          {[
            { id: 'explore', label: 'Explore', icon: 'globe' },
            { id: 'journeys', label: 'Journeys', icon: 'route' },
            { id: 'lab', label: 'Pattern lab', icon: 'chart' },
            { id: 'collection', label: 'My collection', icon: 'bookmark' },
          ].map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'active' : ''}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id as Page)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              {item.id === 'collection' && validSaved.length > 0 && (
                <small className="nav-count">{validSaved.length}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className={`icon-button ${ambient.playing ? 'sound-active' : ''}`}
            onClick={() => void ambient.toggle()}
            aria-label={
              ambient.playing
                ? 'Turn ambient sound off'
                : 'Turn ambient sound on'
            }
            aria-pressed={ambient.playing}
            title={
              ambient.playing
                ? 'Ambient sound on'
                : 'Enable quiet ambient sound'
            }
          >
            <Icon name={ambient.playing ? 'sound' : 'mute'} size={18} />
          </button>
          <span className="header-divider" />
          <button
            className="icon-button"
            onClick={() =>
              setAppearance((v) => (v === 'dark' ? 'light' : 'dark'))
            }
            aria-label={`Switch to ${appearance === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${appearance === 'dark' ? 'light' : 'dark'} theme`}
          >
            <Icon name={appearance === 'dark' ? 'sun' : 'moon'} size={19} />
          </button>
          <button
            className="about-button"
            onClick={() => setAbout(true)}
            aria-label="About History Loom and its evidence"
          >
            ?
          </button>
        </div>
      </header>
      {ambient.error && (
        <p role="status" className="audio-notice">
          {ambient.error}
        </p>
      )}
      <main id="main-content" tabIndex={-1}>
        {page === 'explore' && (
          <div className="page-enter">
            <section className="hero">
              <div className="hero-art" />
              <div className="hero-shade" />
              <div className="hero-stars" aria-hidden="true" />
              <div className="hero-copy">
                <span className="eyebrow">
                  <span className="small-star">✦</span> A LIVING ATLAS OF HUMAN
                  HISTORY
                </span>
                <h1>
                  The past is alive.
                  <br />
                  <em>Follow its echoes.</em>
                </h1>
                <p>
                  A world of unexpected connections.
                  <br />
                  Across oceans. Across centuries. Across us.
                </p>
                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() => startJourney(featuredJourneys[0])}
                  >
                    Begin a journey
                    <Icon name="arrow" size={18} />
                  </button>
                  <button className="hero-secondary" onClick={surprise}>
                    <Icon name="spark" size={16} />
                    Surprise me
                  </button>
                </div>
              </div>
              <button
                className="hero-discovery"
                onClick={() => startJourney(featuredJourneys[1])}
              >
                <span className="orbit-icon">
                  <Icon name="network" size={21} />
                </span>
                <span>
                  <small>THE WORLD HAS ALWAYS BEEN CONNECTED</small>
                  <strong>Nothing travels alone.</strong>
                  <span>
                    Trace the invisible cargo of history{' '}
                    <Icon name="arrow" size={14} />
                  </span>
                </span>
              </button>
              <div className="hero-bottom">
                <span>
                  {moments.length} moments <b>·</b>{' '}
                  {new Set(moments.map((m) => m.region)).size} continents{' '}
                  <b>·</b>{' '}
                  {(
                    Math.floor(yearDistance(firstYear, lastYear) / 100) * 100
                  ).toLocaleString()}{' '}
                  years of human possibility
                </span>
                <button onClick={browse}>
                  Explore the atlas <span>↓</span>
                </button>
              </div>
            </section>
            <section className="explore-section" id="atlas-explore">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">EVERYTHING HAS A BEFORE</span>
                  <h2>Pull a thread. See what connects.</h2>
                </div>
                <div className="search-box">
                  <Icon name="search" size={16} />
                  <input
                    aria-label="Search historical moments"
                    placeholder="A place, an idea, a moment…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      aria-label="Clear search"
                      onClick={() => setQuery('')}
                    >
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div
                className="theme-filters"
                aria-label="Filter historical themes"
              >
                <button
                  className={theme === 'all' ? 'active' : ''}
                  aria-pressed={theme === 'all'}
                  onClick={() => setTheme('all')}
                >
                  <Icon name="globe" size={15} />
                  All threads
                </button>
                {Object.entries(themes).map(([key, t]) => (
                  <button
                    key={key}
                    className={theme === key ? 'active' : ''}
                    aria-pressed={theme === key}
                    onClick={() => setTheme(key as Theme)}
                    style={{ '--filter-color': t.color } as CSSProperties}
                  >
                    <span className="filter-dot" />
                    {t.label}
                  </button>
                ))}
                <span className="moment-count" role="status">
                  {filtered.length} moments
                </span>
              </div>
              <div className="atlas-stage">
                <WorldMap
                  moments={filtered}
                  selected={selected}
                  echoes={echoes}
                  onSelect={select}
                />
                {selected ? (
                  <aside
                    className="selected-moment"
                    key={selected.id}
                    style={
                      {
                        '--moment-color': themes[selected.theme].color,
                      } as CSSProperties
                    }
                  >
                    <div className="selected-top">
                      <span className="eyebrow">A THREAD TO FOLLOW</span>
                      <button
                        className={`icon-button ${saved.includes(selected.id) ? 'is-saved' : ''}`}
                        aria-label={
                          saved.includes(selected.id)
                            ? 'Unsave selected moment'
                            : 'Save selected moment'
                        }
                        aria-pressed={saved.includes(selected.id)}
                        onClick={() => toggleSave(selected.id)}
                      >
                        <Icon
                          name={
                            saved.includes(selected.id) ? 'check' : 'bookmark'
                          }
                          size={17}
                        />
                      </button>
                    </div>
                    <span className="selected-year">
                      {momentDate(selected)}
                    </span>
                    <span className="selected-place">{selected.place}</span>
                    <h3>{selected.title}</h3>
                    <p>{selected.hook}</p>
                    <button
                      className="text-button selected-open"
                      onClick={() => setDetail(selected)}
                    >
                      Step into this moment
                      <Icon name="arrow" size={17} />
                    </button>
                    <div className="selected-echoes">
                      <span className="eyebrow">
                        {echoes.length
                          ? 'IT ECHOES THROUGH…'
                          : 'A THREAD WORTH EXPLORING'}
                      </span>
                      {echoes.length ? (
                        echoes.map((e) => (
                          <button key={e.id} onClick={() => select(e)}>
                            <span className="echo-dot" />
                            <span>{e.place.split(' · ')[0]}</span>
                            <small>{yearLabel(e.year)}</small>
                            <Icon name="arrow" size={12} />
                          </button>
                        ))
                      ) : (
                        <p>Broaden the filters to find more connections.</p>
                      )}
                    </div>
                  </aside>
                ) : (
                  <aside className="empty-state">
                    <Icon name="search" size={32} />
                    <h3>A thread yet to be found.</h3>
                    <p>Try another word or open up the timeline.</p>
                    <button className="primary-button" onClick={reset}>
                      Show the whole world
                    </button>
                  </aside>
                )}
              </div>
              <div className="atlas-timeline">
                <div>
                  <Icon name="route" size={17} />
                  <label htmlFor="atlas-year">
                    THE WORLD UP TO <strong>{yearLabel(until)}</strong>
                  </label>
                </div>
                <div className="timeline-track">
                  <div className="timeline-dots" aria-hidden="true">
                    {moments.map((m) => (
                      <i
                        key={m.id}
                        style={{
                          left: `${((yearToAxis(m.year) - axisStart) / (axisEnd - axisStart)) * 100}%`,
                          background: themes[m.theme].color,
                          opacity: m.year <= until ? 0.7 : 0.16,
                        }}
                      />
                    ))}
                  </div>
                  <input
                    id="atlas-year"
                    type="range"
                    min={axisStart}
                    max={axisEnd}
                    aria-valuetext={yearLabel(until)}
                    step="1"
                    value={yearToAxis(until)}
                    onChange={(e) =>
                      setUntil(axisToYear(Number(e.target.value)))
                    }
                  />
                  <div className="timeline-labels">
                    <span>{yearLabel(firstYear)}</span>
                    <span
                      style={{
                        left: `${((yearToAxis(-1000) - axisStart) / (axisEnd - axisStart)) * 100}%`,
                      }}
                    >
                      1000 BCE
                    </span>
                    <span
                      style={{
                        left: `${((yearToAxis(1000) - axisStart) / (axisEnd - axisStart)) * 100}%`,
                      }}
                    >
                      1000 CE
                    </span>
                    <span>{yearLabel(lastYear)}</span>
                  </div>
                </div>
                <button className="text-button" onClick={reset}>
                  <Icon name="reset" size={14} />
                  All time
                </button>
              </div>
              <div className="moment-browser-heading">
                <span className="eyebrow">OR EXPLORE THE MOMENTS</span>
                <button
                  className="text-button"
                  onClick={() => setViewAll((v) => !v)}
                >
                  {viewAll ? 'Show fewer' : `Browse all ${filtered.length}`}
                  <Icon name="arrow" size={14} />
                </button>
              </div>
              <div className={`moment-strip ${viewAll ? 'expanded' : ''}`}>
                {(viewAll ? filtered : filtered.slice(0, 6)).map((m) => (
                  <button
                    className={selected?.id === m.id ? 'selected' : ''}
                    key={m.id}
                    onClick={() => {
                      select(m)
                      setDetail(m)
                    }}
                    style={
                      {
                        '--moment-color': themes[m.theme].color,
                      } as CSSProperties
                    }
                  >
                    <span className="moment-mini-icon">
                      <Icon name={themes[m.theme].symbol} size={19} />
                    </span>
                    <span className="moment-mini-date">{momentDate(m)}</span>
                    <strong>{m.title}</strong>
                    <small>{m.place.split(' · ')[0]}</small>
                  </button>
                ))}
              </div>
            </section>
            <section className="journeys-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    A LITTLE CURIOSITY GOES A LONG WAY
                  </span>
                  <h2>Get wonderfully lost.</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => navigate('journeys')}
                >
                  All journeys
                  <Icon name="arrow" size={16} />
                </button>
              </div>
              <div className="journey-grid">
                {featuredJourneys.map((j, i) => (
                  <JourneyCard
                    key={j.id}
                    journey={j}
                    index={i}
                    onStart={() => startJourney(j)}
                    completed={completed.includes(j.id)}
                  />
                ))}
              </div>
            </section>
            <section className="lab-invitation">
              <div className="lab-invitation-art">
                <svg viewBox="0 0 380 150" aria-hidden="true">
                  <path d="M0 130C40 128 40 100 80 102S140 70 175 93 215 35 250 53 300 19 380 12" />
                  <path d="M0 145C60 140 50 130 100 130S150 90 190 110 240 64 270 72 320 38 380 30" />
                  <path d="M0 139C50 120 70 143 110 114S170 115 210 90 250 88 290 55 350 42 380 20" />
                </svg>
              </div>
              <div>
                <span className="eyebrow">NOT EVERYTHING REPEATS</span>
                <h2>Some things change everything.</h2>
                <p>
                  Explore the data behind longer lives—and put the 80-year
                  theory to the test.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => navigate('lab')}
              >
                Enter the pattern lab
                <Icon name="arrow" size={17} />
              </button>
            </section>
          </div>
        )}
        {page === 'journeys' && (
          <section className="journeys-page page-enter">
            <div className="page-intro">
              <span className="eyebrow">SMALL JOURNEYS. BIG PERSPECTIVES.</span>
              <h1>
                History takes
                <br />
                <em>unexpected turns.</em>
              </h1>
              <p>
                Three moments. A question. A connection you might never have
                noticed.
              </p>
              <span className="intro-note">
                <Icon name="headphones" size={15} />
                Listen along, or explore at your own pace.
              </span>
            </div>
            <div className="journey-grid">
              {journeys.map((j, i) => (
                <JourneyCard
                  key={j.id}
                  journey={j}
                  index={i}
                  onStart={() => startJourney(j)}
                  completed={completed.includes(j.id)}
                />
              ))}
            </div>
          </section>
        )}
        {page === 'lab' && (
          <Suspense
            fallback={
              <div className="empty-state" role="status">
                <span className="loading-orbit" />
                <p>Finding the patterns…</p>
              </div>
            }
          >
            <PatternLab />
          </Suspense>
        )}
        {page === 'collection' && (
          <section className="collection-page page-enter">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR OWN THREAD THROUGH TIME</span>
                <h1>A cabinet of curiosities.</h1>
              </div>
              <span className="collection-count">
                {validSaved.length} saved moments <b>·</b> {completed.length}{' '}
                journeys explored
              </span>
            </div>
            {validSaved.length ? (
              <div className="collection-grid">
                {validSaved.map((id) => {
                  const m = momentById[id]
                  return (
                    <article
                      key={id}
                      style={
                        {
                          '--moment-color': themes[m.theme].color,
                        } as CSSProperties
                      }
                    >
                      <span className="eyebrow">
                        {momentDate(m)} · {m.region}
                      </span>
                      <h3>{m.title}</h3>
                      <p>{m.hook}</p>
                      <div>
                        <button
                          className="text-button"
                          onClick={() => setDetail(m)}
                        >
                          Revisit
                          <Icon name="arrow" size={15} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Remove ${m.title} from collection`}
                          onClick={() => toggleSave(id)}
                        >
                          <Icon name="bookmark" size={16} />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="collection-empty">
                <ThreadArt kind="sparks" />
                <h2>Keep what makes you wonder.</h2>
                <p>
                  Save any moment with the bookmark.
                  <br />
                  Your discoveries will be waiting here, on this device.
                </p>
                <button
                  className="primary-button"
                  onClick={() => navigate('explore')}
                >
                  Find your first thread
                  <Icon name="arrow" size={17} />
                </button>
              </div>
            )}
            {completed.length > 0 && (
              <>
                <h2 className="completed-heading">Threads you’ve discovered</h2>
                <div className="journey-grid">
                  {journeys
                    .filter((j) => completed.includes(j.id))
                    .map((j, i) => (
                      <JourneyCard
                        key={j.id}
                        journey={j}
                        index={i}
                        onStart={() => startJourney(j)}
                        completed
                      />
                    ))}
                </div>
              </>
            )}
            <p className="small-note collection-privacy">
              Saved in this browser. No account, tracking, or sign-up.
            </p>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <div>
          <span className="footer-brand">historyloom</span>
          <span>
            History doesn’t give us a script. It gives us perspective.
          </span>
        </div>
        <div>
          <button onClick={() => setAbout(true)}>Our approach & sources</button>
          <a href={`${import.meta.env.BASE_URL}index.html`}>
            Original History Loom <Icon name="external" size={12} />
          </a>
          <span>Made for the curious.</span>
        </div>
      </footer>
      {detail && (
        <MomentDialog
          key={detail.id}
          moment={detail}
          saved={saved.includes(detail.id)}
          onSave={() => toggleSave(detail.id)}
          onClose={() => setDetail(null)}
          onFollow={(m) => {
            setSelectedId(m.id)
            setDetail(m)
          }}
        />
      )}
      {journey && (
        <JourneyDialog
          journey={journey}
          completed={completed.includes(journey.id)}
          onClose={() => setJourney(null)}
          onComplete={(id) =>
            setCompleted((v) => (v.includes(id) ? v : [...v, id]))
          }
        />
      )}
      {about && (
        <Modal
          title="Our approach and sources"
          onClose={() => setAbout(false)}
          className="about-dialog"
        >
          <span className="eyebrow">WONDER, WITH THE EVIDENCE IN REACH</span>
          <h2>
            A past worth exploring.
            <br />
            Not a future set in stone.
          </h2>
          <p>
            History Loom is a living atlas of connections. Its {moments.length}{' '}
            curated moments reach across six inhabited continents, from early
            writing to a global pandemic. This is a growing selection, not a
            complete or evenly sampled history of the world.
          </p>
          <div className="about-principles">
            <div>
              <Icon name="book" />
              <h3>Stories have sources.</h3>
              <p>
                Open “the evidence” in any moment for the source and the part a
                short story might miss. Approximate dates are marked. Map points
                locate an anchor, not an event’s entire footprint.
              </p>
            </div>
            <div>
              <Icon name="network" />
              <h3>Echoes are comparisons.</h3>
              <p>
                Map threads link shared editorial themes. Journeys explain both
                the likeness and its limits. Similar tags do not prove a causal
                link or a repeating cycle.
              </p>
            </div>
            <div>
              <Icon name="chart" />
              <h3>Numbers show their workings.</h3>
              <p>
                The lab separates measured life-expectancy estimates from v1’s
                editorial pressure scores and the cycle-selection experiment.
                Missing observations stay missing.
              </p>
            </div>
          </div>
          <details className="evidence">
            <summary>
              Data, artwork & audio credits <Icon name="plus" size={16} />
            </summary>
            <p>
              Life expectancy: Riley, Zijdeman and colleagues, Human Mortality
              Database, and UN World Population Prospects, processed by Our
              World in Data. The lab includes {lifeManifest.countryCount}{' '}
              countries and territories plus World, with{' '}
              {lifeManifest.observationCount.toLocaleString()} observed
              estimates from {lifeManifest.start}–{lifeManifest.end}. Source
              terms and a downloadable snapshot are available in the lab.
            </p>
            <p>
              Coastlines: Natural Earth via world-atlas (public domain). The
              harbor is original AI-generated imagined scenery, not a historical
              reconstruction. Thread illustrations and the optional ambient
              soundscape were created for this app. Narration uses the device’s
              available speech voice; no historical speech is being
              impersonated.
            </p>
            <p>
              Your theme, bookmarks, and completed journeys are stored locally
              in this browser. There is no account, analytics service, or paid
              API call.
            </p>
          </details>
          <div className="about-links">
            <a
              href="https://ourworldindata.org/grapher/life-expectancy"
              target="_blank"
              rel="noreferrer"
            >
              Our World in Data
              <Icon name="external" size={13} />
            </a>
            <a
              href="https://seshatdatabank.info/data"
              target="_blank"
              rel="noreferrer"
            >
              Seshat · a route to deeper historical research
              <Icon name="external" size={13} />
            </a>
            <a href={`${import.meta.env.BASE_URL}index.html`}>
              Visit the original app
              <Icon name="external" size={13} />
            </a>
          </div>
        </Modal>
      )}
    </div>
  )
}
