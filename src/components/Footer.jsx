import { contactLink, customOrderLink } from '../utils/inquiries'
import { followLink } from '../utils/navigation'
import '../styles/Footer.css'

const currentYear = new Date().getFullYear()
const categories = [
  ['Gemstones', 'Natural Sapphires'],
  ['Rings', 'Custom Rings'],
  ['Necklaces', 'Pendants & Bands'],
]

export default function Footer({ onNavigate }) {
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
            {categories.map(([category, label]) => (
              <li key={category}>
                <a href={`/collection?category=${category}`}
                  onClick={(event) => followLink(event, () => onNavigate('/collection', category))}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Connect</h4>
          <ul>
            {contactLink && <li><a href={contactLink} target="_blank" rel="noopener noreferrer">WhatsApp Support</a></li>}
            {customOrderLink && <li><a href={customOrderLink} target="_blank" rel="noopener noreferrer">Custom Inquiries</a></li>}
            <li>Ja-Ela, Sri Lanka</li>
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
