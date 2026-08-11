const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    if (!name || !specialization || !hospital || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doctor = await Doctor.create({ name, specialization, hospital, phone, email });
    res.status(201).json(doctor);
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, from, to, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (specialization) {
      query.specialization = specialization;
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);
    const skip = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Doctor.countDocuments(query),
    ]);

    res.json({
      doctors,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalDoctors: total,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).lean();
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};


const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};


const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await Promise.all([
      Patient.deleteMany({ doctor: doctor._id }),
      doctor.deleteOne(),
    ]);

    res.json({ message: "Doctor and their patients were deleted" });
  } catch (error) {
    next(error);
  }
};


const getDoctorPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ doctor: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

const addPatientToDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const { name, age, gender, phone, condition } = req.body;
    if (!name || !age || !gender || !phone || !condition) {
      return res.status(400).json({ message: "All patient fields are required" });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      condition,
      doctor: doctor._id,
    });

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
};
