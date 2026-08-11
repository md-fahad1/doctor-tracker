const Patient = require("../models/Patient");


const getPatients = async (req, res, next) => {
  try {
    const { search, condition, from, to, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (condition) {
      query.condition = condition;
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);
    const skip = (pageNum - 1) * limitNum;

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate("doctor", "name specialization")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Patient.countDocuments(query),
    ]);

    res.json({
      patients,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalPatients: total,
    });
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "doctor",
      "name specialization"
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
};


const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
};


const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: "Patient deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatients, getPatientById, updatePatient, deletePatient };
