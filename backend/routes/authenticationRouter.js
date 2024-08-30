import express from "express";
import { createToken, postStk, callback } from "../controllers/controller.js";

const authenticationRouter = express.Router();

authenticationRouter.post("/stkpush", createToken, postStk);
authenticationRouter.post("/callback", callback);

export default authenticationRouter;
