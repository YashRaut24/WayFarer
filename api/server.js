const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });

const { fetchLatestHeadlines } = require("../tools/headlines");
const FetchLog = require("./models/FetchLog");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/api/fetch-headlines", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "topic is required" });
  }

  try {
    const headlines = await fetchLatestHeadlines(topic);

    await FetchLog.create({
      tool: "fetch_latest_headlines",
      topic,
      resultCount: headlines.length,
    });

    res.json({ headlines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/history", async (req, res) => {
  const logs = await FetchLog.find().sort({ createdAt: -1 }).limit(50);
  res.json({ logs });
});

const PORT = process.env.API_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Wayfarer API running on port ${PORT}`);
});