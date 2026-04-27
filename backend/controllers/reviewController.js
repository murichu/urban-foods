import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";

const addReview = async (req, res) => {
  const { foodId, rating, comment, userName } = req.body;
  const userId = req.body.userId;

  try {
    const review = new reviewModel({
      foodId,
      userId,
      userName,
      rating: Number(rating),
      comment,
    });
    await review.save();
    res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding review" });
  }
};

const getFoodReviews = async (req, res) => {
  const { foodId } = req.params;
  try {
    const count = await reviewModel.countDocuments({ foodId });
    res.json({ success: true, count });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching review count" });
  }
};

const adminGetFoodReviews = async (req, res) => {
  const { foodId } = req.params;
  try {
    const reviews = await reviewModel.find({ foodId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching reviews" });
  }
};

const listAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching all reviews" });
  }
};

const removeReview = async (req, res) => {
  try {
    const { id } = req.body;
    await reviewModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Review removed successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error removing review" });
  }
};

export { addReview, getFoodReviews, adminGetFoodReviews, listAllReviews, removeReview };
