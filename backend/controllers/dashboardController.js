const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDoctors,
      totalPatients,
      patientsPerDoctor,
      monthlyPatientTrend,
      conditionBreakdown,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),

      Patient.aggregate([
        { $group: { _id: "$doctor", patientCount: { $sum: 1 } } },
        { $sort: { patientCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctor",
          },
        },
        { $unwind: "$doctor" },
        {
          $project: {
            _id: 0,
            doctorId: "$doctor._id",
            doctorName: "$doctor.name",
            patientCount: 1,
          },
        },
      ]),

      Patient.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            count: 1,
          },
        },
      ]),

      Patient.aggregate([
        { $group: { _id: "$condition", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, condition: "$_id", count: 1 } },
      ]),
    ]);

    res.json({
      totalDoctors,
      totalPatients,
      patientsPerDoctor,
      monthlyPatientTrend,
      conditionBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
