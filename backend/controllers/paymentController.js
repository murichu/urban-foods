import mongoose from "mongoose";
import paymentModel from "../models/paymentModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import logger from "../config/logger.js";

const buildSearchFilter = (search) => {
  if (!search) return {};

  return {
    $or: [
      { transactionId: new RegExp(search, "i") },
      { paymentId: new RegExp(search, "i") },
      { CheckoutRequestID: new RegExp(search, "i") },
      { MerchantRequestID: new RegExp(search, "i") },
      { phoneNumber: new RegExp(search, "i") },
      { ResultDesc: new RegExp(search, "i") },
    ],
  };
};

const getAdminPayments = async (req, res) => {
  const {
    page = 1,
    limit = 25,
    search = "",
    status = "All",
    method = "All",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * limitNum;

  try {
    const filter = {
      ...buildSearchFilter(search),
    };

    if (status && status !== "All") {
      filter.status = status;
    }

    if (method && method !== "All") {
      filter.method = method;
    }

    const [totalPayments, payments, stats] = await Promise.all([
      paymentModel.countDocuments(filter),
      paymentModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      paymentModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            completedAmount: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
              },
            },
            failedAmount: {
              $sum: {
                $cond: [{ $eq: ["$status", "failed"] }, "$amount", 0],
              },
            },
            pendingAmount: {
              $sum: {
                $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
              },
            },
            completedCount: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            failedCount: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
            },
            pendingCount: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const orderIds = payments.map((payment) => payment.orderId).filter(Boolean);
    const userIds = payments.map((payment) => payment.userId).filter(Boolean);

    const [orders, users] = await Promise.all([
      orderModel.find({ _id: { $in: orderIds } }).lean(),
      userModel.find({ _id: { $in: userIds } }).select("name email phone").lean(),
    ]);

    const orderMap = new Map(orders.map((order) => [String(order._id), order]));
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const rows = payments.map((payment) => {
      const order = orderMap.get(String(payment.orderId)) || null;
      const user = userMap.get(String(payment.userId)) || null;

      return {
        ...payment,
        order,
        user,
      };
    });

    const summary = stats[0] || {
      totalAmount: 0,
      completedAmount: 0,
      failedAmount: 0,
      pendingAmount: 0,
      completedCount: 0,
      failedCount: 0,
      pendingCount: 0,
    };

    return res.json({
      success: true,
      data: rows,
      currentPage: pageNum,
      totalPages: Math.max(1, Math.ceil(totalPayments / limitNum)),
      totalPayments,
      summary,
    });
  } catch (error) {
    logger.error(`Get admin payments error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error fetching payments",
    });
  }
};

export { getAdminPayments };
