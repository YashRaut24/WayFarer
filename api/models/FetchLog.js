const mongoose = require("mongoose");

const fetchLogSchema = new mongoose.Schema({
    tool: { type: String, required: true },
    topic: { type: String, required: true },
    resultCount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FetchLog", fetchLogSchema);