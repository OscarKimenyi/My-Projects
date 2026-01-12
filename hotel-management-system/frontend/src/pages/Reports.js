import React, { useState, useEffect } from "react";
import { reportService } from "../services/api";
import "../styles/Reports.css";

const Reports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [guestStats, setGuestStats] = useState({});
  const [dateRange, setDateRange] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [revenueRes, occupancyRes, guestsRes] = await Promise.all([
        reportService.getRevenue(dateRange),
        reportService.getOccupancy(),
        reportService.getGuestStats(),
      ]);

      setRevenueData(revenueRes.data);
      setOccupancyData(occupancyRes.data);
      setGuestStats(guestsRes.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleDateChange = () => {
    fetchReports();
  };

  const totalRevenue = revenueData.reduce(
    (sum, day) => sum + parseFloat(day.total_revenue || 0),
    0
  );
  const totalBookings = revenueData.reduce(
    (sum, day) => sum + parseInt(day.bookings_count || 0),
    0
  );

  return (
    <div className="reports">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
      </div>

      {/* Date Range Filter */}
      <div className="report-filters">
        <h3>Date Range</h3>
        <div className="date-inputs">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) =>
                setDateRange({ ...dateRange, start_date: e.target.value })
              }
            />
          </div>
          <div>
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setDateRange({ ...dateRange, end_date: e.target.value })
              }
            />
          </div>
          <button onClick={handleDateChange} className="btn-primary">
            Apply Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="report-summary">
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="summary-number">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Bookings</h3>
          <p className="summary-number">{totalBookings}</p>
        </div>
        <div className="summary-card">
          <h3>Total Guests</h3>
          <p className="summary-number">{guestStats.total_guests || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Unique Guests</h3>
          <p className="summary-number">{guestStats.unique_emails || 0}</p>
        </div>
      </div>

      {/* Revenue Report */}
      <div className="report-section">
        <h2>Revenue Report</h2>
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Average Value</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((day) => (
                <tr key={day.date}>
                  <td>{new Date(day.date).toLocaleDateString()}</td>
                  <td>{day.bookings_count}</td>
                  <td>${parseFloat(day.total_revenue).toFixed(2)}</td>
                  <td>${parseFloat(day.average_booking_value).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Occupancy Report */}
      <div className="report-section">
        <h2>Occupancy Report</h2>
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>Room Type</th>
                <th>Total Rooms</th>
                <th>Occupied</th>
                <th>Occupancy Rate</th>
              </tr>
            </thead>
            <tbody>
              {occupancyData.map((room) => (
                <tr key={room.room_type}>
                  <td>{room.room_type}</td>
                  <td>{room.total_rooms}</td>
                  <td>{room.occupied_rooms}</td>
                  <td>{room.occupancy_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
