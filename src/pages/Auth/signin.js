// src/pages/Auth/Login.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Auth.css";

function LoginComponent() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        if (data.profileImage) {
          localStorage.setItem("profileImage", data.profileImage);
        }

        await Swal.fire("Login Successful!", `Welcome back, ${data.username}!`, "success");
        navigate("/dashboard");
      } else {
        Swal.fire("Login Failed", data.message || "Invalid credentials", "error");
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

      const response = await fetch(
        "http://localhost:5000/api/auth/google-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            username: name,
            profileImage: picture 
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        if (data.profileImage) {
          localStorage.setItem("profileImage", data.profileImage);
        }

        await Swal.fire("Login Successful!", `Welcome back, ${data.username}!`, "success");
        navigate("/dashboard");
      } else {
        Swal.fire("Auth Failed", data.message || "Unable to login with Google", "error");
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
          <input
            className="auth-input"
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
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