import React, { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DashboardLayout.css";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/features/userSlice";
import { setQuery } from "../../redux/features/querySlice";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { query } = useSelector((state) => state.query);
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    dispatch(setUser(null));
    navigate("/login");
  };

  const getQueryStatus = useCallback(async () => {
    try {
      // Query API not available in new API structure
      // Set query status to true (no new queries) for now
      dispatch(setQuery(true));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      getQueryStatus();
    }
  }, [user, getQueryStatus]);

  return (
    <div className="dashboard-container">

      <div className="dashboard-content">{children}</div>
    </div>
  );
};

export default DashboardLayout;
