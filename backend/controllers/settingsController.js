import settingsModel from "../models/settingsModel.js";
import { DELIVERY_FEE } from "../config/orderConfig.js";

const normalizeDeliveryFee = (value, fallback = DELIVERY_FEE) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const deliveryFee = Number(value);

  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
    throw new Error("Delivery fee must be a valid non-negative amount");
  }

  return deliveryFee;
};

const getSettings = async (req, res) => {
  try {
    let settings = await settingsModel.findOne({ type: "business_profile" });
    if (!settings) {
      settings = await settingsModel.create({
        type: "business_profile",
        deliveryFee: DELIVERY_FEE,
      });
    } else if (settings.deliveryFee === undefined || settings.deliveryFee === null) {
      settings.deliveryFee = DELIVERY_FEE;
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching settings" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { 
      businessName, businessEmail, businessPhone, businessAddress, 
      businessCity, businessCountry, businessWebsite, 
      businessPin, businessVat, invoicePrefix, currency, deliveryFee, socialLinks 
    } = req.body;

    const currentSettings = await settingsModel.findOne({ type: "business_profile" });
    const currentDeliveryFee = Number(currentSettings?.deliveryFee);
    const normalizedDeliveryFee = normalizeDeliveryFee(
      deliveryFee,
      Number.isFinite(currentDeliveryFee) && currentDeliveryFee >= 0
        ? currentDeliveryFee
        : DELIVERY_FEE
    );
    
    await settingsModel.findOneAndUpdate(
      { type: "business_profile" },
      { 
        businessName, businessEmail, businessPhone, businessAddress, 
        businessCity, businessCountry, businessWebsite, 
        businessPin, businessVat, invoicePrefix, currency,
        deliveryFee: normalizedDeliveryFee,
        socialLinks 
      },
      { upsert: true, returnDocument: "after" }
    );
    
    res.json({ success: true, message: "Business details updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Error updating settings" });
  }
};

export { getSettings, updateSettings };
