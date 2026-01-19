import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import Layout from "../components/Layout/Layout";
import { authAPI } from "../lib/api";
import "./Register.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const isPhoneLogin = false; // Changed to email login
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Email domain suggestions
  const emailDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];

  // Handle email input change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(""); // Clear error on input change

    // Check if user typed '@' and show suggestions
    if (value.includes("@")) {
      const parts = value.split("@");
      const localPart = parts[0];
      const domainPart = parts[1] || "";

      if (localPart && domainPart.length >= 0) {
        // Filter suggestions based on what user typed after @
        const filteredSuggestions = emailDomains
          .filter((domain) => domain.toLowerCase().startsWith(domainPart.toLowerCase()))
          .map((domain) => `${localPart}@${domain}`);
        
        setSuggestions(filteredSuggestions);
        setShowSuggestions(filteredSuggestions.length > 0 && domainPart !== filteredSuggestions[0]?.split("@")[1]);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setEmail(suggestion);
    setShowSuggestions(false);
    setEmailError("");
  };

  // Validate email
  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue.trim());
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      message.error("Please enter your email address");
      return;
    }

    // Email validation
    if (!validateEmail(email)) {
      message.error("Please enter a valid email address");
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.sendOTP(email, isPhoneLogin);
      const data = await response.json();

      if (response.ok) {
        message.success("OTP sent successfully to your email!");
        // Store email for OTP verification
        localStorage.setItem(
          "loginData",
          JSON.stringify({
            email: email,
            isPhoneLogin: isPhoneLogin,
          })
        );
        navigate("/otp");
      } else {
        message.error(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      message.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid register-container">
        <div className="row text-center" style={{ width: "100%", margin: "auto" }}>
          <div className="form d-block m-auto col-12 col-sm-12 col-md-6 col-lg-6">
            <form className="register-form">
              <h1 style={{ color: "white" }}>Sign In</h1>
              <div className="form-fields mb-3" style={{ position: "relative" }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => {
                    if (email.trim() && !validateEmail(email)) {
                      setEmailError("Please enter a valid email address");
                    } else {
                      setEmailError("");
                    }
                    // Hide suggestions on blur after a short delay
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  onFocus={() => {
                    // Show suggestions again if @ is present
                    if (email.includes("@")) {
                      handleEmailChange({ target: { value: email } });
                    }
                  }}
                  className={`form-control ${emailError ? "is-invalid" : ""}`}
                  autoComplete="email"
                />
                {emailError && (
                  <div className="text-danger mt-1" style={{ fontSize: "12px", textAlign: "left" }}>
                    {emailError}
                  </div>
                )}
                
                {/* Email suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid var(--a)",
                      borderRadius: "8px",
                      marginTop: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 4px 12px rgba(1, 255, 253, 0.2)",
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: "10px 16px",
                          cursor: "pointer",
                          color: "#333",
                          fontSize: "14px",
                          borderBottom: index < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "rgba(1, 255, 253, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remember me */}
              <div className="d-flex justify-content-between mb-3">
                <label className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="me-2"
                  />
                  <span style={{ color: "white", fontSize: "13px" }}>Remember me</span>
                </label>
              </div>

              {/* Send OTP Button */}
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading}
                className="register-btn w-100"
              >
                {isLoading ? "SENDING OTP..." : "Send OTP"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
