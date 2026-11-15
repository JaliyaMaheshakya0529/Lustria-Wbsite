
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import "../styles/Admin.css";
import AdminBatchUpload from "../components/AdminBatchUpload";
import { productCode } from "../utils/productCodes";
import AdminAnalyticsPanel from "../components/AdminAnalyticsPanel";
import AdminAccess from "../components/AdminAccess";
import useProductUploadQueue from "../hooks/useProductUploadQueue";

const CATEGORIES = [
  "Rings",
  "Earrings",
  "Necklaces",
  "Bracelets",
  "Gemstones",
];

const GEMSTONES = [
  "Blue Sapphire",
  "Yellow Sapphire",
  "Pink Sapphire",
  "White Sapphire",
  "Padparadscha",
  "Blue Topaz",
  "White Topaz",
  "Amethyst",
  "Garnet",
  "Citrine",
  "Peridot",
  "Tourmaline",
  "Cat's Eye",
  "Pearl",
  "Black Coral",
  "Nawarathna",
  "Other",
];

const MAX_FEATURED = 4;

const EMPTY_PRODUCT = {
  name: "",
  category: "Rings",
  gemstone: "Blue Sapphire",
  metal: "925 Sterling Silver",
  description: "",
  price: "",
  imageId: undefined,
  available: true,
  featured: false,
};

const formatPrice = (value) =>
  `LKR ${Number(value).toLocaleString("en-LK")}`;

