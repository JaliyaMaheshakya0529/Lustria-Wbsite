import OurWork from "../components/OurWork";
import SignatureCreations from "../components/SignatureCreations";
import Benefits from '../components/Benefits'
import Reviews from '../components/Reviews'
import "../styles/Home.css";

export default function Home() {
  return (
    <>
      <section className="hero-minimal">
        <div className="hero-content">
          <h1 className="hero-brand-name">Lustria Gem &amp; Jewellery</h1>

          <p className="hero-script-tagline">A gem for everyone</p>

          <p className="hero-subtext">
            Authentic natural gemstones, handcrafted in solid sterling silver.
          </p>

          <div className="hero-actions">
            <a href="#collection" className="btn-primary">
              Explore Collection
            </a>
            <a href="#custom" className="btn-outline">
              Custom Order
            </a>
          </div>
        </div>
      </section>

      <span className="ceperate"></span>
      {/* Modern Atelier Work Section */}
      <OurWork />
      <span className="ceperate"></span>
      <SignatureCreations />

      <span className="ceperate"></span>
      <Benefits />

      <span className="ceperate"></span>
      <Reviews />
    </>
  );
}
