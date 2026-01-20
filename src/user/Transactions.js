import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { message, DatePicker } from "antd";
import DashboardLayout from "./components/DashboardLayout";
import Layout from "../components/Layout/Layout";
import { transactionAPI } from "../lib/api";
import "./Transactions.css";

const Transactions = () => {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [histories, setHistories] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  async function getHistories() {
    try {
      setLoading(true);
      // Use Transaction API as requested
      const response = await transactionAPI.getTransactionHistory({});
      const res = await response.json();
      if (res.success) {
        // Support both structures
        const transactions = res.transactions || res.data || [];
        const sortedTransactions = transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistories(sortedTransactions);
        setHistoryData(sortedTransactions);
      } else {
        message.error(res.message || "Failed to load transaction history");
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to load transaction history");
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

  useEffect(() => {
    if (user?.email) {
      getHistories();
    }
  }, [user]);

  return (
    <Layout>
      <DashboardLayout>
        <div className="wallet-page-container">


          {/* Transaction History Section */}
          <div className="history-section" style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
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
                    <th>Reference / ID</th>
                    <th>Details</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center p-5 text-white">Loading...</td></tr>
                  ) : histories && histories.length > 0 ? (
                    histories.map((item, index) => {
                      const isCredit = item.transactionType === "credit";
                      const amountSign = isCredit ? "+" : "-";
                      const amountColor = isCredit ? "#52c41a" : "#ff4d4f";
                      const orderId = item.reference || item.metadata?.orderId || item._id.substring(0, 8).toUpperCase();
                      const description = item.description || (item.referenceType ? item.referenceType.replace('_', ' ') : "Transaction");

                      return (
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
                          <td style={{ color: 'var(--a)' }}>{orderId}</td>
                          <td style={{ maxWidth: '250px' }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'rgba(255,255,255,0.9)' }}>
                              {description}
                            </div>
                            <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'capitalize' }}>{item.referenceType}</small>
                          </td>
                          <td style={{ fontWeight: 'bold', fontSize: '16px', color: amountColor }}>
                            {amountSign}₹{parseFloat(item.amount || 0).toFixed(2)}
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {item.balanceAfter ? `₹${parseFloat(item.balanceAfter).toFixed(2)}` : "-"}
                          </td>
                          <td>
                            <span className={`status-badge ${item.status || "success"}`}>
                              {item.status || "Success"}
                            </span>
                          </td>
                        </tr>
                      )
                    })
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
              {loading ? (
                <div className="text-center p-5 text-white">Loading...</div>
              ) : histories && histories.length > 0 ? (
                histories.map((item, index) => {
                  const isCredit = item.transactionType === "credit";
                  const amountSign = isCredit ? "+" : "-";
                  const amountColor = isCredit ? "#52c41a" : "#ff4d4f";
                  const orderId = item.reference || item.metadata?.orderId || item._id.substring(0, 8).toUpperCase();
                  const description = item.description || item.referenceType || "Transaction";

                  return (
                    <div className="transaction-card" key={item._id || index}>
                      <div className="t-header">
                        <span className="t-date">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <span className={`status-badge ${item.status || "success"}`}>
                          {item.status || "Success"}
                        </span>
                      </div>
                      <div className="t-row" style={{ alignItems: 'center' }}>
                        <span className="t-amount" style={{ fontSize: '20px', color: amountColor }}>
                          {amountSign}₹{parseFloat(item.amount || 0).toFixed(2)}
                        </span>
                        <span className="t-value" style={{ fontSize: '12px', opacity: 0.8 }}>
                          Ref: {orderId}
                        </span>
                      </div>
                      <div className="t-row">
                        <span className="t-label">Details</span>
                        <span className="t-value" style={{ textAlign: 'right' }}>{description}</span>
                      </div>
                      {item.balanceAfter && (
                        <div className="t-row">
                          <span className="t-label">Balance</span>
                          <span className="t-value">₹{parseFloat(item.balanceAfter).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.5)" }}>
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </Layout>
  );
};

export default Transactions;
