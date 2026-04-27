import express from 'express';
import { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, listUsers, removeUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();

// Routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin-login', adminLogin);  // Admin panel login

// Protected Profile Routes
userRouter.get('/profile', authMiddleware, getUserProfile);
userRouter.post('/update', authMiddleware, updateUserProfile);

// Admin Routes
userRouter.get('/list', adminAuth, listUsers);
userRouter.post('/remove', adminAuth, removeUser);

export default userRouter;

