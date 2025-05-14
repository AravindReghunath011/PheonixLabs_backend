const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    notes: {
      type: String,
    },
    sideEffects: [
      {
        description: String,
        severity: {
          type: String,
          enum: ["mild", "moderate", "severe"],
        },
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
