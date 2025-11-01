// src/pages/Auth/ResetPassword.js
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [isResetting, setIsResetting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResetPassword = async () => {
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      Swal.fire("Missing Fields", "Please fill all fields", "warning");
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire("Password Mismatch", "Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      Swal.fire("Weak Password", "Password must be at least 6 characters", "warning");
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch(
        "https://ai-way-2-vacation.onrender.com/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            token, 
            new_password: password 
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire(
          "Password Reset Successful!",
          "Your password has been updated successfully",
          "success"
        );
        navigate("/login");
      } else {
        Swal.fire("Reset Failed", data.detail || "Invalid or expired token", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Network Error", "Please check your connection", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">✈️ AI Trip Planner</h2>
        <h3 className="auth-subtitle">CREATE NEW PASSWORD</h3>
        <p className="auth-description">
          Please enter your new password below.
        </p>

        <div className="auth-input-container">
          <label className="auth-label" htmlFor="password">New Password:</label>
          <input
            className="auth-input"
            id="password"
            name="password"
            type="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="auth-input-container">
          <label className="auth-label" htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            className="auth-input"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <div className="auth-actions">
          <button
            className={`auth-button ${isResetting ? "loading" : ""}`}
            type="button"
            onClick={handleResetPassword}
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset Password"}
          </button>
        </div>

        <div className="auth-switch-container">
          <p className="auth-switch-text">
            Remember your password?
            <Link to="/login" className="auth-switch-button">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;