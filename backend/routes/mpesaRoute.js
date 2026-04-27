import express from 'express';
import { initiatePayment, handleCallback, checkPaymentStatus } from '../controllers/mpesaController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';


const mpesaRouter = express.Router();

// Route to initiate STK push - for customers
mpesaRouter.post('/stkpush', authMiddleware, initiatePayment);

// Route for Admin to initiate STK push for customers
mpesaRouter.post('/admin/stkpush', adminAuth, initiatePayment);

// Route for M-Pesa callback - public (called by Safaricom)
mpesaRouter.post('/callback', handleCallback);

// Route to poll for payment status
mpesaRouter.get('/status/:checkoutRequestId', checkPaymentStatus);

export default mpesaRouter;
