import { initiateMpesaStkPush, processMpesaCallback, queryStkPushStatus } from '../services/mpesaService.js';
import logger from '../config/logger.js';
import orderModel from '../models/orderModel.js';
import paymentModel from '../models/paymentModel.js';

const MPESA_STATUS_QUERY_DELAY_MS =
  Number(process.env.MPESA_STATUS_QUERY_DELAY_MS) || 2 * 60 * 1000;
const MPESA_TEMPORARY_FAILURE_BACKOFF_MS =
  Number(process.env.MPESA_TEMPORARY_FAILURE_BACKOFF_MS) || 60 * 1000;
const temporaryStatusLookupFailures = new Map();

const isTemporaryMpesaStatusError = (error) => {
  const status = error.status || error.response?.status;

  return (
    error.message === 'Error getting access token' ||
    status === 403 ||
    status === 429 ||
    status >= 500
  );
};

const shouldDeferSafaricomStatusQuery = (checkoutRequestId, order) => {
  const lastTemporaryFailure = temporaryStatusLookupFailures.get(checkoutRequestId);
  if (
    lastTemporaryFailure &&
    Date.now() - lastTemporaryFailure < MPESA_TEMPORARY_FAILURE_BACKOFF_MS
  ) {
    return true;
  }

  const lastOrderUpdate = order?.updatedAt ? new Date(order.updatedAt).getTime() : null;
  return Boolean(
    lastOrderUpdate &&
      order.paymentStatus === 'Pending' &&
      Date.now() - lastOrderUpdate < MPESA_STATUS_QUERY_DELAY_MS
  );
};

const pendingPaymentResponse = (res, message = 'Payment confirmation is still pending') => {
  return res.json({
    success: true,
    status: 'Pending',
    message,
  });
};

/**
 * Handle M-Pesa STK Push Initiation
 * POST /api/mpesa/stkpush
 */
