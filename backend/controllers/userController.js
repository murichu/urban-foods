import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';

/**
 * Create JWT token for user
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256', // Explicitly specify algorithm
    notBefore: '0s' // Token is valid immediately
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
    console.error('Login error:', error.message);
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
    if (password.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 10 characters long' 
      });
    }
    
    // Check for common passwords
    const commonPasswords = ['password', '1234567890', 'qwertyuiop', 'letmein123', 'welcome123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is too common. Please choose a stronger password' 
      });
    }
    
    if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one letter, one number, and one special character' 
      });
    }

    // Hashing User Password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creating New User
    const newUser = new userModel({
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

export { loginUser, registerUser };
