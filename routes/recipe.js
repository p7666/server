const express = require("express");
const multer = require("multer");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate.js");

const router = express.Router();

// ✅ Multer Configuration for Image Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ Post a Recipe (Authentication Required)
router.post("/", authenticate, upload.single("image"), async (req, res) => {
    try {
        const { name, ingredients, instructions, cookingTime } = req.body;
        const userId = req.user.id;

        if (!name || !ingredients || !instructions || !cookingTime) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newRecipe = new Recipe({
            name,
            ingredients,
            instructions,
            cookingTime,
            imageUrl: req.file ? req.file.buffer.toString("base64") : null,
            postedBy: userId,
            likes: 0
        });

        await newRecipe.save();
        res.status(201).json({ message: "Recipe posted successfully!", recipe: newRecipe });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch All Recipes
router.get("/", async (req, res) => {
    try {
        const recipes = await Recipe.find().populate("postedBy", "username");
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching recipes." });
    }
});

// ✅ View Full Recipe by ID
router.get("/:id", async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." });
        }
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching recipe." });
    }
});

// ✅ Like Recipe (Authentication Required)
router.post("/like/:id", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const recipe = await Recipe.findById(req.params.id);

        if (!user || !recipe) {
            return res.status(404).json({ message: "User or Recipe not found" });
        }

        if (user.likedRecipes.includes(req.params.id)) {
            return res.status(400).json({ message: "You have already liked this recipe" });
        }

        user.likedRecipes.push(req.params.id);
        await user.save();

        recipe.likes += 1;
        await recipe.save();

        res.status(200).json({ message: "Recipe liked successfully", likedRecipes: user.likedRecipes });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Edit Recipe (Authentication Required)
router.put("/:id", authenticate, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        if (recipe.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to edit this recipe" });
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Recipe updated successfully!", recipe: updatedRecipe });
    } catch (error) {
        res.status(500).json({ error: "Error updating recipe." });
    }
});

module.exports = router;
