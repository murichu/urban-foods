import React, { useContext, useEffect, useState } from "react";

import "./OrderDetails.css";

import { StoreContext } from "../../Context/StoreContext";

import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Calendar,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  Phone,
  Mail,
  Home,
  Printer,
  Share2,
  Shield,
  Award,
  Download,
  MessageCircle,
  Copy,
  Check,
  Zap,
  Heart,
  Coffee,
  ThumbsUp,
} from "lucide-react";

import axios from "axios";

import { assets } from "../../assets/assets";

const OrderDetails = () => {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const { url, token } = useContext(StoreContext);

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [estimatedDelivery, setEstimatedDelivery] = useState(null);

  const [copied, setCopied] = useState(false);

  /**
   * Business Settings
   */
  const [backendDeliveryFee, setBackendDeliveryFee] = useState(0);

  /**
   * Fetch Business Settings
   */
  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        const response = await axios.get(`${url}/api/settings/get`);

        if (response.data.success) {
          setBackendDeliveryFee(Number(response.data.data?.deliveryFee) || 0);
        }
      } catch (error) {
        console.error("Error fetching business settings:", error);
      }
    };

    if (url) {
      fetchBusinessSettings();
    }
  }, [url]);

  /**
   * Fetch Order Details
   */
  const fetchOrderDetails = async () => {
    setLoading(true);

    setError("");

    try {
      const response = await axios.get(
        `${url}/api/order/user-order/${orderId}`,
        {
          headers: {
            token,
          },
        }
      );

      if (!response.data.success) {
        setError("Order not found");

        return;
      }

      const orderData = response.data.data;

      /**
       * Normalize Payment Fields
       */
      const normalizedOrder = {
        ...orderData,

        transactionId:
          orderData.transactionId ||
          orderData.mpesaReceiptNumber ||
          orderData.payment?.transactionId ||
          orderData.payment?.mpesaReceiptNumber ||
          orderData.paymentDetails?.transactionId ||
          orderData.paymentDetails?.mpesaReceiptNumber ||
          orderData.checkoutRequestId ||
          orderData.CheckoutRequestID ||
          null,

        mpesaReceiptNumber:
          orderData.mpesaReceiptNumber ||
          orderData.payment?.mpesaReceiptNumber ||
          orderData.paymentDetails?.mpesaReceiptNumber ||
          orderData.transactionId ||
          null,

        paymentMethod:
          orderData.paymentMethod ||
          orderData.payment?.paymentMethod ||
          orderData.paymentDetails?.paymentMethod ||
          "M-Pesa",

        paymentStatus:
          orderData.paymentStatus ||
          orderData.paymentDetails?.status ||
          (orderData.payment ? "Paid" : "Pending"),

        paymentDate:
          orderData.paymentDate ||
          orderData.payment?.createdAt ||
          orderData.paymentDetails?.createdAt ||
          null,

        paymentDetails: orderData.paymentDetails || orderData.payment || null,
      };

      setOrder(normalizedOrder);

      /**
       * Delivery Estimate
       */
      const baseDate = new Date(
        orderData.date || orderData.createdAt || orderData.updatedAt
      );

      if (!Number.isNaN(baseDate.getTime())) {
        const estimate = new Date(baseDate);

        estimate.setMinutes(estimate.getMinutes() + 45);

        setEstimatedDelivery(estimate);
      } else {
        setEstimatedDelivery(null);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);

      setError(
        error?.response?.data?.message || "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");

      return;
    }

    fetchOrderDetails();
  }, [orderId, token, url]);

  /**
   * Helpers
   */
  const getValidDate = (date) => {
    if (!date) return null;

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const formatDate = (date) => {
    const parsedDate = getValidDate(date);

    if (!parsedDate) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date) => {
    const parsedDate = getValidDate(date);

    if (!parsedDate) {
      return "Time unavailable";
    }

    const now = new Date();

    const diff = now - parsedDate;

    const minutes = Math.floor(diff / 60000);

    const hours = Math.floor(minutes / 60);

    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    return "Just now";
  };

  /**
   * Status Config
   */
  const getStatusConfig = (status) => {
    const configs = {
      "Order Placed": {
        icon: <Clock size={20} />,
        color: "pending",
      },

      "Food Processing": {
        icon: <Zap size={20} />,
        color: "processing",
      },

      "Out for Delivery": {
        icon: <Truck size={20} />,
        color: "shipping",
      },

      Delivered: {
        icon: <CheckCircle size={20} />,
        color: "delivered",
      },
    };

    return configs[status] || configs["Order Placed"];
  };

  /**
   * Copy Order ID
   */
  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderId || order._id);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  /**
   * Loading
   */
  if (loading) {
    return (
      <div className="order-details-status-page">
        <div className="loading-container">
          <div className="loading-ring"></div>

          <h3>Loading Order Details...</h3>
        </div>
      </div>
    );
  }

  /**
   * Error
   */
  if (error || !order) {
    return (
      <div className="order-details-status-page">
        <div className="error-container">
          <AlertCircle size={60} />

          <h2>{error || "Order not found"}</h2>

          <button
            className="primary-btn"
            onClick={() => navigate("/my-orders")}
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  /**
   * Financial Calculations
   */
  const serviceCharge = Math.round(order.amount * 0.05);

  const grandTotal = order.amount + backendDeliveryFee + serviceCharge;

  const statusConfig = getStatusConfig(order.status);

  const orderDate = order.date || order.createdAt || order.updatedAt;

  return (
    <div className="order-details-view">
      {/* NAV */}
      <div className="details-nav">
        <button
          className="back-btn-modern"
          onClick={() => navigate("/my-orders")}
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        <div className="nav-actions">
          <button className="nav-action-btn" onClick={() => window.print()}>
            <Printer size={18} />
          </button>

          <button className="nav-action-btn" onClick={copyOrderId}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="order-header-premium">
        <div className="header-content">
          <div className="order-badge-group">
            <div className="order-badge">
              <Package size={14} />

              <span>
                Order #{order.orderId || order._id?.slice(-8).toUpperCase()}
              </span>
            </div>

            <div className={`status-pill ${statusConfig.color}`}>
              {statusConfig.icon}

              <span>{order.status}</span>
            </div>
          </div>

          <h1 className="order-title">Order Details</h1>

          <div className="order-meta">
            <div className="meta-item">
              <Calendar size={14} />

              <span>{formatDate(orderDate)}</span>
            </div>

            <div className="meta-item">
              <Clock size={14} />

              <span>{formatRelativeTime(orderDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue using the remaining JSX exactly as your current layout */}
      {/* MAIN GRID */}
      <div className="order-details-grid">
        {/* LEFT SIDE */}
        <div className="order-left-column">
          {/* ORDER ITEMS */}
          <div className="premium-card">
            <div className="card-header">
              <ShoppingBag size={20} />
              <h3>Order Items</h3>
            </div>

            <div className="items-list">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item-premium">
                  <div className="item-image-wrapper">
                    <img src={`${url}/images/${item.image}`} alt={item.name} />

                    <span className="item-quantity-badge">{item.quantity}</span>
                  </div>

                  <div className="item-details-premium">
                    <h4>{item.name}</h4>

                    <p>Ksh {Number(item.price || 0).toLocaleString()}</p>
                  </div>

                  <div className="item-total-premium">
                    <span>
                      Ksh{" "}
                      {(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="order-summary-premium">
              <div className="summary-row">
                <span>Subtotal</span>

                <span>Ksh {Number(order.amount || 0).toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Delivery Fee</span>

                <span>Ksh {backendDeliveryFee.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Service Charge</span>

                <span>Ksh {serviceCharge.toLocaleString()}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total Amount</span>

                <div className="total-details">
                  <span className="total-currency">Ksh</span>

                  <span className="total-value">
                    {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="savings-badge">
                <ThumbsUp size={14} />

                <span>Thank you for ordering with us</span>
              </div>
            </div>
          </div>

          {/* DELIVERY INFO */}
          <div className="premium-card">
            <div className="card-header">
              <MapPin size={20} />
              <h3>Delivery Information</h3>
            </div>

            <div className="delivery-info-premium">
              <div className="recipient-card">
                <div className="recipient-avatar-premium">
                  {order.address?.firstName?.[0]}
                  {order.address?.lastName?.[0]}
                </div>

                <div className="recipient-details-premium">
                  <h4>
                    {order.address?.firstName} {order.address?.lastName}
                  </h4>

                  <div className="contact-info">
                    <Phone size={14} />

                    <span>
                      {order.address?.phone || order.phoneNumber || "N/A"}
                    </span>
                  </div>

                  {order.address?.email && (
                    <div className="contact-info">
                      <Mail size={14} />

                      <span>{order.address?.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="address-card">
                <Home size={16} />

                <div className="address-text">
                  <p>{order.address?.street}</p>

                  <p>
                    {order.address?.city}, {order.address?.state}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="order-right-column">
          {/* PAYMENT */}
          <div className="premium-card">
            <div className="card-header">
              <CreditCard size={20} />
              <h3>Payment Details</h3>
            </div>

            <div className="payment-info-premium">
              <div
                className={`payment-status-card ${
                  order.payment ? "success" : "pending"
                }`}
              >
                {order.payment ? (
                  <CheckCircle size={18} />
                ) : (
                  <Clock size={18} />
                )}

                <div className="status-text">
                  <strong>
                    {order.payment ? "Payment Completed" : "Awaiting Payment"}
                  </strong>
                </div>
              </div>

              <div className="payment-method-card">
                <img
                  src={assets.mpesa || "/mpesa-logo.png"}
                  alt="M-Pesa"
                  className="payment-logo-premium"
                />

                <div className="method-details">
                  <span className="method-name">
                    {order.paymentMethod || "M-Pesa"}
                  </span>

                  <span className="method-status">Secure Payment</span>
                </div>
              </div>

              <div className="payment-transaction">
                <div className="transaction-row">
                  <span>Mpesa Transaction ID</span>

                  <span className="mono">
                    {order.transactionId ||
                      order.mpesaReceiptNumber ||
                      order.paymentDetails?.transactionId ||
                      order.paymentDetails?.mpesaReceiptNumber ||
                      order.checkoutRequestId ||
                      "N/A"}
                  </span>
                </div>

                <div className="transaction-row">
                  <span>Payment Date</span>

                  <span>
                    {order.paymentDate
                      ? formatDate(order.paymentDate)
                      : formatDate(orderDate)}
                  </span>
                </div>

                <div className="transaction-row">
                  <span>Payment Status</span>

                  <span
                    className={`payment-status-text ${
                      order.payment ? "paid" : "pending"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ETA */}
          {order.status !== "Delivered" && (
            <div className="eta-card premium-card">
              <div className="eta-content">
                <Coffee size={24} />

                <div className="eta-text">
                  <h4>Estimated Delivery</h4>

                  <p>{estimatedDelivery?.toLocaleTimeString()}</p>

                  <span>Your order is being prepared</span>
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="action-buttons-premium">
            <button
              className="action-btn-premium primary"
              onClick={() => navigate("/")}
            >
              <Heart size={18} />
              Continue Shopping
            </button>

            <button
              className="action-btn-premium secondary"
              onClick={() => window.print()}
            >
              <Download size={18} />
              Download Invoice
            </button>

            <button className="action-btn-premium tertiary">
              <Share2 size={18} />
              Share Order
            </button>
          </div>

          {/* SUPPORT */}
          <div className="support-card-premium">
            <div className="support-header">
              <Shield size={24} />

              <div>
                <h4>Need Help?</h4>
                <p>Contact support anytime</p>
              </div>
            </div>

            <div className="support-actions">
              <button className="support-btn-chat">
                <MessageCircle size={18} />
                Live Chat
              </button>

              <button className="support-btn-call">
                <Phone size={18} />
                Call Support
              </button>
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="trust-badges-premium">
            <div className="trust-item-premium">
              <Award size={20} />

              <div>
                <strong>Quality Guaranteed</strong>

                <p>Fresh meals delivered</p>
              </div>
            </div>

            <div className="trust-item-premium">
              <Shield size={20} />

              <div>
                <strong>Secure Payment</strong>

                <p>Protected checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING BUTTON */}
      <div
        className="fab-button"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      >
        <ChevronRight size={24} />
      </div>
    </div>
  );
};

export default OrderDetails;
