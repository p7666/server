const express = require("express");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate.js");
const router = express.Router();

// Post a Recipe
router.post("/", async (req, res) => {
    try {
        const { name, imageUrl, ingredients, instructions, cookingTime, userId } = req.body;
        const newRecipe = new Recipe({ name, imageUrl, ingredients, instructions, cookingTime, postedBy: userId });
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search Recipe
router.get("/:name", async (req, res) => {
    const recipe = await Recipe.findOne({ name: req.params.name });
    recipe ? res.json(recipe) : res.status(404).json({ message: "Sorry, don't have this recipe" });
});

// Like Recipe
router.post("/like/:id", authenticate, async (req, res) => {
    try {
      console.log("User ID from token:", req.user?.id); // Debugging log
  
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("User found:", user); // Debugging log
  
      if (user.likedRecipes.includes(req.params.id)) {
        return res.status(400).json({ message: "You have already liked this recipe" });
      }
  
      user.likedRecipes.push(req.params.id);
      await user.save();
  
      res.status(200).json({ message: "Recipe liked successfully", likedRecipes: user.likedRecipes });
    } catch (error) {
      console.error("Error in like API:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
// Edit Recipe
router.put("/:id", async (req, res) => {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRecipe);
});

module.exports = router;
