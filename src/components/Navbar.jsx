
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

const categories = [
  { name: "Rings", filter: "Rings" },
  { name: "Earrings", filter: "Earrings" },
  { name: "Necklaces", filter: "Necklaces" },
  { name: "Gemstones", filter: "Gemstones" },
];

export default function Navbar({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 868) {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setMobileCollectionOpen(false);
  };

  const handleNavigate = (
    path,
    category = null,
    section = null
  ) => {
    closeMenu();
    onNavigate?.(path, category, section);
  };

  return (
    <header
      className={`navbar ${isScrolled ? "is-scrolled" : ""}`}
    >
      {/* BRAND */}
      <a
        href="/"
        className="nav-brand"
        onClick={(e) => {
          e.preventDefault();
          handleNavigate("/");
        }}
      >
        <img
          src="/logo.png"
          alt="Lustria Logo"
          className="nav-brand-logo"
        />
      </a>

      {/* MOBILE BACKDROP */}
      <button
        type="button"
        className={`nav-menu-backdrop ${
          mobileMenuOpen ? "is-open" : ""
        }`}
        aria-label="Close navigation"
        aria-hidden={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={closeMenu}
      />

      {/* NAVIGATION */}
      <nav aria-label="Main navigation">
        <ul
          id="mobile-nav-links"
          className={`nav-links ${
            mobileMenuOpen ? "is-open" : ""
          }`}
        >
          {/* HOME */}
          <li className="nav-item">
            <a
              href="/"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/");
              }}
            >
              Home
            </a>
          </li>

          {/* COLLECTION */}
          <li
            className={`nav-item dropdown-item ${
              mobileCollectionOpen
                ? "mobile-collection-open"
                : ""
            }`}
          >
            {/* DESKTOP COLLECTION */}
            <a
              href="/collection"
              className="nav-link desktop-collection-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/collection", "All");
              }}
            >
              Collection

              <svg
                className="dropdown-chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>

            {/* MOBILE COLLECTION ROW */}
            <div className="mobile-collection-row">
              {/* CLICKABLE COLLECTION LINK */}
              <a
                href="/collection"
                className="mobile-collection-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate("/collection", "All");
                }}
              >
                Collection
              </a>

              {/* ARROW BUTTON ONLY */}
              <button
                type="button"
                className={`mobile-collection-toggle ${
                  mobileCollectionOpen ? "is-active" : ""
                }`}
                aria-label={
                  mobileCollectionOpen
                    ? "Close collection categories"
                    : "Open collection categories"
                }
                aria-controls="mobile-collection-submenu"
                aria-expanded={mobileCollectionOpen}
                onClick={() => {
                  setMobileCollectionOpen((prev) => !prev);
                }}
              >
                <svg
                  className="mobile-collection-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* COLLECTION DROPDOWN */}
            <ul
              id="mobile-collection-submenu"
              className="dropdown-menu"
            >
              {categories.map((item) => (
                <li key={item.name}>
                  <a
                    href={`/collection?category=${encodeURIComponent(
                      item.filter
                    )}`}
                    className="dropdown-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate(
                        "/collection",
                        item.filter
                      );
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          {/* ABOUT */}
          <li className="nav-item">
            <a
              href="/#work"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/", null, "work");
              }}
            >
              About
            </a>
          </li>
        </ul>
      </nav>

      {/* ACTIONS */}
      <div className="nav-actions">
        <a
          href="#contact"
          className="nav-cta"
          onClick={(e) => {
            e.preventDefault();
            closeMenu();

            document
              .getElementById("contact")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          Inquire
        </a>

        {/* MOBILE MENU TOGGLE */}
        <button
          type="button"
          className="mobile-toggle"
          aria-label={
            mobileMenuOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-controls="mobile-nav-links"
          aria-expanded={mobileMenuOpen}
          onClick={() => {
            setMobileMenuOpen((prev) => !prev);
            setMobileCollectionOpen(false);
          }}
        >
          {mobileMenuOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
