import express from "express";
import { addReview, getFoodReviews, adminGetFoodReviews, listAllReviews, removeReview } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get("/list", adminAuth, listAllReviews);
reviewRouter.post("/remove", adminAuth, removeReview);
reviewRouter.get("/:foodId", getFoodReviews);
reviewRouter.get("/admin/:foodId", adminAuth, adminGetFoodReviews);

export default reviewRouter;
