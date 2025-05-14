const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, default: Date.now },
    weight_kg: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeightLog", weightLogSchema);
