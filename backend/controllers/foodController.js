import foodModel from "../models/foodModel.js";
import fs from "fs";

// Add food item
const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });

  try {
    await food.save();
    res.status(200).json({ success: true, message: "Food Added Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error While Adding Food" });
  }
};

// All Food List
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.status(200).json({
      success: true,
      data: foods,
      message: "Data Loaded Successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching food items" });
  }
};

// Remove Foods
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.id);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }

    // Safely delete the associated image file
    fs.unlink(`uploads/${food.image}`, (error) => {
      if (error) {
        console.error(`Error deleting image file: ${error.message}`);
      }
    });

    await foodModel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Food Removed Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error Removing Food" });
  }
};

export { addFood, listFood, removeFood };
