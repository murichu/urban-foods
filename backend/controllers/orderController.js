import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from "axios";

const DELIVERY_FEE = 2;

// Token Generation function
const getAccessToken = async () => {
  const apiUrl =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const headers = {
    Authorization:
      "Basic " +
      Buffer.from(
        `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
      ).toString("base64"),
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(apiUrl, { headers });
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Error getting access token");
  }
};

// Save Transaction function
const saveTransaction = async (values) => {
  const transaction = new Transaction({
    MerchantRequestID: values.MerchantRequestID,
    CheckoutRequestID: values.CheckoutRequestID,
    ResultCode: values.ResultCode,
    ResultDesc: values.ResultDesc,
    Amount: values.Amount,
    MpesaReceiptNumber: values.MpesaReceiptNumber,
    Balance: values.Balance,
    TransactionDate: values.TransactionDate,
    PhoneNumber: values.PhoneNumber,
  });

  try {
    const newTransaction = await transaction.save();
    return newTransaction;
  } catch (err) {
    console.error("Error saving transaction:", err.message);
    throw new Error("Error saving transaction");
  }
};

// Place Order function
const placeOrder = async (req, res) => {
  const frontend_url =
    process.env.MPESA_CALLBACK_URL || "http://localhost:5173";

  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount + DELIVERY_FEE, // Include delivery fee
      address: req.body.address,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const accessToken = await getAccessToken();

    const mpesaPayload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: process.env.MPESA_PASSKEY,
      Timestamp: new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14),
      TransactionType: "CustomerPayBillOnline",
      Amount: req.body.amount + DELIVERY_FEE,
      PartyA: req.body.phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: req.body.phoneNumber,
      CallBackURL: `${frontend_url}/mpesa/callback`,
      AccountReference: `Order_${newOrder._id}`,
      TransactionDesc: "Payment for Order",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      mpesaPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.ResponseCode === "0") {
      res.json({ success: true, message: "M-Pesa STK Push initiated" });
    } else {
      res.status(500).json({
        success: false,
        message: `Error initiating M-Pesa STK Push: ${response.data.ResponseDescription}`,
      });
    }
  } catch (error) {
    console.error(
      "Error in placeOrder function:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ success: false, message: "Error saving Order" });
  }
};

// Handle M-Pesa Callback
const handleCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const {
      ResultCode,
      ResultDesc,
      MerchantRequestID,
      CheckoutRequestID,
      ResponseCode,
      MpesaReceiptNumber,
      Balance,
      TransactionDate,
      PhoneNumber,
    } = stkCallback;

    if (ResponseCode === "0") {
      const order = await orderModel.findOne({ _id: CheckoutRequestID });
      if (order) {
        order.paymentStatus = "Success";
        await order.save();

        // Save the transaction details
        await saveTransaction({
          MerchantRequestID,
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          Amount: order.amount,
          MpesaReceiptNumber,
          Balance,
          TransactionDate,
          PhoneNumber,
        });

        res.status(200).json({ success: true, message: "Payment successful" });
      } else {
        res.status(404).json({ success: false, message: "Order not found" });
      }
    } else {
      res
        .status(400)
        .json({ success: false, message: `Payment failed: ${ResultDesc}` });
    }
  } catch (error) {
    console.error(
      "Error in M-Pesa callback:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Verify Order function
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  if (!orderId) {
    return res
      .status(400)
      .json({ success: false, message: "Order ID is required" });
  }

  try {
    if (success) {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { paymentStatus: "Paid" },
        { new: true }
      );
      if (!updatedOrder) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
      return res.status(200).json({ success: true, message: "Paid" });
    } else {
      const deletedOrder = await orderModel.findByIdAndDelete(orderId);
      if (!deletedOrder) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
      return res.status(200).json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred" });
  }
};

// Retrieve User Orders
const userOrders = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  try {
    const orders = await orderModel.find({ userId });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this user" });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error Retrieving User Orders" });
  }
};

// List Orders with Pagination and Sorting
const listOrders = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    search = "",
    startDate,
    endDate,
  } = req.query;

  try {
    const sortOrder = order === "asc" ? 1 : -1;

    // Create the filter object for MongoDB query
    const filter = {
      $or: [
        { orderId: new RegExp(search, "i") },
        { status: new RegExp(search, "i") },
        // Add more fields if needed
      ],
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Fetch orders with filtering, sorting, and pagination
    const orders = await orderModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Count total documents matching the filter
    const totalOrders = await orderModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error("Error retrieving orders:", error.message);
    res.status(500).json({
      success: false,
      message: "Error Retrieving All Orders",
      error: error.message,
    });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, handleCallback };
