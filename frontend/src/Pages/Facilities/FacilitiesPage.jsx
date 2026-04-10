import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllResources, searchResources } from "../../services/resourceService";
import "./FacilitiesPage.css";

const FacilitiesPage = () => {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [searchBy, setSearchBy] = useState("type");
  const [searchValue, setSearchValue] = useState("");

  const loadResources = async () => {
    try {
      const response = await getAllResources();
      setResources(response.data);
    } catch (error) {
      console.error("Error loading resources:", error);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleSearch = async () => {
    try {
      if (!searchValue.trim()) {
        loadResources();
        return;
      }

      const params = {};

      if (searchBy === "type") {
        params.type = searchValue.toUpperCase().replace(/\s+/g, "_");
      } else if (searchBy === "capacity") {
        params.capacity = Number(searchValue);
      } else if (searchBy === "location") {
        params.location = searchValue;
      }

      const response = await searchResources(params);
      setResources(response.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleResetSearch = () => {
    setSearchBy("type");
    setSearchValue("");
    loadResources();
  };

  const handleBooking = (resource) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("First you should login to the system");
      navigate("/login");
      return;
    }

    if (resource.status === "OUT_OF_SERVICE") {
      return;
    }

    navigate("/bookings", { state: { resource } });
  };

  return (
    <div className="facilities-page">
      <div className="facilities-header">
        <h1>Facilities & Assets Catalogue</h1>
        <p>Browse available lecture halls, labs, meeting rooms, and equipment.</p>
      </div>

      <div className="facilities-filter-bar">
        <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
          <option value="type">Search by Type</option>
          <option value="capacity">Search by Capacity</option>
          <option value="location">Search by Location</option>
        </select>

        <input
          type={searchBy === "capacity" ? "number" : "text"}
          placeholder={
            searchBy === "type"
              ? "Enter type"
              : searchBy === "capacity"
              ? "Enter minimum capacity"
              : "Enter location"
          }
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <button onClick={handleSearch} className="primary-btn">
          Search
        </button>

        <button onClick={handleResetSearch} className="secondary-btn" type="button">
          Reset
        </button>
      </div>

      <div className="facilities-grid">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <div className="facility-card" key={resource.id}>
              <div className="facility-top">
                <h3>{resource.name}</h3>
                <span
                  className={
                    resource.status === "ACTIVE"
                      ? "status-badge active-status"
                      : "status-badge inactive-status"
                  }
                >
                  {resource.status}
                </span>
              </div>

              <p><strong>Type:</strong> {resource.type}</p>
              <p><strong>Capacity:</strong> {resource.capacity}</p>
              <p><strong>Location:</strong> {resource.location}</p>
              <p><strong>Availability:</strong> {resource.availabilityStart} - {resource.availabilityEnd}</p>
              <p><strong>Description:</strong> {resource.description || "N/A"}</p>

              {resource.status === "OUT_OF_SERVICE" ? (
                <button className="unavailable-btn" disabled>
                  Unavailable
                </button>
              ) : (
                <button className="book-btn" onClick={() => handleBooking(resource)}>
                  Booking
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No resources available.</p>
        )}
      </div>
    </div>
  );
};

export default FacilitiesPage;