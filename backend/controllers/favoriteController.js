import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

const toggleFavorite = async (req, res) => {
  const { foodId } = req.body;
  const userId = req.body.userId;

  try {
    const user = await userModel.findById(userId);
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
    res.json({ success: false, message: "Error updating favorites" });
  }
};

const getFavorites = async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    const favorites = await foodModel.find({ _id: { $in: user.favorites } });
    res.json({ success: true, data: favorites });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching favorites" });
  }
};

export { toggleFavorite, getFavorites };
