import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(
        formData.email,
        formData.password
      );

      navigate("/home");
    } catch (error) {
      setError(
        error.message ||
          "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-cinematic-page">

      {/* ===============================================
          CINEMATIC BACKGROUND
      =============================================== */}

      <div className="login-intro-background">

        <div className="login-intro-orb login-orb-one" />

        <div className="login-intro-orb login-orb-two" />

        <div className="login-intro-orb login-orb-three" />

      </div>

      {/* ===============================================
          LARGE INTRO BRAND
      =============================================== */}

      <div className="login-brand-intro">
        SOCIALSPHERE
      </div>

      {/* ===============================================
          CONTINUOUS MOVING BACKGROUND TEXT
      =============================================== */}

      <div
        className="login-background-marquee"
        aria-hidden="true"
      >
        <div className="login-marquee-track">

          <span>SOCIALSPHERE</span>

          <span>SOCIALSPHERE</span>

          <span>SOCIALSPHERE</span>

        </div>
      </div>

      {/* ===============================================
          LOGIN CONTENT
      =============================================== */}

      <div className="login-content">

        <div className="login-card">

          {/* BRAND */}

          <div className="login-brand">
            SocialSphere
            <span>.</span>
          </div>

          {/* HEADER */}

          <div className="login-header">

            <p className="login-eyebrow">
              WELCOME BACK
            </p>

            <h1>
              Sign in to your space.
            </h1>

            <p className="login-description">
              Connect, share and stay
              close to the people that
              matter.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            <div className="auth-field">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                autoComplete="email"
                required
              />

            </div>

            <div className="auth-field">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                autoComplete="current-password"
                required
              />

            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          {/* REGISTER */}

          <p className="login-register">
            New to SocialSphere?{" "}

            <Link to="/register">
              Create an account
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;