const express = require("express");
const { registerUser, loginUser, getMe, uploadAvatar } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;