import '../styles/OurWork.css'

export default function OurWork() {
  return (
    <section className="work-section" id="work">
      <div className="work-container">
        <h2 className="work-heading">Our Work</h2>
        <div className="work-accent-line" aria-hidden="true" />
        <p className="work-paragraph">
          Find out about the best in jewelry design at Lustria. Each and every one of our jewelry pieces is handcrafted by our master craftsmen using top-quality 925 sterling silver and hand-picked natural gemstones. With the fusion of the Ceylon methods and modern aesthetics, we have created some beautiful designs for you.
        </p>
        <div className="work-badges">
          <span className="work-badge">100% Handcrafted</span>
          <span className="work-badge-sep">&bull;</span>
          <span className="work-badge">Natural Certified Gems</span>
          <span className="work-badge-sep">&bull;</span>
          <span className="work-badge">Solid 925 Silver</span>
        </div>
      </div>
    </section>
  )
}