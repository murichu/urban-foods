import express from 'express';
import multer from 'multer';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import adminAuth from '../middleware/adminAuth.js';

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Ensure 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}_${safeOriginalName}`);
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only allow single file
  }
});

// Routes
foodRouter.post('/add', adminAuth, upload.single('image'), addFood);
foodRouter.get('/list', listFood);
foodRouter.delete('/remove/:id', adminAuth, removeFood);
foodRouter.put('/update/:id', adminAuth, upload.single('image'), updateFood);  // Admin: edit food item

export default foodRouter;
