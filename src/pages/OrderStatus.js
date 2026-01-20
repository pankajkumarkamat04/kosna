import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { message } from "antd";
import { orderAPI } from "../lib/api";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import "./OrderStatus.css";

const OrderStatus = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderStatus = async (orderId) => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await orderAPI.getOrderStatus(orderId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to fetch order status";
        setError(errorMessage);
        message.error(errorMessage);
        setLoading(false);
        return;
      }

      const res = await response.json();

      if (res.success && res.order) {
        setOrderData(res);
        setError(null);
      } else {
        const errorMessage = res.message || "Order not found";
        setError(errorMessage);
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      const errorMessage = "Failed to fetch order status";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get orderId from URL parameters
    const orderId = searchParams.get('orderId') || searchParams.get('client_txn_id') || searchParams.get('clientTrxId');

    if (orderId) {
      fetchOrderStatus(orderId);
    } else {
      message.error("No order ID found");
    }
  }, [searchParams, navigate]);

  if (loading && !orderData) {
    return (
      <Layout>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </Layout>
    );
  }

  if (error && !orderData) {
    const orderId = searchParams.get('orderId') || searchParams.get('client_txn_id');
    return (
      <Layout>
        <div className="order-status-wrapper">
          <div className="order-status-content failed-state">
            <div className="status-animation-icon">
              <div className="status-circle-outer">
                <div className="status-circle-inner">
                  <ErrorIcon />
                </div>
              </div>
            </div>
            <h2>Order Not Found</h2>
            <p className="status-message-text">{error}</p>

            <div className="action-buttons-group">
              {orderId && (
                <button
                  className="btn-primary-action"
                  onClick={() => fetchOrderStatus(orderId)}
                  disabled={loading}
                >
                  {loading ? 'Retrying...' : 'Retry'}
                </button>
              )}
              <button className="btn-secondary-action" onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!orderData) {
    return null;
  }

  const order = orderData.order;
  const status = order?.status || 'processing';
  const paymentMethod = order?.paymentMethod || 'wallet';

  const isSuccess = status === 'completed' || status === 'success';
  const isFailed = status === 'failed' || status === 'error';
  const isProcessing = !isSuccess && !isFailed;

  const statusClass = isSuccess ? 'success-state' : isFailed ? 'failed-state' : 'processing-state';

  return (
    <Layout>
      <div className="order-status-wrapper">
        <div className={`order-status-content ${statusClass}`}>
          <div className="status-animation-icon">
            <div className="status-circle-outer">
              <div className="status-circle-inner">
                {isSuccess ? <CheckCircleIcon /> : isFailed ? <ErrorIcon /> : <HourglassEmptyIcon />}
              </div>
            </div>
          </div>

          <h2>
            {isSuccess ? "Order Completed" : isFailed ? "Order Failed" : "Order Processing"}
          </h2>

          <p className="status-message-text">
            {orderData.message || (isSuccess
              ? "Your order has been delivered successfully."
              : isFailed
                ? "Your order failed to process."
                : "Your order is being processed.")}
          </p>

          <div className="transaction-details-box">
            <div className="detail-item">
              <span>Order ID</span>
              <span>{orderData.orderId || order?._id}</span>
            </div>

            {order?.items && order.items.length > 0 && (
              <>
                <div className="detail-item">
                  <span>Item</span>
                  <span>{order.items[0].itemName}</span>
                </div>
                <div className="detail-item">
                  <span>Price</span>
                  <span style={{ color: 'var(--a)', fontWeight: 'bold' }}>₹{order.items[0].price}</span>
                </div>
              </>
            )}

            <div className="detail-item">
              <span>Payment Method</span>
              <span>{paymentMethod === 'wallet' ? 'EZ Wallet' : 'UPI'}</span>
            </div>

            <div className="detail-item">
              <span>Date</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>

            <div className="detail-item">
              <span>Status</span>
              <span className={`status-text ${isSuccess ? 'success' : isFailed ? 'failed' : 'processing'}`}>
                {status}
              </span>
            </div>
          </div>

          {/* Player Details from Description */}
          {order?.description && (
            <div className="transaction-details-box" style={{ marginTop: '-15px' }}>
              <div style={{ textAlign: 'left', marginBottom: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 'bold' }}>
                PLAYER DETAILS
              </div>
              {(() => {
                try {
                  const desc = JSON.parse(order.description);
                  return (
                    <>
                      {desc.playerId && (
                        <div className="detail-item">
                          <span>Player ID</span>
                          <span>{desc.playerId}</span>
                        </div>
                      )}
                      {desc.server && (
                        <div className="detail-item">
                          <span>Server</span>
                          <span>{desc.server}</span>
                        </div>
                      )}
                    </>
                  );
                } catch (e) {
                  return (
                    <div className="detail-item">
                      <span>Details</span>
                      <span>{order.description}</span>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          <div className="action-buttons-group">
            <button className="btn-primary-action" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
            <button className="btn-secondary-action" onClick={() => navigate("/orders")}>
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderStatus;
