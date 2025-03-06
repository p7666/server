const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Recipe = require('../models/Recipe');
const authenticate = require("../middleware/authenticate.js");


const router = express.Router();

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Search Recipe by Name
router.get("/recipes/:name", async (req, res) => {
    try {
      const recipeName = (req.params.name);
      const recipe = await Recipe.findOne({ name: recipeName });
  
      if (!recipe) {
        return res.status(404).json({ message: "Sorry, don't have this recipe" });
      }
  
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
  
  module.exports = router;

// Post a new Recipe (Protected Route)
router.post('/', authMiddleware, async (req, res) => {
    const { name, imageUrl, ingredients, instructions, cookingTime } = req.body;
    const userId = req.user.id; // Extract user ID from token

    try {
        const newRecipe = new Recipe({
            name,
            imageUrl,
            ingredients,
            instructions,
            cookingTime,
            userId
        });

        await newRecipe.save();
        res.status(201).json({ message: 'Recipe posted successfully', newRecipe });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Like a Recipe (Protected Route)
router.post("/like/:id", authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.likedRecipes.includes(req.params.id)) {
        return res.status(400).json({ message: "You have already liked this recipe" });
      }
  
      user.likedRecipes.push(req.params.id);
      await user.save();
  
      res.status(200).json({ message: "Recipe liked successfully", likedRecipes: user.likedRecipes });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
  

// Edit a Recipe (Protected Route)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Ensure the logged-in user is the owner of the recipe
        if (recipe.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to edit this recipe' });
        }

        // Update recipe details
        recipe.name = req.body.name || recipe.name;
        recipe.imageUrl = req.body.imageUrl || recipe.imageUrl;
        recipe.ingredients = req.body.ingredients || recipe.ingredients;
        recipe.instructions = req.body.instructions || recipe.instructions;
        recipe.cookingTime = req.body.cookingTime || recipe.cookingTime;

        await recipe.save();
        res.json({ message: 'Recipe updated successfully', recipe });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
