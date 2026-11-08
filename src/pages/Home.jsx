import OurWork from '../components/OurWork'
import SignatureCreations from '../components/SignatureCreations'
import Benefits from '../components/Benefits'
import Reviews from '../components/Reviews'
import useScrollReveal from '../hooks/useScrollReveal'
import '../styles/Home.css'

export default function Home({ onExplore }) {
  useScrollReveal()

  return (
    <>
      <section className="hero-minimal">
        <div className="hero-content reveal-on-scroll">
          <h1 className="hero-brand-name">Lustria Gem &amp; Jewellery</h1>
          <p className="hero-script-tagline">A gem for everyone</p>
          <p className="hero-subtext">
            Authentic natural gemstones, handcrafted in solid sterling silver.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={onExplore}
            >
              Explore Collection
            </button>
            <a href="#contact" className="btn-outline">
              Custom Order
            </a>
          </div>
        </div>
      </section>

      <div className="reveal-on-scroll">
        <span className="ceperate" aria-hidden="true" />
      </div>

      <div className="reveal-on-scroll">
        <OurWork />
      </div>

      <div className="reveal-on-scroll">
        <span className="ceperate" aria-hidden="true" />
      </div>

      <div className="reveal-on-scroll">
        <SignatureCreations />
      </div>

      <div className="reveal-on-scroll">
        <span className="ceperate" aria-hidden="true" />
      </div>

      <div className="reveal-on-scroll">
        <Benefits />
      </div>

      <div className="reveal-on-scroll">
        <span className="ceperate" aria-hidden="true" />
      </div>

      <div className="reveal-on-scroll">
        <Reviews />
      </div>
    </>
  )
}