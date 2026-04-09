import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllResources, searchResources } from "../../services/resourceService";
import "./FacilitiesPage.css";

const FacilitiesPage = () => {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    capacity: "",
    location: "",
  });

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

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.capacity) params.capacity = filters.capacity;
      if (filters.location) params.location = filters.location;

      const response = await searchResources(params);
      setResources(response.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleBooking = (resource) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      alert("First you should login to the system");
      navigate("/login");
      return;
    }

    alert(`Proceed to booking for ${resource.name}`);
  };

  return (
    <div className="facilities-page">
      <div className="facilities-header">
        <h1>Facilities & Assets Catalogue</h1>
        <p>Browse available lecture halls, labs, meeting rooms, and equipment.</p>
      </div>

      <div className="facilities-filter-bar">
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        <input
          type="number"
          name="capacity"
          placeholder="Minimum Capacity"
          value={filters.capacity}
          onChange={handleFilterChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleFilterChange}
        />

        <button onClick={handleSearch} className="primary-btn">
          Search
        </button>
      </div>

      <div className="facilities-grid">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <div className="facility-card" key={resource.id}>
              <h3>{resource.name}</h3>
              <p><strong>Type:</strong> {resource.type}</p>
              <p><strong>Capacity:</strong> {resource.capacity}</p>
              <p><strong>Location:</strong> {resource.location}</p>
              <p><strong>Availability:</strong> {resource.availabilityStart} - {resource.availabilityEnd}</p>
              <p><strong>Status:</strong> {resource.status}</p>
              <p><strong>Description:</strong> {resource.description || "N/A"}</p>

              <button className="book-btn" onClick={() => handleBooking(resource)}>
                Booking
              </button>
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