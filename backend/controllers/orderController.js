import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from "axios";
import paymentModel from "../models/paymentModel.js";

// M-Pesa Daraja API Credentials
const mpesaCredentials = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortCode: process.env.MPESA_SHORTCODE,
  passKey: process.env.MPESA_PASSKEY,
  callbackUrl: "https://your-callback-url.com/mpesa/callback", // Replace with your callback URL
  paybillNumber: process.env.MPESA_PAYBILL_NUMBER, // Your M-Pesa Paybill number
};

// Function to get M-Pesa access token
const getMpesaAccessToken = async () => {
  const auth = Buffer.from(
    `${mpesaCredentials.consumerKey}:${mpesaCredentials.consumerSecret}`
  ).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to get M-Pesa access token");
  }
};

// Function to initiate M-Pesa STK Push
const initiateMpesaStkPush = async (amount, phoneNumber, orderId) => {
  const accessToken = await getMpesaAccessToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ]/g, "")
    .slice(0, 14);
  const password = Buffer.from(
    `${mpesaCredentials.shortCode}${mpesaCredentials.passKey}${timestamp}`
  ).toString("base64");

  const stkPushRequest = {
    BusinessShortCode: mpesaCredentials.shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: mpesaCredentials.shortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: mpesaCredentials.callbackUrl,
    AccountReference: `Order-${orderId}`,
    TransactionDesc: "Payment for order",
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to initiate M-Pesa STK Push");
  }
};

// Function to initiate M-Pesa C2B (Customer to Business) Paybill transaction
const initiateMpesaC2B = async (amount, phoneNumber, orderId) => {
  const accessToken = await getMpesaAccessToken();

  const c2bRequest = {
    ShortCode: mpesaCredentials.paybillNumber,
    CommandID: "CustomerPayBillOnline",
    Amount: amount,
    Msisdn: phoneNumber,
    BillRefNumber: `Order-${orderId}`, // This is the Account Reference
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate",
      c2bRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to initiate M-Pesa C2B Paybill transaction");
  }
};

// Placing user order from frontend
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173"; // Define Frontend URL for success and cancel URLs

  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();

    // Clears cart data
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Send paymentRequest to frontend to initiate Google Pay
    res.json({ success: true, paymentRequest, orderId: newOrder._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error placing order" });
  }

  // M-Pesa STK Push
  try {
    const phoneNumber = req.body.phoneNumber; // Phone number for M-Pesa payment
    const mpesaResponse = await initiateMpesaStkPush(
      req.body.amount,
      phoneNumber,
      newOrder._id
    );

    if (mpesaResponse.ResponseCode === "0") {
      res.json({
        success: true,
        message:
          "M-Pesa STK Push initiated. Check your phone to complete the payment.",
      });
    } else {
      res.json({
        success: false,
        message: "Failed to initiate M-Pesa payment. Please try again.",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error initiating M-Pesa STK Push" });
  }

  // M-Pesa C2B Paybill Transaction
  try {
    const phoneNumber = req.body.phoneNumber; // Phone number for M-Pesa payment
    const mpesaC2BResponse = await initiateMpesaC2B(
      req.body.amount,
      phoneNumber,
      newOrder._id
    );

    if (mpesaC2BResponse.ResponseCode === "0") {
      res.json({
        success: true,
        message:
          "M-Pesa C2B Paybill transaction initiated. Check your phone to complete the payment.",
      });
    } else {
      res.json({
        success: false,
        message:
          "Failed to initiate M-Pesa C2B Paybill transaction. Please try again.",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error initiating M-Pesa C2B Paybill transaction",
    });
  }
};

export { placeOrder };
