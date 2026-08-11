const express = require("express");
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
} = require("../controllers/doctorController");

const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

router.use(protect);

router.get("/", getDoctors);
router.post("/", adminOnly, createDoctor);

router.get("/:id", getDoctorById);
router.put("/:id", adminOnly, updateDoctor);
router.delete("/:id", adminOnly, deleteDoctor);

router.get("/:id/patients", getDoctorPatients);
router.post("/:id/patients", adminOnly, addPatientToDoctor);

module.exports = router;