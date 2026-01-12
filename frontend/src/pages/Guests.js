import React, { useState, useEffect } from "react";
import { guestService } from "../services/api";
import "../styles/Guests.css";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await guestService.getAllGuests();
      setGuests(response.data);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await guestService.addGuest(newGuest);
      setNewGuest({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
      });
      setShowForm(false);
      fetchGuests();
    } catch (error) {
      console.error("Error adding guest:", error);
    }
  };

  return (
    <div className="guests">
      <div className="page-header">
        <h1>Guest Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add New Guest
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Guest</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newGuest.first_name}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, first_name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newGuest.last_name}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, last_name: e.target.value })
                  }
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={newGuest.email}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, email: e.target.value })
                }
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newGuest.phone}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, phone: e.target.value })
                }
              />
              <textarea
                placeholder="Address"
                value={newGuest.address}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, address: e.target.value })
                }
                rows="3"
              />
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Add Guest
                </button>
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="guests-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td>
                  {guest.first_name} {guest.last_name}
                </td>
                <td>{guest.email || "N/A"}</td>
                <td>{guest.phone || "N/A"}</td>
                <td>{guest.address || "N/A"}</td>
                <td>{new Date(guest.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Guests;
