import { useState } from 'react'
import { Modal } from './Modal'
import { Icon } from './Icon'
import { ThreadArt } from './ThreadArt'
import { momentById, moments } from './content'
import { momentDate, relatedMoments, themes, yearDistance } from './engine'
import { useNarration } from './useExperience'
import type { Journey, Moment } from './types'

export function MomentDialog({
  moment,
  saved,
  onSave,
  onClose,
  onFollow,
}: {
  moment: Moment
  saved: boolean
  onSave: () => void
  onClose: () => void
  onFollow: (moment: Moment) => void
}) {
  const narration = useNarration()
  const related = relatedMoments(moment, moments).slice(0, 3)
  return (
    <Modal title={moment.title} onClose={onClose} className="moment-dialog">
      <div
        className="moment-dialog-art"
        style={{ color: themes[moment.theme].color }}
      >
        <ThreadArt
          kind={
            moment.theme === 'connection'
              ? 'networks'
              : moment.theme === 'freedom'
                ? 'voices'
                : moment.theme === 'survival'
                  ? 'survival'
                  : 'sparks'
          }
        />
        <span className="art-year">{momentDate(moment)}</span>
        <span className="eyebrow">{moment.place}</span>
      </div>
      <div className="moment-dialog-body">
        <span className="eyebrow" style={{ color: themes[moment.theme].color }}>
          {themes[moment.theme].label}
        </span>
        <h2>{moment.title}</h2>
        <p className="story-hook">{moment.hook}</p>
        <div className="story-actions">
          <button
            className="text-button"
            onClick={() =>
              narration.speak(
                `${moment.title}. ${moment.hook} ${moment.story} ${moment.consequence} One thing to remember. ${moment.caution}`,
              )
            }
          >
            <Icon
              name={narration.speaking ? 'pause' : 'headphones'}
              size={17}
            />
            {narration.speaking ? 'Stop narration' : 'Listen to this moment'}
          </button>
          <button
            className={`text-button ${saved ? 'is-saved' : ''}`}
            aria-pressed={saved}
            onClick={onSave}
          >
            <Icon name={saved ? 'check' : 'bookmark'} size={17} />
            {saved ? 'Saved' : 'Save moment'}
          </button>
        </div>
        {narration.error && (
          <p role="status" className="small-note">
            {narration.error}
          </p>
        )}
        <p className="story-text">{moment.story}</p>
        <div className="revelation">
          <Icon name="spark" />
          <div>
            <span className="eyebrow">WHAT CHANGED</span>
            <p>{moment.consequence}</p>
          </div>
        </div>
        <details className="evidence">
          <summary>
            The evidence & the bigger picture <Icon name="plus" size={16} />
          </summary>
          <p>{moment.caution}</p>
          <p className="small-note">
            Date{moment.approximate ? ' approximate' : ''}; location is an
            illustrative anchor. The connections below use shared editorial
            tags, not proof of causation.
          </p>
          {moment.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
              {s.title}
              <Icon name="external" size={14} />
            </a>
          ))}
          <span className="small-note">
            Sources consulted September 2026 · device voice narration
          </span>
        </details>
        {related.length > 0 && (
          <div className="related-moments">
            <span className="eyebrow">FOLLOW AN ECHO</span>
            {related.map(({ moment: other, shared }) => (
              <button
                key={other.id}
                onClick={() => {
                  narration.stop()
                  onFollow(other)
                }}
              >
                <span>
                  <small>
                    {yearDistance(moment.year, other.year).toLocaleString()}{' '}
                    years apart · {shared.join(' + ')}
                  </small>
                  <strong>{other.title}</strong>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

export function JourneyDialog({
  journey,
  onClose,
  onComplete,
  completed,
}: {
  journey: Journey
  onClose: () => void
  onComplete: (id: string) => void
  completed: boolean
}) {
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const narration = useNarration()
  const stops = journey.stops.map((id) => momentById[id])
  const moment = stops[Math.min(step, stops.length - 1)]
  const reveal = step === stops.length
  const changeStep = (next: number) => {
    narration.stop()
    setStep(next)
  }
  return (
    <Modal title={journey.title} onClose={onClose} className="journey-dialog">
      <aside
        className="journey-scene"
        style={{ color: themes[journey.theme].color }}
      >
        <span className="eyebrow">A JOURNEY THROUGH TIME</span>
        <h2>{journey.title}</h2>
        <ThreadArt kind={journey.art} />
        <div className="journey-stop-list">
          {stops.map((stop, i) => (
            <button
              key={stop.id}
              className={step === i ? 'current' : step > i ? 'visited' : ''}
              onClick={() => changeStep(i)}
            >
              <span className="stop-dot">
                {step > i ? <Icon name="check" size={12} /> : i + 1}
              </span>
              <span>
                <small>{momentDate(stop)}</small>
                {stop.place}
              </span>
            </button>
          ))}
          <button
            className={reveal ? 'current' : ''}
            onClick={() => changeStep(stops.length)}
          >
            <span className="stop-dot">
              <Icon name="spark" size={12} />
            </span>
            <span>
              <small>THE REVEAL</small>Find the thread
            </span>
          </button>
        </div>
        <p className="scene-note">
          An editorial journey. Similarities worth exploring, differences worth
          keeping.
        </p>
      </aside>
      <div className="journey-body" key={step}>
        <div className="journey-progress">
          {Array.from({ length: stops.length + 1 }, (_, i) => (
            <span key={i} className={i <= step ? 'filled' : ''} />
          ))}
          <small>
            {step + 1} / {stops.length + 1}
          </small>
        </div>
        {!reveal ? (
          <>
            <span className="eyebrow">
              {momentDate(moment)} <span className="quiet">/</span>{' '}
              {moment.place}
            </span>
            <h3>{moment.title}</h3>
            <p className="story-hook">{moment.hook}</p>
            <button
              className="text-button"
              onClick={() =>
                narration.speak(
                  `${moment.title}. ${moment.hook} ${moment.story} ${moment.consequence}`,
                )
              }
            >
              <Icon
                name={narration.speaking ? 'pause' : 'headphones'}
                size={17}
              />
              {narration.speaking ? 'Stop narration' : 'Listen to this story'}
            </button>
            {narration.error && (
              <p role="status" className="small-note">
                {narration.error}
              </p>
            )}
            <p className="story-text">{moment.story}</p>
            <div className="revelation">
              <Icon name="spark" />
              <p>{moment.consequence}</p>
            </div>
            <details className="evidence">
              <summary>
                Look a little closer <Icon name="plus" size={15} />
              </summary>
              <p>{moment.caution}</p>
              {moment.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                  <Icon name="external" size={14} />
                </a>
              ))}
            </details>
            <div className="journey-bottom">
              <span>
                {step < stops.length - 1
                  ? `${moment.approximate || stops[step + 1].approximate ? 'About ' : ''}${yearDistance(moment.year, stops[step + 1].year).toLocaleString()} years later…`
                  : 'Compare these moments.'}
              </span>
              <button
                className="primary-button"
                onClick={() => changeStep(step + 1)}
              >
                {step === stops.length - 1
                  ? 'Find the connection'
                  : 'Travel onward'}
                <Icon name="arrow" size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="eyebrow">THE CONNECTION</span>
            <h3>{journey.question}</h3>
            <div className="answer-options">
              {journey.options.map((option, i) => (
                <button
                  key={option}
                  aria-pressed={answer === i}
                  className={answer === i ? 'chosen' : ''}
                  onClick={() => {
                    setAnswer(i)
                    onComplete(journey.id)
                  }}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  {option}
                  {answer === i && (
                    <Icon
                      name={i === journey.answer ? 'check' : 'spark'}
                      size={17}
                    />
                  )}
                </button>
              ))}
            </div>
            {answer !== null && (
              <div className="answer-reveal" role="status">
                <span className="eyebrow">
                  {answer === journey.answer
                    ? 'YOU FOUND THE THREAD'
                    : 'HERE’S THE INTERESTING PART'}
                </span>
                <p>{journey.explanation}</p>
                <div className="rhyme-difference">
                  <div>
                    <Icon name="network" />
                    <h4>What echoes</h4>
                    <p>{journey.rhyme}</p>
                  </div>
                  <div>
                    <Icon name="spark" />
                    <h4>What changes</h4>
                    <p>{journey.difference}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="journey-bottom">
              <span>
                {completed
                  ? 'Journey added to your collection.'
                  : 'A pattern is an invitation to ask better questions.'}
              </span>
              <button className="primary-button" onClick={onClose}>
                Back to the world
                <Icon name="globe" size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
