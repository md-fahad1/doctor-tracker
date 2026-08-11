const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  suspendUser,
  activateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.patch("/:id/suspend", suspendUser);
router.patch("/:id/activate", activateUser);
router.delete("/:id", deleteUser);

module.exports = router;