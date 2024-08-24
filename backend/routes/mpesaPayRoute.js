import express from "express";
import Payment from "../models/paymentModel.js";
import { initiateMpesaC2B } from "../services/mpesaPay.js";

const mpesapaybillRouter = express.Router();

mpesapaybillRouter.post("/mpesa_c2b", async (req, res) => {
  const { userId, orderId, amount, phoneNumber } = req.body;

  try {
    const payment = new Payment({
      userId,
      orderId,
      method: "mpesa_c2b",
      amount,
      phoneNumber,
      status: "pending",
    });

    const mpesaResponse = await initiateMpesaC2B(amount, phoneNumber, orderId);

    if (mpesaResponse.ResponseCode === "0") {
      payment.status = "completed";
      payment.transactionId = mpesaResponse.ConversationID;
    } else {
      payment.status = "failed";
    }

    await payment.save();
    res.json({ success: true, payment });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "M-Pesa C2B failed", error });
  }
});

export default mpesapaybillRouter;
