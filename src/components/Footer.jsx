import '../styles/Footer.css'

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" id="contact">
      <div className="footer-content">
        <div className="footer-col">
          <h4>Lustria Gem &amp; Jewellery</h4>
          <p>Handcrafted natural gemstones and bespoke sterling silver jewelry designed with precision and elegance.</p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="/collection?category=Gemstones" onClick={(event) => { event.preventDefault(); onNavigate?.('/collection', 'Gemstones') }}>Natural Sapphires</a></li>
            <li><a href="/collection?category=Rings" onClick={(event) => { event.preventDefault(); onNavigate?.('/collection', 'Rings') }}>Custom Rings</a></li>
            <li><a href="/collection?category=Necklaces" onClick={(event) => { event.preventDefault(); onNavigate?.('/collection', 'Necklaces') }}>Pendants &amp; Bands</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Connect</h4>
          <ul>
            <li><a href="#contact">WhatsApp Support</a></li>
            <li><a href="#contact">Custom Inquiries</a></li>
            <li><a href="#contact">Ja-Ela, Sri Lanka</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Lustria. All rights reserved.</p>
        <p>Crafted with Natural Gemstones</p>
      </div>
    </footer>
  )
}