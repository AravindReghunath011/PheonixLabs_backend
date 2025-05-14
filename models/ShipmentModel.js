const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medication_name: { type: String, required: true },
    dosage: { type: String, required: true },
    courier_name: { type: String, required: true },
    tracking_id: { type: String },
    tracking_link: { type: String },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "failed"],
      required: true,
    },
    expected_delivery_date: { type: Date, required: true },
    shipped_at: { type: Date },
    delivered_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
