const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUserProfile,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes
router.use(protect);

// Get all users with pagination and filtering
router.get("/", getUsers);

// Get single user by ID
router.get("/get-user-data", getUserById);

// Update user profile
router.post("/update-profile", updateUserProfile);

module.exports = router;
