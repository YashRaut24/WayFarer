const mongoose = require("mongoose");

const priceCheckSchema = new mongoose.Schema({
  url: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  checkedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PriceCheck", priceCheckSchema);