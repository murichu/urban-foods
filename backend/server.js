import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import favoriteRouter from './routes/favoriteRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import errorHandler from './middleware/errorHandler.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import morgan from 'morgan';
import mpesaRouter from './routes/mpesaRoute.js';
import auditLogRouter from './routes/auditLogRoute.js';
import settingsRouter from './routes/settingsRoute.js';


import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 4000;

// DB connection
connectDB();

// Ensure logs directory exists for Morgan
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Access log stream for Morgan
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

// HTTP Request logging (Morgan)
app.use(morgan('dev')); // Console
app.use(morgan('combined', { stream: accessLogStream })); // File


// 1. CORS Configuration (MUST BE FIRST)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// 2. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Rate Limiting
const limiter = rateLimit({
  max: 1000, // Increased for development
  windowMs: 15 * 60 * 1000, 
  message: 'Too many requests, please try again later'
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many login/register attempts'
});
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);

// 4. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Data Sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// 6. Cookies
app.use(cookieParser());

// 7. Static Files
app.use(express.static('public'));
app.use('/images', express.static('uploads'));

// 8. Routes
app.use('/api/foods', foodRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/favorite', favoriteRouter);
app.use('/api/review', reviewRouter);
app.use('/api/mpesa', mpesaRouter);
app.use('/api/audit', auditLogRouter);
app.use('/api/settings', settingsRouter);

app.get('/', (req, res) => {
  res.send('API WORKING');
});

// 9. Error Handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
