import React, { useState, useContext, useEffect } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import {
  Package,
  PackageOpen,
  ChevronRight,
  Clock,
  ShoppingBag,
  Calendar,
  Search,
  Filter,
  X,
  CheckCircle,
  Truck,
  Zap,
  Eye,
  AlertCircle,
  ChevronDown,
  MapPin,
  CreditCard,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/user-orders",
        {},
        {
          headers: { token }
        }
      );
      const ordersData = Array.isArray(response.data.data) ? response.data.data : [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order =>
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusConfig = (status) => {
    const configs = {
      "delivered": {
        class: "delivered",
        icon: <CheckCircle size={14} />,
        label: "Delivered"
      },
      "food processing": {
        class: "processing",
        icon: <Zap size={14} />,
        label: "Processing"
      },
      "out for delivery": {
        class: "shipping",
        icon: <Truck size={14} />,
        label: "Out for Delivery"
      },
      "pending": {
        class: "pending",
        icon: <Clock size={14} />,
        label: "Pending"
      },
      "cancelled": {
        class: "cancelled",
        icon: <X size={14} />,
        label: "Cancelled"
      }
    };
    return configs[status?.toLowerCase()] || configs["pending"];
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="my-orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="my-orders-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <PackageOpen size={64} />
          </div>
          <h2>No orders yet</h2>
          <p>You haven't placed any orders. Time to satisfy your cravings!</p>
          <button className="empty-action-btn" onClick={() => navigate("/")}>
            <ShoppingBag size={18} />
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="my-orders-container">
        {/* Header */}
        <div className="orders-header">
          <div className="header-left">
            <h1>My Orders</h1>
            <p>Track and manage all your orders</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {orders.filter(o => o.status?.toLowerCase() === "delivered").length}
              </span>
              <span className="stat-label">Delivered</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {orders.filter(o => o.status?.toLowerCase() !== "delivered" && o.status?.toLowerCase() !== "cancelled").length}
              </span>
              <span className="stat-label">Active</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="orders-toolbar">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by order ID or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="filter-wrapper">
            <button
              className={`filter-trigger ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filter
              {statusFilter !== "all" && <span className="filter-dot"></span>}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-section">
              <label>Status</label>
              <div className="status-options">
                <button
                  className={`status-option ${statusFilter === "all" ? "active" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </button>
                <button
                  className={`status-option ${statusFilter === "pending" ? "active" : ""}`}
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </button>
                <button
                  className={`status-option ${statusFilter === "food processing" ? "active" : ""}`}
                  onClick={() => setStatusFilter("food processing")}
                >
                  Processing
                </button>
                <button
                  className={`status-option ${statusFilter === "out for delivery" ? "active" : ""}`}
                  onClick={() => setStatusFilter("out for delivery")}
                >
                  Out for Delivery
                </button>
                <button
                  className={`status-option ${statusFilter === "delivered" ? "active" : ""}`}
                  onClick={() => setStatusFilter("delivered")}
                >
                  Delivered
                </button>
                <button
                  className={`status-option ${statusFilter === "cancelled" ? "active" : ""}`}
                  onClick={() => setStatusFilter("cancelled")}
                >
                  Cancelled
                </button>
              </div>
            </div>
            {(searchTerm || statusFilter !== "all") && (
              <div className="filter-actions">
                <button className="clear-filters" onClick={clearFilters}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Info */}
        {filteredOrders.length !== orders.length && (
          <div className="results-info">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="no-results">
            <AlertCircle size={48} />
            <h3>No matching orders</h3>
            <p>Try adjusting your search or filters</p>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const isExpanded = expandedOrder === order._id;
              const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <div key={order._id} className="order-list-item">
                  {/* Main Row */}
                  <div className="order-row" onClick={() => toggleExpand(order._id)}>
                    <div className="order-info">
                      <div className="order-icon">
                        <Package size={20} />
                      </div>
                      <div className="order-details">
                        <div className="order-id">
                          <span className="label">Order</span>
                          <span className="value">#{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="order-meta">
                          <span className="date">
                            <Calendar size={12} />
                            {formatDate(order.date)}
                          </span>
                          <span className="items-count">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="order-amount">
                      <span className="amount">Ksh {order.amount?.toLocaleString()}</span>
                    </div>

                    <div className={`order-status ${statusConfig.class}`}>
                      {statusConfig.icon}
                      <span>{statusConfig.label}</span>
                    </div>

                    <div className="order-expand">
                      <ChevronDown size={18} className={isExpanded ? 'rotated' : ''} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="order-expanded">
                      {/* Items List */}
                      <div className="expanded-section">
                        <h4>Order Items</h4>
                        <div className="items-list">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="expanded-item">
                              <div className="item-info">
                                <span className="item-qty">{item.quantity}×</span>
                                <span className="item-name">{item.name}</span>
                              </div>
                              <div className="item-price">
                                Ksh {(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="expanded-section">
                        <h4>Delivery Details</h4>
                        <div className="delivery-info">
                          <div className="info-row">
                            <MapPin size={14} />
                            <span>
                              {order.address?.street}, {order.address?.city}, {order.address?.state}
                            </span>
                          </div>
                          <div className="info-row">
                            <Calendar size={14} />
                            <span>{new Date(order.date).toLocaleString()}</span>
                          </div>
                          {order.phone && (
                            <div className="info-row">
                              <span className="label">Contact:</span>
                              <span>{order.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="expanded-section">
                        <h4>Payment Summary</h4>
                        <div className="payment-summary">
                          <div className="summary-row">
                            <span>Subtotal</span>
                            <span>Ksh {order.amount?.toLocaleString()}</span>
                          </div>
                          <div className="summary-row">
                            <span>Delivery Fee</span>
                            <span>Ksh 200</span>
                          </div>
                          <div className="summary-row total">
                            <span>Total</span>
                            <span>Ksh {(order.amount + 200).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="expanded-actions">
                        <button
                          className="action-btn primary"
                          onClick={() => navigate(`/order-details/${order._id}`)}
                        >
                          <Eye size={16} />
                          View Full Details
                        </button>
                        {order.status?.toLowerCase() === "delivered" && (
                          <button
                            className="action-btn secondary"
                            onClick={() => navigate("/")}
                          >
                            <ShoppingBag size={16} />
                            Reorder
                          </button>
                        )}
                        {order.status?.toLowerCase() === "pending" && (
                          <button className="action-btn danger">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;