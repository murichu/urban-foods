/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import "./OrderDetails.css";
import { StoreContext } from "../../Context/StoreContext";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order details from API
    // For demo purposes, using mock data
    const fetchOrder = async () => {
      try {
        // Replace with actual API call
        const mockOrder = {
          _id: orderId,
          date: "2024-01-15",
          status: "Delivered",
          items: [
            { name: "Pizza", price: 1200, quantity: 2, image: "pizza.jpg" },
            { name: "Burger", price: 800, quantity: 1, image: "burger.jpg" }
          ],
          total: 3200,
          deliveryAddress: "123 Main Street, City, Country",
          paymentMethod: "Card",
          tracking: [
            { status: "Order Placed", time: "10:00 AM", completed: true },
            { status: "Preparing", time: "10:15 AM", completed: true },
            { status: "Out for Delivery", time: "11:00 AM", completed: true },
            { status: "Delivered", time: "11:30 AM", completed: true }
          ]
        };
        setOrder(mockOrder);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-details-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Order Not Found</h2>
        <p>Sorry, we couldn't find your order.</p>
        <button onClick={() => navigate("/my-orders")}>View My Orders</button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "#4caf50";
      case "Out for Delivery": return "#2196f3";
      case "Preparing": return "#ff9800";
      case "Cancelled": return "#f44336";
      default: return "#666";
    }
  };

  return (
    <div className="order-details">
      <div className="order-details-container">
        <div className="order-header">
          <button className="back-btn" onClick={() => navigate("/my-orders")}>
            ← Back to Orders
          </button>
          <h1>Order #{order._id}</h1>
          <span 
            className="order-status" 
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status}
          </span>
        </div>

        <div className="order-content">
          <div className="order-items-section">
            <h2>Order Items</h2>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <div className="order-item-info">
                    <h3>{item.name}</h3>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <p className="order-item-price">Ksh {item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="order-summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Ksh {order.total}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>Ksh 200</span>
              </div>
              <hr />
              <div className="summary-row total">
                <span>Total</span>
                <span>Ksh {order.total + 200}</span>
              </div>
            </div>

            <div className="order-info-card">
              <h3>Delivery Address</h3>
              <p>{order.deliveryAddress}</p>
            </div>

            <div className="order-info-card">
              <h3>Payment Method</h3>
              <p>{order.paymentMethod}</p>
            </div>

            <div className="order-info-card">
              <h3>Order Date</h3>
              <p>{new Date(order.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="order-tracking">
          <h2>Order Tracking</h2>
          <div className="tracking-timeline">
            {order.tracking.map((step, index) => (
              <div 
                key={index} 
                className={`tracking-step ${step.completed ? "completed" : ""}`}
              >
                <div className="tracking-marker">
                  {step.completed ? (
                    <span className="checkmark">✓</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="tracking-info">
                  <h4>{step.status}</h4>
                  <p>{step.time}</p>
                </div>
                {index < order.tracking.length - 1 && (
                  <div className={`tracking-line ${step.completed ? "completed" : ""}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="order-actions">
          {order.status === "Delivered" && (
            <>
              <button className="reorder-btn" onClick={() => navigate("/")}>
                Reorder
              </button>
              <button className="review-btn">
                Write a Review
              </button>
            </>
          )}
          {(order.status === "Preparing" || order.status === "Order Placed") && (
            <button className="cancel-btn">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
