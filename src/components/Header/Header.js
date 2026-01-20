import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SideMenu from "./SideMenu";
import Backdrop from "./Backdrop";
import Tippy from "@tippyjs/react";
import LogoutTippy from "./LogoutTippy";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import "./Header.css";
import IMAGES from "../../img/image.js";

const Header = () => {
  const { user } = useSelector((state) => state.user);
  const { balance } = useAuth();
  const navigate = useNavigate();
  const [sideMenu, setSideMenu] = useState(false);
  const [black, setBlack] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 40) {
        setBlack(true);
      } else {
        setBlack(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header className="header d-none d-lg-flex">
        <div className="header-main">
          <div
            className="burger-icon header-left"
            onClick={() => setSideMenu(!sideMenu)}
          >
            <MenuIcon className="icon" />
          </div>
          <SideMenu sideMenu={sideMenu} setSideMenu={setSideMenu} />
          <Backdrop sideMenu={sideMenu} setSideMenu={setSideMenu} />
          <div className="logo header-center" onClick={() => navigate("/")}>
            <img src={IMAGES.logo} alt="" />
          </div>
          <div className="action-btns header-right">
            {user && (
              <div
                onClick={() => navigate("/wallet")}
                className="wallet-cont header-coin-btn"
              >
                <img width="20px" height="20px" src={IMAGES.coin} alt="" />
                <span>{parseFloat(balance).toFixed(2)}</span>
              </div>
            )}
            <Tippy
              interactive
              theme="light"
              content={<LogoutTippy user={user && user} />}
            >
              <span
                className="menu-img-container d-flex header-user-icon"
                onClick={() => navigate(user ? "/my-account" : "/login")}
                style={{ cursor: "pointer" }}
              >
                <AccountCircleIcon
                  className="icon d-lg-block d-md-none d-none"
                  style={{ fontSize: "32px", color: "#ffffff" }}
                />
              </span>
            </Tippy>
          </div>
        </div>
      </header>
      <div className={`mobile-header ${black && "active"} d-lg-none`}>
        <div
          className="burger-icon mobile-header-left"
          onClick={() => setSideMenu(!sideMenu)}
        >
          <MenuIcon className="icon" />
        </div>
        <div className="logo mobile-header-center" onClick={() => navigate("/")}>
          <img src={IMAGES.logo} alt="" />
        </div>
        <div className="mobile-header-right">
          {user && (
            <div
              onClick={() => navigate("/wallet")}
              className="wallet-cont mobile-header-coin-btn"
            >
              <img width="18px" height="18px" src={IMAGES.coin} alt="" />
              <span>{parseFloat(balance).toFixed(2)}</span>
            </div>
          )}
          <Tippy
            interactive
            theme="light"
            content={<LogoutTippy user={user && user} />}
          >
            <span
              className="menu-img-container d-flex mobile-header-user-icon"
              onClick={() => navigate(user ? "/my-account" : "/login")}
              style={{ cursor: "pointer" }}
            >
              <AccountCircleIcon
                className="icon"
                style={{ fontSize: "28px", color: "#ffffff" }}
              />
            </span>
          </Tippy>
        </div>
      </div>
      <SideMenu sideMenu={sideMenu} setSideMenu={setSideMenu} />
      <Backdrop sideMenu={sideMenu} setSideMenu={setSideMenu} />
    </>
  );
};

export default Header;
