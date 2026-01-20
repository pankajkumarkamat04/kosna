import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StickyFooter from "./StickyFooter";
import TelegramIcon from "@mui/icons-material/Telegram";
import FacebookIcon from "@mui/icons-material/Facebook";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import IMAGES from "../../img/image";
import "./Footer.css";
import logo512 from "../../img/logo512.png";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const currentYear = new Date().getFullYear();

  return (
    <React.Fragment>
      <div className="container-fluid footer-container">
        {/* Telegram Floating Icon */}
        <div className="wa-icon-cont">
          <Link target="_blank" to="https://t.me/pankajkamat">
            <TelegramIcon style={{ fontSize: "40px", color: "#fff" }} />
          </Link>
        </div>

        {/* Main Footer Content */}
        <div className="footer-main-content">
          {/* Brand Section */}
          <div className="footer-brand-section">
            <div className="footer-logo">
              <img src={logo512} alt="Logo" width={120} />
            </div>
            <p className="footer-tagline">
              Top up your game in an instant and get back to what matters—epic wins, fast play, and non-stop action!
            </p>
          </div>

          {/* Payment Methods Section */}
          <div className="footer-section payment-section d-block d-lg-none">
            <h6 className="footer-section-title">Payment Methods</h6>
            <div className="footer-divider"></div>
            <div className="payment-methods">
              <div className="payment-logo">
                <img src={IMAGES.paytm} alt="Paytm" />
              </div>
              <div className="payment-logo">
                <img src={IMAGES.phonepe} alt="PhonePe" />
              </div>
              <div className="payment-logo">
                <img src={IMAGES.gpay} alt="Google Pay" />
              </div>
            </div>
            <p className="payment-note">Secure & Instant Payment Processing</p>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section quick-links-section">
            <h6 className="footer-section-title">Quick Links</h6>
            <div className="footer-divider"></div>
            <div className="quick-links-grid">
              <a
                href="https://t.me/pankajkamat"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link-item"
              >
                <TelegramIcon className="quick-link-icon" />
                <span>Telegram</span>
              </a>
              <a
                href="https://facebook.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link-item"
              >
                <FacebookIcon className="quick-link-icon" />
                <span>Facebook</span>
              </a>
              <a
                href="https://t.me/pankajkamat"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link-item"
              >
                <SupportAgentIcon className="quick-link-icon" />
                <span>Support</span>
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="footer-section legal-section">
            <h6 className="footer-section-title">Legal</h6>
            <div className="footer-divider"></div>
            <ul className="legal-links">
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund-policy">Refund Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="footer-copyright">
          <div className="copyright-divider"></div>
          <p>©️ {currentYear} KOSAN SHOP. All Rights Reserved.</p>
          <p className="copyright-subtext">
            Made with ❤️ for Gamers
          </p>
        </div>
      </div>
      <StickyFooter />
    </React.Fragment>
  );
};

export default Footer;
