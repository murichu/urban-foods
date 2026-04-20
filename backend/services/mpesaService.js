import axios from 'axios';

/**
 * Generate M-Pesa access token
 * @returns {Promise<string>} Access token
 */
export const getAccessToken = async () => {
  const apiUrl =
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const headers = {
    Authorization:
      'Basic ' +
      Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
      ).toString('base64'),
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.get(apiUrl, { headers });
    return response.data.access_token;
  } catch (error) {
    console.error(
      'Error getting access token:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Error getting access token');
  }
};

/**
 * Generate timestamp for M-Pesa requests
 * @returns {string} Timestamp in YYYYMMDDHHmmss format
 */
export const generateTimestamp = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2)
  );
};

/**
 * Generate password for M-Pesa STK Push
 * @param {string} shortCode - Business short code
 * @param {string} passkey - M-Pesa passkey
 * @param {string} timestamp - Timestamp string
 * @returns {string} Base64 encoded password
 */
export const generatePassword = (shortCode, passkey, timestamp) => {
  return Buffer.from(shortCode + passkey + timestamp).toString('base64');
};

/**
 * Initiate M-Pesa STK Push
 * @param {number} amount - Amount to charge
 * @param {string} phoneNumber - Phone number to charge
 * @param {string} orderId - Order reference
 * @returns {Promise<object>} M-Pesa response
 */
export const initiateMpesaStkPush = async (amount, phoneNumber, orderId) => {
  const accessToken = await getAccessToken();
  
  const shortCode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const timestamp = generateTimestamp();
  const password = generatePassword(shortCode, passkey, timestamp);
  
  const frontend_url = process.env.MPESA_CALLBACK_URL || 'http://localhost:5173';

  const mpesaPayload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: `${frontend_url}/mpesa/callback`,
    AccountReference: `Order_${orderId}`,
    TransactionDesc: 'Payment for Order',
  };

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      mpesaPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error initiating STK Push:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Error initiating STK Push');
  }
};

/**
 * Query M-Pesa STK Push status
 * @param {string} checkoutRequestID - Checkout request ID
 * @returns {Promise<object>} Query response
 */
export const queryStkPushStatus = async (checkoutRequestID) => {
  const accessToken = await getAccessToken();
  
  const shortCode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const timestamp = generateTimestamp();
  const password = generatePassword(shortCode, passkey, timestamp);

  const queryData = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestID,
  };

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      queryData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error querying STK Push status:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Error querying STK Push status');
  }
};

/**
 * Initiate M-Pesa C2B (Customer to Business) payment
 * @param {number} amount - Amount to charge
 * @param {string} phoneNumber - Phone number
 * @param {string} orderId - Order reference
 * @returns {Promise<object>} M-Pesa response
 */
export const initiateMpesaC2B = async (amount, phoneNumber, orderId) => {
  const accessToken = await getAccessToken();

  const c2bPayload = {
    ShortCode: process.env.MPESA_SHORTCODE || '174379',
    CommandID: 'CustomerPayBillOnline',
    Amount: amount,
    MSISDN: phoneNumber,
    BillRefNumber: `Order_${orderId}`,
  };

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate',
      c2bPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error initiating C2B payment:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Error initiating C2B payment');
  }
};
