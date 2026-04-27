import mongoose from "mongoose";
import logger from "./logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_DB);
    logger.info("DB Connected Successfully");
  } catch (error) {
    logger.error(`Error connecting to the database: ${error.message}`);
    // Optionally, you can exit the process if the connection fails
    process.exit(1);
  }
};
