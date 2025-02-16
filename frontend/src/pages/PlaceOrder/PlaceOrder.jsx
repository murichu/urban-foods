/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DELIVERY_FEE = 2;

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

  const [isLoading, setIsLoading] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const MpesaStkPushSubmitted = () =>
    toast(
      "Mpesa Stk Push Submitted Successfully, Enter your Pin to complete the transaction",
      {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
      }
    );

  const MpesaStkPushSuccess = () =>
    toast.info("Mpesa Stk Push Success, transaction completed successfully");

  const MpesaStkPushFailed = () =>
    toast.error("Mpesa Stk Push Failed, Please try again", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
    });

  const StkPushCancelledByUser = () =>
    toast.error("StkPush was rejected by the user", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
    });

  const handleMpesaStkPush = async () => {
  
    try {
      setIsLoading(true);
      const { data: stkResponse } = await axios.post(
        url + "/api/stkpush",
        {
          phone: data.phone,
          amount: getTotalCartAmount() + DELIVERY_FEE,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          } // Ensure dToken is passed here
        }
      );

      MpesaStkPushSubmitted();
      console.log(stkResponse);
      await validateTransaction(stkResponse);
    } catch (error) {
      console.log(error);
      MpesaStkPushFailed();
    } finally {
      setIsLoading(false);
    }
  };

  const validateTransaction = async (payload) => {
    const checkStatus = async () => {
      try {
        const { data } = await axios.post(
          url + "/api/validate",
          {
            payload: {
              MerchantRequestID: payload.MerchantRequestID,
            },
          },
          { headers: { token } }
        );
        const transaction = data.transaction;
        switch (transaction["ResultCode"]) {
          case 0:
            console.log("Transaction Successful");
            MpesaStkPushSuccess();
            break;

          case 1032:
            console.log("Transaction cancelled by user");
            StkPushCancelledByUser();
            break;

          default:
            console.log("Transaction Failed");
            MpesaStkPushFailed();
            await checkStatus();
            break;
        }
      } catch (error) {
        console.log(error);
        MpesaStkPushFailed();
      }
    };
    setTimeout(checkStatus, 10000);
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];

      food_list.map((item) => {
        if (cartItems[item._id] > 0) {
          let itemInfo = item;
          itemInfo["quantity"] = cartItems[item._id];
          orderItems.push(itemInfo);
        }
      });
      console.log(orderItems);

      // Construct the order data payload
      let orderData = {
        address: data,
        items: orderItems,
        amount: getTotalCartAmount() + DELIVERY_FEE,
      };

      console.log(orderItems);

      let response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });
      
      // Handle successful response
      if (response.data.success) {
        await handleMpesaStkPush(); // Initiate M-Pesa STK Push after placing order
      } else {
        alert("Error placing order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an issue placing your order. Please try again.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token]);

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
              <p>Ksh {getTotalCartAmount() === 0 ? 0 : DELIVERY_FEE}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                Ksh{" "}
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + DELIVERY_FEE}
              </b>
            </div>
          </div>
        </div>
        <button type="submit" disabled={isLoading}>Place Order</button>
        <ToastContainer />
        {isLoading && (
          <div className="loading-overlay">
            <p>Loading...</p>
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </form>
  );
};

export default PlaceOrder;
