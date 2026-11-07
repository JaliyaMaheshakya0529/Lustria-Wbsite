import '../styles/Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <p className="hero-subtitle">Authentic & Certified</p>
        <h1 className="hero-title">Timeless Natural Gemstones & Fine Silver</h1>
        <p className="hero-description">
          Discover hand-selected Ceylon sapphires, custom settings, and artisan silver jewelry tailored to your story.
        </p>
        <div className="hero-buttons">
          <a href="#collection" className="btn-primary">View Collection</a>
          <a href="#custom" className="btn-secondary">Request Custom Piece</a>
        </div>
      </section>
    </div>
  )
}