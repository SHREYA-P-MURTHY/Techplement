const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const translate = require("google-translate-api-x");
const quoteRoutes = require("./routes/quoteRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const quoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true },
});

const Quote = mongoose.models.Quote || mongoose.model("Quote", quoteSchema);
app.get("/api/quotes/today", async (req, res) => {
  try {
    let quote;

    // If a specific quote ID is provided, fetch that quote
    if (req.query.id) {
      quote = await Quote.findById(req.query.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
    } else {
      // Otherwise, fetch a random quote
      const count = await Quote.countDocuments();
      if (count === 0) {
        return res.status(404).json({ message: "No quotes available" });
      }
      const randomIndex = Math.floor(Math.random() * count);
      quote = await Quote.findOne().skip(randomIndex);
    }

    // If language is Hindi, translate it
    if (req.query.lang === "hi") {
      const translatedContent = await translate(quote.content, { to: "hi" });
      const translatedAuthor = await translate(quote.author, { to: "hi" });

      return res.json({
        id: quote._id, // Send the ID so frontend knows which quote is displayed
        content: translatedContent.text,
        author: translatedAuthor.text,
      });
    }

    // Return the original quote
    res.json({
      id: quote._id,
      content: quote.content,
      author: quote.author,
    });
  } catch (err) {
    console.error("Error fetching or translating quote:", err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
