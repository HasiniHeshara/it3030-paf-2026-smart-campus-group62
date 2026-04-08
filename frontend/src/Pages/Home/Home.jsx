import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <main className="page">
      <section className="hero-section">
        <div className="hero-left">
          <span className="section-tag">Smart Campus Operations</span>
          <h1>Manage university spaces, bookings, support requests, and updates in one place.</h1>
          <p>
            Smart Campus Hub connects facilities management, booking workflows,
            maintenance reporting, notifications, and secure system access into
            one smooth university platform for students, staff, and
            administrators.
          </p>

          <div className="hero-buttons">
            <Link to="/facilities" className="primary-btn">
              Explore Facilities
            </Link>
            <Link to="/bookings" className="secondary-btn">
              View Booking Flow
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="glass-card">
            <h3>Campus Snapshot</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <h4>128</h4>
                <p>Resources Listed</p>
              </div>
              <div className="stat-box">
                <h4>46</h4>
                <p>Active Bookings</p>
              </div>
              <div className="stat-box">
                <h4>12</h4>
                <p>Open Tickets</p>
              </div>
              <div className="stat-box">
                <h4>24/7</h4>
                <p>System Access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="connected-section">
        <div className="section-heading">
          <span className="section-tag">Connected Workflow</span>
          <h2>How the full system works together</h2>
          <p>
            Every module supports the next step in the university workflow,
            creating one connected real-world experience.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="workflow-icon">🏫</div>
            <h3>1. Discover Resources</h3>
            <p>
              Users browse lecture halls, labs, meeting rooms, and equipment
              based on capacity, location, availability, and status.
            </p>
          </div>

          <div className="workflow-card">
            <div className="workflow-icon">📅</div>
            <h3>2. Make Bookings</h3>
            <p>
              After finding a suitable resource, users submit booking requests
              with purpose, date, and expected attendees.
            </p>
          </div>

          <div className="workflow-card">
            <div className="workflow-icon">🛠️</div>
            <h3>3. Report Issues</h3>
            <p>
              If a facility or asset has a problem, users can create
              maintenance or incident tickets with details and evidence.
            </p>
          </div>

          <div className="workflow-card">
            <div className="workflow-icon">🔔</div>
            <h3>4. Receive Updates</h3>
            <p>
              The system keeps users informed about booking decisions, ticket
              progress, and new comments through notifications.
            </p>
          </div>
        </div>
      </section>

      <section className="feature-highlight">
        <div className="feature-left">
          <span className="section-tag">Designed for Universities</span>
          <h2>A clean and practical platform for campus operations</h2>
          <p>
            The interface is built to feel modern, calm, and easy to use, with
            soft academic colors and structured sections that suit a university
            management system.
          </p>
        </div>

        <div className="feature-right">
          <div className="mini-panel">
            <h3>For Students & Staff</h3>
            <p>
              Browse spaces, request bookings, report problems, and stay
              informed without switching between separate systems.
            </p>
          </div>

          <div className="mini-panel">
            <h3>For Admin Teams</h3>
            <p>
              Monitor facilities, manage approvals, review maintenance issues,
              and control access through one dashboard-driven workflow.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;