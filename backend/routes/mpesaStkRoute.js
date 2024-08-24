import express from "express";
import Payment from "../models/paymentModel.js";
import { initiateMpesaStkPush } from "../services/mpesaStkPush.js";

const mpesaStkRouter = express.Router();

mpesaStkRouter.post("/mpesa_stk", async (req, res) => {
  // Log the request body to see what data is being received
  console.log("Received request for /mpesa_stk:", req.body);

  const { userId, orderId, amount, phoneNumber } = req.body;

  try {
    // Log the payment details before saving
    console.log("Creating new payment record with details:", {
      userId,
      orderId,
      amount,
      phoneNumber,
    });

    const payment = new Payment({
      userId,
      orderId,
      method: "mpesa_stk",
      amount,
      phoneNumber,
      status: "pending",
    });

    // Log before initiating the M-Pesa STK Push
    console.log(
      "Initiating M-Pesa STK Push for amount:",
      amount,
      "Phone:",
      phoneNumber
    );

    const mpesaResponse = await initiateMpesaStkPush(
      amount,
      phoneNumber,
      orderId
    );

    // Log the response from M-Pesa
    console.log("M-Pesa STK Push Response:", mpesaResponse);

    if (mpesaResponse.ResponseCode === "0") {
      payment.status = "completed";
      payment.transactionId = mpesaResponse.CheckoutRequestID;
      console.log(
        "Payment completed. Transaction ID:",
        mpesaResponse.CheckoutRequestID
      );
    } else {
      payment.status = "failed";
      console.log(
        "Payment failed with ResponseCode:",
        mpesaResponse.ResponseCode
      );
    }

    // Log before saving the payment
    console.log("Saving payment record to the database...");
    await payment.save();

    // Log the response being sent to the client
    console.log("Sending response to client with payment details:", payment);
    res.json({ success: true, payment });
  } catch (error) {
    // Log the error if any occurs
    console.error("Error occurred during M-Pesa STK Push process:", error);

    res
      .status(500)
      .json({ success: false, message: "M-Pesa STK Push failed", error });
  }
});

export default mpesaStkRouter;
