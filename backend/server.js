import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import mpesaStkRoute from "./routes/mpesaStkRoute.js";
import mpesaPayRoute from "./routes/mpesaPayRoute.js";

// app config
const app = express();
const port = process.env.PORT;

// db connection
connectDB();

// middleware
app.use(express.json());
app.use(cors());

// api endpoint
app.use("/api/foods", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Payment Routes
app.use("/api/mpesa_stk", mpesaStkRoute);
app.use("/api/mpesa_c2b", mpesaPayRoute);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
