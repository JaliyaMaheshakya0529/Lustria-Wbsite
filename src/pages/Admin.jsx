
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import "../styles/Admin.css";

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

// ==========================================
// LOGIN
// ==========================================

function Login() {
  const { signIn } = useAuthActions();

  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const form = new FormData();
      form.set("email", email.trim());
      form.set("password", password);
      form.set("flow", signup ? "signUp" : "signIn");

      await signIn("password", form);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ladmin-auth">
      <div className="ladmin-login-card">
        <div className="ladmin-brand">
          <h1>LUSTRIA</h1>
          <span>ADMINISTRATION</span>
        </div>

        <div className="ladmin-login-heading">
          <span className="ladmin-eyebrow">PRIVATE ACCESS</span>
          <h2>{signup ? "Create Account" : "Welcome Back"}</h2>
          <p>
            Sign in to manage your jewellery collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ladmin-login-form">
          <label htmlFor="admin-email">Email Address</label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            required
            minLength={8}
            autoComplete={signup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          {error && <p className="ladmin-error">{error}</p>}

          <button
            type="submit"
            className="ladmin-primary"
            disabled={busy}
          >
            {busy
              ? "Please wait..."
              : signup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          className="ladmin-link-button"
          onClick={() => {
            setSignup(!signup);
            setError("");
          }}
        >
          {signup
            ? "Already have an account? Sign in"
            : "First time? Create an account"}
        </button>

        <a href="/" className="ladmin-return">
          Return to Website
        </a>
      </div>
    </div>
  );
}

// ==========================================
// ACCESS DENIED
// ==========================================

function AccessDenied() {
  const { signOut } = useAuthActions();

  return (
    <div className="ladmin-auth">
      <div className="ladmin-login-card">
        <div className="ladmin-brand">
          <h1>LUSTRIA</h1>
          <span>ADMINISTRATION</span>
        </div>

        <div className="ladmin-login-heading">
          <span className="ladmin-eyebrow">ACCOUNT PENDING</span>
          <h2>Access Restricted</h2>
          <p>
            Your account is authenticated, but it has not been
            approved as a Lustria administrator.
          </p>
          <p>
            Open Convex Dashboard, find your account in the
            users table, and add its ID to the admins table.
          </p>
        </div>

        <button
          className="ladmin-primary"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ERROR BOUNDARY
// ==========================================

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="ladmin-auth">
          <div className="ladmin-login-card">
            <div className="ladmin-brand">
              <h1>LUSTRIA</h1>
              <span>ADMINISTRATION</span>
            </div>

            <h2>Admin Service Unavailable</h2>
            <p className="ladmin-error">
              {this.state.error.message}
            </p>

            <button
              className="ladmin-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==========================================
// ADMIN ACCESS
// ==========================================

function AdminAccess() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  const isAdmin = useQuery(
    api.products.adminStatus,
    isAuthenticated ? {} : "skip"
  );

  if (isLoading) {
    return (
      <div className="ladmin-loading">
        Loading Lustria Admin...
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  if (isAdmin === undefined) {
    return (
      <div className="ladmin-loading">
        Checking administrator permissions...
      </div>
    );
  }

  if (!isAdmin) return <AccessDenied />;

  return <Dashboard />;
}

// ==========================================
// MAIN DASHBOARD
// ==========================================

function Dashboard() {
  const { signOut } = useAuthActions();

  const products = useQuery(api.products.listAdmin);

  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(
    api.products.generateUploadUrl
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const closeRef = useRef(null);
  const savingRef = useRef(false);

  savingRef.current = saving;

  const allProducts = products || [];

  const filteredProducts = useMemo(() => {
    return [...(products || [])]
      .filter((product) => {
        const matchesSearch = [
          product.name,
          product.category,
          product.gemstone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesCategory =
          category === "All" ||
          product.category === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [products, search, category]);

  const availableCount = allProducts.filter(
    (p) => p.available
  ).length;

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
        if (!savingRef.current) {
          setEditorOpen(false);
        }
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
    setPreview(url);

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
    if (savingRef.current) return;

    setEditorOpen(false);
    setImageFile(null);
  }

  // ========================================
  // SAVE PRODUCT
  // ========================================

  async function handleSave(event) {
    event.preventDefault();

    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    setError("");

    try {
      const price = Number(form.price);

      if (
        !form.name.trim() ||
        form.price === "" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error("Enter a valid name and price.");
      }

      let imageId = form.imageId;

      if (imageFile) {
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (!allowed.includes(imageFile.type)) {
          throw new Error("Only JPG, PNG and WebP images are allowed.");
        }

        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error("Maximum image size is 5 MB.");
        }

        const uploadUrl = await generateUploadUrl();

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": imageFile.type,
          },
          body: imageFile,
        });

        if (!response.ok) {
          throw new Error("Image upload failed.");
        }

        const uploaded = await response.json();
        imageId = uploaded.storageId;
      }

      if (!imageId) {
        throw new Error("Please upload a product image.");
      }

      const payload = {
        name: form.name.trim(),
        category: form.category,
        gemstone: form.gemstone,
        metal: form.metal,
        description: form.description.trim(),
        price,
        imageId,
        available: form.available,
        featured: form.featured,
      };

      if (editingId) {
        await updateProduct({
          id: editingId,
          ...payload,
        });
        setNotice("Product updated successfully.");
      } else {
        await createProduct(payload);
        setNotice("Product added successfully.");
      }

      setEditorOpen(false);
      setImageFile(null);
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
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
          <div className="ladmin-nav-item active">
            <Icon name="grid" />
            <span>Dashboard</span>
          </div>

          <div className="ladmin-nav-item">
            <Icon name="package" />
            <span>Products</span>
          </div>
        </nav>

        <div className="ladmin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            View Website
          </a>

          <button type="button" onClick={() => signOut()}>
            <Icon name="logout" size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="ladmin-main">
        <header className="ladmin-header">
          <div>
            <span className="ladmin-eyebrow">
              LUSTRIA MANAGEMENT
            </span>

            <h1>Dashboard</h1>
            <p>Manage your jewellery collection.</p>
          </div>

          <button
            type="button"
            className="ladmin-primary ladmin-add-button"
            onClick={openNew}
          >
            <Icon name="plus" size={17} />
            Add Product
          </button>
        </header>

        {/* STATS */}

        <div className="ladmin-stats">
          <div className="ladmin-stat">
            <span>Total Products</span>
            <strong>{allProducts.length}</strong>
            <small>All jewellery pieces</small>
          </div>

          <div className="ladmin-stat">
            <span>Available</span>
            <strong>{availableCount}</strong>
            <small>Visible to customers</small>
          </div>

          <div className="ladmin-stat">
            <span>Featured</span>
            <strong>{featuredCount}</strong>
            <small>Highlighted products</small>
          </div>
        </div>

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

        <section className="ladmin-panel">
          <div className="ladmin-panel-header">
            <div>
              <h2>Product Collection</h2>
              <p>{filteredProducts.length} products</p>
            </div>

            <div className="ladmin-filters">
              <div className="ladmin-search">
                <Icon name="search" size={17} />

                <input
                  type="search"
                  placeholder="Search jewellery..."
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

          {products === undefined ? (
            <div className="ladmin-empty">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="ladmin-empty">
              <Icon name="package" size={34} />
              <h3>No Products Found</h3>
              <p>Add your first product to get started.</p>

              <button
                type="button"
                className="ladmin-primary"
                onClick={openNew}
              >
                Add Product
              </button>
            </div>
          ) : (
            <div className="ladmin-products">
              {filteredProducts.map((product) => (
                <article
                  className="ladmin-product"
                  key={product._id}
                >
                  <div className="ladmin-product-image">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                      />
                    )}
                  </div>

                  <div className="ladmin-product-info">
                    <h3>{product.name}</h3>

                    <p>
                      {product.category} · {product.gemstone}
                    </p>

                    <strong>
                      {formatPrice(product.price)}
                    </strong>
                  </div>

                  <div className="ladmin-product-status">
                    <span
                      className={`ladmin-badge ${
                        product.available
                          ? "available"
                          : "hidden"
                      }`}
                    >
                      {product.available
                        ? "Available"
                        : "Hidden"}
                    </span>

                    {product.featured && (
                      <span className="ladmin-badge featured">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="ladmin-product-actions">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                    >
                      <Icon name="edit" size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(product)}
                    >
                      <Icon name="trash" size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

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
                <span className="ladmin-eyebrow">
                  PRODUCT MANAGEMENT
                </span>

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
                disabled={saving}
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
                {preview ? (
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
                  <small>Highlight this product</small>
                </span>

                <input
                  type="checkbox"
                  checked={form.featured}
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
                  disabled={saving}
                  onClick={closeEditor}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ladmin-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Product"
                      : "Add Product"}
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
    <AdminErrorBoundary>
      <AdminAccess />
    </AdminErrorBoundary>
  );
}
