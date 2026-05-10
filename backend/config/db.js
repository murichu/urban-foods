import mongoose from "mongoose";
import logger from "./logger.js";

export const connectDB = async () => {
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

    logger.info("MongoDB Connected Successfully");
  } catch (error) {
    logger.error(`Database Connection Error: ${error.message}`);

    // Exit application on failure
    process.exit(1);
  }
};
