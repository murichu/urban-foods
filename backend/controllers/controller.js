import axios from "axios"; // Ensure axios is imported

// Middleware to create token
export const createToken = async (req, res, next) => {
  try {
    const secret = process.env.MPESA_CONSUMER_SECRET;
    const consumer = process.env.MPESA_CONSUMER_KEY;

    // Check if environment variables are properly set
    if (!secret || !consumer) {
      return res
        .status(400)
        .json("Environment variables for API keys are missing.");
    }

    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");
    const url_dev =
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    // Make the request using Axios
    const response = await axios.get(url_dev, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    // Extract token from the response
    const token = response.data.access_token;

    // If successful, attach the token to the request object and proceed to the next middleware
    req.token = token;
    next();
  } catch (err) {
    // Enhanced error handling to provide more details
    console.error("Error generating token:", err.response?.data || err.message);

    // Send back a meaningful error response to the client
    res
      .status(400)
      .json("TOKEN GENERATION ERROR: " + (err.response?.data || err.message));
  }
};

// Define your STK Push URL
const stk_dev =
  "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

// Function to handle STK Push
export const postStk = async (req, res) => {
  try {
    // Extract phone and amount from request body
    const { phone, amount } = req.body;
    if (!phone || !amount) {
      return res.status(400).json("empty request body");
    }

    // Extract token from request object
    const token = req.token;
    if (!token) {
      return res.status(400).json("Token is missing. Please try again.");
    }

    const shortCode = "174379";
    const passkey =
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

    // Generate timestamp
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    // Encode password
    const password = Buffer.from(shortCode + passkey + timestamp).toString(
      "base64"
    );

    // Prepare STK Push data
    const data = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: "http://localhost:5173/stkpush/callback",
      AccountReference: "Reject Finance Bill 2024",
      TransactionDesc: "Reject Finance Bill 2024",
    };

    // Make STK Push request
    const response = await axios.post(stk_dev, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    // Process response
    const responseData = response.data;
    if (responseData.ResponseCode == "0") {
      const transaction = {
        MerchantRequestID: responseData.MerchantRequestID,
        CheckoutRequestID: responseData.CheckoutRequestID,
        ResultCode: responseData.ResponseCode,
        ResultDesc: responseData.ResponseDescription,
      };
      res.status(200).json(transaction);
    } else {
      res.status(400).json(responseData);
    }
  } catch (err) {
    console.error(
      "Error processing STK Push:",
      err.response?.data || err.message
    );
    res.status(422).json("STK PUSH ERROR: " + err.message);
  }
};

// Callback function to handle STK push results
export const callback = async (req, res) => {
  try {
    console.log("Headers:", req.headers); // Log headers
    console.log("Raw Body:", req.body); // Log raw body

    // Check if body and structure are as expected
    if (!req.body || !req.body.Body || !req.body.Body.stkCallback) {
      return res.status(400).json({ error: "Invalid request structure" });
    }

    const data = req.body.Body.stkCallback;

    // Extract transaction details
    const transaction = {
      MerchantRequestID: data.MerchantRequestID,
      CheckoutRequestID: data.CheckoutRequestID,
      ResultCode: data.ResultCode,
      ResultDesc: data.ResultDesc,
      Amount: data.CallbackMetadata?.Item[0]?.Value,
      MpesaReceiptNumber: data.CallbackMetadata?.Item[1]?.Value,
      Balance: data.CallbackMetadata?.Item[2]?.Value,
      TransactionDate: data.CallbackMetadata?.Item[3]?.Value,
      PhoneNumber: data.CallbackMetadata?.Item[4]?.Value,
    };

    // Process the transaction data as needed
    // Example: Save to database, send notification, etc.

    res.status(200).json({ status: "Success", transaction });
  } catch (err) {
    console.error("Error handling callback:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Validate transaction status
export const validateTransaction = async (req, res) => {
  try {
    const { payload } = req.body;
    
    if (!payload || !payload.MerchantRequestID) {
      return res.status(400).json({ success: false, message: "MerchantRequestID is required" });
    }

    const token = req.token;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is missing" });
    }

    const shortCode = "174379";
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

    // Generate timestamp
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    // Encode password
    const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

    const queryData = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: payload.MerchantRequestID,
    };

    const queryUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";

    const response = await axios.post(queryUrl, queryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const responseData = response.data;
    
    res.status(200).json({ 
      success: true, 
      transaction: responseData 
    });
  } catch (err) {
    console.error(
      "Error validating transaction:",
      err.response?.data || err.message
    );
    res.status(422).json({ 
      success: false, 
      message: "VALIDATION ERROR: " + err.message 
    });
  }
};
