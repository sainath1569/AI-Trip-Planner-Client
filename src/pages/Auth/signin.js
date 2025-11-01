// src/pages/Auth/Login.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Auth.css";

function LoginComponent() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      Swal.fire("Missing Fields", "Please fill all fields", "warning");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch(
        "https://ai-way-2-vacation.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

        if (response.ok) {
        // Save returned user info
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        if (data.profile_image) {
          localStorage.setItem("profileImage", data.profile_image);
        }

        await Swal.fire("Login Successful!", `Welcome back, ${data.username}!`, "success");
        // If this is the admin user, send them to the admin dashboard
        if (data.email && data.email.toLowerCase() === "admin@gmail.com") {
          navigate("/admin-dashboard");
        } else {
          navigate("/planner");
        }
      } else {
        Swal.fire("Login Failed", data.detail || "Invalid credentials", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Network Error", "Please check your connection", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture } = decoded;

      const username = name.toLowerCase().replace(/\s+/g, '_');

      // Use the Google auth endpoint
      const response = await fetch(
        "https://ai-way-2-vacation.onrender.com/auth/google-auth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: email,
            username: username,
            profile_image: picture 
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save returned user info
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        if (data.profile_image) {
          localStorage.setItem("profileImage", data.profile_image);
        }

        await Swal.fire("Login Successful!", `Welcome to AI Trip Planner, ${data.username}!`, "success");
        // If this is the admin user, send them to the admin dashboard
        // Use the email returned by the backend (data.email). Fallback to the decoded email if needed.
        const returnedEmail = data.email || email;
        if (returnedEmail && returnedEmail.toLowerCase() === "admin@gmail.com") {
          navigate("/admin-dashboard");
        } else {
          navigate("/planner");
        }
      } else {
        Swal.fire("Google Login Failed", data.detail || "Unable to login with Google", "error");
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      Swal.fire("Error", "Google authentication failed", "error");
    }
  };

  const handleGoogleError = () => {
    Swal.fire("Google Login Failed", "Please try again later", "error");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">✈️ AI Trip Planner</h2>
        <h3 className="auth-subtitle">WELCOME BACK</h3>

        <div className="auth-input-container">
          <label className="auth-label" htmlFor="email">Email:</label>
          <input
            className="auth-input"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="auth-input-container">
          <label className="auth-label" htmlFor="password">Password:</label>
          <div className="password-input-wrapper">
            <input
              className="auth-input password-input"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
            >
              <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{showPassword ? "🙉" : "🙈"}</span>
            </button>
          </div>
        </div>

        <div className="auth-actions">
          <button
            className={`auth-button ${isLoggingIn ? "loading" : ""}`}
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </button>
        </div>

        <div className="auth-forgot-password">
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot your password?
          </Link>
        </div>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="google-auth-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="pill"
            theme="filled_blue"
            size="large"
            text="continue_with"
          />
        </div>

        <div className="auth-switch-container">
          <p className="auth-switch-text">
            Don't have an account?
            <Link to="/signup" className="auth-switch-button">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId="221878465173-tggq7abqtnmn2di7f214lvgaevenk7dn.apps.googleusercontent.com">
      <LoginComponent />
    </GoogleOAuthProvider>
  );
}