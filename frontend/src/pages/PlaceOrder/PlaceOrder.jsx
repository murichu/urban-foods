import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  MapPin, Phone, Mail, User,
  CreditCard, Truck, ShoppingBag,
  ArrowRight, ShieldCheck, Clock,
  CheckCircle, AlertCircle, Globe,
  Home, Send, Smartphone, Lock
} from "lucide-react";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, foodList, cartItems, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Kenya",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [mpesaSuccess, setMpesaSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${url}/api/user/profile`, {
          headers: { token }
        });
        if (response.data.success) {
          const user = response.data.user;
          setData(prev => ({
            ...prev,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || '',
            street: user.address || ''
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (token) {
      fetchUserProfile();
    } else {
      navigate("/cart");
    }
  }, [token, url, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!data.firstName.trim()) newErrors.firstName = "First name required";
    if (!data.lastName.trim()) newErrors.lastName = "Last name required";
    if (!data.email.trim()) newErrors.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Invalid email";
    if (!data.street.trim()) newErrors.street = "Street address required";
    if (!data.city.trim()) newErrors.city = "City required";
    if (!data.state.trim()) newErrors.state = "State/County required";
    if (!data.postalCode.trim()) newErrors.postalCode = "Postal code required";
    if (!data.phone.trim()) newErrors.phone = "Phone number required";
    else if (!/^[0-9+\s]{10,13}$/.test(data.phone.replace(/\s/g, ''))) newErrors.phone = "Valid phone required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTransaction = async (checkoutRequestId) => {
    const checkStatus = async () => {
      try {
        const { data } = await axios.get(
          `${url}/api/mpesa/status/${checkoutRequestId}`,
          { headers: { token } }
        );

        if (data.status === "Paid") {
          setPaymentStatus("success");
          toast.success("Payment Received! Redirecting...");
          setMpesaSuccess(true);
          setTimeout(() => navigate("/my-orders"), 2000);
        } else if (data.status === "Failed") {
          setPaymentStatus("failed");
          toast.error("Payment Failed. Please try again.");
          setIsLoading(false);
        } else {
          setTimeout(checkStatus, 3000);
        }
      } catch (error) {
        setTimeout(checkStatus, 5000);
      }
    };
    setTimeout(checkStatus, 10000);
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = getTotalCartAmount();
    if (amount === 0) {
      toast.error("Your cart is empty");
      return;
    }

    let orderItems = foodList
      .filter(item => cartItems[item._id] > 0)
      .map(item => ({ ...item, quantity: cartItems[item._id] }));

    let normalizedPhone = data.phone.replace(/\s+/g, "");
    if (normalizedPhone.startsWith("0")) normalizedPhone = "254" + normalizedPhone.substring(1);
    if (normalizedPhone.startsWith("+254")) normalizedPhone = normalizedPhone.substring(1);

    setIsLoading(true);
    setPaymentStatus("processing");

    try {
      const response = await axios.post(url + "/api/order/place", {
        address: data,
        items: orderItems,
        amount,
        phoneNumber: normalizedPhone,
      }, { headers: { token } });

      if (response.data.success) {
        toast.info("STK Push sent to your phone");
        if (response.data.checkoutRequestId) {
          validateTransaction(response.data.checkoutRequestId);
        }
      } else {
        toast.error(response.data.message);
        setIsLoading(false);
        setPaymentStatus(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setIsLoading(false);
      setPaymentStatus(null);
    }
  };

  const totalAmount = getTotalCartAmount();
  const deliveryFee = totalAmount === 0 ? 0 : 200;
  const finalAmount = totalAmount + deliveryFee;
  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  if (totalAmount === 0 && !isLoading) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="place-order-page">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="place-order-background">
        <div className="order-orb orb-1"></div>
        <div className="order-orb orb-2"></div>
        <div className="order-orb orb-3"></div>
      </div>

      <div className="place-order-container">
        {/* Header */}
        <div className="checkout-header">
          <div className="header-badge">
            <ShoppingBag size={16} />
            <span>Secure Checkout</span>
          </div>
          <h1>Complete Your Order</h1>
          <p className="header-subtitle">Review items and provide delivery details</p>
        </div>

        <div className="checkout-grid">
          {/* Left Column - Delivery Form */}
          <div className="checkout-form-column">
            <div className="form-card">
              <div className="card-header">
                <div className="header-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3>Delivery Information</h3>
                  <p>Enter your shipping address</p>
                </div>
              </div>

              <form onSubmit={placeOrder} className="delivery-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <User size={14} />
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={data.firstName}
                      onChange={onChangeHandler}
                      placeholder="John"
                      className={errors.firstName ? "error" : ""}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label>
                      <User size={14} />
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={data.lastName}
                      onChange={onChangeHandler}
                      placeholder="Doe"
                      className={errors.lastName ? "error" : ""}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={14} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={onChangeHandler}
                    placeholder="john@example.com"
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>
                    <Home size={14} />
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={data.street}
                    onChange={onChangeHandler}
                    placeholder="123 Main Street"
                    className={errors.street ? "error" : ""}
                  />
                  {errors.street && <span className="error-message">{errors.street}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={data.city}
                      onChange={onChangeHandler}
                      placeholder="Nairobi"
                      className={errors.city ? "error" : ""}
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label>State/County</label>
                    <input
                      type="text"
                      name="state"
                      value={data.state}
                      onChange={onChangeHandler}
                      placeholder="Nairobi County"
                      className={errors.state ? "error" : ""}
                    />
                    {errors.state && <span className="error-message">{errors.state}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={data.postalCode}
                      onChange={onChangeHandler}
                      placeholder="00100"
                      className={errors.postalCode ? "error" : ""}
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                  </div>
                  <div className="form-group">
                    <label>
                      <Globe size={14} />
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={data.country}
                      onChange={onChangeHandler}
                      placeholder="Kenya"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={14} />
                    Phone Number (M-Pesa)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={data.phone}
                    onChange={onChangeHandler}
                    placeholder="0712345678"
                    className={errors.phone ? "error" : ""}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                  <span className="field-hint">We'll send payment prompt to this number</span>
                </div>
              </form>
            </div>

            {/* Delivery Tips - Compact */}
            <div className="delivery-tips-compact">
              <div className="tip-item">
                <Truck size={16} />
                <div>
                  <strong>Free Delivery</strong>
                  <span>On orders over Ksh 1000</span>
                </div>
              </div>
              <div className="tip-item">
                <Clock size={16} />
                <div>
                  <strong>30-45 min</strong>
                  <span>Est. delivery time</span>
                </div>
              </div>
              <div className="tip-item">
                <Smartphone size={16} />
                <div>
                  <strong>M-Pesa Express</strong>
                  <span>Secure payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-summary-column">
            <div className="summary-card">
              <div className="summary-header">
                <ShoppingBag size={18} />
                <h3>Order Summary</h3>
                <span className="item-badge">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>

              {/* Order Items */}
              <div className="order-items-list">
                {foodList.filter(item => cartItems[item._id] > 0).map((item) => (
                  <div key={item._id} className="order-item">
                    <div className="item-image">
                      <img src={url + "/images/" + item.image} alt={item.name} />
                      <span className="item-qty">{cartItems[item._id]}</span>
                    </div>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">Ksh {item.price}</span>
                    </div>
                    <div className="item-total">
                      Ksh {item.price * cartItems[item._id]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>Ksh {totalAmount.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "free" : ""}>
                    {deliveryFee === 0 ? "Free" : `Ksh ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="divider"></div>
                <div className="breakdown-row total">
                  <span>Total Amount</span>
                  <span>Ksh {finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="payment-method">
                <div className="method-header">
                  <CreditCard size={14} />
                  <span>Payment Method</span>
                </div>
                <div className="mpesa-option">
                  <div className="mpesa-icon">💰</div>
                  <div className="mpesa-info">
                    <strong>M-Pesa Express</strong>
                    <p>Pay securely via M-Pesa</p>
                  </div>
                  <CheckCircle size={16} className="check-icon" />
                </div>
              </div>

              {/* Place Order Button */}
              <button
                className="place-order-btn"
                onClick={placeOrder}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Place Order
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="security-notice">
                <ShieldCheck size={12} />
                <span>Secure encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Overlay */}
      {isLoading && (
        <div className="payment-overlay">
          <div className="payment-dialog">
            <div className="payment-animation">
              {paymentStatus === "processing" && (
                <>
                  <div className="pulse-ring"></div>
                  <div className="payment-icon">💰</div>
                </>
              )}
              {paymentStatus === "success" && (
                <div className="success-icon">
                  <CheckCircle size={48} />
                </div>
              )}
              {paymentStatus === "failed" && (
                <div className="failed-icon">
                  <AlertCircle size={48} />
                </div>
              )}
            </div>
            <h3>
              {paymentStatus === "processing" && "Processing Payment"}
              {paymentStatus === "success" && "Payment Successful!"}
              {paymentStatus === "failed" && "Payment Failed"}
              {!paymentStatus && "Placing Order..."}
            </h3>
            <p>
              {paymentStatus === "processing" && "Check your phone for M-Pesa prompt"}
              {paymentStatus === "success" && "Redirecting to your orders..."}
              {paymentStatus === "failed" && "Please try again"}
              {!paymentStatus && "Please wait..."}
            </p>
            {paymentStatus === "failed" && (
              <button className="retry-btn" onClick={() => setIsLoading(false)}>
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;