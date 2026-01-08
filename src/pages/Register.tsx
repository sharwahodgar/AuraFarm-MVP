import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const f = e.currentTarget;

    const name = (f.elements.namedItem("name") as HTMLInputElement).value;
    const village = (f.elements.namedItem("village") as HTMLInputElement).value;
    const landSize = (f.elements.namedItem("landSize") as HTMLInputElement).value;
    const crops = (f.elements.namedItem("crops") as HTMLInputElement).value;
    const livestock = (f.elements.namedItem("livestock") as HTMLInputElement).value;
    const email = (f.elements.namedItem("email") as HTMLInputElement).value;
    const password = (f.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name,
        village,
        landSize,
        crops: crops ? crops.split(",").map((c) => c.trim()) : [],
        livestock: livestock ? livestock.split(",").map((l) => l.trim()) : [],
        badges: ["New Farmer"],
        createdAt: serverTimestamp(),
      });

      navigate("/feed");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
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

      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🌾</span>
            <h1 className="auth-title">Join AuraFarm</h1>
          </div>
          <p className="auth-subtitle">Start your journey with fellow farmers</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="village">Village</label>
              <div className="input-wrapper">
                <span className="input-icon">🏘️</span>
                <input
                  id="village"
                  name="village"
                  type="text"
                  placeholder="Your village"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="landSize">Land Size</label>
              <div className="input-wrapper">
                <span className="input-icon">📏</span>
                <input
                  id="landSize"
                  name="landSize"
                  type="text"
                  placeholder="e.g., 3 acres"
                  disabled={loading}
                />
              </div>
            </div>

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
          </div>

          <div className="form-group">
            <label htmlFor="crops">Crops</label>
            <div className="input-wrapper">
              <span className="input-icon">🌾</span>
              <input
                id="crops"
                name="crops"
                type="text"
                placeholder="Rice, Wheat, Corn (comma separated)"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="livestock">Livestock</label>
            <div className="input-wrapper">
              <span className="input-icon">🐄</span>
              <input
                id="livestock"
                name="livestock"
                type="text"
                placeholder="Cows, Goats, Chickens (comma separated)"
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
                placeholder="Create a strong password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <span className="button-icon">→</span>
              </>
            )}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/" className="auth-link">
                Sign in instead
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
