import axios from "axios";
import { Buffer } from "buffer";

const mpesaCredentials = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  paybillNumber: process.env.MPESA_PAYBILL_NUMBER,
  shortcode: process.env.MPESA_SHORTCODE, // If needed for other purposes
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

export const initiateMpesaC2B = async (amount, phoneNumber, orderId) => {
  const accessToken = await getMpesaAccessToken();

  const c2bRequest = {
    ShortCode: mpesaCredentials.paybillNumber,
    CommandID: "CustomerPayBillOnline",
    Amount: amount,
    Msisdn: phoneNumber,
    BillRefNumber: `Order-${orderId}`,
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


