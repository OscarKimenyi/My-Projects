import React, { useState, useEffect } from "react";
import { roomService, guestService, bookingService } from "../services/api";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalGuests: 0,
    activeBookings: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [roomsRes, availableRoomsRes, guestsRes, bookingsRes] =
        await Promise.all([
          roomService.getAllRooms(),
          roomService.getAvailableRooms(),
          guestService.getAllGuests(),
          bookingService.getAllBookings(),
        ]);

      // Count active bookings (both 'confirmed' and 'checked-in')
      const activeBookingsCount = bookingsRes.data.filter(
        (b) => b.status === "confirmed" || b.status === "checked-in"
      ).length;

      setStats({
        totalRooms: roomsRes.data.length,
        availableRooms: availableRoomsRes.data.length,
        totalGuests: guestsRes.data.length,
        activeBookings: activeBookingsCount,
        totalBookings: bookingsRes.data.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Rooms</h3>
          <p className="stat-number">{stats.totalRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Available Rooms</h3>
          <p className="stat-number">{stats.availableRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Total Guests</h3>
          <p className="stat-number">{stats.totalGuests}</p>
        </div>
        <div className="stat-card">
          <h3>Active Bookings</h3>
          <p className="stat-number">{stats.activeBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{stats.totalBookings}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
