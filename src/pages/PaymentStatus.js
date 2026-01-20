import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message } from "antd";
import Layout from "../components/Layout/Layout";
import { transactionAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import "./PaymentStatus.css";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshBalance } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const clientTxnId = searchParams.get("client_txn_id") ||
          searchParams.get("clientTxnId") ||
          searchParams.get("clientTrxId") ||
          searchParams.get("udf1");
        const txnId = searchParams.get("txn_id") ||
          searchParams.get("txnId") ||
          searchParams.get("transactionId");

        console.log("Debug - Full URL:", window.location.href);
        console.log("Debug - Raw Search Params:", window.location.search);
        console.log("Debug - PaymentStatus Init:", { clientTxnId, txnId });

        if (!clientTxnId) {
          console.warn("Debug - Missing clientTxnId");
          message.error("Transaction ID not found");
          setLoading(false);
          return;
        }

        console.log("Debug - Fetching transaction status...");
        const response = await transactionAPI.getTransactionStatus(clientTxnId, txnId);
        const data = await response.json();

        console.log("Debug - API Response:", data);

        if (response.ok && (data.success !== false)) {
          const paymentInfo = data.data || data.transaction || data;
          console.log("Debug - Payment Info:", paymentInfo);
          setPaymentData(paymentInfo);

          // Get the actual payment status from the transaction data
          const status = paymentInfo?.status || data.status;
          const paymentStatus = paymentInfo?.paymentStatus || paymentInfo?.payment_status;

          console.log("Debug - Raw Status:", { status, paymentStatus });

          // Normalize status to lowercase for comparison
          const normalizedStatus = status?.toLowerCase() || '';
          const normalizedPaymentStatus = paymentStatus?.toLowerCase() || '';

          // Check for pending statuses first
          const isPaymentPending =
            normalizedStatus === "pending" ||
            normalizedStatus === "processing" ||
            normalizedStatus === "initiated" ||
            normalizedStatus === "in_progress" ||
            normalizedPaymentStatus === "pending" ||
            normalizedPaymentStatus === "processing" ||
            normalizedPaymentStatus === "initiated";

          // Check for failure statuses
          const isPaymentFailed =
            normalizedStatus === "failed" ||
            normalizedStatus === "failure" ||
            normalizedStatus === "fail" ||
            normalizedStatus === "cancelled" ||
            normalizedStatus === "canceled" ||
            normalizedStatus === "rejected" ||
            normalizedStatus === "declined" ||
            normalizedPaymentStatus === "failed" ||
            normalizedPaymentStatus === "failure" ||
            normalizedPaymentStatus === "fail";

          // Check for success statuses only if not pending and not failed
          const isPaymentSuccess = !isPaymentPending && !isPaymentFailed && (
            normalizedStatus === "success" ||
            normalizedStatus === "completed" ||
            normalizedStatus === "paid" ||
            normalizedStatus === "successful" ||
            normalizedPaymentStatus === "success" ||
            normalizedPaymentStatus === "completed" ||
            normalizedPaymentStatus === "paid"
          );

          console.log("Debug - Determined Status:", {
            isPaymentSuccess,
            isPaymentPending,
            isPaymentFailed
          });

          setIsSuccess(isPaymentSuccess);
          setIsPending(isPaymentPending);

          // Refresh balance if payment is successful (for both UPI and wallet payments)
          if (isPaymentSuccess) {
            console.log("Debug - Refreshing balance...");
            // Refresh balance and wait a bit to ensure it's updated
            refreshBalance().then(() => {
              console.log("Debug - Balance refreshed");
            }).catch((err) => {
              console.error("Debug - Balance refresh failed:", err);
            });
          }
        } else {
          console.error("Debug - Response not ok or data.success false:", data);
          setIsSuccess(false);
          setIsPending(false);
          setPaymentData(null);
          message.error(data.message || "Failed to fetch payment status");
        }
      } catch (error) {
        console.error("Debug - Error fetching payment status:", error);
        setIsSuccess(false);
        setIsPending(false);
        message.error("Failed to fetch payment status");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [searchParams, refreshBalance]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="payment-status-container">
          <div className="payment-status-card">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Checking payment status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="payment-status-wrapper">
        <div className={`payment-status-content ${isSuccess ? 'success-state' : isPending ? 'pending-state' : 'failed-state'}`}>
          <div className="status-animation-icon">
            <div className="status-circle-outer">
              <div className="status-circle-inner">
                {isSuccess ? <CheckCircleIcon /> : isPending ? <AccessTimeIcon /> : <CancelIcon />}
              </div>
            </div>
          </div>

          <h2>{isSuccess ? "Payment Successful" : isPending ? "Payment Pending" : "Payment Failed"}</h2>

          {paymentData && (
            <div className="transaction-details-box">
              <div className="detail-item">
                <span>Order ID</span>
                <span>{paymentData.orderId || paymentData.order_id || paymentData.clientTxnId || paymentData.client_txn_id || "N/A"}</span>
              </div>

              <div className="detail-item">
                <span>Amount</span>
                <span style={{ color: 'var(--a)', fontWeight: 'bold' }}>
                  ₹{parseFloat(paymentData.amount || 0).toFixed(2)}
                </span>
              </div>

              {paymentData.gameName && (
                <div className="detail-item">
                  <span>Game Name</span>
                  <span>{paymentData.gameName}</span>
                </div>
              )}

              {paymentData.pack && (
                <div className="detail-item">
                  <span>Pack</span>
                  <span>{paymentData.pack}</span>
                </div>
              )}

              <div className="detail-item">
                <span>Date</span>
                <span>{formatDate(paymentData.createdAt || paymentData.created_at || paymentData.paymentTime || paymentData.payment_time)}</span>
              </div>

              <div className="detail-item">
                <span>Status</span>
                <span className={`status-text ${isSuccess ? 'success' : isPending ? 'pending' : 'failed'}`}>
                  {paymentData.status || (isSuccess ? 'Success' : isPending ? 'Pending' : 'Failed')}
                </span>
              </div>
            </div>
          )}

          <div className="action-buttons-group">
            <button className="btn-primary-action" onClick={() => navigate("/wallet")}>
              Add More Funds
            </button>
            <button className="btn-secondary-action" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentStatus;

