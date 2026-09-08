import { Component, StrictMode } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import AtlasApp from './AtlasApp'
import './atlas.css'

class ExperienceBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Atlas error', error, info.componentStack)
  }
  render() {
    return this.state.failed ? (
      <main className="fallback-page">
        <h1>Let’s pick up the thread.</h1>
        <p>
          Something interrupted the atlas. Your saved collection is still on
          this device.
        </p>
        <button onClick={() => window.location.reload()}>
          Reopen the atlas
        </button>
        <a href={`${import.meta.env.BASE_URL}index.html`}>
          Open the original History Loom
        </a>
      </main>
    ) : (
      this.props.children
    )
  }
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceBoundary>
      <AtlasApp />
    </ExperienceBoundary>
  </StrictMode>,
)
