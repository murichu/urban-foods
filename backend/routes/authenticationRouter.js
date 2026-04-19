import express from "express";
import { createToken, postStk, callback, validateTransaction } from "../controllers/controller.js";

const authenticationRouter = express.Router();

authenticationRouter.post("/stkpush", createToken, postStk);
authenticationRouter.post("/callback", callback);
authenticationRouter.post("/validate", createToken, validateTransaction);

export default authenticationRouter;
