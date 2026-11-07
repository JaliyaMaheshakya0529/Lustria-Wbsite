import { useState, useEffect } from 'react'
import '../styles/Navbar.css'

const categories = [
  { name: 'Rings', path: '#rings' },
  { name: 'Earrings', path: '#earrings' },
  { name: 'Necklaces', path: '#necklaces' },
  { name: 'Gemstones', path: '#gemstones' }
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <a href="/" className="nav-brand" onClick={closeMenu}>
        <img src="./public/logo.png" alt="Lustria Logo" className="nav-brand-logo" />
      </a>

      {/* Nav Menu Links */}
      <nav>
        <ul className={`nav-links ${mobileMenuOpen ? 'is-open' : ''}`}>
          <li className="nav-item">
            <a href="#home" className="nav-link" onClick={closeMenu}>Home</a>
          </li>

          <li className="nav-item dropdown-item">
            <a href="#collection" className="nav-link" onClick={closeMenu}>
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
                  <a href={item.path} className="dropdown-link" onClick={closeMenu}>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li className="nav-item">
            <a href="#about" className="nav-link" onClick={closeMenu}>About</a>
          </li>
        </ul>
      </nav>

      {/* Right Actions: CTA + Hamburger Button */}
      <div className="nav-actions">
        <a href="#contact" className="nav-cta" onClick={closeMenu}>Inquire</a>

        <button 
          className="mobile-toggle" 
          type="button" 
          aria-label="Toggle Navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}