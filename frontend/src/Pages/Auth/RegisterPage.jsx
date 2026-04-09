import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    year: "",
    faculty: "",
    itNumber: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Register to use Smart Campus Hub.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="year"
            placeholder="Year"
            value={formData.year}
            onChange={handleChange}
            required
          />

         <select
            name="faculty"
            value={formData.faculty}
            onChange={handleChange}
            required
         >
            <option value="">Select Faculty</option>
            <option value="Computing">Computing</option>
            <option value="Business">Business</option>
            <option value="Humanities">Humanities</option>
            <option value="Engineering">Engineering</option>
         </select>

          <input
            type="text"
            name="itNumber"
            placeholder="IT Number"
            value={formData.itNumber}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="University email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn">
            Register
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;