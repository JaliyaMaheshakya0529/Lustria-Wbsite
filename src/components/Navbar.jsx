import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles/Navbar.css'

const categories = [
  { name: 'Rings', filter: 'Rings' },
  { name: 'Earrings', filter: 'Earrings' },
  { name: 'Necklaces', filter: 'Necklaces' },
  { name: 'Gemstones', filter: 'Gemstones' }
]

function Chevron({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function Navbar({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 20)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false)

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 20)
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent('lustria:scroll-lock', { detail: { locked: true } }))

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        setMobileCollectionOpen(false)
      }
    }
    const onResize = () => {
      if (window.innerWidth > 868) {
        setMobileMenuOpen(false)
        setMobileCollectionOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      window.dispatchEvent(new CustomEvent('lustria:scroll-lock', { detail: { locked: false } }))
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [mobileMenuOpen])

  const closeMenu = () => {
    setMobileMenuOpen(false)
    setMobileCollectionOpen(false)
  }

  const navigate = (path, category = null, section = null) => {
    closeMenu()
    onNavigate?.(path, category, section)
  }

  const go = (event, path, category = null, section = null) => {
    // Normal browser link behavior is preserved with modifier keys.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    navigate(path, category, section)
  }

  const mobileMenu = mobileMenuOpen && typeof document !== 'undefined' && createPortal(
    <div className={`mobile-nav-layer ${isScrolled ? 'is-scrolled' : ''}`}>
      <button type="button" className="mobile-nav-backdrop"
        aria-label="Close navigation" onClick={closeMenu} tabIndex={-1} />
      <nav id="mobile-nav-links" className="mobile-nav-panel"
        aria-label="Mobile navigation" data-lenis-prevent>
        <a href="/" className="mobile-nav-link" onClick={(e) => go(e, '/')}>Home</a>

        <div className="mobile-nav-collection">
          <div className="mobile-collection-row">
            <a href="/collection" className="mobile-collection-link"
              onClick={(e) => go(e, '/collection', 'All')}>Collection</a>
            <button type="button" className={`mobile-collection-toggle ${mobileCollectionOpen ? 'is-active' : ''}`}
              aria-label={mobileCollectionOpen ? 'Close collection categories' : 'Open collection categories'}
              aria-controls="mobile-collection-submenu" aria-expanded={mobileCollectionOpen}
              onClick={() => setMobileCollectionOpen((open) => !open)}>
              <Chevron className="mobile-collection-chevron" />
            </button>
          </div>
          {mobileCollectionOpen && (
            <ul className="mobile-collection-submenu" id="mobile-collection-submenu">
              {categories.map(({ name, filter }) => (
                <li key={name}>
                  <a className="mobile-category-link"
                    href={`/collection?category=${encodeURIComponent(filter)}`}
                    onClick={(e) => go(e, '/collection', filter)}>{name}</a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <a href="/#work" className="mobile-nav-link"
          onClick={(e) => go(e, '/', null, 'work')}>About</a>
      </nav>
    </div>,
    document.body
  )

  return (
    <>
      <header className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
        {/* Navbar's blur is ONLY on its glass layer, never on a dropdown ancestor. */}
        <span className="nav-glass" aria-hidden="true" />
        <a href="/" className="nav-brand" onClick={(e) => go(e, '/')}>
          <img src="/logo.png" className="nav-brand-logo" alt="Lustria" />
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <ul className="nav-links">
            <li className="nav-item">
              <a href="/" className="nav-link" onClick={(e) => go(e, '/')}>Home</a>
            </li>
            <li className="nav-item dropdown-item">
              <a href="/collection" className="nav-link desktop-collection-link"
                onClick={(e) => go(e, '/collection', 'All')}>
                Collection <Chevron className="dropdown-chevron" />
              </a>
              <ul className="dropdown-menu">
                {categories.map(({ name, filter }) => (
                  <li key={name}>
                    <a className="dropdown-link"
                      href={`/collection?category=${encodeURIComponent(filter)}`}
                      onClick={(e) => go(e, '/collection', filter)}>{name}</a>
                  </li>
                ))}
              </ul>
            </li>
            <li className="nav-item">
              <a href="/#work" className="nav-link"
                onClick={(e) => go(e, '/', null, 'work')}>About</a>
            </li>
          </ul>
        </nav>

        <div className="nav-actions">
          <a href="/#contact" className="nav-cta"
            onClick={(e) => go(e, '/', null, 'contact')}>Inquire</a>
          <button type="button" className="mobile-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-controls="mobile-nav-links" aria-expanded={mobileMenuOpen}
            onClick={() => {
              setMobileMenuOpen((open) => !open)
              setMobileCollectionOpen(false)
            }}>
            {mobileMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </header>
      {mobileMenu}
    </>
  )
}
