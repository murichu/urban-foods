import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_DB);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    // Optionally, you can exit the process if the connection fails
    process.exit(1);
  }
};
