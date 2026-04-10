import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllResources } from "../../services/resourceService";
import "./Home.css";

const Home = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await getAllResources();
        setResources(response.data);
      } catch (error) {
        console.error("Error loading resources:", error);
      }
    };

    loadResources();
  }, []);

  const totalResources = resources.length;
  const activeResources = resources.filter(
    (resource) => resource.status === "ACTIVE"
  ).length;
  const outOfServiceResources = resources.filter(
    (resource) => resource.status === "OUT_OF_SERVICE"
  ).length;

  return (
    <main className="page">
      <section className="hero-section">
        <div className="hero-left">
          <span className="section-tag">SMART CAMPUS OPERATIONS</span>
          <h1>
            Manage university spaces, bookings, support requests,
            and updates in one place.
          </h1>
          <p>
            Smart Campus Hub connects facilities management, booking workflows,
            maintenance reporting, notifications, and secure system access into
            one smooth university platform for students, staff, and administrators.
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
                <h4>{totalResources}</h4>
                <p>Total Resources</p>
              </div>

              <div className="stat-box">
                <h4>{activeResources}</h4>
                <p>Active Resources</p>
              </div>

              <div className="stat-box">
                <h4>{outOfServiceResources}</h4>
                <p>Out of Service</p>
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
          <span className="section-tag">CONNECTED WORKFLOW</span>
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
    </main>
  );
};

export default Home;