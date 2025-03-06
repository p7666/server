require("dotenv").config(); // Ensure .env is loaded at the top

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

app.use(express.json());
app.use(cors());
app.use("/auth", require("./routes/auth"));
app.use("/contact", require("./routes/contact"));
app.use("/recipes", require("./routes/recipe"));
app.use('/recipes', require('./routes/recipeRoutes'));
app.use('/user', require('./routes/userRoutes'));

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

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("🚀 Server is running on port: " + PORT);
});
