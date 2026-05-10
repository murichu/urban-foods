import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: {
      type: String,
      default: "Order Placed",
      enum: ["Order Placed", "Food Processing", "Out for Delivery", "Delivered", "Cancelled"],
    },
    paymentStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Success", "Failed", "Paid"],
    },
    payment: { type: Boolean, default: false },
    mpesaFailedAttempts: { type: Number, default: 0 },
    orderId: { type: String, unique: true },
    paymentId: { type: String, unique: true },
    mpesaCheckoutRequestId: { type: String, index: true, sparse: true },
    mpesaMerchantRequestId: { type: String, index: true, sparse: true },
    trackingId: { type: String, unique: true },
  },
  { timestamps: true }
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
