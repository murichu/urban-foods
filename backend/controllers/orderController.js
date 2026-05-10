import mongoose from "mongoose";
import os from "os";

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import paymentModel from "../models/paymentModel.js";
import foodModel from "../models/foodModel.js";
import settingsModel from "../models/settingsModel.js";
import auditLogModel from "../models/auditLogModel.js";

import logger from "../config/logger.js";

import { DELIVERY_FEE } from "../config/orderConfig.js";
import { generateCustomId } from "../utils/idGenerator.js";

import { initiateMpesaStkPush } from "../services/mpesaService.js";

import { createAuditLog } from "./auditLogController.js";

/* =========================================================
   DELIVERY FEE
========================================================= */

const getConfiguredDeliveryFee = async () => {
  const settings = await settingsModel.findOne({
    type: "business_profile",
  });

  const deliveryFee = Number(settings?.deliveryFee);

  return Number.isFinite(deliveryFee) && deliveryFee >= 0
    ? deliveryFee
    : DELIVERY_FEE;
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeKenyanPhone = (phone) => {
  let normalized = phone?.replace(/\s+/g, "").replace("+", "");

  if (normalized?.startsWith("0")) {
    normalized = "254" + normalized.substring(1);
  } else if (normalized?.startsWith("7") || normalized?.startsWith("1")) {
    normalized = "254" + normalized;
  }

  return normalized;
};

const isValidKenyanPhone = (phone) => {
  return /^(254)(7|1)\d{8}$/.test(phone);
};

const serializeOrder = (order) => {
  const serialized = order.toObject ? order.toObject() : order;

  if (serialized.paymentStatus === "Paid") {
    serialized.payment = true;
  }

  return serialized;
};

const syncOrderPaymentState = async (order) => {
  if (!order) return order;

  if (order.payment || order.paymentStatus === "Paid") {
    if (!order.payment || order.paymentStatus !== "Paid") {
      order.payment = true;
      order.paymentStatus = "Paid";

      await order.save();
    }

    return order;
  }

  const completedPayment = await paymentModel.exists({
    orderId: order._id,
    status: "completed",
  });

  if (completedPayment) {
    order.payment = true;
    order.paymentStatus = "Paid";

    await order.save();
  }

  return order;
};

/* =========================================================
   PLACE ORDER
========================================================= */

const placeOrder = async (req, res) => {
  let { items, amount, address, phoneNumber, userId } = req.body;

  if (!phoneNumber && address?.phone) {
    phoneNumber = address.phone;
  }

  if (!items || !amount || !address || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order amount",
    });
  }

  const normalizedPhone = normalizeKenyanPhone(phoneNumber);

  if (!isValidKenyanPhone(normalizedPhone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number",
    });
  }

  let newOrder;

  try {
    const deliveryFee = await getConfiguredDeliveryFee();

    const finalAmount = numericAmount + deliveryFee;

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const orderId = generateCustomId("ORD");
        const trackingId = generateCustomId("TRK");

        newOrder = new orderModel({
          userId,
          items,
          amount: finalAmount,
          address,
          orderId,
          trackingId,
          payment: false,
          paymentStatus: "Pending",
          status: "Order Placed",
        });

        await newOrder.save();

        break;
      } catch (error) {
        if (
          error.code === 11000 &&
          (error.message.includes("orderId") ||
            error.message.includes("trackingId"))
        ) {
          attempts++;

          logger.warn(`ID collision retry ${attempts}/${maxAttempts}`);

          if (attempts === maxAttempts) {
            throw new Error("Failed to generate unique order IDs");
          }
        } else {
          throw error;
        }
      }
    }

    /* CLEAR CART */

    await userModel.findByIdAndUpdate(userId, {
      cartData: {},
    });

    /* AUDIT */

    await createAuditLog({
      userId,
      action: "ORDER_PLACE",
      entity: "Order",
      entityId: newOrder._id.toString(),
      status: "success",
      metadata: {
        orderId: newOrder.orderId,
        trackingId: newOrder.trackingId,
        amount: newOrder.amount,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    /* INITIATE STK PUSH */

    const mpesaResponse = await initiateMpesaStkPush(
      newOrder.amount,
      normalizedPhone,
      newOrder._id,
      newOrder.orderId
    );

    /* SUCCESS */

    if (mpesaResponse.ResponseCode === "0") {
      logger.info(`STK Push initiated for ${newOrder.orderId}`);

      return res.status(200).json({
        success: true,
        message: "M-Pesa prompt sent successfully",

        orderId: newOrder._id,

        enterpriseOrderId: newOrder.orderId,

        trackingId: newOrder.trackingId,

        checkoutRequestId: mpesaResponse.CheckoutRequestID,

        customerMessage: mpesaResponse.CustomerMessage,

        stkResponse: mpesaResponse,
      });
    }

    /* FAILED STK */

    logger.warn(`STK Push failed for ${newOrder.orderId}`);

    newOrder.payment = false;
    newOrder.paymentStatus = "Failed";

    await newOrder.save();

    /* AUDIT FAILURE */

    await createAuditLog({
      userId,
      action: "PAYMENT_FAILED",
      entity: "Order",
      entityId: newOrder._id.toString(),
      status: "failed",
      metadata: {
        orderId: newOrder.orderId,
        trackingId: newOrder.trackingId,
        responseCode: mpesaResponse.ResponseCode,
        responseDescription: mpesaResponse.ResponseDescription,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    /* DELETE FAILED ORDER */

    await orderModel.findByIdAndDelete(newOrder._id);

    logger.info(`Deleted failed order ${newOrder.orderId}`);

    return res.status(400).json({
      success: false,
      paymentStatus: "Failed",
      responseCode: mpesaResponse.ResponseCode,
      message: mpesaResponse.ResponseDescription || "STK Push failed",
    });
  } catch (error) {
    if (newOrder?._id && !newOrder.payment) {
      try {
        await orderModel.findByIdAndDelete(newOrder._id);

        logger.warn(`Cleaned failed order ${newOrder.orderId}`);
      } catch (cleanupError) {
        logger.error(cleanupError.message);
      }
    }

    logger.error(`Place order error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: error.message || "Error placing order",
    });
  }
};

/* =========================================================
   VERIFY ORDER
========================================================= */

const verifyOrder = async (req, res) => {
  const {
    orderId,
    success,

    transactionId,
    mpesaReceiptNumber,
    paymentMethod,
    CheckoutRequestID,
    MerchantRequestID,
    phoneNumber,
    amount,
  } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Order ID required",
    });
  }

  try {
    /**
     * Find Order
     */
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /**
     * PAYMENT SUCCESS
     */
    if (success) {
      // Update payment state
      order.payment = true;

      order.paymentStatus = "Paid";

      // Save payment details directly on order
      order.transactionId =
        transactionId || mpesaReceiptNumber || order.transactionId || null;

      order.mpesaReceiptNumber = mpesaReceiptNumber || transactionId || null;

      order.paymentMethod = paymentMethod || "M-Pesa";

      order.paymentDate = new Date();

      order.CheckoutRequestID =
        CheckoutRequestID || order.CheckoutRequestID || null;

      order.MerchantRequestID =
        MerchantRequestID || order.MerchantRequestID || null;

      order.phoneNumber = phoneNumber || order.phoneNumber || null;

      await order.save();

      /**
       * Create Payment Record
       */
      const existingPayment = await paymentModel.findOne({
        orderId: order._id,

        transactionId: transactionId || mpesaReceiptNumber,
      });

      // Prevent duplicate payments
      if (!existingPayment) {
        const payment = new paymentModel({
          userId: order.userId,

          orderId: order._id,

          paymentId: order.paymentId,

          method: "mpesa_stk",

          paymentMethod: paymentMethod || "M-Pesa",

          amount: amount || order.amount,

          status: "completed",

          transactionId: transactionId || mpesaReceiptNumber,

          mpesaReceiptNumber: mpesaReceiptNumber || transactionId,

          phoneNumber: phoneNumber || null,

          CheckoutRequestID,

          MerchantRequestID,
        });

        await payment.save();
      }

      /**
       * Audit Log
       */
      await createAuditLog({
        userId: order.userId,

        action: "PAYMENT_SUCCESS",

        entity: "Order",

        entityId: order._id.toString(),

        status: "success",

        metadata: {
          orderId: order.orderId,

          trackingId: order.trackingId,

          transactionId: transactionId || mpesaReceiptNumber,

          amount: amount || order.amount,
        },

        ipAddress: req.ip,

        userAgent: req.get("User-Agent"),
      });

      logger.info(`Payment verified successfully for ${order.orderId}`);

      return res.status(200).json({
        success: true,

        message: "Payment verified successfully",

        data: {
          orderId: order._id,

          transactionId: order.transactionId,

          paymentStatus: order.paymentStatus,
        },
      });
    }

    /**
     * PAYMENT FAILED
     */
    order.payment = false;

    order.paymentStatus = "Failed";

    await order.save();

    /**
     * Audit Failed Payment
     */
    await createAuditLog({
      userId: order.userId,

      action: "PAYMENT_FAILED",

      entity: "Order",

      entityId: order._id.toString(),

      status: "failed",

      metadata: {
        orderId: order.orderId,

        trackingId: order.trackingId,
      },

      ipAddress: req.ip,

      userAgent: req.get("User-Agent"),
    });

    /**
     * Delete Failed Order
     */
    await orderModel.findByIdAndDelete(order._id);

    logger.warn(`Deleted failed payment order ${order.orderId}`);

    return res.status(400).json({
      success: false,

      message: "Payment failed. Order cancelled.",
    });
  } catch (error) {
    logger.error(`Verify order error: ${error.message}`);

    return res.status(500).json({
      success: false,

      message: "Internal server error",
    });
  }
};
/* =========================================================
   USER ORDERS
========================================================= */

const userOrders = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID required",
    });
  }

  try {
    /**
     * Fetch User Orders
     */
    const orders = await orderModel.find({ userId }).sort({
      createdAt: -1,
    });

    /**
     * Sync Payment States
     */
    const syncedOrders = await Promise.all(orders.map(syncOrderPaymentState));

    /**
     * Enrich Orders
     */
    const enrichedOrders = await Promise.all(
      syncedOrders.map(async (order) => {
        /**
         * Find Latest Successful Payment
         */
        const payment = await paymentModel
          .findOne({
            orderId: order._id,

            status: {
              $in: [
                "completed",
                "Completed",
                "success",
                "Success",
                "paid",
                "Paid",
              ],
            },
          })
          .sort({
            createdAt: -1,
          });

        const serializedOrder = serializeOrder(order);

        /**
         * Normalize Transaction ID
         */
        const transactionId =
          serializedOrder.transactionId ||
          serializedOrder.mpesaReceiptNumber ||
          payment?.transactionId ||
          payment?.mpesaReceiptNumber ||
          payment?.receiptNumber ||
          payment?.CheckoutRequestID ||
          payment?.MpesaReceiptNumber ||
          payment?.MerchantRequestID ||
          null;

        /**
         * Normalize Payment Method
         */
        const paymentMethod =
          serializedOrder.paymentMethod ||
          payment?.method ||
          payment?.paymentMethod ||
          "M-Pesa";

        /**
         * Normalize Payment Status
         */
        const paymentStatus =
          serializedOrder.paymentStatus ||
          payment?.status ||
          (serializedOrder.payment ? "Paid" : "Pending");

        /**
         * Normalize Payment Date
         */
        const paymentDate =
          serializedOrder.paymentDate ||
          payment?.createdAt ||
          payment?.updatedAt ||
          null;

        return {
          ...serializedOrder,

          /**
           * Core Payment Fields
           */
          transactionId,

          mpesaReceiptNumber:
            serializedOrder.mpesaReceiptNumber ||
            payment?.mpesaReceiptNumber ||
            payment?.MpesaReceiptNumber ||
            transactionId ||
            null,

          paymentMethod,

          paymentStatus,

          paymentDate,

          /**
           * Additional Payment References
           */
          paymentReference:
            payment?.reference ||
            serializedOrder.MerchantRequestID ||
            payment?.MerchantRequestID ||
            null,

          checkoutRequestId:
            serializedOrder.CheckoutRequestID ||
            payment?.CheckoutRequestID ||
            null,

          merchantRequestId:
            serializedOrder.MerchantRequestID ||
            payment?.MerchantRequestID ||
            null,

          /**
           * Payment Summary
           */
          paymentDetails: {
            id: payment?._id || null,

            amount: payment?.amount || serializedOrder.amount,

            transactionId,

            mpesaReceiptNumber:
              serializedOrder.mpesaReceiptNumber ||
              payment?.mpesaReceiptNumber ||
              payment?.MpesaReceiptNumber ||
              transactionId ||
              null,

            paymentMethod,

            status: paymentStatus,

            reference: payment?.reference || null,

            checkoutRequestId:
              serializedOrder.CheckoutRequestID ||
              payment?.CheckoutRequestID ||
              null,

            merchantRequestId:
              serializedOrder.MerchantRequestID ||
              payment?.MerchantRequestID ||
              null,

            phoneNumber:
              serializedOrder.phoneNumber || payment?.phoneNumber || null,

            createdAt: paymentDate,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,

      count: enrichedOrders.length,

      data: enrichedOrders,
    });
  } catch (error) {
    logger.error(`User orders error: ${error.message}`);

    return res.status(500).json({
      success: false,

      message: "Error retrieving orders",
    });
  }
};

/* =========================================================
   LIST ORDERS (ADMIN)
========================================================= */

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({
      createdAt: -1,
    });

    const syncedOrders = await Promise.all(orders.map(syncOrderPaymentState));

    return res.status(200).json({
      success: true,
      data: syncedOrders.map(serializeOrder),
    });
  } catch (error) {
    logger.error(`List orders error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Error retrieving orders",
    });
  }
};

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  const VALID_STATUSES = [
    "Order Placed",
    "Food Processing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  if (!orderId || !status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await syncOrderPaymentState(order);

    const requiresPayment = [
      "Food Processing",
      "Out for Delivery",
      "Delivered",
    ].includes(status);

    if (requiresPayment && !order.payment) {
      return res.status(400).json({
        success: false,
        message: "Payment not received",
      });
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: serializeOrder(order),
    });
  } catch (error) {
    logger.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Error updating order",
    });
  }
};

