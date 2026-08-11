// Run with: node utils/seedAdmin.js
// Creates one demo admin account so you can log in immediately after setup.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "admin@doctortracker.com";
  const exists = await User.findOne({ email });

  if (exists) {
    console.log("Demo admin already exists:", email);
  } else {
    await User.create({ name: "Admin", email, password: "password123" });
    console.log("Demo admin created:");
    console.log("  email:    admin@doctortracker.com");
    console.log("  password: password123");
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
