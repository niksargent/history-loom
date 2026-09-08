import { lazy, Suspense, useState } from 'react'
import { Icon } from './Icon'
const LifeChart = lazy(() => import('./LifeChart'))
const FingerprintLab = lazy(() => import('./FingerprintLab'))
const CycleLab = lazy(() => import('./CycleLab'))
export default function PatternLab() {
  const [tab, setTab] = useState('life')
  return (
    <section className="pattern-lab page-enter">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FOLLOW YOUR CURIOSITY FURTHER</span>
          <h1>Look beneath the story.</h1>
        </div>
        <p>Less guesswork. More discovery.</p>
      </div>
      <div className="lab-tabs" role="tablist" aria-label="Pattern experiments">
        {[
          { id: 'life', icon: 'leaf', name: 'Lives getting longer' },
          {
            id: 'fingerprints',
            icon: 'network',
            name: 'History’s fingerprints',
          },
          { id: 'cycles', icon: 'route', name: 'The 80-year idea' },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            aria-controls={`lab-${t.id}`}
            id={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            onKeyDown={(event) => {
              const ids = ['life', 'fingerprints', 'cycles']
              const index = ids.indexOf(t.id)
              const next =
                event.key === 'ArrowRight'
                  ? ids[(index + 1) % 3]
                  : event.key === 'ArrowLeft'
                    ? ids[(index + 2) % 3]
                    : event.key === 'Home'
                      ? ids[0]
                      : event.key === 'End'
                        ? ids[2]
                        : null
              if (next) {
                event.preventDefault()
                setTab(next)
                document.getElementById(`tab-${next}`)?.focus()
              }
            }}
          >
            <Icon name={t.icon} size={18} />
            {t.name}
          </button>
        ))}
      </div>
      <div
        className="lab-panel"
        role="tabpanel"
        id={`lab-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        <Suspense
          fallback={
            <div className="empty-state" role="status">
              Preparing your window into the data…
            </div>
          }
        >
          {tab === 'life' ? (
            <LifeChart />
          ) : tab === 'fingerprints' ? (
            <FingerprintLab />
          ) : (
            <CycleLab />
          )}
        </Suspense>
      </div>
    </section>
  )
}
