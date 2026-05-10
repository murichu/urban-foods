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

  // Backend delivery fee
  const [backendDeliveryFee, setBackendDeliveryFee] = useState(0);

  // Fetch business settings
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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/user-orders`,
        {},
        {
          headers: { token },
        }
      );

      const ordersData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

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

  // Filter orders
  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) =>
          getDisplayStatus(order).toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  };

  // Payment status
  const isOrderPaid = (order) =>
    order.payment || order.paymentStatus === "Paid";

  // Display status
  const getDisplayStatus = (order) => {
    if (!isOrderPaid(order) && order.paymentStatus !== "Paid") {
      return "Payment Pending";
    }

    return order.status || "Order Placed";
  };

  // Status styles
  const getStatusConfig = (status) => {
    const configs = {
      "order placed": {
        class: "pending",
        icon: <Package size={10} />,
        label: "Order Placed",
      },

      delivered: {
        class: "delivered",
        icon: <CheckCircle size={10} />,
        label: "Delivered",
      },

      "food processing": {
        class: "processing",
        icon: <Zap size={10} />,
        label: "Processing",
      },

      "out for delivery": {
        class: "shipping",
        icon: <Truck size={10} />,
        label: "Out for Delivery",
      },

      pending: {
        class: "pending",
        icon: <Clock size={10} />,
        label: "Pending",
      },

      "payment pending": {
        class: "pending",
        icon: <CreditCard size={10} />,
        label: "Payment Pending",
      },

      cancelled: {
        class: "cancelled",
        icon: <X size={10} />,
        label: "Cancelled",
      },
    };

    return configs[status?.toLowerCase()] || configs["order placed"];
  };

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();

    // Reset time to compare only dates
    const orderDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const diffTime = currentDate - orderDate;

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";

    if (diffDays === 1) return "Yesterday";

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  // Toggle expanded order
  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Calculate total
  const calculateOrderTotal = (amount) => {
    return amount + backendDeliveryFee;
  };

  // Loading state
  if (loading) {
    return (
      <div className="my-orders-loading">
        <div className="loading-spinner"></div>

        <p>Loading your orders...</p>
      </div>
    );
  }

  // Empty state
  if (!orders.length) {
    return (
      <div className="my-orders-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <PackageOpen size={64} />
          </div>

          <h2>No orders yet</h2>

          <p>You haven't placed any orders yet.</p>

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
        {/* HEADER */}
        <div className="orders-header">
          <div className="header-left">
            <h1>My Orders</h1>

            <p>Track and manage your orders</p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="orders-toolbar">
          <div className="search-wrapper">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className={`filter-trigger ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filter
          </button>
        </div>

        {/* FILTERS */}
        {showFilters && (
          <div className="filter-panel">
            <div className="status-options">
              {[
                "all",
                "order placed",
                "food processing",
                "out for delivery",
                "delivered",
                "cancelled",
              ].map((status) => (
                <button
                  key={status}
                  className={`status-option ${
                    statusFilter === status ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            {(searchTerm || statusFilter !== "all") && (
              <button className="clear-filters" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ORDERS */}
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(getDisplayStatus(order));

            const isExpanded = expandedOrder === order._id;

            const totalItems =
              order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

            return (
              <div key={order._id} className="order-list-item">
                {/* ORDER ROW */}
                <div
                  className="order-row"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="order-info">
                    <div className="order-icon">
                      <Package size={20} />
                    </div>

                    <div className="order-details">
                      <div className="order-id">
                        <span className="label">Order</span>

                        <span className="value">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </div>

                      <div className="order-meta">
                        <span className="date">
                          <Calendar size={12} />
                          {formatDate(order.date || order.createdAt)}
                        </span>

                        <span className="items-count">{totalItems} items</span>
                      </div>
                    </div>
                  </div>

                  {/* ORDER AMOUNT */}
                  <div className="order-amount">
                    <span className="amount">
                      Ksh {calculateOrderTotal(order.amount).toLocaleString()}
                    </span>
                  </div>

                  {/* STATUS */}
                  <div className={`order-status ${statusConfig.class}`}>
                    {statusConfig.icon}

                    <span>{statusConfig.label}</span>
                  </div>

                  {/* EXPAND */}
                  <div className="order-expand">
                    <ChevronDown
                      size={18}
                      className={isExpanded ? "rotated" : ""}
                    />
                  </div>
                </div>

                {/* EXPANDED */}
                {isExpanded && (
                  <div className="order-expanded">
                    {/* ITEMS */}
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
                              Ksh{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DELIVERY */}
                    <div className="expanded-section">
                      <h4>Delivery Details</h4>

                      <div className="delivery-info">
                        <div className="info-row">
                          <MapPin size={14} />

                          <span>
                            {order.address?.street}, {order.address?.city},{" "}
                            {order.address?.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PAYMENT SUMMARY */}
                    <div className="expanded-section">
                      <h4>Payment Summary</h4>

                      <div className="payment-summary">
                        <div className="summary-row">
                          <span>Subtotal</span>

                          <span>Ksh {order.amount?.toLocaleString()}</span>
                        </div>

                        <div className="summary-row">
                          <span>Delivery Fee</span>

                          <span>Ksh {backendDeliveryFee.toLocaleString()}</span>
                        </div>

                        <div className="summary-row total">
                          <span>Total</span>

                          <span>
                            Ksh{" "}
                            {calculateOrderTotal(order.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="expanded-actions">
                      <button
                        className="action-btn primary"
                        onClick={() => navigate(`/order-details/${order._id}`)}
                      >
                        <Eye size={16} />
                        View Details
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

                      {!isOrderPaid(order) && (
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
      </div>
    </div>
  );
};

export default MyOrders;
