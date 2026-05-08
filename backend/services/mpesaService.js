import axios from "axios";
import orderModel from "../models/orderModel.js";
import paymentModel from "../models/paymentModel.js";
import logger from "../config/logger.js";
import { generateCustomId } from "../utils/idGenerator.js";

const getMpesaBaseUrl = () => {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

/**
 * Generate M-Pesa access token
 */
export const getAccessToken = async () => {
  const baseUrl = getMpesaBaseUrl();
  const apiUrl = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
  const headers = {
    Authorization:
      "Basic " +
      Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
      ).toString("base64"),
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(apiUrl, { headers });
    return response.data.access_token;
  } catch (error) {
    logger.error(
      "Error getting M-Pesa access token:",
      error.response?.data || error.message
    );
    throw new Error("Error getting access token");
  }
};

/**
 * Generate timestamp for M-Pesa requests
 */
export const generateTimestamp = () => {
  const date = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

/**
 * Initiate M-Pesa STK Push
 */
export const initiateMpesaStkPush = async (
  amount,
  phoneNumber,
  orderDatabaseId,
  orderId
) => {
  const accessToken = await getAccessToken();

  const shortCode = process.env.MPESA_SHORTCODE || "174379";
  const passkey =
    process.env.MPESA_PASSKEY ||
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const timestamp = generateTimestamp();
  const password = Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );

  // Use a dedicated backend callback URL
  // If not provided in env, we might need a way to detect it or use a default
  const callbackUrl =
    process.env.MPESA_BACKEND_CALLBACK_URL ||
    process.env.MPESA_CALLBACK_URL ||
    `${
      process.env.BACKEND_URL || "https://jc8rvy-4000.csb.app"
    }/api/mpesa/callback`;

  const mpesaPayload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: phoneNumber.replace("+", ""),
    PartyB: shortCode,
    PhoneNumber: phoneNumber.replace("+", ""),
    CallBackURL: callbackUrl,
    AccountReference: orderId,
    TransactionDesc: `Payment for Urban Foods Order ${orderId}`,
  };

  try {
    const baseUrl = getMpesaBaseUrl();
    const response = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      mpesaPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // If successful, we should store the CheckoutRequestID in the order or a payment record
    if (response.data.ResponseCode === "0") {
      await orderModel.findByIdAndUpdate(orderDatabaseId, {
        $set: {
          paymentId: generateCustomId("STK"), // New Payment ID for this initiation
          mpesaCheckoutRequestId: response.data.CheckoutRequestID,
        },
      });
    }

    return response.data;
  } catch (error) {
    logger.error(
      "Error initiating M-Pesa STK Push:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Handle M-Pesa callback logic
 */
export const processMpesaCallback = async (stkCallback) => {
  const {
    ResultCode,
    ResultDesc,
    MerchantRequestID,
    CheckoutRequestID,
    CallbackMetadata,
  } = stkCallback;

  // Find order by mpesaCheckoutRequestId
  const order = await orderModel.findOne({
    mpesaCheckoutRequestId: CheckoutRequestID,
  });

  if (!order) {
    logger.error(
      `CRITICAL: Order not found for M-Pesa CheckoutRequestID: ${CheckoutRequestID}`
    );
    throw new Error("Order not found");
  }

  if (ResultCode === 0) {
    order.paymentStatus = "Paid";
    order.payment = true;
    await order.save();

    const items = CallbackMetadata?.Item || [];
    const transactionId = items.find(
      (i) => i.Name === "MpesaReceiptNumber"
    )?.Value;
    const amount = items.find((i) => i.Name === "Amount")?.Value;
    const phoneNumber = items.find((i) => i.Name === "PhoneNumber")?.Value;

    const payment = new paymentModel({
      userId: order.userId,
      orderId: order._id,
      paymentId: order.paymentId,
      method: "mpesa_stk",
      amount: amount || order.amount,
      status: "completed",
      transactionId,
      phoneNumber,
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    });

    await payment.save();
    logger.info(
      `Payment SUCCESS for Order: ${order.orderId} (ID: ${order._id})`
    );
    return { success: true, order };
  } else {
    order.paymentStatus = "Failed";
    await order.save();
    logger.warn(
      `Payment FAILED for Order: ${order.orderId} (ID: ${order._id}): ${ResultDesc}`
    );

    // Log failed payment attempt
    const payment = new paymentModel({
      userId: order.userId,
      orderId: order._id,
      paymentId: order.paymentId,
      method: "mpesa_stk",
      amount: order.amount,
      status: "failed",
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    });
    await payment.save();

    return { success: false, order, message: ResultDesc };
  }
};

/**
 * Query M-Pesa STK Push status
 */
export const queryStkPushStatus = async (checkoutRequestID) => {
  const accessToken = await getAccessToken();
  const shortCode = process.env.MPESA_SHORTCODE || "174379";
  const passkey =
    process.env.MPESA_PASSKEY ||
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const timestamp = generateTimestamp();
  const password = Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );

  try {
    const baseUrl = getMpesaBaseUrl();
    const response = await axios.post(
      `${baseUrl}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error(
      "Error querying STK status:",
      error.response?.data || error.message
    );
    throw error;
  }
};
