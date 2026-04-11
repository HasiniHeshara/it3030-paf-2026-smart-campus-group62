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

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  const validateField = (name, value, allValues = formData) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Full name must be at least 3 characters";
        return "";

      case "year":
        if (!value.trim()) return "Year is required";
        if (!/^[1-4](st|nd|rd|th)\sYear\s-\s[1-2](st|nd|rd|th)\sSemester$/i.test(value.trim())) {
          return "Use format like 1st Year - 2nd Semester";
        }
        return "";

      case "faculty":
        if (!value.trim()) return "Faculty is required";
        return "";

      case "itNumber":
        if (!value.trim()) return "IT number is required";
        if (!/^IT\d{8}$/i.test(value.trim())) return "IT number must be like IT12345678";
        return "";

      case "email":
        if (!value.trim()) return "University email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Enter a valid email address";
        }
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";

      default:
        return "";
    }
  };

  const validateAll = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const validationError = validateField(key, formData[key], formData);
      if (validationError) {
        newErrors[key] = validationError;
      }
    });

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, updatedFormData),
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
          <div className="auth-field">
            <input
              type="text"
              name="fullName"
              placeholder="Full name"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? "input-error" : ""}
              required
            />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>

          <div className="auth-field">
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={errors.year ? "input-error" : ""}
              required
            >
            <option value="">Select Year</option>
            <option value="1st Year - 1st Semester">1st Year - 1st Semester</option>
            <option value="1st Year - 2nd Semester">1st Year - 2nd Semester</option>
            <option value="2nd Year - 1st Semester">2nd Year - 1st Semester</option>
            <option value="2nd Year - 2nd Semester">2nd Year - 2nd Semester</option>
            <option value="3rd Year - 1st Semester">3rd Year - 1st Semester</option>
            <option value="3rd Year - 2nd Semester">3rd Year - 2nd Semester</option>
            <option value="4th Year - 1st Semester">4th Year - 1st Semester</option>
            <option value="4th Year - 2nd Semester">4th Year - 2nd Semester</option>
          </select>
            {errors.year && <p className="field-error">{errors.year}</p>}
          </div>

          <div className="auth-field">
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className={errors.faculty ? "input-error" : ""}
              required
            >
              <option value="">Select Faculty</option>
              <option value="Computing">Computing</option>
              <option value="Business">Business</option>
              <option value="Humanities">Humanities</option>
              <option value="Engineering">Engineering</option>
            </select>
            {errors.faculty && <p className="field-error">{errors.faculty}</p>}
          </div>

          <div className="auth-field">
            <input
              type="text"
              name="itNumber"
              placeholder="IT Number"
              value={formData.itNumber}
              onChange={handleChange}
              className={errors.itNumber ? "input-error" : ""}
              required
            />
            {errors.itNumber && <p className="field-error">{errors.itNumber}</p>}
          </div>

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