import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navigation.css";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>Rolex Hotel</h2>
      </div>
      <ul className="nav-links">
        <li>
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/rooms"
            className={location.pathname === "/rooms" ? "active" : ""}
          >
            Rooms
          </Link>
        </li>
        <li>
          <Link
            to="/guests"
            className={location.pathname === "/guests" ? "active" : ""}
          >
            Guests
          </Link>
        </li>
        <li>
          <Link
            to="/bookings"
            className={location.pathname === "/bookings" ? "active" : ""}
          >
            Bookings
          </Link>
        </li>
        <li>
          <Link to="/new-booking" className="btn-primary">
            New Booking
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
