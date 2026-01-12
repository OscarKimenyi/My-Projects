import React, { useState, useEffect } from "react";
import { guestService, roomService, bookingService } from "../services/api";
import "../styles/NewBooking.css";

const NewBooking = () => {
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookingData, setBookingData] = useState({
    guest_id: "",
    room_id: "",
    check_in: "",
    check_out: "",
    total_amount: 0,
  });
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchGuestsAndRooms();
  }, []);

  const fetchGuestsAndRooms = async () => {
    try {
      const [guestsRes, roomsRes] = await Promise.all([
        guestService.getAllGuests(),
        roomService.getAvailableRooms(),
      ]);
      setGuests(guestsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateTotal = (roomId, checkIn, checkOut) => {
    if (!roomId || !checkIn || !checkOut) return 0;

    const room = rooms.find((r) => r.id === parseInt(roomId));
    if (!room) return 0;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    return nights > 0 ? nights * room.price_per_night : 0;
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setBookingData({ ...bookingData, room_id: roomId });

    const room = rooms.find((r) => r.id === parseInt(roomId));
    setSelectedRoom(room);

    if (bookingData.check_in && bookingData.check_out) {
      const total = calculateTotal(
        roomId,
        bookingData.check_in,
        bookingData.check_out
      );
      setBookingData((prev) => ({ ...prev, total_amount: total }));
    }
  };

  const handleDateChange = (field, value) => {
    const newData = { ...bookingData, [field]: value };
    setBookingData(newData);

    if (newData.room_id && newData.check_in && newData.check_out) {
      const total = calculateTotal(
        newData.room_id,
        newData.check_in,
        newData.check_out
      );
      setBookingData((prev) => ({ ...prev, total_amount: total }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookingService.createBooking(bookingData);
      alert("Booking created successfully!");
      setBookingData({
        guest_id: "",
        room_id: "",
        check_in: "",
        check_out: "",
        total_amount: 0,
      });
      setSelectedRoom(null);
      fetchGuestsAndRooms(); // Refresh available rooms
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Error creating booking. Please try again.");
    }
  };

  return (
    <div className="new-booking">
      <div className="page-header">
        <h1>Create New Booking</h1>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Guest Information</h3>
          <select
            value={bookingData.guest_id}
            onChange={(e) =>
              setBookingData({ ...bookingData, guest_id: e.target.value })
            }
            required
          >
            <option value="">Select Guest</option>
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.first_name} {guest.last_name} - {guest.phone}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <h3>Room Selection</h3>
          <select
            value={bookingData.room_id}
            onChange={handleRoomChange}
            required
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_number} - {room.room_type} (${room.price_per_night}
                /night)
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <h3>Booking Dates</h3>
          <div className="date-inputs">
            <div>
              <label>Check-in Date</label>
              <input
                type="date"
                value={bookingData.check_in}
                onChange={(e) => handleDateChange("check_in", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <label>Check-out Date</label>
              <input
                type="date"
                value={bookingData.check_out}
                onChange={(e) => handleDateChange("check_out", e.target.value)}
                min={
                  bookingData.check_in || new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>
          </div>
        </div>

        {selectedRoom && (
          <div className="room-details">
            <h3>Room Details</h3>
            <p>
              <strong>Room:</strong> {selectedRoom.room_number} -{" "}
              {selectedRoom.room_type}
            </p>
            <p>
              <strong>Price per night:</strong> ${selectedRoom.price_per_night}
            </p>
            <p>
              <strong>Description:</strong> {selectedRoom.description}
            </p>
          </div>
        )}

        {bookingData.total_amount > 0 && (
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <p>
              <strong>Total Amount:</strong> ${bookingData.total_amount}
            </p>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={!bookingData.total_amount}
          >
            Create Booking
          </button>
          <button
            type="button"
            onClick={() => {
              setBookingData({
                guest_id: "",
                room_id: "",
                check_in: "",
                check_out: "",
                total_amount: 0,
              });
              setSelectedRoom(null);
            }}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBooking;
