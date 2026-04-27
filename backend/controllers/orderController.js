import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import paymentModel from '../models/paymentModel.js';
import { generateCustomId } from '../utils/idGenerator.js';
import logger from '../config/logger.js';
import { initiateMpesaStkPush } from '../services/mpesaService.js';
import { createAuditLog } from './auditLogController.js';
import auditLogModel from '../models/auditLogModel.js';
import mongoose from 'mongoose';
import os from 'os';

const DELIVERY_FEE = 2;

/**
 * Place order and initiate M-Pesa STK Push with Enterprise ID and Retry Logic
 */
const placeOrder = async (req, res) => {
  let { items, amount, address, phoneNumber, userId } = req.body;
  
  if (!phoneNumber && address?.phone) {
    phoneNumber = address.phone;
  }
  
  if (!items || !amount || !address || !phoneNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: items, amount, address, phoneNumber' 
    });
  }
  
  // Normalize phone number (Kenyan format)
  let normalizedPhone = phoneNumber.replace(/\s+/g, '').replace('+', '');
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '254' + normalizedPhone.substring(1);
  } else if (normalizedPhone.startsWith('7') || normalizedPhone.startsWith('1')) {
    normalizedPhone = '254' + normalizedPhone;
  }
  
  const phoneRegex = /^(254)(7|1)\d{8}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid phone number format. Use 07xxxxxxxx or 2547xxxxxxxx.' 
    });
  }
  
  try {
    let newOrder;
    let attempts = 0;
    const maxAttempts = 5;

    // Retry logic for unique ID collisions
    while (attempts < maxAttempts) {
      try {
        const orderId = generateCustomId('ORD');
        const trackingId = generateCustomId('TRK');

        newOrder = new orderModel({
          userId,
          items,
          amount: amount + DELIVERY_FEE,
          address,
          orderId,
          trackingId,
        });

        await newOrder.save();
        break; // Success
      } catch (error) {
        if (error.code === 11000 && (error.message.includes('orderId') || error.message.includes('trackingId'))) {
          attempts++;
          logger.warn(`Collision detected for Order/Tracking ID. Retrying... (${attempts}/${maxAttempts})`);
          if (attempts === maxAttempts) throw new Error('Failed to generate unique IDs after 5 attempts');
        } else {
          throw error;
        }
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Log order placement
    await createAuditLog({
      userId,
      action: 'ORDER_PLACE',
      entity: 'Order',
      entityId: newOrder._id.toString(),
      status: 'success',
      metadata: { orderId: newOrder.orderId, trackingId: newOrder.trackingId, amount: newOrder.amount },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Initiate M-Pesa Payment
    const mpesaResponse = await initiateMpesaStkPush(
      amount + DELIVERY_FEE,
      normalizedPhone,
      newOrder._id,
      newOrder.orderId
    );

    if (mpesaResponse.ResponseCode === '0') {
      logger.info(`Order ${newOrder.orderId} placed and STK Push initiated`);
      res.json({ 
        success: true, 
        message: 'Order placed. M-Pesa STK Push initiated.',
        orderId: newOrder._id,
        enterpriseOrderId: newOrder.orderId,
        trackingId: newOrder.trackingId,
        stkResponse: mpesaResponse
      });
    } else {
      // We keep the order but mark it as payment pending/failed
      newOrder.paymentStatus = 'Failed';
      await newOrder.save();
      
      res.status(500).json({
        success: false,
        message: `M-Pesa STK Push failed: ${mpesaResponse.ResponseDescription}`,
        orderId: newOrder._id,
        enterpriseOrderId: newOrder.orderId
      });
    }
  } catch (error) {
    logger.error(`Error in placeOrder: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error processing order' 
    });
  }
};

/**
 * Verify order payment status (Legacy/Webhook fallback)
 */
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required' });
  }
  
  try {
    const status = success ? 'Paid' : 'Failed';
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { paymentStatus: status, payment: success },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    return res.status(200).json({ success, message: status });
  } catch (error) {
    logger.error(`Verify order error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Retrieve user orders
 */
const userOrders = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }
  
  try {
    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    logger.error(`User orders error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error retrieving orders' });
  }
};

/**
 * List all orders with pagination and sorting (Admin)
 */
const listOrders = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
    status = '',
    paymentStatus = ''
  } = req.query;
  
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(500, Math.max(1, parseInt(limit)));
  const sortOrder = order === 'asc' ? 1 : -1;

  try {
    const filter = {};
    
    // Status Filter
    if (status && status !== 'All') {
      filter.status = status;
    }
    
    // Payment Status Filter
    if (paymentStatus && paymentStatus !== 'All') {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.$or = [
        { orderId: new RegExp(search, 'i') },
        { trackingId: new RegExp(search, 'i') },
        { status: new RegExp(search, 'i') },
        { 'address.firstName': new RegExp(search, 'i') },
        { 'address.lastName': new RegExp(search, 'i') },
        { 'address.email': new RegExp(search, 'i') },
        { 'address.phone': new RegExp(search, 'i') },
      ];
      // Try matching ObjectId if it looks like one
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        filter.$or.push({ _id: search });
      }
    }

    logger.info(`Fetching orders with filter: ${JSON.stringify(filter)}`);

    const orders = await orderModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalOrders = await orderModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      currentPage: pageNum,
      totalPages: Math.ceil(totalOrders / limitNum),
      totalOrders,
    });
  } catch (error) {
    logger.error(`Error listing orders: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error retrieving all orders' });
  }
};

/**
 * Update order status (admin)
 */
const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  const VALID_STATUSES = ['Order Placed', 'Food Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (!orderId || !status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid orderId or status' });
  }

  try {
    const updated = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.status(200).json({ success: true, message: 'Order status updated', data: updated });
  } catch (error) {
    logger.error(`Update order status error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error updating status' });
  }
};

/**
 * Get a single order by ID
 */
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await orderModel.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving order' });
  }
};

/**
 * Get Admin Statistics for Dashboard
 */
const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await orderModel.aggregate([
      {
        $facet: {
          dailyRevenue: [
            { 
              $match: { 
                createdAt: { $gte: today },
                payment: true 
              } 
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          totalOrders: [
            { $count: "count" }
          ],
          pendingOrders: [
            { $match: { status: { $in: ["Order Placed", "Food Processing"] } } },
            { $count: "count" }
          ],
          deliveredOrders: [
            { $match: { status: "Delivered" } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const recentLogs = await auditLogModel.find().sort({ createdAt: -1 }).limit(5);
    const systemHealth = {
      dbStatus: mongoose.connection.readyState === 1 ? 'Online' : 'Issues Detected',
      apiStatus: 'Stable',
      serverLoad: `${(os.loadavg()[0]).toFixed(2)}`
    };

    const result = {
      dailyRevenue: stats[0].dailyRevenue[0]?.total || 0,
      totalOrders: stats[0].totalOrders[0]?.count || 0,
      pendingOrders: stats[0].pendingOrders[0]?.count || 0,
      deliveredOrders: stats[0].deliveredOrders[0]?.count || 0,
      activeAdmins: 1, // Fixed for now as admin is env-based
      recentActivity: recentLogs,
      systemHealth
    };

    res.json({ success: true, stats: result });
  } catch (error) {
    logger.error(`Get admin stats error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateOrderStatus, getOrderById, getAdminStats };
