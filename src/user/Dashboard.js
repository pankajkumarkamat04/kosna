import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { dashboardAPI } from "../lib/api";
import DashboardLayout from "./components/DashboardLayout";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import TollIcon from "@mui/icons-material/Toll";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  const { balance } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    walletBalance: 0,
    orders: { total: 0, completedCount: 0, successAmount: 0 },
    transactions: { total: 0, successfulCount: 0, successAmount: 0 }
  });
  const [loading, setLoading] = useState(false);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard();
      const res = await response.json();
      if (res.success || res.message === "Dashboard data retrieved successfully") {
        setStats(res.data || {});
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (user !== null) {
      getDashboardData();
    }
  }, [user]);

  return (
    <Layout>
      <DashboardLayout>
        <div className="dashboard-main-wrapper">
          <div className="dashboard-header">
            <h4 className="dashboard-title">Dashboard</h4>
          </div>
          <div className="user-dashboard">
            <div className="shadow dash-card" onClick={() => navigate("/orders")}>
              <div className="dash-card-content">
                <div className="dash-card-info">
                  <div className="dash-card-number">
                    {loading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <b>{stats.orders?.total || 0}</b>
                    )}
                  </div>
                  <span className="dash-card-label">Total Orders</span>
                </div>
                <div className="dash-card-icon">
                  <InstallMobileIcon />
                </div>
              </div>
            </div>

            <div className="shadow dash-card" onClick={() => navigate("/wallet")}>
              <div className="dash-card-content">
                <div className="dash-card-info">
                  <div className="dash-card-number">
                    {/* Prefer API balance, fallback to context balance */}
                    <b>₹{parseFloat(stats.walletBalance ?? balance ?? 0).toFixed(2)}</b>
                  </div>
                  <span className="dash-card-label">Coins</span>
                </div>
                <div className="dash-card-icon">
                  <TollIcon />
                </div>
              </div>
            </div>

            <div className="shadow dash-card" onClick={() => navigate("/transactions")}>
              <div className="dash-card-content">
                <div className="dash-card-info">
                  <div className="dash-card-number">
                    {loading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <b>{stats.transactions?.total || 0}</b>
                    )}
                  </div>
                  <span className="dash-card-label">Total Transactions</span>
                </div>
                <div className="dash-card-icon">
                  <TollIcon />
                </div>
              </div>
            </div>

            <div
              className="shadow dash-card"
              onClick={() => navigate("/my-account")}
            >
              <div className="dash-card-content">
                <div className="dash-card-info">
                  <div className="dash-card-number">
                    <b>{user?.name ? user.name.split(' ')[0] : 'Account'}</b>
                  </div>
                  <span className="dash-card-label">My Account</span>
                </div>
                <div className="dash-card-icon">
                  <AccountCircleIcon />
                </div>
              </div>
            </div>


          </div>
        </div>
      </DashboardLayout>
    </Layout>
  );
};

export default Dashboard;
