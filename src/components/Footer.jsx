import '../styles/Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h4>Lustria Gem & Jewellery</h4>
          <p>Handcrafted natural gemstones and bespoke sterling silver jewelry designed with precision and elegance.</p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="#catalog">Natural Sapphires</a></li>
            <li><a href="#catalog">Custom Rings</a></li>
            <li><a href="#catalog">Pendants & Bands</a></li>
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