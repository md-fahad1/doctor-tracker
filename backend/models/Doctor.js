const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    hospital: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

doctorSchema.index({ name: "text", specialization: "text", hospital: "text" });


doctorSchema.index({ specialization: 1 });
doctorSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Doctor", doctorSchema);
