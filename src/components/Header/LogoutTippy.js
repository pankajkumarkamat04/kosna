import React, { useEffect } from "react";
import Person2Icon from "@mui/icons-material/Person2";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { authAPI } from "../../lib/api";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/features/userSlice";
import "./Header.css";

const LogoutTippy = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    dispatch(setUser(null));
    navigate("/login");
  };

  const getUserData = async () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");

    if (!token) {
      dispatch(setUser(null));
      return;
    }

    try {
      const response = await authAPI.getUserInfo();

      if (response.ok) {
        const res = await response.json();
        const user = res.data || res;

        if (user && (user._id || user.name || user.email)) {
          dispatch(setUser(user));
        } else {
          if (response.status === 401 || response.status === 403) {
            dispatch(setUser(null));
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
          } else {
            dispatch(setUser(null));
          }
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          dispatch(setUser(null));
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
        } else {
          dispatch(setUser(null));
        }
      }
    } catch (error) {
      dispatch(setUser(null));
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="logout-tippy-container">
      {user ? (
        <>
          <div className="user-profile-section">
            <div className="user-avatar">
              <Person2Icon />
            </div>
            <div className="user-info">
              <span className="user-name">{user.name || "User"}</span>
              <span className="user-email">{user.email || ""}</span>
            </div>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-item" onClick={() => navigate("/user-dashboard")}>
            <div className="menu-icon">
              <Person2Icon />
            </div>
            <span>My Dashboard</span>
          </div>

          <div className="menu-item logout" onClick={handleLogout}>
            <div className="menu-icon">
              <LogoutIcon />
            </div>
            <span>Logout</span>
          </div>
        </>
      ) : (
        <>
          <div className="menu-item" onClick={() => navigate("/login")}>
            <div className="menu-icon">
              <Person2Icon />
            </div>
            <span>Login</span>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-item" onClick={() => navigate("/register")}>
            <div className="menu-icon">
              <Person2Icon />
            </div>
            <span>Register</span>
          </div>
        </>
      )}
    </div>
  );
};

export default LogoutTippy;
