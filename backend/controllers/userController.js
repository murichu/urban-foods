import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { createAuditLog } from './auditLogController.js';
import logger from '../config/logger.js';
import { generateCustomId } from '../utils/idGenerator.js';

/**
 * Create JWT token for user
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Login user
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User doesn't exist"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = createToken(user._id);

    // Log successful login
    await createAuditLog({
      userId: user._id.toString(),
      userEmail: user.email,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Don't expose sensitive data
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Register new user
 */
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;

  // Validate input
  if (!name || !password || !email) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email',
      });
    }

    // Validate strong password (minimum 8 characters, at least one number and one letter)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one letter and one number'
      });
    }

    // Hashing User Password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creating New User
    const newUser = new userModel({
      enterpriseId: generateCustomId('UID'),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * Admin login — validates against ADMIN_EMAIL and ADMIN_PASSWORD env vars
 */
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({ success: false, message: 'Admin credentials not configured' });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    // Log failed admin login
    await createAuditLog({
      userId: 'anonymous_admin',
      userEmail: email,
      action: 'ADMIN_LOGIN_FAILURE',
      entity: 'User',
      status: 'failure',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  try {
    const token = jwt.sign({ email, isAdmin: true }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // Log successful admin login
    await createAuditLog({
      userId: 'admin',
      userEmail: email,
      action: 'ADMIN_LOGIN',
      entity: 'User',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(200).json({ success: true, token });
  } catch (error) {
    logger.error(`Admin login error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
};

/**
 * Get User Profile
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

/**
 * Update User Profile
 */
const updateUserProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  try {
    const user = await userModel.findByIdAndUpdate(
      req.body.userId,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

/**
 * List all users (Admin only)
 */
const listUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error(`List users error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

/**
 * Remove user (Admin only)
 */
const removeUser = async (req, res) => {
  try {
    const { id } = req.body;
    await userModel.findByIdAndDelete(id);
    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    logger.error(`Remove user error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error removing user' });
  }
};

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, listUsers, removeUser };
