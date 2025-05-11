const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://jaspreetsingh221309:O9PDqR5HChAJt9lU@cluster0.vumkhpm.mongodb.net/eventsdb", {
 useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define Event model
const eventSchema = new mongoose.Schema({
  title: String,
  category: String,
  location: String,
  time: String,
});
const Event = mongoose.model("Event", eventSchema);

// GET API to return events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});