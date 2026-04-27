import express from "express";
import { toggleFavorite, getFavorites } from "../controllers/favoriteController.js";
import authMiddleware from "../middleware/auth.js";

const favoriteRouter = express.Router();

favoriteRouter.post("/toggle", authMiddleware, toggleFavorite);
favoriteRouter.get("/list", authMiddleware, getFavorites);

export default favoriteRouter;