export const initiatePayment = async (req, res) => {
  const { orderId, phoneNumber, amount } = req.body;

  if (!orderId || !phoneNumber || !amount) {
    return res.status(400).json({ success: false, message: 'Missing orderId, phoneNumber or amount' });
  }

  try {
    // We need the internal _id to update the order with CheckoutRequestID
    // But we use the human-readable orderId for the M-Pesa reference
    const order = await orderModel.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const mpesaResponse = await initiateMpesaStkPush(order.amount, phoneNumber, order._id, orderId);

    if (mpesaResponse.ResponseCode === '0') {
      logger.info(`STK Push initiated successfully for order ${orderId}`);
      return res.json({
        success: true,
        message: 'M-Pesa STK Push initiated. Please enter your PIN on your phone.',
        checkoutRequestId: mpesaResponse.CheckoutRequestID
      });
    } else {
      logger.error(`STK Push initiation failed for order ${orderId}: ${mpesaResponse.ResponseDescription}`);
      return res.status(500).json({
        success: false,
        message: `M-Pesa Error: ${mpesaResponse.ResponseDescription}`,
      });
    }
  } catch (error) {
    logger.error(`Error in initiatePayment: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal server error during payment initiation' });
  }
};

/**
 * Handle M-Pesa callback from Safaricom
 * POST /api/mpesa/callback
 */
export const handleCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      logger.warn('Invalid M-Pesa callback received: Missing Body or stkCallback');
      return res.status(400).json({ success: false, message: 'Invalid callback structure' });
    }
    
    const result = await processMpesaCallback(Body.stkCallback);
    
    // Safaricom expects a 200 OK to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: result?.duplicate ? 'Duplicate callback acknowledged' : 'Callback processed'
    });
  } catch (error) {
    logger.error(`Error in handleCallback: ${error.message}`);
    // Still return 200 to Safaricom but log the error
    return res.status(200).json({ success: false, message: 'Error processed' });
  }
};

/**
 * Poll for payment status
 * GET /api/mpesa/status/:checkoutRequestId
 */
export const checkPaymentStatus = async (req, res) => {
  const { checkoutRequestId } = req.params;
  
  try {
    const payment = await paymentModel.findOne({ CheckoutRequestID: checkoutRequestId }).sort({ createdAt: -1 });
    if (payment?.status === 'completed') {
      temporaryStatusLookupFailures.delete(checkoutRequestId);
      return res.json({ success: true, status: 'Paid', message: 'Payment confirmed via callback' });
    }
    if (payment?.status === 'failed') {
      temporaryStatusLookupFailures.delete(checkoutRequestId);
      return res.json({ success: true, status: 'Failed', message: 'Payment failed via callback' });
    }

    // Check our database first for the callback result
    const order = await orderModel.findOne({ mpesaCheckoutRequestId: checkoutRequestId });
    
    if (order) {
      if (order.paymentStatus === 'Paid') {
        if (!order.payment) {
          order.payment = true;
          await order.save();
        }
        temporaryStatusLookupFailures.delete(checkoutRequestId);
        return res.json({ success: true, status: 'Paid', message: 'Payment confirmed via callback' });
      }
      if (order.paymentStatus === 'Failed') {
        temporaryStatusLookupFailures.delete(checkoutRequestId);
        return res.json({ success: true, status: 'Failed', message: 'Payment failed via callback' });
      }
    }

    if (shouldDeferSafaricomStatusQuery(checkoutRequestId, order)) {
      return pendingPaymentResponse(res, 'Awaiting M-Pesa callback');
    }

    // Fallback: Query Safaricom directly if no callback result yet
    const status = await queryStkPushStatus(checkoutRequestId);
    
    let friendlyStatus = 'Pending';
    if (status.ResultCode === '0') {
      friendlyStatus = 'Paid';
      temporaryStatusLookupFailures.delete(checkoutRequestId);
      
      // Update order if we missed the callback but Safaricom says it's success
      if (order && order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
        order.payment = true;
        order.mpesaFailedAttempts = 0;
        await order.save();
        await paymentModel.create({
          userId: order.userId,
          orderId: order._id,
          paymentId: order.paymentId,
          method: 'mpesa_stk',
          amount: order.amount,
          status: 'completed',
          CheckoutRequestID: checkoutRequestId,
          ResultCode: Number(status.ResultCode),
          ResultDesc: status.ResultDesc,
        });
      }
    } else if (status.ResultCode) {
      friendlyStatus = 'Failed';
      temporaryStatusLookupFailures.delete(checkoutRequestId);
      if (order) {
        order.mpesaFailedAttempts = (order.mpesaFailedAttempts || 0) + 1;
        order.paymentStatus = 'Failed';
        order.payment = false;
        await order.save();

        await paymentModel.create({
          userId: order.userId,
          orderId: order._id,
          paymentId: order.paymentId,
          method: 'mpesa_stk',
          amount: order.amount,
          status: 'failed',
          CheckoutRequestID: checkoutRequestId,
          ResultCode: Number(status.ResultCode),
          ResultDesc: status.ResultDesc,
        });

        if (order.mpesaFailedAttempts >= 3) {
          await orderModel.findByIdAndDelete(order._id);
        }
      }
    }

    return res.json({ 
      success: true, 
      status: friendlyStatus,
      rawStatus: status.ResultDesc,
      resultCode: status.ResultCode
    });
  } catch (error) {
    // Handle Safaricom-specific "ongoing" error
    if (error.response?.data?.errorCode === '500.001.1001') {
      return pendingPaymentResponse(res, 'Ongoing request');
    }

    if (isTemporaryMpesaStatusError(error)) {
      temporaryStatusLookupFailures.set(checkoutRequestId, Date.now());
      logger.debug(`Deferred M-Pesa status lookup for ${checkoutRequestId}: ${error.message}`);
      return pendingPaymentResponse(res);
    }

    logger.error(`Error checking payment status: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};
