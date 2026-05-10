import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import logger from "./config/logger.js";

// Routes
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import favoriteRouter from "./routes/favoriteRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import mpesaRouter from "./routes/mpesaRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import auditLogRouter from "./routes/auditLogRoute.js";
import settingsRouter from "./routes/settingsRoute.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

// ─────────────────────────────────────────────────────────────
// Environment Configuration
// ─────────────────────────────────────────────────────────────
dotenv.config();

// ─────────────────────────────────────────────────────────────
// App Initialization
// ─────────────────────────────────────────────────────────────
const app = express();
const port = process.env.PORT || 4000;

// Hide Express fingerprint
app.disable("x-powered-by");

// Trust proxy (Render, Railway, Vercel, etc.)
app.set("trust proxy", 1);

// ─────────────────────────────────────────────────────────────
// Database Connection
// ─────────────────────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────────────────────
// HTTP Logger
// ─────────────────────────────────────────────────────────────
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: logger.stream,
  })
);

// ─────────────────────────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────────────────────────
const parseOrigins = (value) =>
  value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const allowedOrigins = [
  ...parseOrigins(process.env.CORS_ORIGINS),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.ADMIN_URL),

  // Local Development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
].filter(Boolean);

const allowedOriginPatterns = [
  /^https:\/\/[a-z0-9-]+-(5173|5174|5175)\.csb\.app$/i,
  /^https:\/\/[a-z0-9-]+-(5173|5174|5175)\.preview\.app\.github\.dev$/i,
];

const isAllowedOrigin = (origin) =>
  allowedOrigins.includes("*") ||
  allowedOrigins.includes(origin) ||
  allowedOriginPatterns.some((pattern) => pattern.test(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "token", "Accept"],

    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// ─────────────────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// ─────────────────────────────────────────────────────────────
// Body Parsers
// ─────────────────────────────────────────────────────────────
app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ─────────────────────────────────────────────────────────────
// MongoDB Injection Protection
// ─────────────────────────────────────────────────────────────
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};

  for (const key in obj) {
    // Remove dangerous MongoDB operators
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }

    const value = obj[key];

    sanitized[key] = typeof value === "object" ? sanitizeObject(value) : value;
  }

  return sanitized;
};

app.use((req, res, next) => {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────
// Prevent HTTP Parameter Pollution
// ─────────────────────────────────────────────────────────────
app.use(hpp());

// ─────────────────────────────────────────────────────────────
// Cookies
// ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: process.env.NODE_ENV === "production" ? 200 : 1000,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Authentication Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: process.env.NODE_ENV === "production" ? 10 : 100,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/user/admin-login", authLimiter);

// ─────────────────────────────────────────────────────────────
// Static Files
// ─────────────────────────────────────────────────────────────
app.use(express.static("public"));
app.use("/images", express.static("uploads"));

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────
app.use("/api/foods", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/review", reviewRouter);
app.use("/api/mpesa", mpesaRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/audit", auditLogRouter);
app.use("/api/settings", settingsRouter);

// ─────────────────────────────────────────────────────────────
// Health Check Route
// ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API WORKING",
    environment: process.env.NODE_ENV,
    timestamp: new Date(),
  });
});

// ─────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
});
