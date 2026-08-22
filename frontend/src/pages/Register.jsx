import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api(
        "/auth/register",
        {
          method: "POST",

          body: JSON.stringify({
            name:
              formData.name.trim(),

            email:
              formData.email.trim(),

            password:
              formData.password,
          }),
        }
      );

      navigate("/login");
    } catch (error) {
      setError(
        error.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">

        <section className="auth-brand-panel">

          <div className="auth-brand-content">

            <Link
              to="/"
              className="auth-logo"
            >
              SocialSphere
            </Link>

            <p className="auth-eyebrow">
              BUILD YOUR SPACE
            </p>

            <h1>
              Join the
              <br />
              conversation.
            </h1>

            <p className="auth-brand-copy">
              Create your profile, discover
              people, share posts, and build
              your SocialSphere.
            </p>

            <div className="auth-feature-list">

              <div>
                <span>01</span>
                <p>
                  Create your personal profile
                </p>
              </div>

              <div>
                <span>02</span>
                <p>
                  Follow and discover people
                </p>
              </div>

              <div>
                <span>03</span>
                <p>
                  Share and join conversations
                </p>
              </div>

            </div>

          </div>

        </section>

        <section className="auth-form-panel">

          <div className="auth-form-card">

            <div className="auth-form-header">

              <p className="auth-form-eyebrow">
                GET STARTED
              </p>

              <h2>
                Create account
              </h2>

              <p>
                It only takes a moment to join
                SocialSphere.
              </p>

            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              <div className="auth-field">

                <label htmlFor="register-name">
                  Full name
                </label>

                <input
                  id="register-name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="name"
                  maxLength="80"
                  required
                />

              </div>

              <div className="auth-field">

                <label htmlFor="register-email">
                  Email
                </label>

                <input
                  id="register-email"
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

                <label htmlFor="register-password">
                  Password
                </label>

                <input
                  id="register-password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="new-password"
                  required
                />

              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={
                  loading ||
                  !formData.name.trim() ||
                  !formData.email.trim() ||
                  !formData.password
                }
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </button>

            </form>

            <div className="auth-switch">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
              </Link>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

export default Register;