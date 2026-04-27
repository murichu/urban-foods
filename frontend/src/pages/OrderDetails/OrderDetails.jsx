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
  User,
  Home,
  FileText,
  Printer,
  Share2,
  Star,
  Timer,
  Shield,
  Award,
  Download,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  MoreHorizontal,
  Zap,
  Heart,
  TrendingUp,
  Coffee,
  Smile,
  ThumbsUp
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
  const [activeTab, setActiveTab] = useState("details");

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrder(response.data.data);
        const estimate = new Date(response.data.data.date);
        estimate.setMinutes(estimate.getMinutes() + 45);
        setEstimatedDelivery(estimate);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrderDetails();
    } else {
      navigate("/");
    }
  }, [orderId, token]);

  const getStatusConfig = (status) => {
    const configs = {
      "Food Processing": {
        icon: <Zap size={20} />,
        color: "processing",
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        message: "Your order is being prepared with care",
        bg: "rgba(245, 158, 11, 0.1)",
        progress: 25
      },
      "Out for delivery": {
        icon: <Truck size={20} />,
        color: "shipping",
        gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
        message: "Your order is on the way!",
        bg: "rgba(59, 130, 246, 0.1)",
        progress: 50
      },
      "Delivered": {
        icon: <CheckCircle size={20} />,
        color: "delivered",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
        message: "Order completed successfully! Enjoy your meal!",
        bg: "rgba(16, 185, 129, 0.1)",
        progress: 100
      },
      "Pending": {
        icon: <Clock size={20} />,
        color: "pending",
        gradient: "linear-gradient(135deg, #ff6347, #e5533d)",
        message: "Order confirmed. We're getting it ready!",
        bg: "rgba(255, 99, 71, 0.1)",
        progress: 10
      }
    };
    return configs[status] || configs["Pending"];
  };

  const getProgressSteps = () => {
    const steps = ["Order Placed", "Processing", "Out for Delivery", "Delivered"];
    const statuses = ["Pending", "Food Processing", "Out for delivery", "Delivered"];
    const currentIndex = statuses.indexOf(order?.status);

    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      active: index === currentIndex,
      icon: index === 0 ? <Package size={16} /> :
        index === 1 ? <Zap size={16} /> :
          index === 2 ? <Truck size={16} /> : <CheckCircle size={16} />
    }));
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="order-details-status-page">
        <div className="loading-container">
          <div className="loading-animation">
            <div className="loading-ring"></div>
            <div className="loading-ring-inner"></div>
          </div>
          <div className="loading-text">
            <h3>Loading Order Details</h3>
            <p>Please wait while we fetch your order information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-status-page">
        <div className="error-container">
          <div className="error-icon">
            <AlertCircle size={64} />
          </div>
          <h2>{error || "Order Not Found"}</h2>
          <p>We couldn't find the order you're looking for. Please check the order ID or contact support.</p>
          <div className="error-actions">
            <button className="primary-btn" onClick={() => navigate("/my-orders")}>
              <ArrowLeft size={18} />
              Back to My Orders
            </button>
            <button className="secondary-btn" onClick={() => navigate("/")}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const progressSteps = getProgressSteps();
  const progressWidth = ((progressSteps.filter(s => s.completed).length) / progressSteps.length) * 100;

  return (
    <div className="order-details-view">
      <div className="order-details-background">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="order-details-wrapper">
        {/* Navigation */}
        <nav className="details-nav">
          <button className="back-btn-modern" onClick={() => navigate("/my-orders")}>
            <ArrowLeft size={18} />
            <span>Back to Orders</span>
          </button>
          <div className="nav-actions">
            <button className="nav-action-btn" onClick={() => window.print()}>
              <Printer size={18} />
            </button>
            <button className="nav-action-btn" onClick={() => window.location.href = `mailto:support@example.com?subject=Order ${order._id}`}>
              <MessageCircle size={18} />
            </button>
          </div>
        </nav>

        {/* Header Section */}
        <div className="order-header-premium">
          <div className="header-content">
            <div className="order-badge-group">
              <div className="order-badge">
                <Package size={14} />
                <span>Order #{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <button className="copy-badge" onClick={copyOrderId}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy ID"}
              </button>
            </div>
            <h1 className="order-title">
              Order Details
              <span className="title-badge">
                <TrendingUp size={14} />
                Track Order
              </span>
            </h1>
            <div className="order-meta">
              <div className="meta-item">
                <Calendar size={14} />
                <span>{formatDate(order.date)}</span>
              </div>
              <div className="meta-divider"></div>
              <div className="meta-item">
                <Clock size={14} />
                <span>{formatRelativeTime(order.date)}</span>
              </div>
            </div>
          </div>
          <div className={`order-status-card ${statusConfig.color}`} style={{ background: statusConfig.bg }}>
            <div className="status-icon" style={{ background: statusConfig.gradient }}>
              {statusConfig.icon}
            </div>
            <div className="status-info">
              <span className="status-label">Current Status</span>
              <span className="status-value">{order.status}</span>
              <span className="status-message">{statusConfig.message}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="order-tabs">
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <ShoppingBag size={18} />
            Order Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            <Truck size={18} />
            Tracking Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <MessageCircle size={18} />
            Support
          </button>
        </div>

        {/* Main Content */}
        <div className="order-details-grid">
          {/* Left Column */}
          <div className="order-left-column">
            {/* Tracking Progress Card */}
            <div className="tracking-card premium-card">
              <div className="card-header">
                <div className="header-icon-wrapper">
                  <Truck size={20} />
                </div>
                <h3>Order Tracking</h3>
                <span className="header-badge">
                  <Zap size={12} />
                  Live
                </span>
              </div>
              <div className="tracking-progress">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progressWidth}%` }}>
                    <div className="progress-glow"></div>
                  </div>
                </div>
                <div className="tracking-steps-enhanced">
                  {progressSteps.map((step, index) => (
                    <div key={index} className={`tracking-step-enhanced ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                      <div className="step-icon-wrapper">
                        <div className="step-icon">{step.icon}</div>
                        {index < progressSteps.length - 1 && (
                          <div className={`step-connector ${step.completed ? 'completed' : ''}`}></div>
                        )}
                      </div>
                      <div className="step-content">
                        <span className="step-name">{step.name}</span>
                        <span className="step-status">
                          {step.completed ? 'Completed' : step.active ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {estimatedDelivery && order.status !== "Delivered" && (
                <div className="delivery-estimate-premium">
                  <div className="estimate-icon">
                    <Timer size={18} />
                  </div>
                  <div className="estimate-content">
                    <span className="estimate-label">Estimated Delivery Time</span>
                    <span className="estimate-time">{estimatedDelivery.toLocaleTimeString()}</span>
                  </div>
                  <div className="estimate-progress">
                    <div className="mini-progress"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items Card */}
            <div className="items-card premium-card">
              <div className="card-header">
                <div className="header-icon-wrapper">
                  <ShoppingBag size={20} />
                </div>
                <h3>Order Items</h3>
                <span className="item-count">{order.items.length} items</span>
              </div>
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-premium">
                    <div className="item-image-wrapper">
                      <img src={url + "/images/" + item.image} alt={item.name} />
                      <span className="item-quantity-badge">{item.quantity}</span>
                    </div>
                    <div className="item-details-premium">
                      <h4>{item.name}</h4>
                      <p className="item-category">Food Item</p>
                      <div className="item-price-breakdown">
                        <span>Ksh {item.price} × {item.quantity}</span>
                      </div>
                    </div>
                    <div className="item-total-premium">
                      <span className="total-label">Total</span>
                      <span className="total-amount">Ksh {item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-summary-premium">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>Ksh {order.amount.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>Ksh 200</span>
                </div>
                <div className="summary-row">
                  <span>Service Charge</span>
                  <span>Ksh {Math.round(order.amount * 0.05).toLocaleString()}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <div className="total-details">
                    <span className="total-currency">Ksh</span>
                    <span className="total-value">{(order.amount + 200 + Math.round(order.amount * 0.05)).toLocaleString()}</span>
                  </div>
                </div>
                <div className="savings-badge">
                  <ThumbsUp size={14} />
                  <span>You saved Ksh {Math.round(order.amount * 0.1).toLocaleString()} with promo codes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="order-right-column">
            {/* Delivery Information */}
            <div className="info-card premium-card">
              <div className="card-header">
                <div className="header-icon-wrapper">
                  <MapPin size={20} />
                </div>
                <h3>Delivery Information</h3>
              </div>
              <div className="delivery-info-premium">
                <div className="recipient-card">
                  <div className="recipient-avatar-premium">
                    {order.address.firstName?.[0]}{order.address.lastName?.[0]}
                  </div>
                  <div className="recipient-details-premium">
                    <h4>{order.address.firstName} {order.address.lastName}</h4>
                    <div className="contact-info">
                      <Phone size={14} />
                      <span>{order.address.phone}</span>
                    </div>
                    {order.address.email && (
                      <div className="contact-info">
                        <Mail size={14} />
                        <span>{order.address.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="address-card">
                  <Home size={16} />
                  <div className="address-text">
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                  </div>
                </div>
                <div className="delivery-instructions">
                  <div className="instructions-icon">
                    <FileText size={14} />
                  </div>
                  <span>Delivery Instructions: Leave at front door if not home</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="info-card premium-card">
              <div className="card-header">
                <div className="header-icon-wrapper">
                  <CreditCard size={20} />
                </div>
                <h3>Payment Method</h3>
              </div>
              <div className="payment-info-premium">
                <div className={`payment-status-card ${order.payment ? 'success' : 'pending'}`}>
                  <div className="status-icon-small">
                    {order.payment ? <CheckCircle size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="status-text">
                    <span className="status-title">{order.payment ? "Payment Completed" : "Awaiting Payment"}</span>
                    <span className="status-description">
                      {order.payment ? "Transaction verified successfully" : "Please complete payment to confirm order"}
                    </span>
                  </div>
                </div>
                <div className="payment-method-card">
                  <img src={assets.mpesa || "/mpesa-logo.png"} alt="M-Pesa" className="payment-logo-premium" />
                  <div className="method-details">
                    <span className="method-name">M-Pesa Express</span>
                    <span className="method-status">Active</span>
                  </div>
                </div>
                <div className="payment-transaction">
                  <div className="transaction-row">
                    <span>Transaction ID:</span>
                    <span className="mono">{order.transactionId || "TXN" + order._id.slice(-8)}</span>
                  </div>
                  <div className="transaction-row">
                    <span>Payment Date:</span>
                    <span>{formatDate(order.date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Delivery Card */}
            {order.status !== "Delivered" && (
              <div className="eta-card premium-card">
                <div className="eta-content">
                  <div className="eta-icon">
                    <Coffee size={24} />
                  </div>
                  <div className="eta-text">
                    <h4>Estimated Delivery Time</h4>
                    <p>{estimatedDelivery?.toLocaleTimeString()}</p>
                    <span className="eta-note">Your order is being prepared</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons-premium">
              <button className="action-btn-premium primary" onClick={() => navigate("/")}>
                <Heart size={18} />
                Continue Shopping
                <ChevronRight size={18} />
              </button>
              <button className="action-btn-premium secondary" onClick={() => window.print()}>
                <Download size={18} />
                Download Invoice
              </button>
              <button className="action-btn-premium tertiary">
                <Share2 size={18} />
                Share Order Details
              </button>
            </div>

            {/* Support Card */}
            <div className="support-card-premium">
              <div className="support-header">
                <Shield size={24} />
                <div>
                  <h4>Need Assistance?</h4>
                  <p>Our support team is here to help 24/7</p>
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

            {/* Trust Badges */}
            <div className="trust-badges-premium">
              <div className="trust-item-premium">
                <Award size={20} />
                <div>
                  <strong>Quality Guaranteed</strong>
                  <p>100% satisfaction or money back</p>
                </div>
              </div>
              <div className="trust-item-premium">
                <Shield size={20} />
                <div>
                  <strong>Secure Payment</strong>
                  <p>Your transaction is protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fab-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ChevronRight size={24} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;