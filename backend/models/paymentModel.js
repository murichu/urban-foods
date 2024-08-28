import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  method: {
    type: String,
    enum: ["mpesa_stk", "mpesa_c2b"],
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  transactionId: { type: String },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const paymentModel =
  mongoose.models.payment || mongoose.model("Payment", paymentSchema);

export default paymentModel;

const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
    MerchantRequestID: String,
    CheckoutRequestID: String,
    ResultCode: Number,
    ResultDesc: String,
    Amount: Number,
    MpesaReceiptNumber: String,
    Balance: Number,
    TransactionDate: Date,
    PhoneNumber: Number
});


const Transaction = mongoose.model('Transaction', transactionSchema);