/* =========================================================
   GET ORDER BY ID
========================================================= */

const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await syncOrderPaymentState(order);

    const payment = await paymentModel
      .findOne({
        orderId: order._id,
        status: { $in: ["completed", "Completed", "success", "Success"] },
      })
      .sort({ createdAt: -1 });

    const serializedOrder = serializeOrder(order);

    return res.status(200).json({
      success: true,
      data: {
        ...serializedOrder,
        transactionId:
          payment?.transactionId || payment?.MpesaReceiptNumber || null,
        paymentReference: payment?.reference || null,
        paymentMethod: payment?.method || "M-Pesa",
        paymentDate: payment?.createdAt || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving order",
    });
  }
};

/* =========================================================
   GET USER ORDER BY ID
========================================================= */

const getUserOrderById = async (req, res) => {
  const { id } = req.params;

  const userId = req.userId || req.body.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    /**
     * Find Order
     */
    const order = await orderModel.findOne({
      _id: id,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /**
     * Sync Payment State
     */
    await syncOrderPaymentState(order);

    /**
     * Get Latest Successful Payment
     */
    const payment = await paymentModel
      .findOne({
        orderId: order._id,

        status: {
          $in: ["completed", "Completed", "success", "Success", "paid", "Paid"],
        },
      })
      .sort({
        createdAt: -1,
      });

    const serializedOrder = serializeOrder(order);

    /**
     * Normalize Transaction ID
     */
    const transactionId =
      serializedOrder.transactionId ||
      serializedOrder.mpesaReceiptNumber ||
      payment?.transactionId ||
      payment?.mpesaReceiptNumber ||
      payment?.receiptNumber ||
      payment?.CheckoutRequestID ||
      payment?.MpesaReceiptNumber ||
      payment?.MerchantRequestID ||
      null;

    const enrichedOrder = {
      ...serializedOrder,

      transactionId,

      mpesaReceiptNumber:
        serializedOrder.mpesaReceiptNumber ||
        payment?.mpesaReceiptNumber ||
        payment?.MpesaReceiptNumber ||
        transactionId ||
        null,

      paymentMethod:
        serializedOrder.paymentMethod ||
        payment?.method ||
        payment?.paymentMethod ||
        "M-Pesa",

      paymentStatus:
        serializedOrder.paymentStatus ||
        payment?.status ||
        (serializedOrder.payment ? "Paid" : "Pending"),

      paymentDate:
        serializedOrder.paymentDate ||
        payment?.createdAt ||
        payment?.updatedAt ||
        null,

      checkoutRequestId:
        serializedOrder.CheckoutRequestID || payment?.CheckoutRequestID || null,

      merchantRequestId:
        serializedOrder.MerchantRequestID || payment?.MerchantRequestID || null,

      paymentDetails: payment
        ? {
            id: payment._id,

            amount: payment.amount || serializedOrder.amount,

            transactionId,

            mpesaReceiptNumber:
              payment.mpesaReceiptNumber ||
              payment.MpesaReceiptNumber ||
              transactionId,

            paymentMethod: payment.method || "M-Pesa",

            status: payment.status || "Pending",

            phoneNumber: payment.phoneNumber || null,

            checkoutRequestId: payment.CheckoutRequestID || null,

            merchantRequestId: payment.MerchantRequestID || null,

            createdAt: payment.createdAt || null,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      data: enrichedOrder,
    });
  } catch (error) {
    logger.error(`Get user order error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Error retrieving order",
    });
  }
};

/* =========================================================
   ADMIN STATS
========================================================= */

const getAdminStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalMenuItems,
      totalRevenue,
      recentOrders,
    ] = await Promise.all([
      orderModel.countDocuments(),
      userModel.countDocuments(),
      foodModel.countDocuments(),
      orderModel.aggregate([
        {
          $match: {
            payment: true,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),
      orderModel
        .find()
        .sort({
          createdAt: -1,
        })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalCustomers,
        totalMenuItems,
        totalRevenue: totalRevenue?.[0]?.total || 0,
        recentOrders,
        systemHealth: {
          dbStatus: mongoose.connection.readyState === 1 ? "Online" : "Offline",

          apiStatus: "Stable",

          serverLoad: Number(os.loadavg()[0].toFixed(2)),
        },
      },
    });
  } catch (error) {
    logger.error(`Admin stats error: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Error fetching admin stats",
    });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateOrderStatus,
  getOrderById,
  getUserOrderById,
  getAdminStats,
};
