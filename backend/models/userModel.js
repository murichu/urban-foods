import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    enterpriseId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    favorites: { type: [String], default: [] },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
