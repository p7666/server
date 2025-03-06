const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  ingredients: { type: [String], required: true },  // ✅ Fix: Changed from String to [String]
  instructions: { type: String, required: true },
  cookingTime: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Recipe", RecipeSchema);
