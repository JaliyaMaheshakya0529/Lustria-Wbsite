import "../styles/SignatureCreations.css";

const signaturePieces = [
  {
    id: 1,
    title: "Ceylon Blue Sapphire Ring",
    metal: "Solid 925 Sterling Silver",
    price: "LKR 48,000",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 2,
    title: "Padparadscha Halo Solitaire",
    metal: "Solid 925 Sterling Silver",
    price: "LKR 54,000",
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    title: "Cushion Cut Citrine Pendant",
    metal: "Solid 925 Sterling Silver",
    price: "LKR 32,500",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 4,
    title: "Emerald Cut Topaz Band",
    metal: "Solid 925 Sterling Silver",
    price: "LKR 28,000",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80",
  },
];

export default function SignatureCreations() {
  return (
    <section className="signatures-section" id="collection">
      <div className="signatures-container">
        {/* Clean Header */}
        <div className="signatures-header">
          <h2 className="signatures-heading">SIGNATURE CREATIONS</h2>
          <p className="signatures-sub">
            Handcrafted Ceylon gems and bespoke sterling silver settings.
          </p>
        </div>

        {/* 4-Item 1:1 Grid */}
        <div className="signatures-grid">
          {signaturePieces.map((piece) => (
            <article key={piece.id} className="signature-card">
              <div className="signature-image-box">
                <img src={piece.image} alt={piece.title} loading="lazy" />
              </div>

              <div className="signature-info">
                <span className="signature-metal">{piece.metal}</span>
                <h3 className="signature-title">{piece.title}</h3>
                <span className="signature-price">{piece.price}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Collection Action */}
        <div className="signatures-action">
          <a href="#all" className="btn-signatures-view">
            View All Pieces
          </a>
        </div>
      </div>
    </section>
  );
}
