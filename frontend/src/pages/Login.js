import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(credentials.username, credentials.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="hotel-icon">
              <i className="icon">🏨</i>
            </div>
            <h1>Grand Hotel</h1>
            <p>Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account</p>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Username</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <span className="loading">
                  <span className="spinner"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="demo-credentials">
            <div className="demo-header">
              <h3>Demo Credentials</h3>
            </div>
            <div className="credential-cards">
              <div className="credential-card admin">
                <h4>Administrator</h4>
                <p>
                  Username: <strong>admin</strong>
                </p>
                <p>
                  Password: <strong>admin123</strong>
                </p>
                <small>Full system access</small>
              </div>
              <div className="credential-card manager">
                <h4>Manager</h4>
                <p>
                  Username: <strong>manager</strong>
                </p>
                <p>
                  Password: <strong>manager123</strong>
                </p>
                <small>Management access</small>
              </div>
              <div className="credential-card housekeeping">
                <h4>Housekeeping</h4>
                <p>
                  Username: <strong>housekeeper</strong>
                </p>
                <p>
                  Password: <strong>clean123</strong>
                </p>
                <small>Cleaning tasks only</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
