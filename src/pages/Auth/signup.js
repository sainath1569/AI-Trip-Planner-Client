// src/pages/Auth/SignUp.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Auth.css";

function SignUpComponent() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignUp = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
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

    if (username.length < 3) {
      Swal.fire("Invalid Username", "Username must be at least 3 characters", "warning");
      return;
    }

    setIsSigningUp(true);

    try {
      const requestBody = {
        username: username,
        email: email,
        password: password
      };

      console.log("Sending data:", requestBody);

      const response = await fetch(
        "https://ai-way-2-vacation.onrender.com/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire("Sign Up Successful!", "Your account has been created!", "success");
        navigate("/login");
      } else {
        Swal.fire("Sign Up Failed", data.detail || "Something went wrong", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Network Error", "Please check your connection", "error");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture } = decoded;

      // Use Google name as username
      const username = name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 20);

      console.log("Google signup - Username:", username);
      console.log("Google signup - Email:", email);

      // Use the new Google auth endpoint
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
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("username", data.username);
        if (data.profile_image) {
          localStorage.setItem("profileImage", data.profile_image);
        }

        await Swal.fire("Sign Up Successful!", `Welcome to AI Trip Planner, ${data.username}!`, "success");
        navigate("/planner");
      } else {
        Swal.fire("Google Sign Up Failed", data.detail || "Unable to sign up with Google", "error");
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      Swal.fire("Error", "Google authentication failed", "error");
    }
  };

  const handleGoogleError = () => {
    Swal.fire("Google Sign Up Failed", "Please try again later", "error");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">✈️ AI Trip Planner</h2>
        <h3 className="auth-subtitle">CREATE ACCOUNT</h3>

        <div className="auth-input-container">
          <label className="auth-label" htmlFor="username">Username:</label>
          <input
            className="auth-input"
            id="username"
            name="username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

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
              className="auth-input"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
             <span style={{ fontSize: "1.6rem", lineHeight: 1 }}> {showPassword ? "🙉" : "🙈"} </span>
            </button>
          </div>
        </div>

        <div className="auth-input-container">
          <label className="auth-label" htmlFor="confirmPassword">Confirm Password:</label>
          <div className="password-input-wrapper">
            <input
              className="auth-input"
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggleConfirmPasswordVisibility}
            >
             <span style={{ fontSize: "1.6rem", lineHeight: 1 }}> {showConfirmPassword ? "🙉" : "🙈"} </span>
            </button>
          </div>
        </div>

        <div className="auth-actions">
          <button
            className={`auth-button ${isSigningUp ? "loading" : ""}`}
            type="button"
            onClick={handleSignUp}
            disabled={isSigningUp}
          >
            {isSigningUp ? "Creating Account..." : "Sign Up"}
          </button>
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
            text="signup_with"
          />
        </div>

        <div className="auth-switch-container">
          <p className="auth-switch-text">
            Already have an account?
            <Link to="/login" className="auth-switch-button">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <GoogleOAuthProvider clientId="221878465173-tggq7abqtnmn2di7f214lvgaevenk7dn.apps.googleusercontent.com">
      <SignUpComponent />
    </GoogleOAuthProvider>
  );
}