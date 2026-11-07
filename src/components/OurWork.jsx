import '../styles/OurWork.css'

export default function OurWork() {
  return (
    <section className="work-section" id="work">
      <div className="work-container">
        
        <h2 className="work-heading">Our Work</h2>
        
        <div className="work-accent-line" aria-hidden="true" />

        <p className="work-paragraph">
          Discover the pinnacle of fine jewelry craftsmanship at Lustria. Every piece is 
          handcrafted by master artisans using premium 925 sterling silver and hand-selected natural gems. 
          By blending traditional Ceylon techniques with modern elegance, we bring you timeless creations 
          designed to elevate your everyday style and last a lifetime.
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