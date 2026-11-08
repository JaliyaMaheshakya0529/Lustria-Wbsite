
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

function formatPrice(price) {
  return `LKR ${Number(price).toLocaleString("en-LK")}`;
}

function Icon({ name, size = 20 }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    box: (
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
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5" />
        <path d="M4 16v4h16v-4" />
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
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

// ---------------------------------------
// AUTHENTICATION
// ---------------------------------------

function Login() {
  const { signIn } = useAuthActions();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.set("email", email);
      form.set("password", password);
      form.set("flow", isSignup ? "signUp" : "signIn");

      await signIn("password", form);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ladmin-auth-page">
      <div className="ladmin-auth-card">
        <div className="ladmin-auth-brand">
          <h1>LUSTRIA</h1>
          <span>ADMINISTRATION</span>
        </div>

        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
        <p>Sign in to manage your jewellery collection.</p>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={
              isSignup ? "new-password" : "current-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          {error && (
            <p className="ladmin-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="ladmin-btn-primary"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          className="ladmin-auth-switch"
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}
        >
          {isSignup
            ? "Already have an account? Sign in"
            : "First-time setup? Create account"}
        </button>

        <a href="/" className="ladmin-back-link">
          Return to Lustria
        </a>
      </div>
    </div>
  );
}

function AccessDenied() {
  const { signOut } = useAuthActions();

  return (
    <div className="ladmin-auth-page">
      <div className="ladmin-auth-card">
        <div className="ladmin-auth-brand">
          <h1>LUSTRIA</h1>
          <span>ADMINISTRATION</span>
        </div>

        <h2>Access Restricted</h2>
        <p>
          Your account is not approved as a Lustria administrator.
          An existing administrator must add your user ID to the
          Convex admins table.
        </p>

        <button
          className="ladmin-btn-primary"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------
// MAIN ADMIN ENTRY
// ---------------------------------------

export default function Admin() {
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
        Verifying administrator permissions...
      </div>
    );
  }

  if (!isAdmin) return <AccessDenied />;

  return <Dashboard />;
}

// ---------------------------------------
// DASHBOARD
// ---------------------------------------

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
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const closeButtonRef = useRef(null);

  const allProducts = products || [];

  const filteredProducts = useMemo(() => {
    return allProducts
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

  // Lock background scrolling only while editor is open.
  useEffect(() => {
    if (!editorOpen) return;

    const oldOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeydown = (e) => {
      if (e.key === "Escape" && !saving) {
        setEditorOpen(false);
      }

      if (e.key !== "Tab") return;

      const dialog = document.querySelector(".ladmin-editor");
      if (!dialog) return;

      const elements = Array.from(
        dialog.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'
        )
      ).filter((element) => element.getClientRects().length > 0);

      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        document.activeElement === last
      ) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKeydown);

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [editorOpen, saving]);

  // Generate and clean up local image previews.
  useEffect(() => {
    if (!imageFile) return;

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function openNew() {
    setEditingId(null);
    setForm({ ...EMPTY_PRODUCT });
    setImageFile(null);
    setImagePreview("");
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
    setImagePreview(product.imageUrl || "");
    setError("");
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;
    setEditorOpen(false);
    setImageFile(null);
  }

  async function handleSave(e) {
    e.preventDefault();

    if (saving) return;

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
        throw new Error("Enter a valid product name and price.");
      }

      let imageId = form.imageId;

      if (imageFile) {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (!allowedTypes.includes(imageFile.type)) {
          throw new Error("Only JPG, PNG and WebP images are allowed.");
        }

        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error("Image must be smaller than 5 MB.");
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
          throw new Error("Unable to upload image.");
        }

        const uploaded = await response.json();
        imageId = uploaded.storageId;
      }

      if (!imageId) {
        throw new Error("Please select a product image.");
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
        setNotice("New product added successfully.");
      }

      setEditorOpen(false);
      setImageFile(null);
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (
      !window.confirm(
        `Are you sure you want to delete "${product.name}"?`
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
          <span>ADMIN PANEL</span>
        </div>

        <nav className="ladmin-navigation">
          <div className="ladmin-nav-item active">
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </div>

          <div className="ladmin-nav-item">
            <Icon name="box" />
            <span>Products</span>
          </div>
        </nav>

        <div className="ladmin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            View Website
          </a>

          <button onClick={() => signOut()}>
            <Icon name="logout" size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="ladmin-main">
        <header className="ladmin-header">
          <div>
            <span className="ladmin-overline">
              LUSTRIA MANAGEMENT
            </span>

            <h1>Dashboard</h1>
            <p>Manage your jewellery collection.</p>
          </div>

          <button
            className="ladmin-btn-primary ladmin-add-btn"
            onClick={openNew}
          >
            <Icon name="plus" size={17} />
            Add Product
          </button>
        </header>

        {/* STATISTICS */}

        <div className="ladmin-stats">
          <div className="ladmin-stat-card">
            <span>Total Products</span>
            <strong>{allProducts.length}</strong>
            <small>Jewellery catalogue</small>
          </div>

          <div className="ladmin-stat-card">
            <span>Available Products</span>
            <strong>{availableCount}</strong>
            <small>Visible to customers</small>
          </div>

          <div className="ladmin-stat-card">
            <span>Featured Products</span>
            <strong>{featuredCount}</strong>
            <small>Homepage highlights</small>
          </div>
        </div>

        {notice && (
          <div className="ladmin-notice" role="status">
            {notice}
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {/* PRODUCTS */}

        <section className="ladmin-panel">
          <div className="ladmin-panel-header">
            <div>
              <h2>Product Collection</h2>
              <p>
                {filteredProducts.length} products found
              </p>
            </div>

            <div className="ladmin-filters">
              <div className="ladmin-search">
                <Icon name="search" size={17} />

                <input
                  type="search"
                  placeholder="Search products..."
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
              <Icon name="box" size={34} />
              <h3>No Products Found</h3>
              <p>
                Add your first jewellery product or
                change your search filters.
              </p>

              <button
                className="ladmin-btn-primary"
                onClick={openNew}
              >
                Add Product
              </button>
            </div>
          ) : (
            <div className="ladmin-product-list">
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

                  <div className="ladmin-product-details">
                    <h3>{product.name}</h3>

                    <p>
                      {product.category} · {product.gemstone}
                    </p>

                    <strong>
                      {formatPrice(product.price)}
                    </strong>
                  </div>

                  <div className="ladmin-product-badges">
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
                      onClick={() => openEdit(product)}
                      aria-label={`Edit ${product.name}`}
                    >
                      <Icon name="edit" size={16} />
                      Edit
                    </button>

                    <button
                      className="delete"
                      onClick={() => handleDelete(product)}
                      aria-label={`Delete ${product.name}`}
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

      {/* PRODUCT EDITOR */}

      {editorOpen && (
        <div
          className="ladmin-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeEditor();
            }
          }}
        >
          <div
            className="ladmin-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ladmin-editor-title"
          >
            <div className="ladmin-editor-header">
              <div>
                <span className="ladmin-overline">
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
                ref={closeButtonRef}
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
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                  />
                ) : (
                  <div className="ladmin-upload-placeholder">
                    <Icon name="upload" size={28} />
                    <span>Click to upload image</span>
                    <small>JPG, PNG or WebP · Max 5 MB</small>
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

              <label htmlFor="ladmin-name">
                Product Name
              </label>

              <input
                id="ladmin-name"
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
                  <label htmlFor="ladmin-category">
                    Category
                  </label>

                  <select
                    id="ladmin-category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ladmin-gemstone">
                    Gemstone
                  </label>

                  <select
                    id="ladmin-gemstone"
                    value={form.gemstone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gemstone: e.target.value,
                      })
                    }
                  >
                    {GEMSTONES.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label htmlFor="ladmin-metal">
                Metal
              </label>

              <select
                id="ladmin-metal"
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

              <label htmlFor="ladmin-price">
                Price (LKR)
              </label>

              <input
                id="ladmin-price"
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

              <label htmlFor="ladmin-description">
                Description
              </label>

              <textarea
                id="ladmin-description"
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

              <div className="ladmin-toggle-row">
                <div>
                  <strong>Available</strong>
                  <small>Visible in the public collection</small>
                </div>

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
              </div>

              <div className="ladmin-toggle-row">
                <div>
                  <strong>Featured Product</strong>
                  <small>Highlight on the homepage</small>
                </div>

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
              </div>

              {error && (
                <p className="ladmin-error" role="alert">
                  {error}
                </p>
              )}

              <div className="ladmin-form-footer">
                <button
                  type="button"
                  className="ladmin-btn-secondary"
                  disabled={saving}
                  onClick={closeEditor}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ladmin-btn-primary"
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
Y