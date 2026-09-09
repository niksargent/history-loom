import { useCallback, useEffect, useRef, useState } from 'react'

export function readStored<T>(key: string, fallback: T): T {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(`loom-atlas:${key}`) ?? 'null',
    )
    if (Array.isArray(fallback))
      return (
        Array.isArray(value) && value.every((item) => typeof item === 'string')
          ? value
          : fallback
      ) as T
    if (key === 'theme' && value !== 'light' && value !== 'dark')
      return fallback
    return typeof value === typeof fallback && value !== null
      ? (value as T)
      : fallback
  } catch {
    return fallback
  }
}
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initial))
  useEffect(() => {
    try {
      localStorage.setItem(`loom-atlas:${key}`, JSON.stringify(value))
    } catch {
      /* Private browsing can disable persistence. */
    }
  }, [key, value])
  return [value, setValue] as const
}
export function useNarration() {
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    utterance.current = null
    setSpeaking(false)
  }, [])
  useEffect(
    () => () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    },
    [],
  )
  const speak = (text: string) => {
    if (speaking) {
      stop()
      return
    }
    if (!('speechSynthesis' in window)) {
      setError(
        'Narration is unavailable in this browser. The full story is shown below.',
      )
      return
    }
    setError('')
    window.speechSynthesis.cancel()
    const speech = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    speech.voice =
      voices.find(
        (v) =>
          v.lang === 'en-GB' && /natural|online|female|sonia/i.test(v.name),
      ) ??
      voices.find((v) => v.lang === 'en-GB') ??
      voices.find((v) => v.lang.startsWith('en')) ??
      null
    speech.lang = 'en-GB'
    speech.rate = 0.91
    speech.pitch = 1
    speech.onend = () => {
      if (utterance.current === speech) setSpeaking(false)
    }
    speech.onerror = (event) => {
      if (utterance.current !== speech) return
      setSpeaking(false)
      if (event.error !== 'interrupted' && event.error !== 'canceled')
        setError(
          'This device could not play narration. You can still read the complete story.',
        )
    }
    utterance.current = speech
    setSpeaking(true)
    window.speechSynthesis.speak(speech)
  }
  return { speaking, speak, stop, error }
}
export function useAmbient() {
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const context = useRef<AudioContext | null>(null)
  useEffect(
    () => () => {
      void context.current?.close()
    },
    [],
  )
  const toggle = async () => {
    if (context.current) {
      await context.current.close()
      context.current = null
      setPlaying(false)
      return
    }
    try {
      const audio = new AudioContext()
      await audio.resume()
      const master = audio.createGain()
      master.gain.value = 0.035
      master.connect(audio.destination)
      // A quiet original ambient chord; no autoplay, recordings, or network requests.
      ;[110, 164.81, 220.3, 293.66, 329.63].forEach((frequency, i) => {
        const oscillator = audio.createOscillator()
        oscillator.type = 'sine'
        oscillator.frequency.value = frequency
        const gain = audio.createGain()
        gain.gain.value = 0.1
        const lfo = audio.createOscillator()
        lfo.frequency.value = 0.06 + i * 0.012
        const modulation = audio.createGain()
        modulation.gain.value = 0.055
        lfo.connect(modulation)
        modulation.connect(gain.gain)
        oscillator.connect(gain)
        gain.connect(master)
        oscillator.start()
        lfo.start()
      })
      context.current = audio
      setPlaying(true)
      setError('')
    } catch {
      setError('Ambient audio is unavailable in this browser.')
    }
  }
  return { playing, toggle, error }
}
