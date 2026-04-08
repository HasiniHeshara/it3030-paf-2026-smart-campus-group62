import React from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./NavBar.css";

const Navbar = () => {
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
          <Link to="/login" className="nav-login-btn">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;