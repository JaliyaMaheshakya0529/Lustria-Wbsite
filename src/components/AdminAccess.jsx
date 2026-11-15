import React, { useState } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import ProductNumberInitializer from "./ProductNumberInitializer";

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
  const userId = useQuery(api.products.currentUserId);

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
          {userId && <p>Account ID <code>{userId}</code></p>}
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

function AuthorizedAdmin({ children }) {
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

  return <><ProductNumberInitializer />{children}</>;
}

export default function AdminAccess({ children }) {
  return <AdminErrorBoundary><AuthorizedAdmin>{children}</AuthorizedAdmin></AdminErrorBoundary>;
}
