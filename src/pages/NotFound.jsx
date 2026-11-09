import { useEffect } from 'react'
import '../styles/NotFound.css'

// Uses the public Lustria navbar/footer from App.jsx, never records analytics.
// This component is also used for non-existent /product/:id routes.
export default function NotFound({ onNavigate }) {
  useEffect(() => {
    const previous = document.title
    document.title = 'Lustria'
    return () => { document.title = previous }
  }, [])

  const followLink = (event, path) => {
    // Preserve opening in a new tab and the browser's normal link behavior.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (typeof onNavigate !== 'function') return
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <section className="l404" aria-labelledby="l404-title">
      <div className="l404-inner">
        <div className="l404-art" aria-hidden="true">
          <span className="l404-trace l404-trace--left" />
          <svg className="l404-gem" viewBox="0 0 112 96" fill="none" aria-hidden="true">
            <path d="M16 30 37 8h38l21 22-40 54L16 30Z" />
            <path d="M16 30h80M37 8l-6 22 25 54 25-54-6-22M31 30h50" />
            <path d="M56 2v-2M5 15l-5-5M107 15l5-5" />
          </svg>
          <span className="l404-trace l404-trace--right" />
        </div>

        <div className="l404-number" aria-hidden="true">404</div>
        <p className="l404-script">A little sparkle went missing</p>
        <h1 id="l404-title">This page couldn't be found.</h1>
        <p className="l404-description">
          The piece or page you were looking for may have moved.
          There are still beautiful things to discover at Lustria.
        </p>

        <div className="l404-actions">
          <a className="l404-btn l404-btn--primary" href="/collection" onClick={(event) => followLink(event, '/collection')}>
            Explore Collection
          </a>
          <a className="l404-btn l404-btn--secondary" href="/" onClick={(event) => followLink(event, '/')}>
            Back to Home
          </a>
        </div>
      </div>
    </section>
  )
}
