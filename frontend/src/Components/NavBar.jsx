import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "./NavBar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardPath =
    user?.role === "ADMIN" ? "/admin-dashboard" : "/dashboard";

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand">
          <img src={logo} alt="Smart Campus Hub Logo" className="brand-logo" />
          <div className="brand-text">
            <h2>Smart Campus Hub</h2>
            <p>University Operations Platform</p>
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>
          <NavLink to="/facilities" className="nav-link">
            Facilities
          </NavLink>
          <NavLink to="/bookings" className="nav-link">
            Bookings
          </NavLink>
          <NavLink to="/maintenance" className="nav-link">
            Maintenance
          </NavLink>
          <NavLink to="/notifications" className="nav-link">
            Notifications
          </NavLink>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to={dashboardPath} className="nav-login-btn">
                Dashboard
              </Link>
              <button className="nav-login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login-btn">
                Login
              </Link>
              <Link to="/register" className="nav-register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;