
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import useScrollReveal from "../hooks/useScrollReveal";
import "../styles/Collection.css";

const categories = [
  "All",
  "Rings",
  "Earrings",
  "Necklaces",
  "Bracelets",
  "Gemstones",
];

const gemstones = [
  "All",
  "Blue Sapphire",
  "Yellow Sapphire",
  "Pink Sapphire",
  "White Sapphire",
  "Padparadscha",
  "Topaz",
  "Amethyst",
  "Garnet",
  "Citrine",
  "Peridot",
  "Tourmaline",
  "Cat's Eye",
  "Pearl",
  "Other",
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export default function Collection({
  initialCategory = "All",
  onFilterChange,
}) {
  // ==========================================
  // CONVEX DATABASE
  // ==========================================

  const liveProducts = useQuery(api.products.list);

  const products = useMemo(() => {
    return (liveProducts || []).map((product) => ({
      id: product._id,
      title: product.name,
      category: product.category,
      gemstone: product.gemstone,
      metal: product.metal,
      description: product.description,
      price: product.price,
      priceFormatted: `LKR ${Number(
        product.price
      ).toLocaleString("en-LK")}`,
      image: product.imageUrl,
      featured: product.featured,
      createdAt: product.createdAt,
    }));
  }, [liveProducts]);

  // ==========================================
  // FILTER STATES
  // ==========================================

  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);

  const [selectedGemstone, setSelectedGemstone] =
    useState("All");

  const [sortBy, setSortBy] = useState("featured");

  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const [mobileFilterOpen, setMobileFilterOpen] =
    useState(false);

  // ==========================================
  // REFERENCES
  // ==========================================

  const sortMenuRef = useRef(null);
  const sortTriggerRef = useRef(null);
  const filterTriggerRef = useRef(null);
  const filterCloseRef = useRef(null);
  const filterPanelRef = useRef(null);

  // ==========================================
  // SYNC CATEGORY WITH NAVIGATION
  // ==========================================

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // ==========================================
  // MOBILE FILTER DRAWER
  // ==========================================

  useEffect(() => {
    if (!mobileFilterOpen) return;

    const originalBodyOverflow =
      document.body.style.overflow;

    const originalHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    window.dispatchEvent(
      new CustomEvent("lustria:scroll-lock", {
        detail: { locked: true },
      })
    );

    filterCloseRef.current?.focus({
      preventScroll: true,
    });

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMobileFilterOpen(false);
      }
    };

    const closeOnResize = () => {
      if (window.innerWidth > 868) {
        setMobileFilterOpen(false);
      }
    };

    // Keep keyboard focus inside the open drawer.
    const trapFocus = (event) => {
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        filterPanelRef.current?.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])'
        ) || []
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("keydown", trapFocus);
    window.addEventListener("resize", closeOnResize);

    return () => {
      document.body.style.overflow =
        originalBodyOverflow;

      document.documentElement.style.overflow =
        originalHtmlOverflow;

      window.dispatchEvent(
        new CustomEvent("lustria:scroll-lock", {
          detail: { locked: false },
        })
      );

      window.removeEventListener(
        "keydown",
        closeOnEscape
      );

      window.removeEventListener(
        "keydown",
        trapFocus
      );

      window.removeEventListener(
        "resize",
        closeOnResize
      );

      filterTriggerRef.current?.focus({
        preventScroll: true,
      });
    };
  }, [mobileFilterOpen]);

  // ==========================================
  // SORT DROPDOWN
  // ==========================================

  useEffect(() => {
    if (!sortMenuOpen) return;

    const closeOnOutside = (event) => {
      if (
        !sortMenuRef.current?.contains(event.target)
      ) {
        setSortMenuOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSortMenuOpen(false);
        sortTriggerRef.current?.focus();
      }
    };

    document.addEventListener(
      "pointerdown",
      closeOnOutside
    );

    document.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOnOutside
      );

      document.removeEventListener(
        "keydown",
        closeOnEscape
      );
    };
  }, [sortMenuOpen]);

  // ==========================================
  // FILTER HANDLERS
  // ==========================================

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onFilterChange?.(category);
  };

  const resetFilters = () => {
    handleCategorySelect("All");
    setSelectedGemstone("All");
    setSortBy("featured");
  };

  // ==========================================
  // LIVE FILTERING AND SORTING
  // ==========================================

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "All" ||
          product.category === selectedCategory;

        const matchesGemstone =
          selectedGemstone === "All" ||
          product.gemstone === selectedGemstone;

        return matchesCategory && matchesGemstone;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") {
          return a.price - b.price;
        }

        if (sortBy === "price-high") {
          return b.price - a.price;
        }

        if (a.featured !== b.featured) {
          return Number(b.featured) -
            Number(a.featured);
        }

        return b.createdAt - a.createdAt;
      });
  }, [
    products,
    selectedCategory,
    selectedGemstone,
    sortBy,
  ]);

  // ==========================================
  // SCROLL ANIMATIONS
  // ==========================================

  useScrollReveal(filteredProducts);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="shop-section">
      {/* HEADER */}

      <header className="shop-header reveal-on-scroll">
        <h1 className="shop-heading">
          The Entire Collection
        </h1>

        <p className="shop-sub">
          Handcrafted solid 925 sterling silver jewelry
          set with authentic natural Ceylon gems.
        </p>
      </header>

      {/* CONTROLS BAR */}

      <div className="shop-controls-bar">
        <button
          type="button"
          className="btn-filter-mobile"
          ref={filterTriggerRef}
          aria-controls="shop-filter-panel"
          aria-expanded={mobileFilterOpen}
          onClick={() => {
            setSortMenuOpen(false);
            setMobileFilterOpen((prev) => !prev);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>

          Filters
          {selectedCategory !== "All" ||
          selectedGemstone !== "All"
            ? " • Active"
            : ""}
        </button>

        {/* PRODUCT COUNT */}

        <span className="shop-item-count">
          Showing{" "}
          <strong>
            {liveProducts === undefined
              ? "..."
              : filteredProducts.length}
          </strong>{" "}
          creations
        </span>

        {/* SORT MENU */}

        <div className="shop-sort">
          <span
            className="shop-sort-label"
            id="shop-sort-label"
          >
            Sort by:
          </span>

          <div
            className="shop-sort-select-wrap"
            ref={sortMenuRef}
          >
            <button
              type="button"
              id="shop-sort-select"
              ref={sortTriggerRef}
              className={`shop-sort-select ${
                sortMenuOpen ? "is-open" : ""
              }`}
              aria-labelledby="shop-sort-label shop-sort-select"
              aria-haspopup="true"
              aria-expanded={sortMenuOpen}
              aria-controls="shop-sort-options"
              onClick={() =>
                setSortMenuOpen((open) => !open)
              }
            >
              <span>
                {
                  sortOptions.find(
                    (option) => option.value === sortBy
                  )?.label
                }
              </span>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {sortMenuOpen && (
              <div
                id="shop-sort-options"
                className="shop-sort-options"
                role="group"
                aria-label="Sort products"
              >
                {sortOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`shop-sort-option ${
                      sortBy === option.value
                        ? "is-selected"
                        : ""
                    }`}
                    aria-pressed={
                      sortBy === option.value
                    }
                    onClick={() => {
                      setSortBy(option.value);
                      setSortMenuOpen(false);
                      sortTriggerRef.current?.focus();
                    }}
                  >
                    {option.label}

                    {sortBy === option.value && (
                      <span aria-hidden="true">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN COLLECTION LAYOUT */}

      <div className="shop-layout">
        {/* MOBILE BACKDROP */}

        <button
          className={`shop-filter-backdrop ${
            mobileFilterOpen ? "is-open" : ""
          }`}
          type="button"
          aria-label="Close filters"
          aria-hidden={!mobileFilterOpen}
          tabIndex={mobileFilterOpen ? 0 : -1}
          onClick={() => setMobileFilterOpen(false)}
        />

        {/* FILTER SIDEBAR */}

        <aside
          id="shop-filter-panel"
          ref={filterPanelRef}
          className={`shop-sidebar ${
            mobileFilterOpen ? "is-open" : ""
          }`}
          aria-label="Collection filters"
          data-lenis-prevent
        >
          <div className="shop-sidebar-header">
            <h3>Filters</h3>

            <button
              type="button"
              className="shop-close-btn"
              ref={filterCloseRef}
              onClick={() =>
                setMobileFilterOpen(false)
              }
              aria-label="Close filters"
            >
              &times;
            </button>
          </div>

          {/* CATEGORY FILTER */}

          <div className="filter-group">
            <h4 className="filter-title">
              Category
            </h4>

            <div className="filter-pills">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`filter-pill ${
                    selectedCategory === category
                      ? "is-active"
                      : ""
                  }`}
                  aria-pressed={
                    selectedCategory === category
                  }
                  onClick={() =>
                    handleCategorySelect(category)
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* GEMSTONE FILTER */}

          <div className="filter-group">
            <h4 className="filter-title">
              Gemstone
            </h4>

            <div className="filter-pills">
              {gemstones.map((gemstone) => (
                <button
                  key={gemstone}
                  type="button"
                  className={`filter-pill ${
                    selectedGemstone === gemstone
                      ? "is-active"
                      : ""
                  }`}
                  aria-pressed={
                    selectedGemstone === gemstone
                  }
                  onClick={() =>
                    setSelectedGemstone(gemstone)
                  }
                >
                  {gemstone}
                </button>
              ))}
            </div>
          </div>

          {/* RESET FILTERS */}

          {(selectedCategory !== "All" ||
            selectedGemstone !== "All") && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          )}
        </aside>

        {/* PRODUCT GRID */}

        <div className="shop-grid-area">
          {/* LOADING STATE */}

          {liveProducts === undefined ? (
            <div className="shop-empty">
              <p className="shop-empty-text">
                Loading jewellery collection...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* EMPTY STATE */

            <div className="shop-empty">
              <p className="shop-empty-text">
                {products.length === 0
                  ? "Our jewellery collection is coming soon."
                  : "No creations match the selected filters."}
              </p>

              {products.length > 0 && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={resetFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            /* LIVE PRODUCTS */

            <div className="shop-grid">
              {filteredProducts.map((piece) => (
                <article
                  key={piece.id}
                  className="signature-card reveal-on-scroll"
                >
                  <div className="signature-image-box">
                    {piece.image ? (
                      <img
                        src={piece.image}
                        alt={piece.title}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="shop-image-placeholder"
                        aria-label="Image unavailable"
                      >
                        Image unavailable
                      </div>
                    )}
                  </div>

                  <div className="signature-info">
                    <span className="signature-metal">
                      {piece.metal}
                    </span>

                    <h3 className="signature-title">
                      {piece.title}
                    </h3>

                    <span className="signature-price">
                      {piece.priceFormatted}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
