import userModel from '../models/userModel.js';

/**
 * Add items to user cart
 */
const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    
    // Validate input
    if (!userId || !itemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Item ID are required' 
      });
    }
    
    // Validate ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    
    let userData = await userModel.findById(userId);
    
    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    let cartData = userData.cartData || {};
    
    if (!cartData[itemId]) {
      cartData[itemId] = 1;
    } else {
      cartData[itemId] += 1;
    }
    
    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: 'Added To Cart' });
  } catch (error) {
    console.error('Add to cart error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding item to cart' 
    });
  }
};

/**
 * Remove items from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    
    // Validate input
    if (!userId || !itemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Item ID are required' 
      });
    }
    
    // Validate ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    
    let userData = await userModel.findById(userId);
    
    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    let cartData = userData.cartData || {};
    
    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
    }
    
    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: 'Removed From Cart' });
  } catch (error) {
    console.error('Remove from cart error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error removing item from cart' 
    });
  }
};

/**
 * Fetch user cart data
 */
const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate input
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
    
    let userData = await userModel.findById(userId);
    
    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    let cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.error('Get cart error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching cart data' 
    });
  }
};

export { addToCart, removeFromCart, getCart };
