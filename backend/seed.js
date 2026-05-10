import mongoose from 'mongoose';
import dotenv from 'dotenv';
import foodModel from './models/foodModel.js';
import { generateCustomId } from './utils/idGenerator.js';

dotenv.config();

const foodData = [
  { name: "Greek salad", price: 12, category: "Salad", image: "food_1.png" },
  { name: "Veg salad", price: 18, category: "Salad", image: "food_2.png" },
  { name: "Clover Salad", price: 16, category: "Salad", image: "food_3.png" },
  { name: "Chicken Salad", price: 24, category: "Salad", image: "food_4.png" },
  { name: "Lasagna Rolls", price: 14, category: "Rolls", image: "food_5.png" },
  { name: "Peri Peri Rolls", price: 12, category: "Rolls", image: "food_6.png" },
  { name: "Chicken Rolls", price: 20, category: "Rolls", image: "food_7.png" },
  { name: "Veg Rolls", price: 15, category: "Rolls", image: "food_8.png" },
  { name: "Ripple Ice Cream", price: 14, category: "Desserts", image: "food_9.png" },
  { name: "Fruit Ice Cream", price: 22, category: "Desserts", image: "food_10.png" },
  { name: "Jar Ice Cream", price: 10, category: "Desserts", image: "food_11.png" },
  { name: "Vanilla Ice Cream", price: 12, category: "Desserts", image: "food_12.png" },
  { name: "Chicken Sandwich", price: 12, category: "Sandwich", image: "food_13.png" },
  { name: "Vegan Sandwich", price: 18, category: "Sandwich", image: "food_14.png" },
  { name: "Grilled Sandwich", price: 16, category: "Sandwich", image: "food_15.png" },
  { name: "Bread Sandwich", price: 24, category: "Sandwich", image: "food_16.png" },
  { name: "Cup Cake", price: 14, category: "Cake", image: "food_17.png" },
  { name: "Vegan Cake", price: 12, category: "Cake", image: "food_18.png" },
  { name: "Butterscotch Cake", price: 20, category: "Cake", image: "food_19.png" },
  { name: "Sliced Cake", price: 15, category: "Cake", image: "food_20.png" },
  { name: "Garlic Mushroom", price: 14, category: "Pure Veg", image: "food_21.png" },
  { name: "Fried Cauliflower", price: 22, category: "Pure Veg", image: "food_22.png" },
  { name: "Mix Veg Pulao", price: 10, category: "Pure Veg", image: "food_23.png" },
  { name: "Rice Zucchini", price: 12, category: "Pure Veg", image: "food_24.png" },
  { name: "Cheese Pasta", price: 12, category: "Pasta", image: "food_25.png" },
  { name: "Tomato Pasta", price: 18, category: "Pasta", image: "food_26.png" },
  { name: "Creamy Pasta", price: 16, category: "Pasta", image: "food_27.png" },
  { name: "Chicken Pasta", price: 24, category: "Pasta", image: "food_28.png" },
  { name: "Butter Noodles", price: 14, category: "Noodles", image: "food_29.png" },
  { name: "Veg Noodles", price: 12, category: "Noodles", image: "food_30.png" },
  { name: "Somen Noodles", price: 20, category: "Noodles", image: "food_31.png" },
  { name: "Cooked Noodles", price: 15, category: "Noodles", image: "food_32.png" }
];

const descriptions = {
  "Salad": "Fresh and crisp greens tossed with premium ingredients and our signature dressing.",
  "Rolls": "Delicious fillings wrapped in a soft, golden-brown shell for a perfect bite.",
  "Desserts": "A sweet conclusion to your meal, crafted with love and the finest ingredients.",
  "Sandwich": "Hearty fillings between slices of artisanal bread, toasted to perfection.",
  "Cake": "Moist, decadent, and beautifully layered treats for every celebration.",
  "Pure Veg": "Wholesome vegetarian delights prepared with garden-fresh vegetables and spices.",
  "Pasta": "Authentic Italian-style pasta cooked al dente with rich, flavorful sauces.",
  "Noodles": "Wok-tossed noodles with a blend of savory spices and fresh garden vegetables."
};

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGOOSE_DB ||
      (process.env.MONGODB_URL && process.env.MONGODB_NAME
        ? `${process.env.MONGODB_URL}/${process.env.MONGODB_NAME}`
        : undefined) ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.DATABASE_URL;

    if (!mongoUri) {
      throw new Error(
        "Missing MongoDB connection string. Set MONGOOSE_DB or MONGODB_URL and MONGODB_NAME in backend/.env."
      );
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing food items
    await foodModel.deleteMany({});
    console.log('Cleared existing food items');

    const formattedData = foodData.map(item => ({
      ...item,
      enterpriseId: generateCustomId('FID'),
      description: descriptions[item.category] || "A delicious and wholesome meal prepared fresh for you."
    }));

    await foodModel.insertMany(formattedData);
    console.log('Successfully seeded 32 food items');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
