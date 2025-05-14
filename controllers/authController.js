const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a valid email address",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "1d",
      }
    );

    console.log(user,'user /???')

    // Send response
    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          is_profile_completed: user.is_profile_completed,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("entered register");
    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a valid email address",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      is_profile_complete: false,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "1d",
      }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          is_profile_complete: user.is_profile_complete,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error registering user",
      error: error.message,
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      age,
      height_cm,
      biological_sex,
      current_weight_kg,
      goal_weight_kg,
    } = req.body;
    const userId = req.user.id; // Assuming you have user info from auth middleware

    // Input validation
    if (!age || !height_cm || !biological_sex || !current_weight_kg) {
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
        age,
        height_cm,
        biological_sex,
        current_weight_kg,
        goal_weight_kg, // Optional field
        bmi,
        bmi_category,
        is_profile_complete: true,
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
