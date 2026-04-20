import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import paymentModel from '../models/paymentModel.js';
import { getAccessToken, initiateMpesaStkPush } from '../services/mpesaService.js';

const DELIVERY_FEE = 2;

/**
 * Place order and initiate M-Pesa STK Push
 */
const placeOrder = async (req, res) => {
  const frontend_url = process.env.MPESA_CALLBACK_URL || 'http://localhost:5173';
  
  // Validate required fields
  const { items, amount, address, phoneNumber } = req.body;
  
  if (!items || !amount || !address || !phoneNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: items, amount, address, phoneNumber' 
    });
  }
  
  // Validate phone number format (basic validation for Kenyan numbers)
  const phoneRegex = /^(\+254|254|0)?[1-9]\d{8}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid phone number format. Please use a valid Kenyan phone number.' 
    });
  }
  
  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount must be a positive number' 
    });
  }

  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount + DELIVERY_FEE,
      address: req.body.address,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const mpesaResponse = await initiateMpesaStkPush(
      req.body.amount + DELIVERY_FEE,
      req.body.phoneNumber,
      newOrder._id
    );

    if (mpesaResponse.ResponseCode === '0') {
      res.json({ 
        success: true, 
        message: 'M-Pesa STK Push initiated',
        orderId: newOrder._id
      });
    } else {
      // Delete the order if STK push fails
      await orderModel.findByIdAndDelete(newOrder._id);
      res.status(500).json({
        success: false,
        message: `Error initiating M-Pesa STK Push: ${mpesaResponse.ResponseDescription}`,
      });
    }
  } catch (error) {
    console.error(
      'Error in placeOrder function:',
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ 
      success: false, 
      message: 'Error saving Order' 
    });
  }
};

/**
 * Handle M-Pesa callback
 */
const handleCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid callback structure' 
      });
    }
    
    const { stkCallback } = Body;
    const {
      ResultCode,
      ResultDesc,
      MerchantRequestID,
      CheckoutRequestID,
      ResponseCode,
      CallbackMetadata,
    } = stkCallback;

    if (ResponseCode === '0' || ResultCode === '0') {
      const order = await orderModel.findOne({ _id: CheckoutRequestID });
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }
      
      order.paymentStatus = 'Success';
      await order.save();

      // Extract metadata safely
      const metadata = CallbackMetadata?.Item || [];
      const transactionData = {
        MerchantRequestID,
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
        Amount: metadata[0]?.Value || order.amount,
        MpesaReceiptNumber: metadata[1]?.Value,
        Balance: metadata[2]?.Value,
        TransactionDate: metadata[3]?.Value,
        PhoneNumber: metadata[4]?.Value,
      };

      // Save transaction to payment model
      const payment = new paymentModel({
        userId: order.userId,
        orderId: order._id,
        method: 'mpesa_stk',
        amount: transactionData.Amount,
        status: 'completed',
        transactionId: CheckoutRequestID,
        phoneNumber: transactionData.PhoneNumber,
        MerchantRequestID: transactionData.MerchantRequestID,
        CheckoutRequestID: transactionData.CheckoutRequestID,
        ResultCode: transactionData.ResultCode,
        ResultDesc: transactionData.ResultDesc,
        MpesaReceiptNumber: transactionData.MpesaReceiptNumber,
        Balance: transactionData.Balance,
        TransactionDate: transactionData.TransactionDate,
        PhoneNumber: transactionData.PhoneNumber,
      });

      await payment.save();

      res.status(200).json({ success: true, message: 'Payment successful' });
    } else {
      // Payment failed - update order status
      const order = await orderModel.findOne({ _id: CheckoutRequestID });
      if (order) {
        order.paymentStatus = 'Failed';
        await order.save();
      }
      
      res.status(400).json({ 
        success: false, 
        message: `Payment failed: ${ResultDesc}` 
      });
    }
  } catch (error) {
    console.error(
      'Error in M-Pesa callback:',
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Verify order payment status
 */
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  if (!orderId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Order ID is required' 
    });
  }
  
  // Validate ObjectId format
  if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid order ID format' 
    });
  }

  try {
    if (success) {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'Paid' },
        { new: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Paid' 
      });
    } else {
      const deletedOrder = await orderModel.findByIdAndDelete(orderId);
      
      if (!deletedOrder) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }
      
      return res.status(200).json({ 
        success: false, 
        message: 'Not Paid' 
      });
    }
  } catch (error) {
    console.error('Verify order error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred' 
    });
  }
};

/**
 * Retrieve user orders
 */
const userOrders = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'User ID is required' 
    });
  }
  
  // Validate ObjectId format
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user ID format' 
    });
  }

  try {
    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        message: 'No orders found' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    console.error('User orders error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Error Retrieving User Orders' 
    });
  }
};

/**
 * List all orders with pagination and sorting
 */
const listOrders = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
    startDate,
    endDate,
  } = req.query;
  
  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  
  // Whitelist allowed sort fields
  const allowedSortFields = ['createdAt', 'amount', 'status', 'paymentStatus'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  try {
    // Create the filter object for MongoDB query
    const filter = {};
    
    // Add search filter if search term exists
    if (search) {
      filter.$or = [
        { _id: new RegExp(search, 'i') },
        { status: new RegExp(search, 'i') },
      ];
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Fetch orders with filtering, sorting, and pagination
    const orders = await orderModel
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Count total documents matching the filter
    const totalOrders = await orderModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      currentPage: pageNum,
      totalPages: Math.ceil(totalOrders / limitNum),
      totalOrders,
    });
  } catch (error) {
    console.error('Error retrieving orders:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error Retrieving All Orders',
      error: error.message,
    });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, handleCallback };
