import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import mongoose from "mongoose";

const toggleFavorite = async (req, res) => {
  const { foodId } = req.body;
  const userId = req.userId || req.body.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: "Invalid food item" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let favorites = user.favorites || [];
    
    if (favorites.includes(foodId)) {
      favorites = favorites.filter(id => id !== foodId);
    } else {
      favorites.push(foodId);
    }

    user.favorites = favorites;
    await user.save();
    res.json({ success: true, message: "Favorites updated", favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating favorites" });
  }
};

const getFavorites = async (req, res) => {
  const userId = req.userId || req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const favoriteIds = (user.favorites || []).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    const favorites = await foodModel.find({ _id: { $in: favoriteIds } });
    res.json({ success: true, data: favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching favorites" });
  }
};

export { toggleFavorite, getFavorites };
