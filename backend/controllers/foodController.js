import foodModel from '../models/foodModel.js';
import fs from 'fs';
import path from 'path';
import { generateCustomId } from '../utils/idGenerator.js';

// Allowed file types for upload
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Resolve uploads directory from current backend process working directory.
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

/**
 * Validate file type and size
 */
const validateFile = (file) => {
  if (!file) {
    return { valid: false, message: 'No file uploaded' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: 'File too large. Maximum size is 5MB'
    };
  }

  return { valid: true };
};

/**
 * Sanitize filename to prevent directory traversal attacks
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Add food item
 */
const addFood = async (req, res) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const validation = validateFile(req.file);
    if (!validation.valid) {
      // Delete the invalid file
      fs.unlink(req.file.path, () => { });
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Validate required fields
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
      fs.unlink(req.file.path, () => { });
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category) are required'
      });
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      fs.unlink(req.file.path, () => { });
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    const image_filename = sanitizeFilename(`${req.file.filename}`);

    const food = new foodModel({
      enterpriseId: generateCustomId('FID'),
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      category: category.trim(),
      image: image_filename,
    });

    await food.save();
    res.status(201).json({
      success: true,
      message: 'Food Added Successfully',
      data: food
    });
  } catch (error) {
    console.error('Add food error:', error.message);

    // Clean up file if save fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => { });
    }

    res.status(500).json({
      success: false,
      message: 'Error While Adding Food'
    });
  }
};

/**
 * List all food items
 */
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: foods,
      count: foods.length,
    });
  } catch (error) {
    console.error('List food error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching food items'
    });
  }
};

/**
 * Remove food item
 */
const removeFood = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid food ID format'
      });
    }

    const food = await foodModel.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    // Use basename to ensure we never resolve outside uploads when deleting file.
    const safeImageName = path.basename(food.image);
    const imagePath = path.join(UPLOADS_DIR, safeImageName);

    fs.unlink(imagePath, (error) => {
      if (error && error.code !== 'ENOENT') {
        console.error(`Error deleting image file: ${error.message}`);
      }
    });

    await foodModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Food Removed Successfully'
    });
  } catch (error) {
    console.error('Remove food error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error Removing Food'
    });
  }
};

/**
 * Update food item (name, description, price, category, optionally new image)
 */
const updateFood = async (req, res) => {
  try {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      if (req.file) fs.unlink(req.file.path, () => { });
      return res.status(400).json({ success: false, message: 'Invalid food ID format' });
    }

    const food = await foodModel.findById(req.params.id);
    if (!food) {
      if (req.file) fs.unlink(req.file.path, () => { });
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const { name, description, price, category } = req.body;
    const priceNum = parseFloat(price);

    if (price !== undefined && (isNaN(priceNum) || priceNum <= 0)) {
      if (req.file) fs.unlink(req.file.path, () => { });
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    // If a new image was uploaded, validate and replace the old one
    if (req.file) {
      const validation = validateFile(req.file);
      if (!validation.valid) {
        fs.unlink(req.file.path, () => { });
        return res.status(400).json({ success: false, message: validation.message });
      }
      // Delete old image
      const oldImagePath = path.join(UPLOADS_DIR, path.basename(food.image));
      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting old image:', err.message);
      });
      food.image = sanitizeFilename(req.file.filename);
    }

    if (name) food.name = name.trim();
    if (description) food.description = description.trim();
    if (price !== undefined) food.price = priceNum;
    if (category) food.category = category.trim();
    food.updatedAt = new Date();

    await food.save();
    res.status(200).json({ success: true, message: 'Food Updated Successfully', data: food });
  } catch (error) {
    console.error('Update food error:', error.message);
    if (req.file && req.file.path) fs.unlink(req.file.path, () => { });
    res.status(500).json({ success: false, message: 'Error While Updating Food' });
  }
};

export { addFood, listFood, removeFood, updateFood };
