require("dotenv").config(); // Load .env variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json()); 

app.use(
  cors({
    origin: "https://mern-recipe-app-client.onrender.com", // Allow only frontend
    credentials: true, // Allow cookies and authorization headers
  })
);

// Debugging: Check if .env is loading
console.log("MongoDB URL:", process.env.MONGO_URL);

// Ensure MONGO_URL is defined before connecting
if (!process.env.MONGO_URL) {
    console.error("❌ MONGO_URL is undefined! Make sure your .env file is correctly set.");
    process.exit(1); // Exit the app if no MongoDB URL is found
}

// Connect to MongoDB Atlas
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("✅ DB connected successfully.."))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes (Fixing paths to match frontend)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/recipes", require("./routes/recipeRoutes")); // Keeping only this

app.use("/api/user", require("./routes/userRoutes")); 

// Health Check Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 Server is running on port: " + PORT);
});
