const express = require("express");
const {
  getPatients,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

router.use(protect);

router.get("/", getPatients);
router.put("/:id", adminOnly, updatePatient);
router.delete("/:id", adminOnly, deletePatient);

module.exports = router;