const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    height_cm: { type: Number },
    biological_sex: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    start_weight_kg: { type: Number },
    current_weight_kg: { type: Number },
    goal_weight_kg: { type: Number },
    bmi: { type: Number },
    bmi_category: {
      type: String,
      enum: ["Underweight", "Normal", "Overweight", "Obese"],
    },
    is_profile_completed:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

// Add method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model("User", userSchema);
