import { useState } from "react";
import "../styles/OurWork.css";

const pillImages = {
  ring: { src: "/ringpill.png", alt: "Handcrafted Silver Ring" },
  earring: { src: "/earringpill.png", alt: "Natural Ceylon Gemstones" },
  ring2: { src: "/ring2pill.png", alt: "Bespoke Silver Setting" },
};

export default function OurWork() {
  const [activeImg, setActiveImg] = useState(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (img, e) => {
    setActiveImg(img);
    setCoords({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setActiveImg(null);
  };

  return (
    <section className="work-section" id="work">
      {/* Smooth Animated Cursor Follower */}
      <div
        className={`pill-cursor-preview ${activeImg ? "is-visible" : ""}`}
        style={{
          transform: `translate3d(${coords.x + 16}px, ${coords.y + 16}px, 0)`,
        }}
      >
        <div className="preview-card">
          {activeImg && <img src={activeImg.src} alt={activeImg.alt} />}
        </div>
      </div>

      <div className="work-container">
        <h2 className="work-heading">OUR WORK</h2>

        <p className="work-paragraph">
          Artistry meets fine jewelry at Lustria. Every piece is handcrafted
          <span
            className="inline-img-pill"
            onMouseEnter={(e) => handleMouseEnter(pillImages.ring, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img src={pillImages.ring.src} alt={pillImages.ring.alt} />
          </span>
          in solid 925 silver with earth-mined gems,
          <span
            className="inline-img-pill"
            onMouseEnter={(e) => handleMouseEnter(pillImages.earring, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img src={pillImages.earring.src} alt={pillImages.earring.alt} />
          </span>
          blending Ceylon heritage with modern beauty
          <span
            className="inline-img-pill"
            onMouseEnter={(e) => handleMouseEnter(pillImages.ring2, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img src={pillImages.ring2.src} alt={pillImages.ring2.alt} />
          </span>
          to create timeless wearable art.
        </p>

        <div className="work-badges">
          <span className="work-badge">100% Handcrafted</span>
          <span className="work-badge-dot">&bull;</span>
          <span className="work-badge">Natural Certified Gems</span>
          <span className="work-badge-dot">&bull;</span>
          <span className="work-badge">Pure 925 Silver</span>
        </div>
      </div>
    </section>
  );
}
