import React, { useEffect, useState } from "react";
import { addResource, getAllResources, searchResources } from "../../services/resourceService";
import "./AddResource.css";

const AddResource = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "LECTURE_HALL",
    capacity: "",
    location: "",
    availabilityStart: "",
    availabilityEnd: "",
    status: "ACTIVE",
    description: "",
  });

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    capacity: "",
    location: "",
    status: "",
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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      await addResource(payload);
      alert("Resource added successfully");

      setFormData({
        name: "",
        type: "LECTURE_HALL",
        capacity: "",
        location: "",
        availabilityStart: "",
        availabilityEnd: "",
        status: "ACTIVE",
        description: "",
      });

      loadResources();
    } catch (error) {
      console.error(error);
      alert("Failed to add resource");
    }
  };

  const handleSearch = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.capacity) params.capacity = filters.capacity;
      if (filters.location) params.location = filters.location;
      if (filters.status) params.status = filters.status;

      const response = await searchResources(params);
      setResources(response.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleReset = () => {
    setFilters({
      type: "",
      capacity: "",
      location: "",
      status: "",
    });
    loadResources();
  };

  return (
    <div className="resource-page">
      <div className="resource-page-header">
        <h1>Add Resources</h1>
        <p>
          Maintain a catalogue of lecture halls, labs, meeting rooms, and equipment
          with metadata such as type, capacity, location, availability, and status.
        </p>
      </div>

      <div className="resource-page-grid">
        <div className="resource-form-card">
          <h2>Resource Form</h2>

          <form onSubmit={handleSubmit} className="resource-form">
            <input
              type="text"
              name="name"
              placeholder="Resource Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>

            <input
              type="number"
              name="capacity"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <label>Availability Start</label>
            <input
              type="time"
              name="availabilityStart"
              value={formData.availabilityStart}
              onChange={handleChange}
              required
            />

            <label>Availability End</label>
            <input
              type="time"
              name="availabilityEnd"
              value={formData.availabilityEnd}
              onChange={handleChange}
              required
            />

            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>

            <textarea
              name="description"
              placeholder="Description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />

            <button type="submit" className="primary-btn">
              Add Resource
            </button>
          </form>
        </div>

        <div className="resource-filter-card">
          <h2>Search & Filter</h2>

          <div className="resource-form">
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

            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>

            <button type="button" className="primary-btn" onClick={handleSearch}>
              Search
            </button>

            <button type="button" className="secondary-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="resource-list-card">
        <h2>Added Resources</h2>

        <div className="resource-list-grid">
          {resources.length > 0 ? (
            resources.map((resource) => (
              <div className="resource-item-card" key={resource.id}>
                <h3>{resource.name}</h3>
                <p><strong>Type:</strong> {resource.type}</p>
                <p><strong>Capacity:</strong> {resource.capacity}</p>
                <p><strong>Location:</strong> {resource.location}</p>
                <p><strong>Availability:</strong> {resource.availabilityStart} - {resource.availabilityEnd}</p>
                <p><strong>Status:</strong> {resource.status}</p>
                <p><strong>Description:</strong> {resource.description || "N/A"}</p>
              </div>
            ))
          ) : (
            <p>No resources found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddResource;