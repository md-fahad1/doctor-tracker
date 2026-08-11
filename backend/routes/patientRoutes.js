const express = require("express");
const {
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getPatients);
router.route("/:id").get(getPatientById).put(updatePatient).delete(deletePatient);

module.exports = router;
