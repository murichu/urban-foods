import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  type: { type: String, default: "business_profile" },
  businessName: { type: String, default: "Urban Foods" },
  businessEmail: { type: String, default: "info@urbanfoods.com" },
  businessPhone: { type: String, default: "+254 700 000 000" },
  businessAddress: { type: String, default: "Nairobi, Kenya" },
  businessCity: { type: String, default: "Nairobi" },
  businessCountry: { type: String, default: "Kenya" },
  businessWebsite: { type: String, default: "www.urbanfoods.com" },
  businessPin: { type: String, default: "P000000000X" },
  businessVat: { type: String, default: "" },
  invoicePrefix: { type: String, default: "INV-" },
  currency: { type: String, default: "KSh" },
  deliveryFee: { type: Number, default: 0, min: 0 },
  logoUrl: { type: String, default: "" },
  socialLinks: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" }
  }
}, { timestamps: true });

const settingsModel = mongoose.models.settings || mongoose.model("settings", settingsSchema);
export default settingsModel;
