import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import authentication from './routes/authentication';
import { errorHandler } from './middleware/errorHandler';
import bodyParser from 'body-parser';

// app config
const app = express();
const port = process.env.PORT;

// db connection
connectDB();

// middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//static files to use css
app.use(express.static('public'));

// api endpoint
app.use("/api/foods", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
// Handle M-Pesa callback
app.use('/api', authentication);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
