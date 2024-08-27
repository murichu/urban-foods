import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  handleCallback,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Endpoint for Order Router
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/user-orders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/callback", handleCallback);

export default orderRouter;
