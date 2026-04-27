import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { placeOrder, verifyOrder, userOrders, listOrders, updateOrderStatus, getOrderById, getAdminStats } from '../controllers/orderController.js';

import adminAuth from '../middleware/adminAuth.js';

const orderRouter = express.Router();

// Endpoint for Order Router
orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/verify', verifyOrder);
orderRouter.post('/user-orders', authMiddleware, userOrders);
orderRouter.get('/list', adminAuth, listOrders);
orderRouter.get('/stats', adminAuth, getAdminStats);
orderRouter.patch('/status', adminAuth, updateOrderStatus);  // Admin: update order status
orderRouter.get('/:id', adminAuth, getOrderById);            // Admin: get single order detail

export default orderRouter;

