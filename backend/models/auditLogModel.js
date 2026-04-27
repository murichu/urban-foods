import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String },
    action: { type: String, required: true }, // e.g., 'LOGIN', 'LOGOUT', 'ORDER_PLACE', 'PAYMENT_SUCCESS', 'ADMIN_CRUD'
    entity: { type: String, required: true }, // e.g., 'User', 'Order', 'Food', 'Payment'
    entityId: { type: String }, // ID of the affected entity
    status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
    metadata: { type: Object }, // Additional details like IP, User-Agent, or changed fields
    ipAddress: { type: String },
    userAgent: { type: String },
    adminId: { type: String },
    paymentId: { type: String },
    mpesaCheckoutRequestId: { type: String },
    mpesaStkPushCallbackUrl: { type: String },
    orderId: { type: String },
  },
  { timestamps: true }
);

const auditLogModel = mongoose.models.auditLog || mongoose.model('auditLog', auditLogSchema);

export default auditLogModel;
