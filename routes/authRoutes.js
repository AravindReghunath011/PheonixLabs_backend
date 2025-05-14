const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updateUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Update profile route (protected)
router.patch("/update-profile", protect, updateUserProfile);

module.exports = router;
