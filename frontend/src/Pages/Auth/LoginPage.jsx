import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import "./Auth.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauthError");
    const errorParam = params.get("error");

    if (oauthError || errorParam) {
      setError("Google login failed. Please try again.");
    }
  }, [location]);

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "University email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Enter a valid email address";
        }
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";

      default:
        return "";
    }
  };

  const validateAll = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const validationError = validateField(key, formData[key]);
      if (validationError) {
        newErrors[key] = validationError;
      }
    });

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const data = await login(formData);

      if ((data.role || "").toUpperCase() === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    window.location.href = "http://localhost:8082/oauth2/authorization/google";
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        <p>Sign in to your Smart Campus Hub account.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <input
              type="email"
              name="email"
              placeholder="University email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              required
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              required
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn">
            Login
          </button>

          <button
            type="button"
            className="google-login-modern-btn"
            onClick={handleGoogleLogin}
          >
            <span className="google-icon-circle">
              <FcGoogle size={22} />
            </span>
            <span>Continue with Google</span>
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;