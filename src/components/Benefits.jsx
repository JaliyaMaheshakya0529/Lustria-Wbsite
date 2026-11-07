import '../styles/Benefits.css'

export default function Benefits() {
  return (
    <section class="benefits-section">
  <div class="benefits-header">
    <h2 class="benefits-heading">Uncompromising Standards</h2>
    <p class="benefits-sub">Every natural gemstone and silver setting crafted with timeless heritage techniques.</p>
  </div>

  <div class="benefits-container">
    {/* <!-- Featured Wide Card (Span 4) --> */}
    <div class="bento-card card-wide">
      <div>
        <span class="bento-tag">Natural Origin</span>
        <h3 class="bento-title">Certified Ethically-Sourced Gemstones</h3>
        <p class="bento-desc">Unique hand-picked sapphires, emeralds, and natural gemstones certified to be genuine and unenhanced.</p>
      </div>
    </div>

    {/* <!-- Compact Card (Span 2) --> */}
    <div class="bento-card card-compact">
      <div>
        <span class="bento-tag">Purity</span>
        <h3 class="bento-title">Solid 925 Silver</h3>
        <p class="bento-desc">Hypoallergenic sterling silver with an ultra-high-gloss anti-tarnish protective coating.</p>
      </div>
    </div>

    {/* <!-- Half Card (Span 3) --> */}
    <div class="bento-card card-half">
      <div>
        <span class="bento-tag">Custom Finishes</span>
        <h3 class="bento-title">Master Handcrafting</h3>
        <p class="bento-desc">Precise hand-set prongs with bezel settings designed for long-lasting wear without stone slipping out.</p>
      </div>
    </div>

    {/* /z */}
    <div class="bento-card card-half">
      <div>
        <span class="bento-tag">Client Trust</span>
        <h3 class="bento-title">Bespoke Excellence</h3>
        <p class="bento-desc">Custom sizing and jewel settings loved by collectors around the world.</p>
      </div>
      <div class="bento-stars">★★★★★</div>
    </div>
  </div>
</section>
  )
}