
import React, { useEffect, useRef, useState } from "react";
import "../styles/AdminProductViews.css";

const VIEW_OPTIONS = [
  { id: "rows", label: "Rows" },
  { id: "cards", label: "Cards" },
  { id: "compact", label: "Compact" },
];

const money = (price) =>
  `LKR ${Number(price || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  })}`;

function ViewIcon({ type }) {
  if (type === "cards") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" width="17" height="17">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" width="17" height="17">
      {[5, 12, 19].map((y) => (
        <React.Fragment key={y}>
          <rect x="3" y={y - 2} width="4" height="4" rx=".5" />
          <path d={`M10 ${y}H21`} />
        </React.Fragment>
      ))}
    </svg>
  );
}

export default function AdminProductViews({
  products,
  loading = false,
  featuredBusy = {},
  onFeature,
  onEdit,
  onDelete,
  onAdd,
}) {
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("lustria-admin-product-view") || "rows";
    } catch {
      return "rows";
    }
  });

  const scrollRef = useRef(null);

  const changeView = (next) => {
    setView(next);
    try {
      localStorage.setItem("lustria-admin-product-view", next);
    } catch {
      // Storage may be unavailable in private browsing.
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [view]);

  return (
    <div className="lapv-root">
      <div className="lapv-toolbar">
        <div className="lapv-toolbar-label">
          <strong>Display</strong>
          <span>{products.length} products</span>
        </div>

        <div className="lapv-view-switcher" role="group"
          aria-label="Product display mode">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={view === option.id ? "is-active" : ""}
              aria-pressed={view === option.id}
              onClick={() => changeView(option.id)}
              title={`${option.label} view`}
            >
              <ViewIcon type={option.id} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`lapv-scroll lapv-mode-${view}`}
        tabIndex={0}
        aria-label="Scrollable product collection"
      >
        {loading ? (
          <div className="lapv-empty">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="lapv-empty">
            <h3>No products found</h3>
            <p>Add a product or change your search filters.</p>
            <button type="button" onClick={onAdd}>
              Add Product
            </button>
          </div>
        ) : (
          <div className="lapv-grid">
            {products.map((product) => (
              <article className="lapv-item" key={product._id}>
                <div className="lapv-image">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>

                <div className="lapv-details">
                  <h3 title={product.name}>{product.name}</h3>
                  <p>
                    {product.category}
                    {product.gemstone ? ` · ${product.gemstone}` : ""}
                  </p>
                  <strong>{money(product.price)}</strong>
                </div>

                <div className="lapv-status">
                  <span
                    className={`lapv-availability ${
                      product.available ? "is-available" : "is-hidden"
                    }`}
                  >
                    {product.available ? "Available" : "Hidden"}
                  </span>

                  <button
                    type="button"
                    className={`lapv-feature ${
                      product.featured ? "is-featured" : ""
                    }`}
                    aria-pressed={Boolean(product.featured)}
                    disabled={Boolean(featuredBusy[product._id])}
                    title={
                      product.featured
                        ? "Remove from Signature Creations"
                        : "Add to Signature Creations"
                    }
                    onClick={() => onFeature(product)}
                  >
                    <span aria-hidden="true">★</span>
                    {featuredBusy[product._id]
                      ? "Saving..."
                      : product.featured
                        ? "Featured"
                        : "Feature"}
                  </button>
                </div>

                <div className="lapv-actions">
                  <button
                    type="button"
                    className="lapv-edit"
                    onClick={() => onEdit(product)}
                    aria-label={`Edit ${product.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="lapv-delete"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.name}`}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="lapv-footer">
        <span>
          Showing {products.length} product
          {products.length === 1 ? "" : "s"}
        </span>
        <span>Scroll to browse collection</span>
      </div>
    </div>
  );
}
