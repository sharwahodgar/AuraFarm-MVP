import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;

    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/feed");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🌾</span>
            <h1 className="auth-title">AuraFarm</h1>
          </div>
          <p className="auth-subtitle">Welcome back to your farming community</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="farmer@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span className="button-icon">→</span>
              </>
            )}
          </button>

          <div className="auth-footer">
            <p>
              New to AuraFarm?{" "}
              <Link to="/register" className="auth-link">
                Create your account
              </Link>
            </p>
          </div>
        </form>

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">🌱</span>
            <span>Connect with farmers</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Track your crops</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🤝</span>
            <span>Share knowledge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
