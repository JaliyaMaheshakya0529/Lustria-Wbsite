import { useState, useEffect, useMemo, useRef } from 'react'
import '../styles/Collection.css'

const initialProducts = [
  {
    id: 1,
    title: 'Ceylon Blue Sapphire Ring',
    category: 'Rings',
    gemstone: 'Sapphire',
    metal: 'Solid 925 Sterling Silver',
    price: 48000,
    priceFormatted: 'LKR 48,000',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 2,
    title: 'Padparadscha Halo Solitaire',
    category: 'Rings',
    gemstone: 'Padparadscha',
    metal: 'Solid 925 Sterling Silver',
    price: 54000,
    priceFormatted: 'LKR 54,000',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 3,
    title: 'Cushion Cut Citrine Pendant',
    category: 'Necklaces',
    gemstone: 'Citrine',
    metal: 'Solid 925 Sterling Silver',
    price: 32500,
    priceFormatted: 'LKR 32,500',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 4,
    title: 'Emerald Cut Topaz Band',
    category: 'Rings',
    gemstone: 'Topaz',
    metal: 'Solid 925 Sterling Silver',
    price: 28000,
    priceFormatted: 'LKR 28,000',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 5,
    title: 'Natural Amethyst Solitaire Ring',
    category: 'Rings',
    gemstone: 'Amethyst',
    metal: 'Solid 925 Sterling Silver',
    price: 26000,
    priceFormatted: 'LKR 26,000',
    image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 6,
    title: 'Ceylon Yellow Sapphire Studs',
    category: 'Earrings',
    gemstone: 'Sapphire',
    metal: 'Solid 925 Sterling Silver',
    price: 38000,
    priceFormatted: 'LKR 38,000',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 7,
    title: 'Peridot Teardrop Drop Earrings',
    category: 'Earrings',
    gemstone: 'Peridot',
    metal: 'Solid 925 Sterling Silver',
    price: 29500,
    priceFormatted: 'LKR 29,500',
    image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 8,
    title: 'Natural Garnet Floral Pendant',
    category: 'Necklaces',
    gemstone: 'Garnet',
    metal: 'Solid 925 Sterling Silver',
    price: 34000,
    priceFormatted: 'LKR 34,000',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 9,
    title: 'Loose Faceted Blue Sapphire',
    category: 'Gemstones',
    gemstone: 'Sapphire',
    metal: 'Loose Natural Gemstone',
    price: 65000,
    priceFormatted: 'LKR 65,000',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80'
  }
]

const categories = ['All', 'Rings', 'Earrings', 'Necklaces', 'Gemstones']
const gemstones = ['All', 'Sapphire', 'Padparadscha', 'Citrine', 'Topaz', 'Amethyst', 'Peridot', 'Garnet']

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' }
]

export default function Collection({ initialCategory = 'All', onFilterChange }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedGemstone, setSelectedGemstone] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const sortRef = useRef(null)

  useEffect(() => {
    setSelectedCategory(initialCategory)
  }, [initialCategory])

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    if (onFilterChange) onFilterChange(cat)
  }

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((item) => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
        const matchesGemstone = selectedGemstone === 'All' || item.gemstone === selectedGemstone
        return matchesCategory && matchesGemstone
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        return a.id - b.id
      })
  }, [selectedCategory, selectedGemstone, sortBy])

  const resetFilters = () => {
    handleCategorySelect('All')
    setSelectedGemstone('All')
    setSortBy('featured')
  }

  const activeSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || 'Featured'

  return (
    <section className="shop-section">
      <header className="shop-header">
        <h1 className="shop-heading">The Entire Collection</h1>
        <p className="shop-sub">
          Handcrafted solid 925 sterling silver jewelry set with authentic natural Ceylon gems.
        </p>
      </header>

      <div className="shop-controls-bar">
        <button
          type="button"
          className="btn-filter-mobile"
          onClick={() => setMobileFilterOpen((prev) => !prev)}
          aria-expanded={mobileFilterOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Filters {selectedCategory !== 'All' || selectedGemstone !== 'All' ? '• Active' : ''}
        </button>

        <span className="shop-item-count">
          Showing <strong>{filteredProducts.length}</strong> creations
        </span>

        <div className="shop-sort" ref={sortRef}>
          <span className="shop-sort-label">Sort by:</span>
          <div className="custom-sort-wrapper">
            <button
              type="button"
              className={`custom-sort-trigger ${sortDropdownOpen ? 'is-active' : ''}`}
              onClick={() => setSortDropdownOpen((prev) => !prev)}
              aria-expanded={sortDropdownOpen}
            >
              <span>{activeSortLabel}</span>
              <svg
                className={`custom-sort-chevron ${sortDropdownOpen ? 'is-open' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {sortDropdownOpen && (
              <ul className="custom-sort-menu">
                {sortOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      className={`custom-sort-option ${sortBy === opt.value ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSortBy(opt.value)
                        setSortDropdownOpen(false)
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="shop-layout">
        <aside className={`shop-sidebar ${mobileFilterOpen ? 'is-open' : ''}`}>
          <div className="shop-sidebar-header">
            <h3>Filters</h3>
            <button
              type="button"
              className="shop-close-btn"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close filters"
            >
              &times;
            </button>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Category</h4>
            <div className="filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-pill ${selectedCategory === cat ? 'is-active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Gemstone</h4>
            <div className="filter-pills">
              {gemstones.map((gem) => (
                <button
                  key={gem}
                  type="button"
                  className={`filter-pill ${selectedGemstone === gem ? 'is-active' : ''}`}
                  onClick={() => setSelectedGemstone(gem)}
                >
                  {gem}
                </button>
              ))}
            </div>
          </div>

          {(selectedCategory !== 'All' || selectedGemstone !== 'All') && (
            <button type="button" className="btn-reset-filters" onClick={resetFilters}>
              Reset Filters
            </button>
          )}
        </aside>

        <main className="shop-grid-area">
          {filteredProducts.length === 0 ? (
            <div className="shop-empty">
              <p className="shop-empty-text">No creations match the selected filters.</p>
              <button type="button" className="btn-primary" onClick={resetFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="shop-grid">
              {filteredProducts.map((piece) => (
                <article key={piece.id} className="signature-card">
                  <div className="signature-image-box">
                    <img src={piece.image} alt={piece.title} loading="lazy" />
                  </div>

                  <div className="signature-info">
                    <span className="signature-metal">{piece.metal}</span>
                    <h3 className="signature-title">{piece.title}</h3>
                    <span className="signature-price">{piece.priceFormatted}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  )
}