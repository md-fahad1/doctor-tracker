const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  { timestamps: true }
);

patientSchema.index({ doctor: 1 });

patientSchema.index({ name: "text", condition: "text" });

patientSchema.index({ condition: 1 });
patientSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Patient", patientSchema);
