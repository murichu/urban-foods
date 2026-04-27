import settingsModel from "../models/settingsModel.js";

const getSettings = async (req, res) => {
  try {
    let settings = await settingsModel.findOne({ type: "business_profile" });
    if (!settings) {
      settings = await settingsModel.create({ type: "business_profile" });
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
      businessPin, businessVat, invoicePrefix, currency, socialLinks 
    } = req.body;
    
    await settingsModel.findOneAndUpdate(
      { type: "business_profile" },
      { 
        businessName, businessEmail, businessPhone, businessAddress, 
        businessCity, businessCountry, businessWebsite, 
        businessPin, businessVat, invoicePrefix, currency, socialLinks 
      },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, message: "Business details updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error updating settings" });
  }
};

export { getSettings, updateSettings };