function Icon({ name, size = 20 }) {
  const icons = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    list: (<><path d="M9 6h12M9 12h12M9 18h12"/><path d="M3 6h2M3 12h2M3 18h2"/></>),
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="m16 4 4 4L9 19l-5 1 1-5L16 4Z" />
      </>
    ),
    star: <path d="m12 2 3.1 6.3 7 1-5.05 4.9 1.2 6.9L12 17.8l-6.25 3.3 1.2-6.9L1.9 9.3l7-1L12 2Z" /> ,
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2M5 6l1 15h12l1-15" />
        <path d="M10 10v7M14 10v7" />
      </>
    ),
    close: <path d="M18 6 6 18M6 6l12 12" />,
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5" />
        <path d="M4 16v4h16v-4" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function Dashboard() {
  const { signOut } = useAuthActions();

  const products = useQuery(api.products.listAdmin);

  const setFeatured = useMutation(api.products.setFeatured);
  const deleteProduct = useMutation(api.products.remove);

  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");
  const [productSort, setProductSort] = useState("newest");
  const resetProductFilters = () => { setSearch(""); setCategory("All"); setAvailability("all"); setProductSort("newest"); };
  const [category, setCategory] = useState("All");
  const [activeView, setActiveView] = useState("dashboard");
  const [productView, setProductView] = useState(() => {
    try {
      const saved = window.localStorage.getItem("lustria-admin-product-view");
      return ["rows", "cards", "compact"].includes(saved) ? saved : "rows";
    } catch {
      return "rows";
    }
  });
  const productScrollRef = useRef(null);
  const [featuredBusy, setFeaturedBusy] = useState({});
  const featuredBusyRef = useRef(new Set());

  const [editorOpen, setEditorOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRevision, setEditingRevision] = useState(0);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const editorImageRef = useRef(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const closeRef = useRef(null);
  const {
    jobs, queueExpanded, setQueueExpanded, queueVisible, pendingCount, failedCount,
    doneCount, overallProgress, recentlyFinished, pendingNewFeatured,
    enqueue, countPendingFeatured, retryJob, dismissJob, clearFinished,
  } = useProductUploadQueue();

  // Keep mouse-wheel scrolling native inside Products even when a site-wide
  // smooth-scroll library (for example Lenis) is active.
  useEffect(() => {
    if (activeView !== "products") return;
    const element = productScrollRef.current;
    if (!element) return;

    const handleWheel = (event) => {
      // Only intercept vertical wheel movement if this area can scroll.
      // At the top/bottom, allow the event to propagate normally.
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxScroll = element.scrollHeight - element.clientHeight;
      if (maxScroll <= 1) return;
      const delta = event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * element.clientHeight
          : event.deltaY;
      const canMove = delta > 0
        ? element.scrollTop < maxScroll - 1
        : element.scrollTop > 1;
      if (!canMove) return;
      event.preventDefault();
      event.stopPropagation();
      element.scrollTop = Math.max(0, Math.min(maxScroll, element.scrollTop + delta));
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [activeView]);

  const allProducts = products || [];

  const filteredProducts = useMemo(() => {
    return [...(products || [])]
      .filter((product) => {
        const matchesSearch = [
          product.name,
          productCode(product.productNo) || "",
          product.category,
          product.gemstone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase());

        const matchesCategory =
          category === "All" ||
          product.category === category;

        const matchesStatus = availability === "all" || (availability === "featured" ? product.featured : availability === "available" ? product.available : !product.available);
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (productSort === "name") return a.name.localeCompare(b.name);
        if (productSort === "price-low") return a.price - b.price;
        if (productSort === "price-high") return b.price - a.price;
        if (productSort === "oldest") return a.createdAt - b.createdAt;
        return b.createdAt - a.createdAt;
      });
  }, [products, search, category, availability, productSort]);

  useEffect(() => {
    if (productScrollRef.current) productScrollRef.current.scrollTop = 0;
  }, [search, category, productView, availability, productSort]);

  const changeProductView = (view) => {
    setProductView(view);
    try {
      window.localStorage.setItem("lustria-admin-product-view", view);
    } catch {
      // Private browsing may disable storage.
    }
  };

  const goToView = (view) => {
    setActiveView(view);
  };

  async function toggleFeatured(product) {
    const id = product._id;
    if (featuredBusyRef.current.has(id)) return;
    if (!product.featured) {
      const activeFeatured = (products || []).filter((item) => item.featured).length;
      const pendingFeatured = countPendingFeatured(job => !job.editingId);
      if (activeFeatured + pendingFeatured >= MAX_FEATURED) {
        setNotice(`Maximum ${MAX_FEATURED} featured products. Remove one first.`);
        return;
      }
    }
    featuredBusyRef.current.add(id);
    setFeaturedBusy((prev) => ({ ...prev, [id]: true }));
    setNotice("");
    try {
      await setFeatured({
        id,
        featured: !product.featured,
      });
      setNotice(product.featured
        ? `Removed “${product.name}” from Featured.`
        : `Added “${product.name}” to Featured.`);
    } catch (err) {
      setNotice(err?.data === "PRODUCT_NOT_FOUND" ? "This product was deleted."
        : `Could not update Featured: ${err?.data || err?.message || "Unknown error"}`);
    } finally {
      featuredBusyRef.current.delete(id);
      setFeaturedBusy((prev) => ({ ...prev, [id]: false }));
    }
  }

  const featuredCount = allProducts.filter(
    (p) => p.featured
  ).length;

  // ========================================
  // MODAL SCROLL LOCK AND FOCUS
  // ========================================

  useEffect(() => {
    if (!editorOpen) return;

    const oldOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus({ preventScroll: true });

    function handleKeydown(event) {
      if (event.key === "Escape") {
        setEditorOpen(false);
        setImageFile(null);
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = document.querySelector(".ladmin-editor");
      if (!dialog) return;

      const elements = Array.from(
        dialog.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'
        )
      ).filter((el) => el.getClientRects().length > 0);

      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKeydown);

      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [editorOpen]);

  // ========================================
  // IMAGE PREVIEW
  // ========================================

  useEffect(() => {
    if (!imageFile) return;

    const url = URL.createObjectURL(imageFile);
    const image = editorImageRef.current;
    if (image) image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // ========================================
  // EDITOR HANDLERS
  // ========================================

  function openNew() {
    setEditingId(null);
    setForm({ ...EMPTY_PRODUCT });
    setImageFile(null);
    setPreview("");
    setError("");
    setEditorOpen(true);
  }

  function openEdit(product) {
    setEditingId(product._id);
    setEditingRevision(product.revision ?? 0);

    setForm({
      name: product.name,
      category: product.category,
      gemstone: product.gemstone,
      metal: product.metal,
      description: product.description,
      price: String(product.price),
      imageId: product.imageId,
      available: product.available,
      featured: product.featured,
    });

    setImageFile(null);
    setPreview(product.imageUrl || "");
    setError("");
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setImageFile(null);
  }

  // Validate synchronously, snapshot everything, and close immediately.
  // The queue owns each snapshot independently of subsequent editor changes.
  function handleSave(event) {
    event.preventDefault();
    setError("");
    const price = Number(form.price);
    if (!form.name.trim() || form.price === "" || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid product name and price.");
      return;
    }
    if (!imageFile && !form.imageId) {
      setError("Please upload a product image.");
      return;
    }
    if (imageFile) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
        setError("Only JPG, PNG and WebP images are allowed.");
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        setError("Maximum image size is 5 MB.");
        return;
      }
    }
    if (form.featured) {
      const currentFeatured = allProducts.filter((item) => item.featured && item._id !== editingId).length;
      const pendingFeatured = countPendingFeatured(job => !editingId || job.editingId !== editingId);
      if (currentFeatured + pendingFeatured >= MAX_FEATURED) {
        setError(`Only ${MAX_FEATURED} products can be featured. Unfeature another product first.`);
        return;
      }
    }
    enqueue([{
      name: form.name.trim(),
      editingId,
      expectedRevision: editingRevision,
      file: imageFile,
      payload: {
        name: form.name.trim(),
        category: form.category,
        gemstone: form.gemstone,
        metal: form.metal,
        description: form.description.trim(),
        price,
        imageId: form.imageId,
        available: form.available,
        featured: form.featured,
      },
    }]);
    setEditorOpen(false);
    setImageFile(null);
  }

  // Queue all batch items immediately. Existing background manager uploads up to
  // two at a time and provides progress + retry without blocking the admin.
  function queueBatch(batch) {
    if (!batch.length) return;
    const currentFeatured = allProducts.filter((p) => p.featured).length;
    const pendingFeatured = countPendingFeatured(job => !job.editingId);
    const batchFeatured = batch.filter((item) => item.payload.featured).length;
    if (currentFeatured + pendingFeatured + batchFeatured > MAX_FEATURED) {
      throw new Error(`Maximum ${MAX_FEATURED} Featured products. Remove Featured selections first.`);
    }
    enqueue(batch.map(item => ({ ...item, name: item.payload.name, editingId: null })));
    setNotice(`${batch.length} product${batch.length === 1 ? "" : "s"} added to the upload queue.`);
  }

  // ========================================
  // DELETE PRODUCT
  // ========================================

  async function handleDelete(product) {
    if (
      !window.confirm(
        `Delete "${product.name}" permanently?`
      )
    ) {
      return;
    }

    try {
      await deleteProduct({ id: product._id });
      setNotice("Product deleted successfully.");
    } catch (err) {
      setNotice(err.message || "Unable to delete product.");
    }
  }


  return (
    <div className="ladmin-layout">
      {/* SIDEBAR */}

      <aside className="ladmin-sidebar">
        <div className="ladmin-sidebar-top">
          <a href="/" className="ladmin-logo">
            LUSTRIA
          </a>
          <span>ADMINISTRATION</span>
        </div>

        <nav className="ladmin-navigation">
          <button type="button"
            className={`ladmin-nav-item ${activeView === "dashboard" ? "active" : ""}`}
            aria-current={activeView === "dashboard" ? "page" : undefined}
            onClick={() => goToView("dashboard")}>
            <Icon name="grid" />
            <span>Dashboard</span>
          </button>

          <button type="button"
            className={`ladmin-nav-item ${activeView === "products" ? "active" : ""}`}
            aria-current={activeView === "products" ? "page" : undefined}
            onClick={() => goToView("products")}>
            <Icon name="package" />
            <span>Products</span>
          </button>
        </nav>

        <div className="ladmin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            View Website
          </a>

          <button type="button" onClick={() => signOut()} disabled={pendingCount > 0}>
            <Icon name="logout" size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="ladmin-main">
        <header className="ladmin-header">
          <div>


            <h1>{activeView === "dashboard" ? "Dashboard" : "Products"}</h1>
            <p>{activeView === "dashboard" ? "Your website performance at a glance." : "Manage your jewellery collection."}</p>
          </div>

          {activeView === "products" && (
            <div className="ladmin-header-actions">
              <button type="button" className="ladmin-secondary" onClick={() => setBatchOpen(true)}>
                <Icon name="package" size={17} /> Batch Upload
              </button>
              <button type="button" className="ladmin-primary ladmin-add-button" onClick={openNew}>
                <Icon name="plus" size={17} /> Add Product
              </button>
            </div>
          )}
        </header>

        {/* Isolated from the product manager: analytics errors cannot crash admin. */}
        {activeView === "dashboard" && (
          <AdminAnalyticsPanel />
        )}



        {/* NOTICE */}

        {notice && (
          <div className="ladmin-notice" role="status">
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {/* PRODUCT COLLECTION */}

        {activeView === "products" && <section className="ladmin-panel">
          <div className="ladmin-collection-summary" role="group" aria-label="Collection status filters">
          {[["all", "All products", allProducts.length], ["available", "Available", allProducts.filter(p => p.available).length], ["hidden", "Hidden", allProducts.filter(p => !p.available).length], ["featured", "Featured", featuredCount]].map(([value,label,count]) => <button key={value} type="button" aria-pressed={availability === value} className={availability === value ? "selected" : ""} onClick={() => setAvailability(value)}><span>{label}</span><strong>{count}</strong></button>)}
          </div>
          <div className="ladmin-panel-header">
            <div>
              <h2>{activeView === "dashboard" ? "Recent Products" : "Product Collection"}</h2>
              <p>{filteredProducts.length} products · {featuredCount}/{MAX_FEATURED} featured</p>
            </div>

            <div className="ladmin-filters">
              <div className="ladmin-search">
                <Icon name="search" size={17} />

                <input
                  type="search"
                  aria-label="Search products" placeholder="Name, code or gemstone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="All">All Categories</option>

                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ladmin-product-toolbar">
            <div className="ladmin-product-view-switch" role="group" aria-label="Product display layout">
              {[
                { value: "rows", label: "Rows", icon: "list" },
                { value: "cards", label: "Cards", icon: "grid" },
                { value: "compact", label: "Compact", icon: "package" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={productView === option.value ? "active" : ""}
                  aria-pressed={productView === option.value}
                  onClick={() => changeProductView(option.value)}
                >
                  <Icon name={option.icon} size={15} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            <div className="ladmin-browse-controls"><label>Sort <select aria-label="Sort products" value={productSort} onChange={e => setProductSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>{(search || category !== "All" || availability !== "all" || productSort !== "newest") && <button type="button" onClick={resetProductFilters}>Reset filters</button>}</div>
          </div>

          <div className={`ladmin-product-scroll ladmin-view-${productView}`} ref={productScrollRef} data-lenis-prevent data-lenis-prevent-wheel tabIndex={0} aria-label="Scrollable products">
            {products === undefined ? (
              <div className="ladmin-empty">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="ladmin-empty">
                <Icon name="package" size={34} />
                <h3>No Products Found</h3>
                <p>Try a different search or add your first product.</p>{allProducts.length > 0 && <button type="button" className="ladmin-secondary" onClick={resetProductFilters}>Clear filters</button>}
                <button type="button" className="ladmin-primary" onClick={openNew}>
                  Add Product
                </button>
              </div>
            ) : (
              <div className="ladmin-products">
                {filteredProducts.map((product) => (
                  <article className="ladmin-product" key={product._id}>
                    <div className="ladmin-product-image">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} loading="lazy" />
                      ) : (
                        <span className="ladmin-no-image">No image</span>
                      )}
                    </div>
                    <div className="ladmin-product-info">
                      <h3 title={product.name}>{product.name}</h3>
                      <span className="ladmin-product-id">{productCode(product.productNo) || 'Product ID pending'}</span>
                      <p>{product.category}{product.gemstone ? ` · ${product.gemstone}` : ""}</p>
                      <strong>{formatPrice(product.price)}</strong>
                    </div>
                    <div className="ladmin-product-status">
                      <span className={`ladmin-badge ${product.available ? "available" : "hidden"}`}>
                        {product.available ? "Available" : "Hidden"}
                      </span>
                      <button
                        type="button"
                        className={`ladmin-featured-toggle ${product.featured ? "is-featured" : ""}`}
                        disabled={Boolean(featuredBusy[product._id]) || (!product.featured && featuredCount >= MAX_FEATURED)}
                        aria-pressed={Boolean(product.featured)}
                        title={product.featured ? "Remove from Signature Creations" : featuredCount >= MAX_FEATURED ? "Maximum 4 featured products — unfeature one first" : "Add to Signature Creations"}
                        onClick={() => toggleFeatured(product)}
                      >
                        <Icon name="star" size={14} />
                        {featuredBusy[product._id] ? "Saving…" : product.featured ? "Featured" : "Feature"}
                      </button>
                    </div>
                    <div className="ladmin-product-actions">
                      <button type="button" onClick={() => openEdit(product)}>
                        <Icon name="edit" size={16} /> Edit
                      </button>
                      <button type="button" className="danger" onClick={() => handleDelete(product)}>
                        <Icon name="trash" size={16} /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="ladmin-product-footnote" aria-live="polite">
            Showing {filteredProducts.length} of {allProducts.length} products
            <span>{productView === "cards" ? "Card view" : productView === "compact" ? "Compact view" : "Row view"}</span>
          </div>
        </section>}
      </main>

      {/* NON-BLOCKING BACKGROUND UPLOAD MANAGER */}
      {queueVisible && jobs.length > 0 && (
        <aside className={`ladmin-queue ${queueExpanded ? "is-expanded" : "is-minimized"}`}
          aria-label="Background product uploads" aria-live="polite">
          <div className="ladmin-queue-header">
            <div className="ladmin-queue-heading">
              <span className="ladmin-queue-indicator" aria-hidden="true" />
              <div>
                <strong>{pendingCount ? `Saving ${pendingCount} product${pendingCount === 1 ? "" : "s"}` : failedCount ? `${failedCount} upload${failedCount === 1 ? "" : "s"} need attention` : "All products saved"}</strong>
                <small>{pendingCount ? `${doneCount} completed · ${failedCount} failed` : failedCount ? "Review failed uploads below" : "Finished successfully"}</small>
              </div>
            </div>
            <button type="button" className="ladmin-queue-toggle"
              onClick={() => setQueueExpanded((open) => !open)}
              aria-expanded={queueExpanded} aria-label={queueExpanded ? "Minimize uploads" : "Expand uploads"}>
              {queueExpanded ? "−" : "+"}
            </button>
          </div>
          <div className="ladmin-queue-overall">
            <div className="ladmin-queue-track"><span style={{ width: `${overallProgress}%` }} /></div>
            <small>{overallProgress}% overall</small>
          </div>
          {queueExpanded && (
            <div className="ladmin-queue-body" data-lenis-prevent>
              {jobs.map((job) => (
                <div className="ladmin-queue-job" key={job.id}>
                  <div className="ladmin-queue-job-top">
                    <span title={job.name}>{job.name}</span>
                    <small>{job.status === "done" ? "✓ Saved" : job.status === "failed" ? "Failed" : `${job.progress}%`}</small>
                  </div>
                  <div className={`ladmin-queue-track ${job.status}`}>
                    <span style={{ width: `${job.progress}%` }} />
                  </div>
                  <div className="ladmin-queue-job-bottom">
                    <small>{job.error || job.stage}</small>
                    {job.status === "failed" && (
                      <>
                        {job.canRetry && <button type="button" onClick={() => retryJob(job.id)}>Retry</button>}
                        <button type="button" onClick={() => dismissJob(job.id)}>Dismiss</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div className="ladmin-queue-footer">
                {doneCount > 0 && <button type="button" onClick={clearFinished}>Clear completed</button>}
                {pendingCount > 0 && <span>Keep this tab open until uploads finish.</span>}
                {recentlyFinished && <span>Closing automatically…</span>}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* BATCH UPLOAD EDITOR - admin only */}
      {batchOpen && (
        <AdminBatchUpload
          onClose={() => setBatchOpen(false)}
          onPublish={queueBatch}
          featuredSlots={Math.max(0, MAX_FEATURED - featuredCount - pendingNewFeatured)}
        />
      )}

      {/* EDITOR MODAL */}

      {editorOpen && (
        <div
          className="ladmin-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditor();
            }
          }}
        >
          <div
            className="ladmin-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ladmin-editor-title"
            data-lenis-prevent
          >
            <div className="ladmin-editor-header">
              <div>


                <h2 id="ladmin-editor-title">
                  {editingId
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>
              </div>

              <button
                type="button"
                className="ladmin-close"
                ref={closeRef}
                onClick={closeEditor}
                aria-label="Close editor"
              >
                <Icon name="close" />
              </button>
            </div>

            <form
              className="ladmin-form"
              onSubmit={handleSave}
            >
              <label>Product Image</label>

              <label className="ladmin-image-upload">
                {imageFile ? (
                  <img ref={editorImageRef} alt="Product preview" />
                ) : preview ? (
                  <img src={preview} alt="Product preview" />
                ) : (
                  <div className="ladmin-upload-placeholder">
                    <Icon name="upload" size={28} />
                    <span>Click to upload an image</span>
                    <small>JPG, PNG, WebP · Max 5 MB</small>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                />
              </label>

              <label htmlFor="admin-product-name">
                Product Name
              </label>

              <input
                id="admin-product-name"
                required
                value={form.name}
                placeholder="Natural Blue Sapphire Ring"
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <div className="ladmin-form-row">
                <div>
                  <label htmlFor="admin-category">
                    Category
                  </label>

                  <select
                    id="admin-category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-gemstone">
                    Gemstone
                  </label>

                  <select
                    id="admin-gemstone"
                    value={form.gemstone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gemstone: e.target.value,
                      })
                    }
                  >
                    {GEMSTONES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label htmlFor="admin-metal">Metal</label>

              <select
                id="admin-metal"
                value={form.metal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    metal: e.target.value,
                  })
                }
              >
                <option>925 Sterling Silver</option>
                <option>Pure Sterling Silver</option>
                <option>Gold-Plated Sterling Silver</option>
                <option>Loose Natural Gemstone</option>
              </select>

              <label htmlFor="admin-price">Price (LKR)</label>

              <input
                id="admin-price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                placeholder="25000"
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
              />

              <label htmlFor="admin-description">
                Description
              </label>

              <textarea
                id="admin-description"
                rows={4}
                value={form.description}
                placeholder="Describe this jewellery piece..."
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

              <label className="ladmin-toggle">
                <span>
                  <strong>Available</strong>
                  <small>Show product in the collection</small>
                </span>

                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      available: e.target.checked,
                    })
                  }
                />
              </label>

              <label className="ladmin-toggle">
                <span>
                  <strong>Featured Product</strong>
                  <small>Highlight this product (maximum {MAX_FEATURED})</small>
                </span>

                <input
                  type="checkbox"
                  checked={form.featured}
                  disabled={!form.featured && featuredCount >= MAX_FEATURED && !(editingId && allProducts.find((p) => p._id === editingId)?.featured)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featured: e.target.checked,
                    })
                  }
                />
              </label>

              {error && (
                <p className="ladmin-error" role="alert">
                  {error}
                </p>
              )}

              <div className="ladmin-form-footer">
                <button
                  type="button"
                  className="ladmin-secondary"
                    onClick={closeEditor}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ladmin-primary"
                  >
                  {editingId ? "Queue Update" : "Save & Add Next"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <AdminAccess><Dashboard /></AdminAccess>
  );
}
