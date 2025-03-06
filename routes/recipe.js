const express = require("express");
const multer = require("multer");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate.js");

const router = express.Router();

// Multer Configuration for Image Uploads
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
        });

        await newRecipe.save();
        res.status(201).json({ message: "Recipe posted successfully!", recipe: newRecipe });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Search Recipe by Name
router.get("/:name", async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ name: req.params.name });
        if (!recipe) {
            return res.status(404).json({ message: "Sorry, this recipe does not exist." });
        }
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: "Server error while searching for recipe." });
    }
});

// ✅ Like Recipe (Authentication Required)
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
        console.error("Error in like API:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Edit Recipe (Authentication Required)
router.put("/:id", authenticate, async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRecipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }
        res.json(updatedRecipe);
    } catch (error) {
        res.status(500).json({ error: "Error updating recipe." });
    }
});

module.exports = router;
