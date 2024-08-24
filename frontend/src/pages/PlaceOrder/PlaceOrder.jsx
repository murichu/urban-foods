/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } =
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
    country: "",
    phone: "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const onChangeHandler = (event) => {
    event.preventDefault();
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onPaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }

    let orderItems = [];

    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
      paymentMethod: selectedPaymentMethod,
      phoneNumber: data.phone, // For M-Pesa
    };
    
    console.log("Complete URL:", `${url}api/order/place`);
    console.log("Order Data:", orderData);

    try {
      // Place the order
       const response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });

      if (response.data.success) {
        alert("Order placed successfully!");

        // Handle M-Pesa STK Push payment process
        if (selectedPaymentMethod === "M-Pesa STK Push") {
          try {
            const paymentResponse = await axios.post(
              `${url}/api/mpesa_stk`,
              {
                userId: response.data.order.userId,
                orderId: response.data.order.orderId,
                amount: response.data.order.amount,
                phoneNumber: data.phone,
              },
              {
                headers: { token },
              }
            );

            if (paymentResponse.data.success) {
              alert("Payment initiated successfully. Please complete the payment on your phone.");
              history.push("/my-orders");
            } else {
              alert("Payment initiation failed: " + paymentResponse.data.message);
            }
          } catch (error) {
            console.error("An error occurred while initiating payment: " + error.message);
            alert("An error occurred while initiating payment: " + error.message);
          }
        } else if (selectedPaymentMethod === "Cash on Delivery") {
          history.push("/my-orders");
        } else {
          alert("Complete the payment process.");
        }
      } else {
        alert("Failed to place order. " + response.data.message);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing the order.");
    }
  };

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email address"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="postalCode"
            onChange={onChangeHandler}
            value={data.postalCode}
            type="text"
            placeholder="Postal Code"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder="Phone"
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Ksh {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery fee</p>
              <p>Ksh {getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                Ksh {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
              </b>
            </div>
          </div>
        </div>
        <div className="payment-options">
          <p className="title">Select Payment Method</p>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="M-Pesa STK Push"
              checked={selectedPaymentMethod === "M-Pesa STK Push"}
              onChange={onPaymentMethodChange}
            />
            M-Pesa STK Push
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="M-Pesa Paybill Online"
              checked={selectedPaymentMethod === "M-Pesa Paybill Online"}
              onChange={onPaymentMethodChange}
            />
            M-Pesa Paybill Online
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="Cash on Delivery"
              checked={selectedPaymentMethod === "Cash on Delivery"}
              onChange={onPaymentMethodChange}
            />
            Cash on Delivery
          </label>
        </div>
        <button type="submit">Place Order</button>
      </div>
    </form>
  );
};

export default PlaceOrder;
