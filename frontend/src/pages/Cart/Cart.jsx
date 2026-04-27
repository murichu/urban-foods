import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import {
  Trash2, ShoppingBag, ArrowRight, Ticket,
  Plus, Minus, CreditCard, Truck, Clock,
  AlertCircle, ChevronRight, Sparkles, Gift,
  ArrowLeft
} from "lucide-react";
import { Card, Button, Input, Badge } from "../../components/UI/UI";

const Cart = () => {
  const {
    cartItems,
    foodList,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);

  const totalAmount = getTotalCartAmount();
  const deliveryFee = totalAmount === 0 ? 0 : 200;
  const discountAmount = promoApplied ? totalAmount * 0.1 : promoDiscount;
  const finalAmount = totalAmount + deliveryFee - discountAmount;

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setPromoApplied(true);
      setPromoDiscount(totalAmount * 0.1);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  // Use addToCart for increasing quantity
  const increaseQuantity = (itemId) => {
    addToCart(itemId);
  };

  // Use removeFromCart for decreasing quantity
  const decreaseQuantity = (itemId) => {
    removeFromCart(itemId);
  };

  const getEstimatedDelivery = () => {
    const minutes = Math.floor(Math.random() * (45 - 20 + 1) + 20);
    return `${minutes} - ${minutes + 15} minutes`;
  };

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  if (totalAmount === 0) {
    return (
      <div className="cart-empty-page">
        <div className="empty-cart-container">
          <button className="back-button-nav" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            Back to Menu
          </button>
          <div className="empty-cart-animation">
            <ShoppingBag size={80} />
          </div>
          <div className="empty-cart-content">
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <p className="text-muted-sm">Browse our menu and discover delicious meals</p>
            <button className="btn-explore" onClick={() => navigate("/")}>
              Explore Menu <ArrowRight size={18} />
            </button>
          </div>
          <div className="empty-cart-suggestions">
            <div className="suggestion-title">
              <Sparkles size={16} />
              <span>Popular Items</span>
            </div>
            <div className="suggestion-items">
              {foodList?.slice(0, 3).map(item => (
                <div key={item._id} className="suggestion-item" onClick={() => {
                  addToCart(item._id);
                  navigate("/cart");
                }}>
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-background">
        <div className="cart-orb orb-1"></div>
        <div className="cart-orb orb-2"></div>
      </div>

      <div className="cart-container">
        {/* Main Content */}
        <div className="cart-main">
          {/* Back Button */}
          <div className="cart-navigation">
            <button className="back-button" onClick={() => navigate("/")}>
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>

          <div className="cart-progress">
            <div className="progress-step active">
              <div className="step-number">1</div>
              <span>Cart</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-number">2</div>
              <span>Checkout</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-number">3</div>
              <span>Payment</span>
            </div>
          </div>

          <div className="cart-items-wrapper">
            <div className="cart-items-header">
              <div className="header-title">
                <ShoppingBag size={22} />
                <h2>Your Cart</h2>
                <Badge variant="tomato">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              <button className="clear-cart-btn" onClick={() => {
                Object.keys(cartItems).forEach(item => {
                  for (let i = 0; i < cartItems[item]; i++) {
                    removeFromCart(item);
                  }
                });
              }}>
                Clear All
              </button>
            </div>

            {/* Desktop Table Header */}
            <div className="cart-table-header">
              <div className="col-product">Product</div>
              <div className="col-price">Price</div>
              <div className="col-qty">Quantity</div>
              <div className="col-total">Total</div>
              <div className="col-action"></div>
            </div>

            {/* Cart Items */}
            <div className="cart-items-list">
              {foodList && foodList.map((item) => {
                if (cartItems[item._id] > 0) {
                  return (
                    <div key={item._id} className="cart-item">
                      <div className="cart-item-product">
                        <div className="product-image">
                          <img src={url + "/images/" + item.image} alt={item.name} />
                          {item.isNew && <span className="new-badge">New</span>}
                        </div>
                        <div className="product-info">
                          <h3>{item.name}</h3>
                          <p className="product-category">{item.category}</p>
                          <div className="product-meta">
                            <span className="meta-price">Ksh {item.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="cart-item-price desktop-only">
                        <span>Ksh {item.price.toLocaleString()}</span>
                      </div>

                      <div className="cart-item-quantity">
                        <div className="quantity-control">
                          <button
                            className="qty-btn minus"
                            onClick={() => decreaseQuantity(item._id)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value">{cartItems[item._id]}</span>
                          <button
                            className="qty-btn plus"
                            onClick={() => increaseQuantity(item._id)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-total">
                        <span className="total-amount">
                          Ksh {(item.price * cartItems[item._id]).toLocaleString()}
                        </span>
                      </div>

                      <div className="cart-item-action">
                        <button
                          className="remove-btn"
                          onClick={() => {
                            // Remove all quantities of this item
                            for (let i = 0; i < cartItems[item._id]; i++) {
                              removeFromCart(item._id);
                            }
                          }}
                          aria-label="Remove item completely"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Delivery Info Bar */}
            <div className="delivery-info-bar">
              <div className="info-item">
                <Truck size={18} />
                <div>
                  <strong>Free Delivery</strong>
                  <span>On orders above Ksh 1000</span>
                </div>
              </div>
              <div className="info-divider"></div>
              <div className="info-item">
                <Clock size={18} />
                <div>
                  <strong>Est. Delivery</strong>
                  <span>{getEstimatedDelivery()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="cart-sidebar">
          <div className="sidebar-sticky">
            <Card className="cart-summary-card">
              <div className="summary-header">
                <h3>Order Summary</h3>
                <span className="summary-badge">✨ Save on delivery</span>
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>Ksh {totalAmount.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "free" : ""}>
                    {deliveryFee === 0 ? "Free" : `Ksh ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                {promoApplied && (
                  <div className="summary-row promo-discount">
                    <span>Discount (10%)</span>
                    <span>- Ksh {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="divider"></div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>Ksh {finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="cart-checkout-btn"
                onClick={() => navigate("/order")}
              >
                <CreditCard size={18} />
                Proceed to Checkout
                <ChevronRight size={18} />
              </Button>

              <div className="secure-checkout">
                <div className="secure-badge">
                  <div className="secure-dot"></div>
                  Secure Checkout
                </div>
                <div className="payment-icons">
                  <span>Visa</span>
                  <span>Mastercard</span>
                  <span>M-Pesa</span>
                </div>
              </div>
            </Card>

            <Card className="promo-card">
              <div className="promo-header">
                <div className="promo-icon">
                  <Gift size={20} />
                </div>
                <div>
                  <h4>Have a promo code?</h4>
                  <p className="text-muted-sm">Get discounts on your order</p>
                </div>
              </div>

              <div className="promo-input-group">
                <Input
                  placeholder="Enter code (WELCOME10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-input"
                />
                <Button variant="outline" onClick={handleApplyPromo}>
                  Apply
                </Button>
              </div>

              {promoError && (
                <div className="promo-error">
                  <AlertCircle size={14} />
                  {promoError}
                </div>
              )}

              {promoApplied && (
                <div className="promo-success">
                  <div className="success-check">✓</div>
                  <span>Promo code applied successfully!</span>
                </div>
              )}

              <div className="promo-tip">
                <Sparkles size={14} />
                <span>Tip: Use "WELCOME10" for 10% off your first order</span>
              </div>
            </Card>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-item">
                <div className="trust-icon">🛡️</div>
                <span>Secure Payment</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🚚</div>
                <span>Fast Delivery</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">⭐</div>
                <span>Quality Guarantee</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;