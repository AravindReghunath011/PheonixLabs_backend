const User = require("../models/User");
const Weight = require("../models/Weight");
const Shipment = require("../models/Shipment");
const Medication = require("../models/Medication");

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      height_cm,
      biological_sex,
      current_weight_kg,
      goal_weight_kg,
    } = req.body;
    const userId = req.user.id; // Assuming you have user info from auth middleware

    // Input validation
    if (!age || !height_cm || !biological_sex || !current_weight_kg|| !name) {
      return res.status(400).json({
        status: "fail",
        message:
          "Please provide all required fields: age, height_cm, biological_sex, and current_weight_kg",
      });
    }

    // Age validation
    if (age < 13 || age > 120) {
      return res.status(400).json({
        status: "fail",
        message: "Age must be between 13 and 120",
      });
    }

    // Height validation (in cm)
    if (height_cm < 100 || height_cm > 250) {
      return res.status(400).json({
        status: "fail",
        message: "Height must be between 100cm and 250cm",
      });
    }

    // Weight validation (in kg)
    if (current_weight_kg < 20 || current_weight_kg > 300) {
      return res.status(400).json({
        status: "fail",
        message: "Weight must be between 20kg and 300kg",
      });
    }

    // Biological sex validation
    if (!["Male", "Female", "Other"].includes(biological_sex)) {
      return res.status(400).json({
        status: "fail",
        message: "Biological sex must be Male, Female, or Other",
      });
    }

    // Calculate BMI
    const height_m = height_cm / 100;
    const bmi = current_weight_kg / (height_m * height_m);

    // Determine BMI category
    let bmi_category;
    if (bmi < 18.5) bmi_category = "Underweight";
    else if (bmi < 25) bmi_category = "Normal";
    else if (bmi < 30) bmi_category = "Overweight";
    else bmi_category = "Obese";

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        age,
        height_cm,
        biological_sex,
        current_weight_kg,
        goal_weight_kg, // Optional field
        bmi,
        bmi_category,
        is_profile_completed: true,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating user profile",
      error: error.message,
    });
  }
};

// Get all users with pagination and filtering
exports.getUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Filter by BMI category if provided
    if (req.query.bmi_category) {
      filter.bmi_category = req.query.bmi_category;
    }

    // Filter by age range if provided
    if (req.query.min_age || req.query.max_age) {
      filter.age = {};
      if (req.query.min_age) filter.age.$gte = parseInt(req.query.min_age);
      if (req.query.max_age) filter.age.$lte = parseInt(req.query.max_age);
    }

    // Filter by biological sex if provided
    if (req.query.biological_sex) {
      filter.biological_sex = req.query.biological_sex;
    }

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Get users with pagination and filtering
    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get user by ID with related data
exports.getUserById = async (req, res) => {
  try {
    // Get user data
    console.log(req.user,'user')
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }

    // Get last 8 weight entries
    const weightHistory = await Weight.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("weight_kg date notes");

    // Get next shipment
    const nextShipment = await Shipment.findOne({
      user: req.params.id,
      status: "pending",
    })
      .sort({ scheduledDate: 1 })
      .select("scheduledDate status items");

    // Get current medications
    const medications = await Medication.find({
      user: req.params.id,
      status: "active",
    }).select("name dosage frequency startDate endDate");

    res.status(200).json({
      status: "success",
      data: {
        user: {
          ...user.toObject(),
          weight_history: weightHistory,
          next_shipment: nextShipment,
          medications: medications,
        },
      },
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID format",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Error fetching user data",
      error: error.message,
    });
  }
};
