import { useState, useEffect } from 'react'
import '../styles/Navbar.css'

const categories = [
  { name: 'Rings', filter: 'Rings' },
  { name: 'Earrings', filter: 'Earrings' },
  { name: 'Necklaces', filter: 'Necklaces' },
  { name: 'Gemstones', filter: 'Gemstones' }
]

export default function Navbar({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined
    const handleKeydown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    const handleResize = () => {
      if (window.innerWidth > 868) setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('resize', handleResize)
    }
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  const handleNavigate = (path, category = null, section = null) => {
    closeMenu()
    onNavigate?.(path, category, section)
  }

  return (
    <header className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <a
        href="/"
        className="nav-brand"
        onClick={(e) => {
          e.preventDefault()
          handleNavigate('/')
        }}
      >
        <img src="/Logo.png" alt="Lustria Logo" className="nav-brand-logo" />
      </a>

      <button
        type="button"
        className={`nav-menu-backdrop ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-label="Close navigation menu"
        aria-hidden={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={closeMenu}
      />
      <nav aria-label="Main navigation">
        <ul id="mobile-nav-links" className={`nav-links ${mobileMenuOpen ? 'is-open' : ''}`}>
          <li className="nav-item">
            <a
              href="/"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavigate('/')
              }}
            >
              Home
            </a>
          </li>

          <li className="nav-item dropdown-item">
            <a
              href="/collection"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavigate('/collection', 'All')
              }}
            >
              Collection
              <svg
                className="dropdown-chevron"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>

            <ul className="dropdown-menu">
              {categories.map((item) => (
                <li key={item.name}>
                  <a
                    href={`/collection?category=${encodeURIComponent(item.filter)}`}
                    className="dropdown-link"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigate('/collection', item.filter)
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li className="nav-item">
            <a
              href="/#work"
              className="nav-link"
              onClick={(event) => {
                event.preventDefault()
                handleNavigate('/', null, 'work')
              }}
            >
              About
            </a>
          </li>
        </ul>
      </nav>

      <div className="nav-actions">
        <a
          href="#contact"
          className="nav-cta"
          onClick={(event) => {
            event.preventDefault()
            closeMenu()
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          Inquire
        </a>

        <button
          className="mobile-toggle"
          type="button"
          aria-controls="mobile-nav-links"
          aria-label="Toggle Navigation"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}