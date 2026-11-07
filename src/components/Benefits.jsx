import '../styles/Benefits.css'

export default function Benefits() {
  return (
    <section className="benefits-section">
      <div className="benefits-header">
        <h2 className="benefits-heading">Uncompromising Standards</h2>
        <p className="benefits-sub">
          Every natural gemstone and silver setting crafted with timeless heritage techniques.
        </p>
      </div>

      <div className="benefits-container">
        <div className="bento-card card-wide">
          <div>
            <span className="bento-tag">Natural Origin</span>
            <h3 className="bento-title">Certified Ethically-Sourced Gemstones</h3>
            <p className="bento-desc">
              Unique hand-picked sapphires, emeralds, and natural gemstones certified to be genuine and unenhanced.
            </p>
          </div>
        </div>

        <div className="bento-card card-compact">
          <div>
            <span className="bento-tag">Purity</span>
            <h3 className="bento-title">Solid 925 Silver</h3>
            <p className="bento-desc">
              Hypoallergenic sterling silver with an ultra-high-gloss anti-tarnish protective coating.
            </p>
          </div>
        </div>

        <div className="bento-card card-half">
          <div>
            <span className="bento-tag">Custom Finishes</span>
            <h3 className="bento-title">Master Handcrafting</h3>
            <p className="bento-desc">
              Precise hand-set prongs with bezel settings designed for long-lasting wear without stone slipping out.
            </p>
          </div>
        </div>

        <div className="bento-card card-half">
          <div>
            <span className="bento-tag">Client Trust</span>
            <h3 className="bento-title">Bespoke Excellence</h3>
            <p className="bento-desc">
              Custom sizing and jewel settings loved by collectors around the world.
            </p>
          </div>
          <div className="bento-stars">★★★★★</div>
        </div>
      </div>
    </section>
  )
}