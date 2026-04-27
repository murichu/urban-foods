import mongoose from "mongoose";

// Define the combined schema
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  paymentId: {
    type: String,
    unique: true,
  },
  method: {
    type: String,
    enum: ["mpesa_stk", "mpesa_c2b"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  transactionId: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  MerchantRequestID: {
    type: String,
  },
  CheckoutRequestID: {
    type: String,
  },
  ResultCode: {
    type: Number,
  },
  ResultDesc: {
    type: String,
  },
  MpesaReceiptNumber: {
    type: String,
  },
  Balance: {
    type: Number,
  },
  TransactionDate: {
    type: Date,
  },
  PhoneNumber: {
    type: Number,
  },
}, { timestamps: true });

// Create or retrieve the existing model
const PaymentModel = mongoose.models.PaymentModel || mongoose.model("PaymentModel", paymentSchema);

export default PaymentModel;
