import React, { useState, useEffect } from "react";
import { roomService } from "../services/api";
import "../styles/Rooms.css";
import "../styles/SearchFilters.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [newRoom, setNewRoom] = useState({
    room_number: "",
    room_type: "Standard",
    price_per_night: "",
    description: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await roomService.addRoom(newRoom);
      setNewRoom({
        room_number: "",
        room_type: "Standard",
        price_per_night: "",
        description: "",
      });
      setShowForm(false);
      fetchRooms();
      alert("Room added successfully!");
    } catch (error) {
      console.error("Error adding room:", error);
      alert("Error adding room. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      available: "status-available",
      occupied: "status-occupied",
      maintenance: "status-maintenance",
    };
    return (
      <span className={`status-badge ${statusClass[status]}`}>{status}</span>
    );
  };

  // Filter rooms based on search term and filters
  const filteredRooms = rooms.filter((room) => {
    // Search filter
    if (
      searchTerm &&
      !room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !room.room_type.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !room.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && room.status !== statusFilter) {
      return false;
    }

    // Type filter
    if (typeFilter !== "all" && room.room_type !== typeFilter) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  return (
    <div className="rooms">
      <div className="page-header">
        <h1>Room Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add New Room
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search rooms by number, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
          <button
            onClick={clearFilters}
            className="btn-secondary"
            disabled={
              !searchTerm && statusFilter === "all" && typeFilter === "all"
            }
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Display search results info */}
      <div className="search-info">
        <p>
          Showing {filteredRooms.length} of {rooms.length} rooms
          {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear all
            </button>
          )}
        </p>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Room</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Room Number *</label>
                <input
                  type="text"
                  placeholder="e.g., 101, 202"
                  value={newRoom.room_number}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, room_number: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Room Type *</label>
                <select
                  value={newRoom.room_type}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, room_type: e.target.value })
                  }
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Executive">Executive</option>
                  <option value="Presidential">Presidential</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price per Night ($) *</label>
                <input
                  type="number"
                  placeholder="e.g., 100.00"
                  min="1"
                  step="0.01"
                  value={newRoom.price_per_night}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, price_per_night: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Room features, amenities, bed type, etc."
                  value={newRoom.description}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, description: e.target.value })
                  }
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Add Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredRooms.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🏨</div>
          <h3>No rooms found</h3>
          <p>
            {rooms.length === 0
              ? "No rooms have been added yet. Click 'Add New Room' to get started."
              : "No rooms match your current filters. Try adjusting your search criteria."}
          </p>
          {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-card-header">
                <h3>Room {room.room_number}</h3>
                {getStatusBadge(room.status)}
              </div>
              <p className="room-type">{room.room_type}</p>
              <p className="room-price">
                ${parseFloat(room.price_per_night).toFixed(2)}/night
              </p>
              <p className="room-description">
                {room.description || "No description provided."}
              </p>
              <div className="room-card-footer">
                <small>
                  Added: {new Date(room.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
