import React, { useState } from "react";
import { apiRequest } from "../../services/api";
import "./AddTechnician.css";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  specialization: "NETWORK",
  experienceLevel: "BEGINNER",
};

const AddTechnician = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await apiRequest("/admin/users/technicians", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm(initialForm);
      setMessage("Technician account created successfully.");
    } catch (err) {
      setError(err.message || "Failed to create technician");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-tech-page">
      <div className="add-tech-wrapper">
        <div className="add-tech-hero">
          <div>
            <p className="add-tech-tag">Technician Accounts</p>
            <h1>Add Technician</h1>
            <p>Create a technician account so the user can be assigned to maintenance tickets.</p>
          </div>
        </div>

        {message && <div className="add-tech-feedback success">{message}</div>}
        {error && <div className="add-tech-feedback error">{error}</div>}

        <div className="add-tech-card">
          <form className="add-tech-form" onSubmit={handleSubmit}>
            <label>
              Full Name
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>

            <label>
              Email (Username)
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </label>

            <label>
              Phone Number
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
            </label>

            <label>
              Specialization
              <select name="specialization" value={form.specialization} onChange={handleChange}>
                <option value="NETWORK">Network</option>
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="ELECTRICAL">Electrical</option>
              </select>
            </label>

            <label>
              Experience Level
              <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="EXPERT">Expert</option>
              </select>
            </label>

            <button type="submit" className="add-tech-btn" disabled={submitting}>
              {submitting ? "Creating..." : "Create Technician"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTechnician;