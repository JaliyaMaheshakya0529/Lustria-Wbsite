import '../styles/Navbar.css'

export default function Navbar() {
  const collectionCategories = [
    { name: 'Rings', path: '#rings' },
    { name: 'Earrings', path: '#earrings' },
    { name: 'Necklaces', path: '#necklaces' },
    { name: 'Gemstones', path: '#gemstones' }
  ]

  return (
    <header className="navbar">
      {/* Brand Logo */}
      <a href="/" className="nav-brand">
        {/* <img src="/logo.png" alt="Lustria Logo" height="28" /> */}
        Lustria
      </a>

      {/* Nav Menu */}
      <nav>
        <ul className="nav-links">
          <li className="nav-item">
            <a href="#home" className="nav-link">Home</a>
          </li>

          {/* Clickable Dropdown trigger */}
          <li className="nav-item dropdown-item">
            <a href="#collection" className="nav-link dropdown-trigger">
              Collection
              <svg 
                className="dropdown-chevron" 
                viewBox="0 0 24 24" 
                fill="none" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </a>

            <ul className="dropdown-menu">
              {collectionCategories.map((cat) => (
                <li key={cat.name}>
                  <a href={cat.path} className="dropdown-link">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li className="nav-item">
            <a href="#custom" className="nav-link">Custom Designs</a>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-link">About</a>
          </li>
        </ul>
      </nav>

      {/* CTA Button */}
      <div className="nav-actions">
        <a href="#contact" className="nav-cta">Inquire</a>
      </div>
    </header>
  )
}