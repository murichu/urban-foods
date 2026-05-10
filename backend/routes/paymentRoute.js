import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { getAdminPayments } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.get("/list", adminAuth, getAdminPayments);

export default paymentRouter;
