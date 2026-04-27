import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./LoginPopup.css";
import { X, Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (currState === "Sign Up" && !data.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 6 && currState === "Sign Up") {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    const endpoint = currState === "Login" ? "login" : "register";

    try {
      const response = await axios.post(`${url}/api/user/${endpoint}`, data);

      if (response.data.success) {
        const token = response.data.token;
        const user = response.data.user;

        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userEmail", user.email);

        if (rememberMe && currState === "Login") {
          localStorage.setItem("rememberedEmail", data.email);
        } else if (!rememberMe) {
          localStorage.removeItem("rememberedEmail");
        }

        setSuccessMessage(currState === "Login" ? "Login successful! Redirecting..." : "Account created successfully!");

        setTimeout(() => {
          setShowLogin(false);
        }, 1500);
      } else {
        setErrors({ general: response.data.message || "Something went wrong" });
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Unable to connect to server. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setCurrState(currState === "Login" ? "Sign Up" : "Login");
    setErrors({});
    setSuccessMessage("");
    setData({
      name: "",
      email: rememberMe ? data.email : "",
      password: "",
    });
  };

  return (
    <div className="login-overlay" onClick={() => setShowLogin(false)}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>

        {/* Decorative elements */}
        <div className="card-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
        </div>

        {/* Close button */}
        <button
          type="button"
          className="close-btn-absolute"
          onClick={() => setShowLogin(false)}
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="login-header">
          <div className="header-icon">
            <Shield size={32} />
          </div>
          <h2>{currState === "Login" ? "Welcome Back" : "Create Account"}</h2>
          <p>
            {currState === "Login"
              ? "Sign in to access your dashboard"
              : "Join us and start your journey"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="login-form">

          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="error-message">
              <span>{errors.general}</span>
            </div>
          )}

          <div className="form-fields">
            {currState === "Sign Up" && (
              <div className={`input-group ${errors.name ? 'error' : ''}`}>
                <div className="input-icon">
                  <User size={18} />
                </div>
                <input
                  name="name"
                  type="text"
                  value={data.name}
                  onChange={onChangeHandler}
                  placeholder="Full name"
                  autoComplete="name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
            )}

            <div className={`input-group ${errors.email ? 'error' : ''}`}>
              <div className="input-icon">
                <Mail size={18} />
              </div>
              <input
                name="email"
                type="email"
                value={data.email}
                onChange={onChangeHandler}
                placeholder="Email address"
                autoComplete="email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`input-group ${errors.password ? 'error' : ''}`}>
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={onChangeHandler}
                placeholder="Password"
                autoComplete={currState === "Login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          </div>

          {/* Remember me & Forgot password */}
          {currState === "Login" && (
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-link">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              <>
                {currState === "Login" ? "Sign In" : "Create Account"}
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Switch mode */}
          <div className="switch-mode">
            <span>
              {currState === "Login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={handleSwitchMode}
              className="switch-link"
            >
              {currState === "Login" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>By continuing, you agree to our</p>
          <div className="footer-links">
            <button type="button">Terms of Service</button>
            <span>•</span>
            <button type="button">Privacy Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

LoginPopup.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

export default LoginPopup;