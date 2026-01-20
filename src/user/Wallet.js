import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { message, DatePicker } from "antd";
import DashboardLayout from "./components/DashboardLayout";
import Layout from "../components/Layout/Layout";
import { walletAPI, transactionAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import HistoryIcon from "@mui/icons-material/History";
import AddCardIcon from "@mui/icons-material/AddCard";
import IMAGES from "../img/image.js";
import "./Wallet.css";

const Wallet = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const { balance, refreshBalance } = useAuth();
  const [tab, setTab] = useState(location.state?.tab ?? 1);
  const [form, setForm] = useState({ email: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [histories, setHistories] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  const quickAmounts = [1000, 3000, 5000, 10000, 25000, 50000];

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  async function submitPayment() {
    if (!form?.amount || form.amount.trim() === "") {
      setError(true);
      return message.error("Please enter an amount");
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount < 1) {
      setError(true);
      return message.error("Please enter a valid amount (minimum 1)");
    }

    try {
      setLoading(true);
      setError(false);
      const redirectUrl = `${window.location.origin}/payment-status`;
      const response = await walletAPI.addCoins(amount, redirectUrl);
      const res = await response.json();

      if (res.success) {
        const paymentUrl = res.data?.payment_url || res.data?.paymentUrl || res.transaction?.paymentUrl;
        if (paymentUrl) {
          message.success(res.message || "Redirecting to payment gateway...");
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 500);
        } else {
          message.success(res.message || "Coins added successfully");
          refreshBalance();
          setForm({ email: "", amount: "" });
        }
      } else {
        message.error(res.message || "Failed to add coins");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      message.error("Failed to add coins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedDate) {
      setHistories(historyData);
      return;
    }
    const filteredHis = historyData?.filter((item) => {
      const itemDate = new Date(item.createdAt);
      const selected = new Date(selectedDate);
      return (
        itemDate.getDate() === selected.getDate() &&
        itemDate.getMonth() === selected.getMonth() &&
        itemDate.getFullYear() === selected.getFullYear()
      );
    });
    setHistories(filteredHis);
  }, [selectedDate, historyData]);

  async function getHistories() {
    try {
      const response = await transactionAPI.getTransactionHistory({});
      const res = await response.json();
      if (res.success) {
        const transactions = res.transactions || res.data || [];
        // Sort by date descending (newest first)
        const sortedTransactions = transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistories(sortedTransactions);
        setHistoryData(sortedTransactions);
      } else {
        message.error(res.message || "Failed to load transaction history");
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to load transaction history");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "amount") {
      if (value < 1) {
        setError(true);
      } else {
        setError(false);
      }
    }
  }

  const handleQuickAmount = (amount) => {
    setForm({ ...form, amount: amount.toString() });
    setError(false);
  };

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({
        ...prev,
        customer_email: user?.email,
        customer_name: user?.fname,
        customer_mobile: user?.mobile,
      }));
      getHistories();
      refreshBalance();
    }
  }, [user, refreshBalance]);

  return (
    <Layout>
      <DashboardLayout>
        <div className="wallet-page-container">
          {/* Balance Card */}
          <div className="wallet-balance-card">
            <div className="balance-label">Total Balance</div>
            <div className="balance-amount">
              <img src={IMAGES.ycoin} alt="coin" />
              <span>{parseFloat(balance).toFixed(2)}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="wallet-tabs">
            <div
              className={`wallet-tab-item ${tab === 1 ? 'active' : ''}`}
              onClick={() => setTab(1)}
            >
              <AddCardIcon /> Add Coins
            </div>
            <div
              className={`wallet-tab-item ${tab === 0 ? 'active' : ''}`}
              onClick={() => setTab(0)}
            >
              <HistoryIcon /> Transactions
            </div>
          </div>

          {/* Add Coins Section */}
          {tab === 1 && (
            <div className="add-coins-section">
              <div className="amount-input-group">
                <label>Enter Amount</label>
                <input
                  type="number"
                  className="custom-amount-input"
                  placeholder="₹0"
                  name="amount"
                  min="1"
                  value={form.amount}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              <div className="quick-amounts">
                {quickAmounts.map((amt) => (
                  <div
                    key={amt}
                    className="quick-amount-btn"
                    onClick={() => handleQuickAmount(amt)}
                  >
                    <small>Add</small>
                    <span>₹{amt}</span>
                  </div>
                ))}
              </div>

              <button
                className="pay-btn"
                onClick={submitPayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Pay'}
              </button>
            </div>
          )}

          {/* Transaction History Section */}
          {tab === 0 && (
            <div className="history-section">
              <div className="history-filters">
                <div style={{ flex: 1 }}>
                  <DatePicker
                    className="w-100 custom-datepicker"
                    placeholder="Filter by Date"
                    onChange={(date, dateString) => setSelectedDate(dateString)}
                    format="YYYY-MM-DD"
                    popupClassName="premium-date-picker-dropdown"
                  />
                </div>
                <button
                  className="clear-btn"
                  onClick={() => {
                    setSelectedDate("");
                    setHistories(historyData);
                  }}
                >
                  Clear
                </button>
              </div>

              {/* Desktop Table */}
              <div className="d-none d-lg-block custom-table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {histories && histories.length > 0 ? (
                      histories.map((item, index) => (
                        <tr key={item._id || index}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold', color: '#fff' }}>
                                {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                              </span>
                              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                {new Date(item.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--a)' }}>{item.orderId}</td>
                          <td>{item.paymentNote || item.product || "Wallet Topup"}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '16px' }}>₹{parseFloat(item.amount || 0).toFixed(2)}</td>
                          <td style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {item.balanceAfter ? `₹${parseFloat(item.balanceAfter).toFixed(2)}` : "-"}
                          </td>
                          <td>
                            <span className={`status-badge ${item.status || (item.udf2 || "success").toLowerCase()}`}>
                              {item.status || item.udf2 || "Success"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>No transactions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="d-block d-lg-none p-3 mobile-history-list">
                {histories && histories.length > 0 ? (
                  histories.map((item, index) => (
                    <div className="transaction-card" key={item._id || index}>
                      <div className="t-header">
                        <span className="t-date">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <span className={`status-badge ${item.status || (item.udf2 || "success").toLowerCase()}`}>
                          {item.status || item.udf2 || "Success"}
                        </span>
                      </div>
                      <div className="t-row" style={{ alignItems: 'center' }}>
                        <span className="t-amount" style={{ fontSize: '20px', color: 'var(--a)' }}>
                          ₹{parseFloat(item.amount || 0).toFixed(2)}
                        </span>
                        <span className="t-value" style={{ fontSize: '12px', opacity: 0.8 }}>
                          Order ID: {item.orderId}
                        </span>
                      </div>
                      <div className="t-row">
                        <span className="t-label">Product</span>
                        <span className="t-value">{item.paymentNote || item.product || "Wallet Topup"}</span>
                      </div>
                      {item.balanceAfter && (
                        <div className="t-row">
                          <span className="t-label">Balance</span>
                          <span className="t-value">₹{parseFloat(item.balanceAfter).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.5)" }}>
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </Layout>
  );
};

export default Wallet;
