import React, { useState, useEffect } from "react";
import { bookingService } from "../services/api";
import "../styles/Bookings.css";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingService.checkIn(bookingId);
      alert("Guest checked in successfully!");
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Error checking in guest");
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await bookingService.checkOut(bookingId);
      alert("Guest checked out successfully!");
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error checking out:", error);
      alert("Error checking out guest");
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      confirmed: "status-confirmed",
      "checked-in": "status-checked-in",
      "checked-out": "status-checked-out",
      cancelled: "status-cancelled",
    };
    return (
      <span className={`status-badge ${statusClass[status]}`}>{status}</span>
    );
  };

  const getActionButtons = (booking) => {
    if (booking.status === "confirmed") {
      return (
        <button
          className="btn-success"
          onClick={() => handleCheckIn(booking.id)}
        >
          Check In
        </button>
      );
    } else if (booking.status === "checked-in") {
      return (
        <button
          className="btn-warning"
          onClick={() => handleCheckOut(booking.id)}
        >
          Check Out
        </button>
      );
    }
    return null;
  };

  return (
    <div className="bookings">
      <div className="page-header">
        <h1>Booking Management</h1>
      </div>

      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Booked On</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>
                  {booking.first_name} {booking.last_name}
                </td>
                <td>
                  {booking.room_number} ({booking.room_type})
                </td>
                <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                <td>${booking.total_amount}</td>
                <td>{getStatusBadge(booking.status)}</td>
                <td>{getActionButtons(booking)}</td>
                <td>{new Date(booking.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;
