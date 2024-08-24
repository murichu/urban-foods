import axios from "axios";
import { Buffer } from "buffer";

const mpesaCredentials = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortCode: process.env.MPESA_SHORTCODE,
  passKey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL, // Your callback URL
};

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

export const initiateMpesaStkPush = async (amount, phoneNumber, orderId) => {
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


