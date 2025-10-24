// src/pages/Auth/ForgotPassword.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const handleSendResetLink = async () => {
    if (!email) {
      Swal.fire("Missing Email", "Please enter your email address", "warning");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire(
          "Reset Link Sent!",
          "Password reset link has been sent to your email",
          "success"
        );
        navigate("/login");
      } else {
        // Show specific error message from backend
        Swal.fire("Request Failed", data.detail || "No account found with this email", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Network Error", "Please check your connection", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">✈️ AI Trip Planner</h2>
        <h3 className="auth-subtitle">RESET PASSWORD</h3>
        <p className="auth-description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <div className="auth-input-container">
          <label className="auth-label" htmlFor="email">Email:</label>
          <input
            className="auth-input"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-actions">
          <button
            className={`auth-button ${isSending ? "loading" : ""}`}
            type="button"
            onClick={handleSendResetLink}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;